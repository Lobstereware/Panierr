# Panierr - The Shopping Cart Library for [Sellista](https://sellista.shop)

Panierr is a flexible, event-driven shopping cart library designed for seamless integration with the [Sellista](https://sellista.shop) platform. It provides features like adding, removing, updating items in the cart, and applying discounts. Panierr also supports extensibility through dynamic widget registration, allowing developers to easily enhance cart functionality and customize the user experience.

## Features

- **Add, Remove, Update Cart Items**
- **Apply Discount Codes**
- **Event-Driven Architecture**
- **Cart Persistence via `localStorage`**
- **Cart Sidebar Management**
- **Dynamic Widget Registration**
- **Customizable via CSS Variables**
- **Support for Slots in Widgets**

## About Sellista

Sellista is an eCommerce platform designed to help businesses create beautiful online stores. Panierr is the ideal shopping cart solution for Sellista's dynamic storefronts. [Learn more about Sellista here](https://sellista.shop).

---

## Installation

You can install Panierr via npm:

```bash
npm install panierr
```

---

## Basic Usage

### Import the Library

```typescript
import Panierr from 'panierr';
import CartPreviewWidget from './widgets/CartPreviewWidget';
```

### Initialize the Cart

```typescript
const cart = new Panierr({
  cartTotalSelector: '#cart-total',
  cartCountSelector: '#cart-count',
  cartItemsSelector: '#cart-items',
  cartSidebarTotalSelector: '#cart-sidebar-total',
  sidebarEnabled: true,  // Enable the sidebar managed by the library
  onItemAdded: (item) => console.log(`Item added: ${item.name}`),
  onItemRemoved: (item) => console.log(`Item removed: ${item.name}`),
  onItemUpdated: (item) => console.log(`Item updated: ${item.name}, quantity: ${item.quantity}`),
  onCartCleared: () => console.log('Cart cleared'),
  onDiscountApplied: (discount) => console.log(`Discount applied: ${discount}%`),
  onInvalidDiscount: (code) => console.log(`Invalid discount code: ${code}`),
  widgets: [CartPreviewWidget]  // Register widgets during initialization
});
```

---

### Adding Items to the Cart

Use HTML `data-*` attributes to represent product information:

```html
<div class="product-card" data-product data-item-id="product-1" data-item-name="Product 1" data-item-price="29.99">
  <h3>Product 1</h3>
  <p>$29.99</p>
  <button data-add-to-cart>Add to Cart</button>
</div>
```

Panierr automatically binds the click event to elements with the `data-add-to-cart` attribute. When clicked, it adds the item to the cart based on the product attributes.

---

### Removing Items from the Cart

For removing items, Panierr binds `data-item-id` to remove functionality:

```html
<button class="remove-from-cart" data-item-id="product-1">Remove</button>
```

Panierr will automatically handle the removal logic based on the item ID.

---

### Updating Item Quantities

You can enable quantity updates like this:

```html
<input type="number" class="update-quantity" value="1" data-item-id="product-1">
```

Panierr updates the cart when the input value changes.

---

### Registering Widgets Dynamically

Panierr allows developers to register custom widgets for the cart system:

```typescript
import CartPreviewWidget from './widgets/CartPreviewWidget';

// You can register widgets dynamically after initialization
cart.registerWidgets([CartPreviewWidget]);
```

---

### Example Widget: CartPreviewWidget

Here's a sample widget that provides a preview of cart items:

```typescript
class CartPreviewWidget extends HTMLElement {
  private cart: any;

  static register(cartInstance: any) {
    if (!customElements.get('cart-preview-widget')) {
      customElements.define('cart-preview-widget', CartPreviewWidget);
    }
    
    const widget = document.querySelector('cart-preview-widget') as CartPreviewWidget;
    widget.setCart(cartInstance);
  }

  setCart(cartInstance: any) {
    this.cart = cartInstance;
    this.attachCartEvents();
    this.updateCartPreview();
  }

  connectedCallback() {
    if (this.cart) {
      this.render();
      this.updateCartPreview();
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
    this.innerHTML = `
      <div class="cart-preview">
        <h3>Cart Preview</h3>
        <div class="cart-preview-items">0 items</div>
        <div class="cart-preview-total">Total: $0.00</div>
        <slot></slot> <!-- Allows for additional custom content -->
      </div>
    `;
  }
}

export default CartPreviewWidget;
```

**Usage:**

```html
<cart-preview-widget>
  <div class="extra-info">Free shipping on orders over $50!</div>
</cart-preview-widget>
```

This widget will update dynamically whenever items are added/removed from the cart, and you can customize it using the `slot` feature.

---

## CSS Customization

You can customize widgets like `CartPreviewWidget` by using CSS variables:

```css
:root {
  --cart-bg-color: white;
  --cart-text-color: #2D3748;
  --cart-button-bg: #3182CE;
  --cart-button-hover-bg: #2B6CB0;
}
```

If CSS variables are not defined, the widget falls back on default styles.

---

## Event-Driven Architecture

Panierr supports custom events that notify you when important changes occur in the cart. You can subscribe to events such as:

- `itemAdded`
- `itemRemoved`
- `itemUpdated`
- `cartCleared`
- `discountApplied`
- `invalidDiscount`

**Example:**

```typescript
cart.on('itemAdded', (item) => {
  console.log(`Item added: ${item.name}`);
});
```

---

### Configuration Options

Panierr provides a variety of configuration options to customize your shopping cart behavior. Here’s a breakdown of the available options:

| Option                       | Type                           | Default                   | Description |
|------------------------------|--------------------------------|---------------------------|-------------|
| `cartTotalSelector`           | `string`                       | `'#cart-total'`            | The CSS selector for the element displaying the total cart price. |
| `cartCountSelector`           | `string`                       | `'#cart-count'`            | The CSS selector for the element showing the total number of items in the cart. |
| `cartItemsSelector`           | `string`                       | `'#cart-items'`            | The CSS selector for the element where the list of cart items will be rendered. |
| `cartSidebarTotalSelector`    | `string`                       | `'#cart-total-sidebar'`    | The CSS selector for displaying the total price in the cart sidebar (if enabled). |
| `sidebarEnabled`              | `boolean`                      | `false`                    | Enables/disables the automatic handling of the cart sidebar. |
| `sidebarSelector`             | `string`                       | `'.cart-sidebar'`          | The CSS selector for the sidebar that will display the cart. |
| `onItemAdded`                 | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item is added to the cart. |
| `onItemRemoved`               | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item is removed from the cart. |
| `onItemUpdated`               | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item’s quantity is updated. |
| `onCartCleared`               | `() => void`                   | `() => {}`                 | Callback triggered when the cart is cleared. |
| `onDiscountApplied`           | `(discount: number) => void`   | `() => {}`                 | Callback triggered when a valid discount is applied to the cart. |
| `onInvalidDiscount`           | `(code: string) => void`       | `() => {}`                 | Callback triggered when an invalid discount code is used. |
| `widgets`                     | `Array<any>`                   | `[]`                       | An array of widgets to register. Widgets can be custom elements like the `CartPreviewWidget`. |

### Example Configuration:

```typescript
const cart = new Panierr({
  cartTotalSelector: '#cart-total',            // Element to display total price
  cartCountSelector: '#cart-count',            // Element to display item count
  cartItemsSelector: '#cart-items',            // Element to display list of cart items
  cartSidebarTotalSelector: '#cart-sidebar-total', // Element to display total price in sidebar
  sidebarEnabled: true,                        // Enable the cart sidebar
  sidebarSelector: '.cart-sidebar',            // Define the sidebar element
  onItemAdded: (item) => console.log(`Added: ${item.name}`),
  onItemRemoved: (item) => console.log(`Removed: ${item.name}`),
  onItemUpdated: (item) => console.log(`Updated: ${item.name}, quantity: ${item.quantity}`),
  onCartCleared: () => console.log('Cart cleared'),
  onDiscountApplied: (discount) => console.log(`Discount applied: ${discount}%`),
  onInvalidDiscount: (code) => console.log(`Invalid discount code: ${code}`),
  widgets: [CartPreviewWidget]  // Optional: Register widgets like CartPreviewWidget
});
```

## Contributing: Adding New Widgets

To contribute to Panierr by adding new widgets:

1. **Create the Widget Class**: Ensure the widget follows the structure of `CartPreviewWidget`.
2. **Register the Widget**: Widgets should be registered either during initialization or dynamically using `cart.registerWidgets()`.
3. **Customize with Slots**: Make use of the `slot` functionality for added flexibility.
4. **Style with CSS Variables**: Allow users to customize the widget by defining CSS variables in the widget’s stylesheet.

Example contribution process:

```typescript
class NewWidget extends HTMLElement {
  static register(cartInstance: any) {
    if (!customElements.get('new-widget')) {
      customElements.define('new-widget', NewWidget);
    }

    const widget = document.querySelector('new-widget') as NewWidget;
    widget.setCart(cartInstance);
  }

  setCart(cartInstance: any) {
    this.cart = cartInstance;
    // Attach event handlers, etc.
  }
  
  // ...additional widget logic...
}

export default NewWidget;
```

---

## License

Panierr is licensed under the MIT License. See the `LICENSE` file for details.

