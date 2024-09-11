interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShoppingCartConfig {
  cartTotalSelector: string;
  cartCountSelector: string;
  cartItemsSelector: string;
  cartSidebarTotalSelector: string;
  sidebarEnabled?: boolean;
  sidebarSelector?: string;
  onItemAdded: (item: CartItem) => void;
  onItemRemoved: (item: CartItem) => void;
  onItemUpdated: (item: CartItem) => void;
  onCartCleared: () => void;
  onDiscountApplied: (discount: number) => void;
  onInvalidDiscount: (code: string) => void;
  onError?: (message: string, details?: any) => void; // Optional error callback
  widgets?: Array<any>;
}

type ShoppingCartEvent =
  | 'itemAdded'
  | 'itemRemoved'
  | 'itemUpdated'
  | 'cartCleared'
  | 'discountApplied'
  | 'invalidDiscount'
  | 'error'; // Added error event

class Panierr {
  private cartItems: CartItem[] = [];
  private events: { [key in ShoppingCartEvent]?: Array<(data: any) => void> } = {};
  private discount: number = 0;
  private config: ShoppingCartConfig;
  public widgets: any =  {};

  constructor(config: Partial<ShoppingCartConfig> = {}) {
    this.config = {
      cartTotalSelector: '#cart-total',
      cartCountSelector: '#cart-count',
      cartItemsSelector: '#cart-items',
      cartSidebarTotalSelector: '#cart-total-sidebar',
      sidebarEnabled: false,
      sidebarSelector: '.cart-sidebar',
      onItemAdded: () => {},
      onItemRemoved: () => {},
      onItemUpdated: () => {},
      onCartCleared: () => {},
      onDiscountApplied: () => {},
      onInvalidDiscount: () => {},
      onError: () => {}, // Default error handler does nothing
      ...config,
    };

    this.cartItems = this.getCartFromLocalStorage();
    this.renderCart();

    if (this.config.sidebarEnabled) {
      this.setupSidebar();
    }

    this.setupAddToCartButtons();

    if (this.config.widgets) {
      this.registerWidgets(this.config.widgets);
    }
  }

  // Centralized error handling method
  private handleError(message: string, details?: any): void {
    console.error(`Panierr Error: ${message}`, details);
    
    // Emit error event
    this.emit('error', { message, details });
    
    // Call onError callback if provided
    if (this.config.onError) {
      this.config.onError(message, details);
    }
  }

