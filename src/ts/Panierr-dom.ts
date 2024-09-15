// panierr/dom/PanierrDOM.ts

import PanierrCore, { CartItem } from './PanerrCore';

interface PanierrDOMOptions {
    cart?: PanierrCore;
    currencyFormat?: Intl.NumberFormatOptions;
    locale?: string;
    dataAttributes?: {
      action?: string;
      itemId?: string;
      itemName?: string;
      itemPrice?: string;
      itemQuantity?: string;
      [key: string]: string | undefined;
    };
    templates?: {
      cartItem?: (item: CartItem) => string;
    };
    onError?: (error: Error, context: string) => void;
    onItemAdded?: (item: CartItem) => void;
    onItemRemoved?: (itemId: string) => void;
    discountHandler?: (code: string) => number;
  }

class PanierrDOM {
    private cart: PanierrCore;
    private currencyFormat: Intl.NumberFormatOptions;
    private locale: string;
    private dataAttributes: Required<PanierrDOMOptions['dataAttributes']>;
    private options: PanierrDOMOptions;

  constructor(options?: PanierrDOMOptions) {
    this.options = options || {};
    this.cart = this.options.cart || new PanierrCore();
    this.currencyFormat = this.options.currencyFormat || { style: 'currency', currency: 'USD' };
    this.locale = this.options.locale || 'en-US';
    this.dataAttributes = {
      action: 'data-action',
      itemId: 'data-item-id',
      itemName: 'data-item-name',
      itemPrice: 'data-item-price',
      itemQuantity: 'data-item-quantity',
      ...this.options.dataAttributes,
    };

    this.init();
  }

  /** Initializes event listeners and renders the initial cart state */
  private init(): void {
    this.setupActionListeners();
    this.renderCart();

    // Listen to cart events to update the UI
    this.cart.on('itemAdded', () => this.renderCart());
    this.cart.on('itemRemoved', () => this.renderCart());
    this.cart.on('itemUpdated', () => this.renderCart());
    this.cart.on('cartCleared', () => this.renderCart());
    this.cart.on('discountApplied', () => this.renderCart()); // Handle discount application
  }

