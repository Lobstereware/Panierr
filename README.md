# Panierr - The Shopping Cart Library for [Sellista](https://sellista.shop)

Panierr is a lightweight, flexible, and event-driven shopping cart library designed for [Sellista](https://sellista.shop). It allows store owners to manage their shopping cart functionalities, such as adding/removing items, updating quantities, applying discounts, and more. It also supports widgets for easy integration into the UI.

## Features

- Add items to the cart
- Remove items from the cart
- Update item quantities
- Apply discounts
- Persist cart data using `localStorage`
- Sidebar cart functionality (optional)
- Event-driven design with custom event handlers
- Widget system to extend the cart UI

## Installation

Install Panierr via npm for use within your Sellista project:

```bash
npm install panierr
```

## Usage with Sellista

Panierr integrates smoothly with Sellista's product structure. Here's how to initialize and use it in your Sellista-powered store.

### Import the Library

```typescript
import Panierr from 'panierr';
```

### Initialize the Cart

Set up the shopping cart for your Sellista store using the following configuration:

```typescript
const cart = new Panierr({
  cartTotalSelector: '#cart-total',                // Selector for cart total element
  cartCountSelector: '#cart-count',                // Selector for cart item count element
  cartItemsSelector: '#cart-items',                // Selector for cart items container
  cartSidebarTotalSelector: '#cart-sidebar-total', // Selector for cart total in the sidebar
  sidebarEnabled: true,                            // Enable/Disable sidebar handling
  onItemAdded: (item) => {
    console.log(`Item added to cart: ${item.name}`);
  },
  onItemRemoved: (item) => {
    console.log(`Item removed from cart: ${item.name}`);
  },
  onItemUpdated: (item) => {
    console.log(`Item quantity updated: ${item.name}, quantity: ${item.quantity}`);
  },
  onCartCleared: () => {
    console.log('Cart has been cleared.');
  },
  onDiscountApplied: (discount) => {
    console.log(`Discount applied: ${discount}%`);
  },
  onInvalidDiscount: (code) => {
    console.log(`Invalid discount code: ${code}`);
  },
  widgets: [CartPreviewWidget] // Optional: Register widgets like CartPreviewWidget
});
```

### Adding Items to the Cart in Sellista

Each product in Sellista uses standard HTML data attributes to store product information. Here's how to integrate Panierr to add items to the cart.

```html
<div class="product" data-product data-item-id="laptop-1" data-item-name="Laptop" data-item-price="1200">
  <h3>Laptop</h3>
  <p>Price: $1200.00</p>
  <button class="add-to-cart">Add to Cart</button>
</div>

<script>
  document.querySelectorAll('[data-add-to-cart]').forEach(button => {
    button.addEventListener('click', () => {
      const productElement = button.closest('[data-product]');
      cart.addToCart(productElement);  // Add product to the cart
    });
  });
</script>
```

### Removing Items from the Cart

To remove an item, you can use the `data-item-id` attribute:

```html
<button class="remove-from-cart" data-item-id="laptop-1">Remove</button>

<script>
  document.querySelectorAll('.remove-from-cart').forEach(button => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-item-id');
      cart.removeFromCart(itemId);  // Remove the item by ID
    });
  });
</script>
```

### Updating Item Quantities

Allow users to update item quantities within the cart:

```html
<input class="update-quantity" type="number" value="1" data-item-id="laptop-1">

<script>
  document.querySelectorAll('.update-quantity').forEach(input => {
    input.addEventListener('change', () => {
      const itemId = input.getAttribute('data-item-id');
      const newQuantity = parseInt(input.value);
      cart.updateItemQuantity(itemId, newQuantity);  // Update quantity
    });
  });
</script>
```

### Clearing the Cart

Clear the entire cart easily:

```typescript
cart.clearCart();  // Clears all items from the cart
```

### Applying Discounts

To apply discount codes:

```typescript
cart.applyDiscount('SAVE10');  // Applies a 10% discount if the code is valid
```

## Widgets System

Panierr supports a widget system to extend the cart's UI, like the `CartPreviewWidget`. Widgets are defined as Web Components, and you can register them via the `widgets` array or using `cart.registerWidgets`.

### Example Widget Usage:

```typescript
import { Panierr, CartPreviewWidget } from 'panierr';

const cart = new Panierr({
  sidebarEnabled: true,
  widgets: [CartPreviewWidget]
});
```

## Configuration Options

| Option                       | Type                           | Default                   | Description |
|------------------------------|--------------------------------|---------------------------|-------------|
| `cartTotalSelector`           | `string`                       | `'#cart-total'`            | The CSS selector for the element displaying the cart total. |
| `cartCountSelector`           | `string`                       | `'#cart-count'`            | The CSS selector for the element displaying the total item count. |
| `cartItemsSelector`           | `string`                       | `'#cart-items'`            | The CSS selector for the container where cart items are rendered. |
| `cartSidebarTotalSelector`    | `string`                       | `'#cart-sidebar-total'`    | The CSS selector for the sidebar displaying the cart total. |
| `sidebarEnabled`              | `boolean`                      | `false`                    | Enables/disables the automatic handling of the cart sidebar. |
| `sidebarSelector`             | `string`                       | `'.cart-sidebar'`          | The CSS selector for the sidebar that will display the cart. |
| `onItemAdded`                 | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item is added to the cart. |
| `onItemRemoved`               | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item is removed from the cart. |
| `onItemUpdated`               | `(item: CartItem) => void`     | `() => {}`                 | Callback triggered when an item's quantity is updated. |
| `onCartCleared`               | `() => void`                   | `() => {}`                 | Callback triggered when the cart is cleared. |
| `onDiscountApplied`           | `(discount: number) => void`   | `() => {}`                 | Callback triggered when a valid discount is applied. |
| `onInvalidDiscount`           | `(code: string) => void`       | `() => {}`                 | Callback triggered when an invalid discount code is used. |
| `widgets`                     | `Array<any>`                   | `[]`                       | An array of widgets to register. Widgets can be custom elements like the `CartPreviewWidget`. |

## Contributing

We welcome contributions to improve Panierr. You can add new features, fix bugs, or create new widgets that enhance the shopping experience. To create a custom widget, define a new class that extends `HTMLElement`, and register it using the `registerWidgets` method.

### Creating Custom Widgets

Here's an example of how you can create and register a custom widget:

```typescript
class MyCustomWidget extends HTMLElement {
  constructor() {
    super();
    // Custom widget logic
  }
  
  static register(cartInstance: Panierr) {
    customElements.define('my-custom-widget', MyCustomWidget);
    const widget = new MyCustomWidget();
    widget.setAttribute('cart', cartInstance);
    document.body.appendChild(widget);
  }
}
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## About Sellista

[Panierr](https://sellista.shop) is part of the [Sellista](https://sellista.shop) ecosystem, an innovative platform designed to empower small businesses with customizable online stores. [Explore more features here](https://sellista.shop).