  public on(event: ShoppingCartEvent, listener: (data: any) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener);
  }

  public off(event: ShoppingCartEvent, listener: (data: any) => void): void {
    if (this.events[event]) {
      this.events[event] = this.events[event]!.filter(l => l !== listener);
    }
  }

  private emit(event: ShoppingCartEvent, data: any): void {
    this.events[event]?.forEach(listener => listener(data));
  }

  private getCartFromLocalStorage(): CartItem[] {
    const storedCart = localStorage.getItem('cartItems');
    try {
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      this.handleError('Failed to parse cart data from localStorage', { error });
      return [];
    }
  }

  private saveCartToLocalStorage(): void {
    try {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    } catch (error) {
      this.handleError('Failed to save cart data to localStorage', { error });
    }
  }

  public addToCart(productElement: HTMLElement): void {
    const itemId = productElement.getAttribute('data-item-id');
    const itemName = productElement.getAttribute('data-item-name');
    const itemPrice = productElement.getAttribute('data-item-price');

    if (!itemId || !itemName || !itemPrice) {
      this.handleError("Invalid product attributes, can't add to cart", { itemId, itemName, itemPrice });
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      this.handleError("Invalid product price", { itemId, itemName, itemPrice });
      return;
    }

    const existingItem = this.cartItems.find(item => item.id === itemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem: CartItem = { id: itemId, name: itemName, price, quantity: 1 };
      this.cartItems.push(newItem);
      this.emit('itemAdded', newItem);
      this.config.onItemAdded(newItem);
    }

    this.saveCartToLocalStorage();
    this.renderCart();
  }

  public removeFromCart(itemId: string): void {
    const removedItem = this.cartItems.find(item => item.id === itemId);

    if (!removedItem) {
      this.handleError(`Item with ID ${itemId} not found in the cart`, { itemId });
      return;
    }

    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.emit('itemRemoved', removedItem);
    this.config.onItemRemoved(removedItem);
    this.saveCartToLocalStorage();
    this.renderCart();
  }

  public updateItemQuantity(itemId: string, newQuantity: number): void {
    const item = this.cartItems.find(item => item.id === itemId);

    if (!item) {
      this.handleError(`Item with ID ${itemId} not found in the cart`, { itemId });
      return;
    }

    if (newQuantity <= 0) {
      this.handleError('Quantity must be greater than zero', { itemId, newQuantity });
      return;
    }

    item.quantity = newQuantity;
    this.emit('itemUpdated', item);
    this.config.onItemUpdated(item);
    this.saveCartToLocalStorage();
    this.renderCart();
  }

  public clearCart(): void {
    if (this.cartItems.length === 0) {
      this.handleError('Cart is already empty');
      return;
    }
    this.cartItems = [];
    this.emit('cartCleared', {});
    this.config.onCartCleared();
    this.saveCartToLocalStorage();
    this.renderCart();
  }

  public applyDiscount(code: string): void {
    if (code === 'SAVE10') {
      this.discount = 10;
      this.emit('discountApplied', this.discount);
      this.config.onDiscountApplied(this.discount);
    } else {
      this.handleError('Invalid discount code', { code });
      this.emit('invalidDiscount', code);
      this.config.onInvalidDiscount(code);
    }
    this.renderCart();
  }

  public toggleCartSidebar(): void {
    if (this.config.sidebarEnabled && this.config.sidebarSelector) {
      const cartSidebar = document.querySelector<HTMLElement>(this.config.sidebarSelector);
      if (cartSidebar) {
        cartSidebar.classList.toggle('open');
      } else {
        this.handleError('Cart sidebar not found', { selector: this.config.sidebarSelector });
      }
    } else {
      this.handleError('Sidebar is disabled or selector is invalid');
    }
  }

  private setupSidebar(): void {
    const toggleCartBtn = document.getElementById('toggle-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');

    if (toggleCartBtn) {
      toggleCartBtn.addEventListener('click', () => this.toggleCartSidebar());
    }

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => this.toggleCartSidebar());
    }
  }

  private setupAddToCartButtons(): void {
    document.querySelectorAll('[data-add-to-cart]').forEach(button => {
      button.addEventListener('click', () => {
        const productCard = button.closest('[data-product]');
        if (productCard) {
          this.addToCart(productCard as HTMLElement);
        } else {
          this.handleError('Product card not found for Add to Cart button');
        }
      });
    });
  }

  public registerWidgets(widgets: any[]): void {
    widgets.forEach(widget => {
      if (typeof widget.register === 'function') {
        widget.register(this);
      } else {
        this.handleError('Widget does not have a register method', { widget });
      }
    });
  }

  private calculateTotals(): { totalPrice: number; totalItems: number; discountAmount: number } {
    const totalPrice = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    const discountAmount = totalPrice * (this.discount / 100);
    return { totalPrice: totalPrice - discountAmount, totalItems, discountAmount };
  }

  public renderCart(): void {
    const totalContainer = document.querySelector<HTMLElement>(this.config.cartTotalSelector);
    const cartCountContainer = document.querySelector<HTMLElement>(this.config.cartCountSelector);
    const cartItemsContainer = document.querySelector<HTMLElement>(this.config.cartItemsSelector);
    const totalSidebar = document.querySelector<HTMLElement>(this.config.cartSidebarTotalSelector);

    const { totalPrice, totalItems } = this.calculateTotals();

    if (totalContainer) totalContainer.textContent = `Total: $${totalPrice.toFixed(2)}`;

    if (cartCountContainer) cartCountContainer.textContent = `Items: ${totalItems}`;

    if (totalSidebar) totalSidebar.textContent = `Total: $${totalPrice.toFixed(2)}`;

    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      this.cartItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${item.name} - $${item.price} x ${item.quantity} 
          <button class="remove-from-cart" data-item-id="${item.id}">Remove</button>
          <input class="update-quantity" type="number" value="${item.quantity}" data-item-id="${item.id}">
        `;
        cartItemsContainer.appendChild(li);
      });

      cartItemsContainer.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', () => {
          const itemId = button.getAttribute('data-item-id');
          if (itemId) this.removeFromCart(itemId);
        });
      });

      cartItemsContainer.querySelectorAll('.update-quantity').forEach(input => {
        input.addEventListener('change', () => {
          const itemId = input.getAttribute('data-item-id');
          const newQuantity = parseInt((input as HTMLInputElement).value);
          if (itemId && newQuantity > 0) this.updateItemQuantity(itemId, newQuantity);
        });
      });
    }
  }
}

export default Panierr;