  /** Sets up event listeners for elements with data-action attributes */
  private setupActionListeners(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const action = target.getAttribute(this.dataAttributes?.action as any);
      const itemId = target.getAttribute(this.dataAttributes?.itemId as any);

      if (!action) return;

      switch (action) {
        case 'add-to-cart':
          this.handleAddToCart(target);
          break;
        case 'remove-from-cart':
          this.handleRemoveFromCart(target);
          break;
        case 'increase-quantity':
          this.handleIncreaseQuantity(itemId);
          break;
        case 'decrease-quantity':
          this.handleDecreaseQuantity(itemId);
          break;
        case 'clear-cart':
          this.cart.clearCart();
          break;
        case 'toggle-cart':
          this.toggleCartVisibility();
          break;
        case 'apply-discount':
          this.handleApplyDiscount();
          break;
        // Additional actions can be added here
        default:
          // Handle unknown actions if necessary
          break;
      }
    });

    document.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.matches(`[${this.dataAttributes?.itemQuantity}]`)) {
        this.handleQuantityChange(target);
      }
    });
  }

  /** Handles adding an item to the cart */
  private handleAddToCart(element: HTMLElement): void {
    const item = this.extractItemData(element);
    if (item) {
      this.cart.addItem(item);
    } else {
      console.error('Failed to extract item data from:', element);
    }
  }

  /** Handles removing an item from the cart */
  private handleRemoveFromCart(element: HTMLElement): void {
    if(!this.dataAttributes?.itemId) return console.error('Missing item ID on element:', element);

    const itemId = element.getAttribute(this.dataAttributes.itemId);
    if (itemId) {
      this.cart.removeItem(itemId);
    } else {
      console.error('Missing item ID on element:', element);
    }
  }

  /** Handles increasing the quantity of a cart item */
  private handleIncreaseQuantity(itemId: string | null): void {
    if (itemId) {
      const currentQuantity = this.cart.getItemQuantity(itemId) || 0;
      this.cart.updateItemQuantity(itemId, currentQuantity + 1);
    }
  }

  /** Handles decreasing the quantity of a cart item */
  private handleDecreaseQuantity(itemId: string | null): void {
    if (itemId) {
      const currentQuantity = this.cart.getItemQuantity(itemId) || 0;
      if (currentQuantity > 1) {
        this.cart.updateItemQuantity(itemId, currentQuantity - 1);
      } else {
        this.cart.removeItem(itemId);
      }
    }
  }

  /** Handles changing the quantity of a cart item via input */
  private handleQuantityChange(element: HTMLInputElement): void {
    if(!this.dataAttributes?.itemId) return 
    const itemId = element.getAttribute(this.dataAttributes.itemId);
    const quantity = parseInt(element.value, 10);
    if (itemId && !isNaN(quantity)) {
      this.cart.updateItemQuantity(itemId, quantity);
    }
  }

  /** Handles applying a discount code */
  private handleApplyDiscount(): void {
    const discountCodeInput = document.querySelector<HTMLInputElement>('#discount-code-input');
    if (discountCodeInput) {
      const code = discountCodeInput.value.trim();
      this.applyDiscount(code);
    }
  }

  /** Applies a discount based on the provided code */
  private applyDiscount(code: string): void {
    // For demonstration purposes, we'll have a simple discount logic
    if (code === 'SAVE10') {
      this.cart.applyDiscount(code);
      alert('Discount applied!');
    } else {
      this.cart.applyDiscount(code);
      alert('Invalid discount code.');
    }
  }

  /** Toggles the visibility of the cart (can be customized) */
  private toggleCartVisibility(): void {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    if (cartSidebar && overlay) {
      cartSidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
  }

  /** Extracts item data from an element's data attributes */
  private extractItemData(element: HTMLElement): CartItem | null {
    
    const attrs = this.dataAttributes;
    if(!attrs) return null

    
    const itemId = element.getAttribute(attrs.itemId);
    const itemName = element.getAttribute(attrs.itemName);
    const itemPrice = parseFloat(element.getAttribute(attrs.itemPrice) || '0');
    const itemQuantity = parseInt(element.getAttribute(attrs.itemQuantity) || '1', 10);
    const itemImg = this.getImageFromButton(element)

    if (!itemId || !itemName || isNaN(itemPrice)) {
      return null;
    }

    return {
      id: itemId,
      name: itemName,
      price: itemPrice,
      image: itemImg?.src,
      quantity: itemQuantity > 0 ? itemQuantity : 1,
    };
  }

  private getImageFromButton(button: HTMLElement) {
    const productCard = button.closest('.product-card');
    if (!productCard) {
      console.error('Product card not found');
      return null;
    }
  
    const img = productCard.querySelector('img');
    if (!img) {
      console.error('Image not found within product card');
      return null;
    }
  
    return img;
  }

  /** Renders the cart items and updates totals */
  public renderCart(): void {
    this.renderCartItems();
    this.updateCartTotals();
  }

  /** Renders cart items into elements with data-cart-items attributes */
  private renderCartItems(): void {
    const cartItemsContainers = document.querySelectorAll<HTMLElement>('[data-cart-items]');
    const cartItems = this.cart.getCartItems();

    cartItemsContainers.forEach((container) => {
      container.innerHTML = '';
      cartItems.forEach((item) => {
        const itemElement = this.createCartItemElement(item);
        itemElement && container.appendChild(itemElement);
      });
    });
  }

  /** Creates a DOM element for a cart item */
  public createCartItemElement(item: CartItem): HTMLElement | null {
    if(!this.dataAttributes) return null
    const formattedPrice = this.formatPrice(item.price);
    const itemElement = document.createElement('div');
    itemElement.classList.add('panierr-cart-item');
    itemElement.setAttribute(this.dataAttributes.itemId, item.id);
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span class="panierr-item-name">${item.name}</span>
      <span class="panierr-item-price">${formattedPrice}</span>
      <div class="panierr-quantity-controls">
        <button class="panierr-decrease-quantity" ${this.dataAttributes.action}="decrease-quantity" ${this.dataAttributes.itemId}="${item.id}">-</button>
        <input type="number" class="panierr-item-quantity" ${this.dataAttributes.itemQuantity}="${item.quantity}" ${this.dataAttributes.itemId}="${item.id}" value="${item.quantity}" min="1">
        <button class="panierr-increase-quantity" ${this.dataAttributes.action}="increase-quantity" ${this.dataAttributes.itemId}="${item.id}">+</button>
      </div>
      <button class="panierr-remove-item" ${this.dataAttributes.action}="remove-from-cart" ${this.dataAttributes.itemId}="${item.id}">&times;</button>
    `;
    return itemElement;
  }

  /** Updates the cart totals displayed in the UI */
  private updateCartTotals(): void {
    const totalItemsElements = document.querySelectorAll<HTMLElement>('[data-cart-count]');
    const totalPriceElements = document.querySelectorAll<HTMLElement>('[data-cart-total]');
    const discountAmountElement = document.getElementById('discount-amount');
    const totals = this.cart.calculateTotals();
  
    const formattedDiscountAmount = this.formatPrice(totals.discountAmount);
    const formattedFinalPrice = this.formatPrice(totals.finalPrice);
  
    totalItemsElements.forEach((element) => {
      element.textContent = `${totals.totalItems}`;
    });
  
    totalPriceElements.forEach((element) => {
      element.textContent = formattedFinalPrice;
    });
  
    if (discountAmountElement) {
      discountAmountElement.textContent = formattedDiscountAmount;
    }
  }

  /** Formats a price according to the specified locale and currency */
  public formatPrice(amount: number): string {
    return new Intl.NumberFormat(this.locale, this.currencyFormat).format(amount);
  }
}

export default PanierrDOM;
