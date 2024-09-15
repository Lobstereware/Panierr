// PanierrCore.ts

/**
 * Shopping cart item interface.
 */
export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string ;
    quantity: number;
    [key: string]: any; // Allows for additional properties
}

/**
 * Discount interface.
 */
export interface Discount {
    code: string;
    type: 'percentage' | 'fixed';
    amount: number;
    [key: string]: any; // Allows for additional properties
}

/**
 * Totals interface.
 */
export interface CartTotals {
    totalItems: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
}

/**
 * Storage provider interface.
 */
export interface StorageProvider {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/**
 * Panierr configuration interface.
 */
export interface PanierrConfig {
    storageKey?: string;
    storageProvider?: StorageProvider;
    autoSave?: boolean;
    autoLoad?: boolean;
    discounts?: Discount[];
    currencyFormat?: Intl.NumberFormatOptions;
    locale?: string;
}

/**
 * Panierr event types.
 */
type PanierrEvent =
    | { type: 'itemAdded'; item: CartItem }
    | { type: 'itemRemoved'; itemId: string }
    | { type: 'itemUpdated'; item: CartItem }
    | { type: 'cartCleared' }
    | { type: 'discountApplied'; discount: Discount }
    | { type: 'discountRemoved' }
    | { type: 'error'; message: string; details?: any };

/**
 * PanierrCore class for managing the shopping cart.
 */
export class PanierrCore {
    private cartItems: CartItem[] = [];
    private discountsApplied: Discount[] = [];
    private config: Required<PanierrConfig>;
    private listeners: {
        [K in PanierrEvent['type']]?: Array<(event: Extract<PanierrEvent, { type: K }>) => void>;
    } = {};

    /**
     * Creates an instance of PanierrCore.
     * @param config - Optional configuration object.
     */
    constructor(config: PanierrConfig = {}) {
        this.config = {
            storageKey: 'panierrCartItems',
            storageProvider: window.localStorage,
            autoSave: true,
            autoLoad: true,
            discounts: [],
            currencyFormat: { style: 'currency', currency: 'USD' },
            locale: 'en-US',
            ...config,
        };

        if (this.config.autoLoad) {
            this.loadCart();
        }
    }

    /**
     * Adds an item to the cart.
     * @param item - The item to add.
     */
    public addItem(item: CartItem): void {
        const existingItem = this.cartItems.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
            this.emit({ type: 'itemUpdated', item: existingItem });
        } else {
            this.cartItems.push({ ...item });
            this.emit({ type: 'itemAdded', item });
        }
        this.saveCart();
    }

    /**
     * Removes an item from the cart.
     * @param itemId - The ID of the item to remove.
     */
    public removeItem(itemId: string): void {
        const index = this.cartItems.findIndex((item) => item.id === itemId);
        if (index !== -1) {
            this.cartItems.splice(index, 1);
            this.emit({ type: 'itemRemoved', itemId });
            this.saveCart();
        } else {
            this.emit({ type: 'error', message: 'Item not found in cart', details: { itemId } });
        }
    }

