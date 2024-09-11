import { Panierr, CheckoutModalWidget } from "../../../src/index";
import { loadStripe } from '@stripe/stripe-js';

(async function init() {

  const stripe = await loadStripe('your-public-stripe-key');
  const elements = stripe?.elements();

  const stripeConfig = {
    stripe, 
    elements,
    onSuccess: (paymentIntent: any) => {
      console.log('Payment successful!', paymentIntent);
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
    },
  };

  const cart = new Panierr({
    widgets: [new CheckoutModalWidget(stripeConfig)],
  });

  cart.widgets.CheckoutModalWidget.init();

  document.getElementById('checkout-button')?.addEventListener('click', () => {
    cart.widgets.CheckoutModalWidget.openModal();

  })

})()