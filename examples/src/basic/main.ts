import { Panierr, CartPreviewWidget } from '../../../src/index';

    const cart = new Panierr({
      cartTotalSelector: '#cart-total',
      cartCountSelector: '#cart-count',
      cartItemsSelector: '#cart-items',
      cartSidebarTotalSelector: '#cart-total-sidebar',
      sidebarEnabled: true,
      sidebarSelector: '.cart-sidebar',
      onItemAdded: (item) => console.log(`Item added: ${item.name}`),
      onItemRemoved: (item) => console.log(`Item removed: ${item.name}`),
      onItemUpdated: (item) => console.log(`Item updated: ${item.name}, quantity: ${item.quantity}`),
      onCartCleared: () => console.log('Cart cleared'),
      onDiscountApplied: (discount) => console.log(`Discount applied: ${discount}%`),
      onInvalidDiscount: (code) => console.log(`Invalid discount code: ${code}`)
    });
    console.log(cart);

    cart.registerWidgets([CartPreviewWidget]);

    document.getElementById('apply-discount-btn')?.addEventListener('click', () => {
      const discountCode = (document.getElementById('discount-code') as HTMLInputElement)?.value;
      cart.applyDiscount(discountCode);
    });

    document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
      cart.clearCart();
    });