# Panierr - The Shopping Cart Library for [Sellista](https://sellista.shop)

Panierr is a lightweight, flexible, and event-driven shopping cart library designed for [Sellista](https://sellista.shop). It integrates seamlessly with the platform, allowing store owners to manage shopping cart functionalities like adding, removing, updating quantities, and applying discounts with ease. Panierr stores cart data in `localStorage` for persistence, ensuring a smooth experience for your users.

## About Sellista

Sellista is an eCommerce platform designed to help businesses build beautiful online stores without complexity. [Visit Sellista](https://sellista.shop/) to explore powerful features for launching and managing your store.

## Features

- Add items to the cart
- Remove items from the cart
- Update item quantities
- Apply discounts
- Persist cart data using `localStorage`
- Event-driven design with custom event handlers
- Easy integration with the Sellista platform

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
  }
});
```

### Adding Items to the Cart in Sellista

Each product in Sellista uses standard HTML data attributes to store product information. Here's an example of how to integrate Panierr to add items to the cart.

```html
<div class="product" data-item-id="laptop-1" data-item-name="Laptop" data-item-price="1200">
  <h3>Laptop</h3>
  <p>Price: $1200.00</p>
  <button class="add-to-cart">Add to Cart</button>
</div>

<script>
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productElement = button.closest('.product');
      cart.addToCart(productElement);  // Add product to the cart
    });
  });
</script>
```

### Removing Items from the Cart

When removing an item from the cart, Panierr takes care of the logic using the `data-item-id` attribute on the button:

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

You can allow users to update item quantities within the cart. The input structure below will allow quantity updates in real-time:

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

Clearing the entire cart is simple:

```typescript
cart.clearCart();  // Clears all items from the cart
```

### Applying Discounts

You can apply discount codes easily within the cart system:

```typescript
cart.applyDiscount('SAVE10');  // Applies a 10% discount if the code is valid
```

## Event-Driven Design

Panierr uses custom events to notify you when changes occur in the cart. This makes it easy to perform actions like updating UI components or saving data to a server when the cart is modified.

Supported events:
- `itemAdded`: Triggered when an item is added to the cart.
- `itemRemoved`: Triggered when an item is removed from the cart.
- `itemUpdated`: Triggered when an item's quantity is updated.
- `cartCleared`: Triggered when the cart is cleared.
- `discountApplied`: Triggered when a valid discount is applied.
- `invalidDiscount`: Triggered when an invalid discount code is used.

### Example Event Usage

```typescript
cart.on('itemAdded', (item) => {
  console.log(`${item.name} was added to the cart.`);
});
```

## Configuration Options

Panierr supports the following configuration options:

| Option                | Type                          | Default                  | Description |
|-----------------------|-------------------------------|--------------------------|-------------|
| `cartTotalSelector`    | `string`                      | `'#cart-total'`           | The CSS selector for the element displaying the cart total. |
| `cartCountSelector`    | `string`                      | `'#cart-count'`           | The CSS selector for the element displaying the total item count. |
| `cartItemsSelector`    | `string`                      | `'#cart-items'`           | The CSS selector for the container where cart items are rendered. |
| `cartSidebarTotalSelector` | `string`                  | `'#cart-sidebar-total'`   | The CSS selector for the sidebar displaying the cart total. |
| `onItemAdded`          | `(item: CartItem) => void`    | `() => {}`                | Callback triggered when an item is added to the cart. |
| `onItemRemoved`        | `(item: CartItem) => void`    | `() => {}`                | Callback triggered when an item is removed from the cart. |
| `onItemUpdated`        | `(item: CartItem) => void`    | `() => {}`                | Callback triggered when an item's quantity is updated. |
| `onCartCleared`        | `() => void`                  | `() => {}`                | Callback triggered when the cart is cleared. |
| `onDiscountApplied`    | `(discount: number) => void`  | `() => {}`                | Callback triggered when a valid discount is applied. |
| `onInvalidDiscount`    | `(code: string) => void`      | `() => {}`                | Callback triggered when an invalid discount code is used. |

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## About Sellista

[Panierr](https://sellista.shop) is part of the [Sellista](https://sellista.shop) ecosystem, an innovative platform designed to empower small businesses with customizable online stores. [Explore more features here](https://sellista.shop).
