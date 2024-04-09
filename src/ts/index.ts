import { Product } from "./Product";

const serverUrl = "http://localhost:5000";
let products: Product[] = [];
let cartItemCount = 0;
let productsPerRow: number;

function main() {
  console.log(serverUrl);
}

async function fetchProducts(): Promise<void> {
  try {
    const response = await fetch(`${serverUrl}/products`);
    if (!response.ok) {
      throw new Error('Erro ao carregar os produtos');
    }
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Erro:', error);
  }
}

function renderProducts(): void {
  const productContainer = document.querySelector('.product-container') as HTMLDivElement;
  productContainer.innerHTML = '';

  productsPerRow = window.innerWidth < 768 ? 2 : 3;
  const maxProductsToShow = productsPerRow * 3;
  const productsToShow = products.slice(0, maxProductsToShow);

  for (let i = 0; i < productsToShow.length; i += productsPerRow) {
    const productsInRow = productsToShow.slice(i, i + productsPerRow);

    const productRow = document.createElement('div');
    productRow.classList.add('product-row');

    productsInRow.forEach(product => {
      const productCard = createProductCard(product);
      productRow.appendChild(productCard);
    });

    productContainer.appendChild(productRow);
  }
}

function createProductCard(product: Product): HTMLDivElement {
  const productCard = document.createElement('div');
  productCard.classList.add('product-card');

  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2 class="product-name">${product.name}</h2>
    <p class="product-price">R$ ${formatPrice(product.price)}</p>
    <p class="parcelamento">até ${formatParcelamento(product.parcelamento)}</p>
    <button class="buy-button">Comprar</button>
  `;

  productCard.querySelector('.buy-button')?.addEventListener('click', () => {
    addToCart(product);
  });

  return productCard;
}

function addToCart(product: Product): void {
  cartItemCount++;
  updateCartItemCount();
}

function updateCartItemCount(): void {
  const cartItemCountElement = document.querySelector('.minicart__count span') as HTMLElement;
  if (cartItemCountElement) {
    cartItemCountElement.textContent = cartItemCount.toString();
  }
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',');
}

function formatParcelamento(parcelamento: number[]): string {
  if (parcelamento.length !== 2) {
    throw new Error('erro de parcelamento');
  }
  return `${parcelamento[0]}x de R$${formatPrice(parcelamento[1])}`;
}

function applyFilters(): void {
  const selectedColors = Array.from(document.querySelectorAll('.color-filter:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
  const selectedSizes = Array.from(document.querySelectorAll('.btn-size-filter.active')).map((button: HTMLButtonElement) => button.value);
  const selectedPrices = Array.from(document.querySelectorAll('.price-filter:checked')).map((checkbox: HTMLInputElement) => checkbox.value);

  console.log("preco selecionado -->", selectedPrices)
  const filteredProducts = products.filter(product => {
    const hasSelectedColor = selectedColors.length === 0 || selectedColors.includes(product.color);
    const hasSelectedSize = selectedSizes.length === 0 || selectedSizes.some(size => product.size.includes(size));
    const hasSelectedPrice = selectedPrices.length === 0 || selectedPrices.some(priceRange => {
      const [min, max] = priceRange.split('-').map(Number);
      console.log("min&max -->", min, max)
      return product.price >= min && product.price <= max;
    });
    return hasSelectedColor && hasSelectedSize && hasSelectedPrice;
  });

  renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(filteredProducts: Product[]): void {
  const productContainer = document.querySelector('.product-container') as HTMLDivElement;
  productContainer.innerHTML = '';

  for (let i = 0; i < filteredProducts.length; i += productsPerRow) {
    const productsInRow = filteredProducts.slice(i, i + productsPerRow);

    const productRow = document.createElement('div');
    productRow.classList.add('product-row');

    productsInRow.forEach(product => {
      const productCard = createProductCard(product);
      productRow.appendChild(productCard);
    });

    productContainer.appendChild(productRow);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  document.querySelectorAll('.btn-size-filter').forEach(button => {
    button.addEventListener('click', function () {
      button.classList.toggle('active');
      document.querySelectorAll('.btn-size-filter').forEach(otherButton => {
        if (otherButton !== button) {
          otherButton.classList.remove('active');
        }
      });
      applyFilters();
    });
  });
  document.querySelectorAll('.color-filter, .price-filter').forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const filterMobileButton = document.querySelector('.filter-mobile');
  const sortMobileButton = document.querySelector('.sort-mobile');
  const filterMenu = document.getElementById('filter-menu');
  const sortMenu = document.getElementById('sort-menu');
  const closeButtons = document.querySelectorAll('.close-menu');

  filterMobileButton.addEventListener('click', function() {
    filterMenu.classList.toggle('open');
  });

  sortMobileButton.addEventListener('click', function() {
    sortMenu.classList.toggle('open');
  });

  closeButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      this.closest('.menu').classList.remove('open');
    });
  });
});


document.addEventListener("DOMContentLoaded", main);