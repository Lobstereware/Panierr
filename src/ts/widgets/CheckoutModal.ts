interface CheckoutWidgetConfig {
  stripe: any;
  elements: any;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any, details?: any) => void;
}

class CheckoutModalWidget {
  private config: CheckoutWidgetConfig;
  private modalElement: HTMLElement | null = null;
  private cardElement: any = null;

  constructor(config: CheckoutWidgetConfig) {
    this.config = config;
  }

  public init() {
    this.createModal();
    this.setupStripeElements();
  }

  private createModal() {
    const modalHtml = `
      <div id="checkout-modal" class="modal hidden">
        <div class="modal-content">
          <h2 class="modal-header">Checkout</h2>
          <form id="checkout-form">
            <h3 class="section-title">Customer Information</h3>
            <label for="name">Full Name</label>
            <input type="text" id="customer-name" name="name" placeholder="John Doe" required />
            
            <label for="email">Email</label>
            <input type="email" id="customer-email" name="email" placeholder="you@example.com" required />

            <h3 class="section-title">Shipping Address</h3>
            <input type="text" id="shipping-address" placeholder="Address" required />
            <input type="text" id="shipping-city" placeholder="City" required />
            <input type="text" id="shipping-zip" placeholder="Postal Code" required />
            <input type="text" id="shipping-country" placeholder="Country" required />

            <h3 class="section-title">Billing Address</h3>
            <input type="text" id="billing-address" placeholder="Address" required />
            <input type="text" id="billing-city" placeholder="City" required />
            <input type="text" id="billing-zip" placeholder="Postal Code" required />
            <input type="text" id="billing-country" placeholder="Country" required />

            <div id="payment-section">
              <h3 class="section-title">Payment</h3>
              <div id="card-element"></div>
              <div id="card-errors" role="alert"></div>
            </div>

            <button type="submit" id="submit-checkout" class="checkout-btn">Pay Now</button>
          </form>
        </div>
      </div>

      <style>
        .modal {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          width: 400px;
          z-index: 1000;
        }

        .modal.active {
          display: block;
        }

        .modal-header {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin: 10px 0;
        }

        label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: #555;
        }

        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        input:focus {
          border-color: #000;
          outline: none;
        }

        .checkout-btn {
          background-color: #000;
          color: #fff;
          border: none;
          padding: 12px;
          font-size: 1.1rem;
          font-weight: bold;
          width: 100%;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .checkout-btn:hover {
          background-color: #444;
        }

        #card-element {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 15px;
        }

        #card-errors {
          color: red;
          font-size: 0.9rem;
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.modalElement = document.getElementById('checkout-modal');

    this.setupModalListeners();
  }

  private setupStripeElements() {
    if (this.config.elements) {
      this.cardElement = this.config.elements.create('card');
      this.cardElement.mount('#card-element');
    }
  }

  private setupModalListeners() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handlePayment();
      });
    }
  }

  public openModal() {
    if (this.modalElement) {
      this.modalElement.classList.add('active');
    }
  }

  public closeModal() {
    if (this.modalElement) {
      this.modalElement.classList.remove('active');
    }
  }

  private async handlePayment() {
    if (!this.config.stripe) {
      this.handleError('Stripe is not initialized');
      return;
    }

    // Collect user info, billing, and shipping address from the form
    const customerName = (document.getElementById('customer-name') as HTMLInputElement).value;
    const customerEmail = (document.getElementById('customer-email') as HTMLInputElement).value;

    const shippingAddress = {
      address: (document.getElementById('shipping-address') as HTMLInputElement).value,
      city: (document.getElementById('shipping-city') as HTMLInputElement).value,
      zip: (document.getElementById('shipping-zip') as HTMLInputElement).value,
      country: (document.getElementById('shipping-country') as HTMLInputElement).value,
    };

    const billingAddress = {
      address: (document.getElementById('billing-address') as HTMLInputElement).value,
      city: (document.getElementById('billing-city') as HTMLInputElement).value,
      zip: (document.getElementById('billing-zip') as HTMLInputElement).value,
      country: (document.getElementById('billing-country') as HTMLInputElement).value,
    };

    try {
      // Create payment intent on your server (this part would normally involve an API call to your backend)
      const paymentIntent = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5000, // Example amount in cents
          customerInfo: {
            name: customerName,
            email: customerEmail,
            shippingAddress,
            billingAddress,
          },
        }),
      }).then(res => res.json());

      // Confirm payment using Stripe
      const { paymentIntent: intent } = await this.config.stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
            address: {
              line1: billingAddress.address,
              city: billingAddress.city,
              postal_code: billingAddress.zip,
              country: billingAddress.country,
            },
          },
        },
      });

      if (intent.status === 'succeeded') {
        this.config.onSuccess?.(intent);
        this.closeModal();
      } else {
        this.handleError('Payment failed');
      }
    } catch (error) {
      this.handleError('Payment processing error', error);
    }
  }

  private handleError(message: string, details?: any) {
    console.error(message, details);
    this.config.onError?.(message, details);
  }

  public register(cart: any) {
    cart.widgets.CheckoutModalWidget = this;
  }
}

export default CheckoutModalWidget;
