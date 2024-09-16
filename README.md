# Panierr Documentation

## Introduction

**Panierr** is a lightweight and modular shopping cart library designed to handle common cart functionalities such as adding/removing items, applying discounts, and persisting data with ease. It consists of two key components:

1. **PanierrCore**: The core logic for managing the shopping cart and related operations.
2. **PanierrDOM**: A utility to bind cart interactions to DOM elements for handling frontend tasks seamlessly.

This documentation covers the setup, usage, and features of Panierr, including the PanierrCore API and PanierrDOM bindings.

---

## PanierrCore

### Overview

PanierrCore is the heart of the shopping cart logic. It manages cart items, applies discounts, calculates totals, and interacts with storage.

### Installation

```bash
npm install panierr
```

### Cart Item Interface

`CartItem` defines the structure of an item in the cart.

```ts
interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    [key: string]: any;
}
```

### Configuration

`PanierrConfig` allows you to configure storage, locale, currency format, and other cart-related settings.

```ts
interface PanierrConfig {
    storageKey?: string;
    storageProvider?: StorageProvider;
    autoSave?: boolean;
    autoLoad?: boolean;
    discounts?: Discount[];
    currencyFormat?: Intl.NumberFormatOptions;
    locale?: string;
}
```

### Key Methods

- `addItem(item: CartItem)`: Adds an item to the cart. If the item already exists, it increments the quantity.
- `removeItem(itemId: string)`: Removes an item by ID from the cart.
- `updateItemQuantity(itemId: string, quantity: number)`: Updates the quantity of a specific item.
- `clearCart()`: Clears the entire cart.
- `getCartItems(): CartItem[]`: Returns a copy of the cart items.
- `applyDiscount(code: string)`: Applies a discount using a discount code.
- `removeDiscount()`: Removes any applied discount.
- `calculateTotals(): CartTotals`: Calculates the cart's total items, total price, discount, and final price.
- `formatPrice(amount: number): string`: Formats prices according to the locale and currency format.

### Example Usage

```ts
import { PanierrCore } from 'panierr';

const cart = new PanierrCore({
    autoSave: true,
    discounts: [{ code: 'SAVE10', type: 'percentage', amount: 10 }]
});

// Add an item to the cart
cart.addItem({
    id: '1',
    name: 'Product 1',
    price: 29.99,
    quantity: 1
});

// Apply a discount
cart.applyDiscount('SAVE10');

// Get totals
const totals = cart.calculateTotals();
console.log(totals.finalPrice);  // Final price after discount
```

---

## PanierrDOM

### Overview

PanierrDOM extends PanierrCore to the DOM, making it easier to handle user interactions like adding/removing items from the cart via HTML elements and attributes.

### Key Features

- Automatically binds actions (add, remove, update) to DOM elements.
- Listens for cart events and updates the UI accordingly.
- Customizable templates for rendering cart items.

### Initialization

```ts
import { PanierrDOM } from 'panierr';

const panierrDOM = new PanierrDOM({
    currencyFormat: { style: 'currency', currency: 'USD' },
    locale: 'en-US',
});
```

### Event Handling

PanierrDOM uses `data-*` attributes to capture user actions such as adding/removing items.

- `data-action="add-to-cart"`: Adds an item to the cart.
- `data-action="remove-from-cart"`: Removes an item from the cart.
- `data-action="increase-quantity"`: Increases the quantity of an item.
- `data-action="decrease-quantity"`: Decreases the quantity of an item.
- `data-action="clear-cart"`: Clears the entire cart.

### Example Usage

#### HTML Example

```html
<!-- Add to Cart Button -->
<button data-action="add-to-cart" data-item-id="1" data-item-name="Product 1" data-item-price="29.99" data-item-quantity="1">
    Add to Cart
</button>

<!-- Cart Sidebar -->
<div id="cart-sidebar">
    <div data-cart-items></div>
    <div>
        Total: <span data-cart-total></span>
        <button data-action="clear-cart">Clear Cart</button>
    </div>
</div>
```

#### JavaScript Example

```ts
const panierrDOM = new PanierrDOM({
    cart: new PanierrCore(),
    currencyFormat: { style: 'currency', currency: 'USD' },
    locale: 'en-US',
    dataAttributes: {
        action: 'data-action',
        itemId: 'data-item-id',
        itemName: 'data-item-name',
        itemPrice: 'data-item-price',
        itemQuantity: 'data-item-quantity',
    }
});

// Listen to cart changes and update the DOM
panierrDOM.renderCart();
```

---

## Event Listeners

Panierr supports event listeners that notify the app when certain actions occur. You can register and unregister event listeners using the `on` and `off` methods.

### Events:

- `itemAdded`: Triggered when an item is added to the cart.
- `itemRemoved`: Triggered when an item is removed from the cart.
- `itemUpdated`: Triggered when an item is updated.
- `cartCleared`: Triggered when the cart is cleared.
- `discountApplied`: Triggered when a discount is applied.

### Example

```ts
cart.on('itemAdded', (event) => {
    console.log('Item added:', event.item);
});

cart.on('cartCleared', () => {
    console.log('Cart was cleared');
});
```
