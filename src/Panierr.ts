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
  onItemAdded: (item: CartItem) => void;
  onItemRemoved: (item: CartItem) => void;
  onItemUpdated: (item: CartItem) => void;
  onCartCleared: () => void;
  onDiscountApplied: (discount: number) => void;
  onInvalidDiscount: (code: string) => void;
}

type ShoppingCartEvent = 
  | 'itemAdded' 
  | 'itemRemoved' 
  | 'itemUpdated' 
  | 'cartCleared' 
  | 'discountApplied' 
  | 'invalidDiscount';


  class Panierr {
    private cartItems: CartItem[];
    private events: { [key in ShoppingCartEvent]?: Array<(data: any) => void> };
    private discount: number;
    private config: ShoppingCartConfig;
  
    constructor(config: Partial<ShoppingCartConfig> = {}) {
      this.config = {
        cartTotalSelector: '#cart-total',
        cartCountSelector: '#cart-count',
        cartItemsSelector: '#cart-items',
        cartSidebarTotalSelector: '#cart-total-sidebar',
        onItemAdded: () => {},
        onItemRemoved: () => {},
        onItemUpdated: () => {},
        onCartCleared: () => {},
        onDiscountApplied: () => {},
        onInvalidDiscount: () => {},
        ...config,
      };
  
      this.cartItems = this.getCartFromLocalStorage();
      this.events = {};
      this.discount = 0;
      this.renderCart();
    }
  
    public on(event: ShoppingCartEvent, listener: (data: any) => void): void {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event]!.push(listener);
    }
  
    private emit(event: ShoppingCartEvent, data: any): void {
      if (this.events[event]) {
        this.events[event]!.forEach(listener => listener(data));
      }
    }
  
    private getCartFromLocalStorage(): CartItem[] {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    }
  
    private saveCartToLocalStorage(): void {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  
    public addToCart(productElement: HTMLElement): void {
      const itemId = productElement.getAttribute('data-item-id')!;
      const itemName = productElement.getAttribute('data-item-name')!;
      const itemPrice = parseFloat(productElement.getAttribute('data-item-price')!);
      const itemQuantity = 1;
  
      const existingItem = this.cartItems.find(item => item.id === itemId);
  
      if (existingItem) {
        existingItem.quantity += itemQuantity;
      } else {
        const newItem: CartItem = { id: itemId, name: itemName, price: itemPrice, quantity: itemQuantity };
        this.cartItems.push(newItem);
        this.emit('itemAdded', newItem);
        this.config.onItemAdded(newItem);
      }
  
      this.saveCartToLocalStorage();
      this.renderCart();
    }
  
    public removeFromCart(itemId: string): void {
      const removedItem = this.cartItems.find(item => item.id === itemId)!;
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
      this.emit('itemRemoved', removedItem);
      this.config.onItemRemoved(removedItem);
      this.saveCartToLocalStorage();
      this.renderCart();
    }
  
    public updateItemQuantity(itemId: string, newQuantity: number): void {
      const item = this.cartItems.find(item => item.id === itemId);
      if (item) {
        item.quantity = newQuantity;
        this.emit('itemUpdated', item);
        this.config.onItemUpdated(item);
        this.saveCartToLocalStorage();
        this.renderCart();
      }
    }
  
    public clearCart(): void {
      this.cartItems = [];
      this.emit('cartCleared', {});
      this.config.onCartCleared();
      this.saveCartToLocalStorage();
      this.renderCart();
    }
  
    public applyDiscount(code: string): void {
      if (code === 'SAVE10') {
        this.discount = 10; // 10% discount
        this.emit('discountApplied', this.discount);
        this.config.onDiscountApplied(this.discount);
      } else {
        this.emit('invalidDiscount', code);
        this.config.onInvalidDiscount(code);
      }
      this.renderCart();
    }
  
    private calculateTotals(): { totalPrice: number, totalItems: number, discountAmount: number } {
      const totalPrice = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const totalItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);
      const discountAmount = totalPrice * (this.discount / 100);
      return { totalPrice: totalPrice - discountAmount, totalItems, discountAmount };
    }
  
    private renderCart(): void {
      const totalContainer = document.querySelector<HTMLElement>(this.config.cartTotalSelector);
      const cartCountContainer = document.querySelector<HTMLElement>(this.config.cartCountSelector);
      const cartItemsContainer = document.querySelector<HTMLElement>(this.config.cartItemsSelector);
      const totalSidebar = document.querySelector<HTMLElement>(this.config.cartSidebarTotalSelector);
  
      const { totalPrice, totalItems } = this.calculateTotals();
  
      if (totalContainer) {
        totalContainer.textContent = `Total: $${totalPrice.toFixed(2)}`;
      }
  
      if (cartCountContainer) {
        cartCountContainer.textContent = `Items: ${totalItems}`;
      }
  
      if (totalSidebar) {
        totalSidebar.textContent = `Total: $${totalPrice.toFixed(2)}`;
      }
  
      if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        this.cartItems.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `${item.name} - $${item.price} x ${item.quantity} 
                          <button class="remove-from-cart" data-item-id="${item.id}">Remove</button>
                          <input class="update-quantity" type="number" value="${item.quantity}" data-item-id="${item.id}">`;
          cartItemsContainer.appendChild(li);
        });
  
        document.querySelectorAll('.remove-from-cart').forEach(button => {
          button.addEventListener('click', () => {
            const itemId = (button as HTMLElement).getAttribute('data-item-id')!;
            this.removeFromCart(itemId);
          });
        });
  
        document.querySelectorAll('.update-quantity').forEach(input => {
          input.addEventListener('change', (e) => {
            const itemId = (input as HTMLElement).getAttribute('data-item-id')!;
            const newQuantity = parseInt((input as HTMLInputElement).value);
            this.updateItemQuantity(itemId, newQuantity);
          });
        });
      }
    }
  }
  
  export default Panierr;