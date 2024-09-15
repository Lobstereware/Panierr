import {  PanierrCore, PanierrDOM } from "../../src";

const cart = new PanierrCore({storageKey: 'fancyStoreCart'});
const panierDOM = new PanierrDOM({
  cart: cart,
  currencyFormat: { style: 'currency', currency: 'USD' },
  locale: 'en-US',
});
let cartOpened = false;
document.addEventListener('click', (event: any) => {
  const target = event.target.closest('[data-action="toggle-cart"]');
  if (target) {
    event.preventDefault();
    toggleCart();
  }
});

function toggleCart() {
    cartOpened=!cartOpened
  const cartSidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  
  cartOpened? cartSidebar?.classList.add('open'): cartSidebar?.classList.remove('open');
  cartOpened? overlay?.classList.add('active'):overlay?.classList.remove('active') ;
}

document.querySelector('.checkout-btn')?.addEventListener('click', () => {
  alert('Proceeding to checkout...');
});


PanierrDOM.prototype.createCartItemElement = function (item) {
  const formattedPrice = this.formatPrice(item.price);
  const itemElement = document.createElement('div');

  itemElement.setAttribute('data-cart-item', '');
  itemElement.setAttribute('data-item-id', item.id);
  itemElement.innerHTML = `
    <img src="${item.image}" alt="${item.name}">
    <div class="cart-item-details">
      <h4>${item.name}</h4>
      <p>${formattedPrice}</p>
      <div class="cart-item-controls">
        <button data-action="decrease-quantity" data-item-id="${item.id}">-</button>
        <input type="number" data-item-quantity data-item-id="${item.id}" value="${item.quantity}" min="1">
        <button data-action="increase-quantity" data-item-id="${item.id}">+</button>
      </div>
    </div>
    <button data-action="remove-from-cart" data-item-id="${item.id}" class="cart-item-remove">&times;</button>
  `;
  return itemElement;
};

panierDOM.renderCart()
