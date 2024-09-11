import { Panierr } from '../../../src/index';

// Initialize Panierr instance
const cart = new Panierr({
  cartItemsSelector: '#cart-items',
  cartTotalSelector: '#cart-total',
  onItemAdded: (item) => {
    console.log(`Item added: ${item.name}`);
  },
  onItemRemoved: (item) => {
    console.log(`Item removed: ${item.name}`);
  },
  onItemUpdated: (item) => {
    console.log(`Item updated: ${item.name}`);
  },
  onCartCleared: () => {
    console.log('Cart cleared');
  },
  onDiscountApplied: (discount) => {
    console.log(`Discount applied: ${discount}%`);
  },
  onInvalidDiscount: (code) => {
    console.log(`Invalid discount code: ${code}`);
  },
});

cart.renderCart();

document.getElementById('checkout-btn')?.addEventListener('click', () => {
  alert('Proceeding to checkout...');
  // Here you would trigger your checkout flow
});