    /**
     * Updates the quantity of an item in the cart.
     * @param itemId - The ID of the item to update.
     * @param quantity - The new quantity.
     */
    public updateItemQuantity(itemId: string, quantity: number): void {
        const item = this.cartItems.find((cartItem) => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.emit({ type: 'itemUpdated', item });
                this.saveCart();
            }
        } else {
            this.emit({ type: 'error', message: 'Item not found in cart', details: { itemId } });
        }
    }

    /**
     * Clears all items from the cart.
     */
    public clearCart(): void {
        this.cartItems = [];
        this.discountsApplied = [];
        this.emit({ type: 'cartCleared' });
        this.saveCart();
    }

    /**
     * Gets a copy of the cart items.
     * @returns An array of cart items.
     */
    public getCartItems(): CartItem[] {
        return [...this.cartItems];
    }

    /**
     * Applies a discount to the cart.
     * @param code - The discount code.
     */
    public applyDiscount(code: string): void {
        const discount = this.config.discounts.find((d) => d.code === code);
        if (discount) {
            this.discountsApplied = [discount];
            this.emit({ type: 'discountApplied', discount });
            this.saveCart();
        } else {
            this.emit({ type: 'error', message: 'Invalid discount code', details: { code } });
        }
    }

    /** Retrieves the current discount amount */
    public getDiscountAmount(): number {
        const totalPrice = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discountAmount = 0;
      
        for (const discount of this.discountsApplied) {
          if (discount.type === 'percentage') {
            discountAmount += totalPrice * (discount.amount / 100);
          } else if (discount.type === 'fixed') {
            discountAmount += discount.amount;
          }
        }
      
        return discountAmount;
      }

    /**
     * Removes all applied discounts.
     */
    public removeDiscount(): void {
        this.discountsApplied = [];
        this.emit({ type: 'discountRemoved' });
        this.saveCart();
    }

    /**
     * Calculates the totals for the cart.
     * @returns An object containing total items, total price, discount amount, and final price.
     */
    public calculateTotals(): CartTotals {
        const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountAmount = this.getDiscountAmount();
        const finalPrice = Math.max(totalPrice - discountAmount, 0);
      
        return {
          totalItems,
          totalPrice,
          discountAmount,
          finalPrice,
        };
      }

    /**
     * Formats a price according to the locale and currency settings.
     * @param amount - The amount to format.
     * @returns A formatted price string.
     */
    public formatPrice(amount: number): string {
        return new Intl.NumberFormat(this.config.locale, this.config.currencyFormat).format(amount);
    }

    /**
     * Registers an event listener.
     * @param eventType - The event type to listen for.
     * @param listener - The callback function.
     */
    public on<K extends PanierrEvent['type']>(
        eventType: K,
        listener: (event: Extract<PanierrEvent, { type: K }>) => void
    ): void {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType]!.push(listener);
    }

    /**
     * Unregisters an event listener.
     * @param eventType - The event type.
     * @param listener - The callback function to remove.
     */
    public off<K extends PanierrEvent['type']>(
        eventType: K,
        listener: (event: Extract<PanierrEvent, { type: K }>) => void
    ): void {
        const listeners = this.listeners[eventType];
        if (listeners) {
            this.listeners[eventType] = listeners.filter((l) => l !== listener) as any;
        }
    }

    /**
     * Emits an event to all registered listeners.
     * @param event - The event object.
     */
    private emit<K extends PanierrEvent['type']>(event: Extract<PanierrEvent, { type: K }>): void {
        const listeners = this.listeners[event.type];
        if (listeners) {
            listeners.forEach((listener) => listener(event));
        }
    }

    /**
     * Saves the cart to storage.
     */
    private saveCart(): void {
        if (!this.config.autoSave) return;
        const storage = this.config.storageProvider;
        if (storage) {
            try {
                const data = JSON.stringify({
                    cartItems: this.cartItems,
                    discountsApplied: this.discountsApplied,
                });
                storage.setItem(this.config.storageKey, data);
            } catch (error) {
                this.emit({ type: 'error', message: 'Failed to save cart', details: error });
            }
        }
    }

    /**
 * Gets the quantity of a specific item in the cart.
 * @param itemId - The ID of the item.
 * @returns The quantity of the item, or null if the item is not in the cart.
 */
    public getItemQuantity(itemId: string): number | null {
        const item = this.cartItems.find((cartItem) => cartItem.id === itemId);
        return item ? item.quantity : null;
    }

    /**
     * Loads the cart from storage.
     */
    private loadCart(): void {
        const storage = this.config.storageProvider;
        if (storage) {
            try {
                const data = storage.getItem(this.config.storageKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    this.cartItems = parsed.cartItems || [];
                    this.discountsApplied = parsed.discountsApplied || [];
                }
            } catch (error) {
                this.emit({ type: 'error', message: 'Failed to load cart', details: error });
            }
        }
    }

    /**
     * Destroys the Panierr instance, removing all listeners.
     */
    public destroy(): void {
        this.listeners = {};
        this.cartItems = [];
        this.discountsApplied = [];
    }
}

export default PanierrCore;
