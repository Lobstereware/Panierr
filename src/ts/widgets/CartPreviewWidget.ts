class CartPreviewWidget extends HTMLElement {
    private cart: any;
  
    constructor() {
      super();
    }
  
    static register(cartInstance: any) {
      if (!customElements.get('cart-preview-widget')) {
        customElements.define('cart-preview-widget', CartPreviewWidget);
      }
  
      const widget = document.querySelector('cart-preview-widget') as CartPreviewWidget;
      if (widget) {
        widget.setCart(cartInstance);
      }
    }
  
    connectedCallback() {
      if (this.cart) {
        this.render();
        this.updateCartPreview();
        this.attachCartEvents();
      }
    }
  
    setCart(cartInstance: any) {
      this.cart = cartInstance;
      if (this.isConnected) {
        this.render();
        this.updateCartPreview();
        this.attachCartEvents();
      }
    }
  
    private attachCartEvents() {
      this.cart.on('itemAdded', () => this.updateCartPreview());
      this.cart.on('itemRemoved', () => this.updateCartPreview());
      this.cart.on('itemUpdated', () => this.updateCartPreview());
      this.cart.on('cartCleared', () => this.updateCartPreview());
    }
  
    private updateCartPreview() {
      const { totalItems, totalPrice } = this.cart.calculateTotals();
      this.querySelector('.cart-preview-items')!.textContent = `${totalItems} items`;
      this.querySelector('.cart-preview-total')!.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }
  
    private render() {
      const checkoutText = this.getAttribute('checkout-text') || 'Checkout';
      const headingText = this.getAttribute('heading-text') || 'Cart Preview';
      const position = this.getAttribute('position') || 'top-right';  // position like 'top-left', 'bottom-right'
      const asIcon = this.getAttribute('as-icon') === 'true';  // Attribute to display as an icon
      const iconHtml = asIcon ? `<i class="fas fa-shopping-cart text-xl"></i>` : '';
  
      this.innerHTML = `
        <style>
          html {
          --cart-bg-color: var(--default-cart-bg-color, #fff);
          --cart-text-color: var(--default-cart-text-color, #2D3748);
          --cart-button-bg: var(--default-cart-button-bg, #3182CE);
          --cart-button-hover-bg: var(--default-cart-button-hover-bg, #2B6CB0);
          }
  
          .cart-preview {
            position: fixed;
            background: var(--cart-bg-color);
            color: var(--cart-text-color);
            padding: ${asIcon ? '0.5rem' : '1rem'};
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: ${asIcon ? '50px' : '220px'};
            z-index: 1000;
            ${this.getPositionStyle(position)}
          }
  
          .cart-preview h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
  
          .cart-preview-items {
            color: #4A5568;
            margin-bottom: 0.5rem;
          }
  
          .cart-preview-total {
            color: var(--cart-text-color);
            font-weight: bold;
            margin-bottom: 1rem;
          }
  
          .cart-preview-checkout {
            background-color: var(--cart-button-bg);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            display: block;
            width: 100%;
            text-align: center;
            transition: background-color 0.3s ease;
          }
  
          .cart-preview-checkout:hover {
            background-color: var(--cart-button-hover-bg);
          }
  
          ::slotted(*) {
            margin-top: 0.5rem;
          }
  
          /* Hide elements if displayed as an icon */
          ${asIcon ? '.cart-preview h3, .cart-preview-items, .cart-preview-total, .cart-preview-checkout { display: none; }' : ''}
        </style>
  
        <div class="cart-preview">
          ${iconHtml}
          <h3 class="text-lg font-semibold">${headingText}</h3>
          <div class="cart-preview-items">0 items</div>
          <div class="cart-preview-total">Total: $0.00</div>
          <button class="cart-preview-checkout">${checkoutText}</button>
          <slot></slot>
        </div>
      `;
  
      this.querySelector('.cart-preview-checkout')!.addEventListener('click', () => {
        alert('Proceeding to checkout...');
        this.cart.clearCart();
      });
    }
  
    private getPositionStyle(position: string): string {
      switch (position) {
        case 'top-left':
          return 'top: 1rem; left: 1rem;';
        case 'top-right':
          return 'top: 1rem; right: 1rem;';
        case 'bottom-left':
          return 'bottom: 1rem; left: 1rem;';
        case 'bottom-right':
          return 'bottom: 1rem; right: 1rem;';
        default:
          return 'top: 1rem; right: 1rem;';  // Default to top-right
      }
    }
  }
  
  export default CartPreviewWidget;
  