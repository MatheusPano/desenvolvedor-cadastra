import { Product } from "./Product";

const serverUrl: string = "http://localhost:5000";
let products: Product[] = [];
let cartItemCount: number = 0;
let productsPerRow: number;
let filteredProducts: Product[] = [];

function main(): void {
  console.log(serverUrl);
}


// ANCHOR - Buscar Produtos
/* ----------- Função assíncrona para buscar produtos do servidor ----------- */
async function fetchProducts(): Promise<void> {
  try {
    const response: Response = await fetch(`${serverUrl}/products`);
    if (!response.ok) {
      throw new Error("Erro ao carregar os produtos");
    }
    products = await response.json();
    // Renderiza os produtos após buscá-los
    renderProducts();
    applyFilters();
  } catch (error) {
    console.error("Erro:", error);
  }
}



// ANCHOR - Ordenar Produtos
/* --------------------- Função para ordenar os produtos -------------------- */
function sortProducts(option: string): void {
  // Ordena apenas os produtos filtrados, em vez de todos os produtos
  switch (option) {
    case "preco-crescente":
      filteredProducts.sort((a: Product, b: Product) => a.price - b.price);
      break;
    case "preco-decrescente":
      filteredProducts.sort((a: Product, b: Product) => b.price - a.price);
      break;
    case "mais-recente":
      filteredProducts.sort(
        (a: Product, b: Product) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      break;
  }

  // Renderiza os produtos filtrados após ordená-los
  //renderFilteredProducts(filteredProducts);
}

// ANCHOR - Aplicar os filtros
/* -------------- Função para aplicar os filtros selecionados -------------- */
function applyFilters(): void {
  const selectedColors = Array.from(
    document.querySelectorAll(".color-filter:checked")
  ).map((checkbox: HTMLInputElement) => checkbox.value);
  const selectedSizes = Array.from(
    document.querySelectorAll(".btn-size-filter.active")
  ).map((button: HTMLButtonElement) => button.value);
  const selectedPrices = Array.from(
    document.querySelectorAll(".price-filter:checked")
  ).map((checkbox: HTMLInputElement) => checkbox.value);

  console.log("preco selecionado -->", selectedPrices);
  filteredProducts = products.filter((product) => {
    const hasSelectedColor =
      selectedColors.length === 0 || selectedColors.includes(product.color);
    const hasSelectedSize =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => product.size.includes(size));
    const hasSelectedPrice =
      selectedPrices.length === 0 ||
      selectedPrices.some((priceRange) => {
        const [min, max] = priceRange.split("-").map(Number);
        console.log("min&max -->", min, max);
        return product.price >= min && product.price <= max;
      });
    return hasSelectedColor && hasSelectedSize && hasSelectedPrice;
  });

  // Verifica se a quantidade de produtos filtrados é menor que 6
  const showLoadMoreButton = filteredProducts.length >= 6;

  // Se houver um limite de produtos a serem mostrados, aplica o limite
  if (productsPerRow * 3 < filteredProducts.length) {
    filteredProducts = filteredProducts.slice(0, productsPerRow * 3);
  }

  // Renderiza os produtos filtrados
  console.log("produtos filtrados-->", filteredProducts)
  renderFilteredProducts(filteredProducts);

  // Seleciona o botão de "Carregar Mais"
  const loadMoreButton: HTMLButtonElement = document.querySelector(".load-more-button") as HTMLButtonElement;
  // Esconde o botão "Carregar Mais" quando a quantidade de produtos filtrados for menor que 6
  loadMoreButton.style.display = showLoadMoreButton ? "block" : "none";
}

// ANCHOR - Renderizar Produtos
/* -------------- Função assíncrona para renderizar os produtos ------------- */
async function renderProducts(option?: string): Promise<void> {
  // Seleciona o container dos produtos no DOM
  const productContainer: HTMLDivElement = document.querySelector(
    ".product-container"
  ) as HTMLDivElement;
  // Limpa o conteúdo anterior
  productContainer.innerHTML = "";

  // Define o número de produtos por linha com base no tamanho da tela
  productsPerRow = window.innerWidth < 768 ? 2 : 3;
  const maxProductsToShow: number = productsPerRow * 3;

  // Se uma opção de ordenação for fornecida, ordena os produtos filtrados
  if (option) {
    sortProducts(option);
    console.log(filteredProducts)
  }


  // Limita a quantidade de produtos filtrados a serem mostrados
  const productsToShow: Product[] = filteredProducts.slice(0, maxProductsToShow);

  // Renderiza os produtos na página
  if (productsToShow.length === 0) {
    productContainer.innerHTML = "<p class='no-products'>Nenhum produto encontrado</p>";
  } else {
    for (let i = 0; i < productsToShow.length; i += productsPerRow) {
      const productsInRow: Product[] = productsToShow.slice(i, i + productsPerRow);

      const productRow: HTMLDivElement = document.createElement("div");
      productRow.classList.add("product-row");

      productsInRow.forEach((product) => {
        const productCard: HTMLDivElement = createProductCard(product);
        productRow.appendChild(productCard);
      });

      productContainer.appendChild(productRow);
    }
  }
}


// ANCHOR - Criar Cards
/* ----------------- Função para criar um cartão de produto ----------------- */
function createProductCard(product: Product): HTMLDivElement {
  const productCard: HTMLDivElement = document.createElement("div");
  productCard.classList.add("product-card");

  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2 class="product-name">${product.name}</h2>
    <p class="product-price">R$ ${formatPrice(product.price)}</p>
    <p class="parcelamento">até ${formatParcelamento(product.parcelamento)}</p>
    <button class="buy-button">Comprar</button>
  `;

  productCard.querySelector(".buy-button")?.addEventListener("click", () => {
    addToCart(product);
    displayProductInfo(product)

  });

  return productCard;
}


// ANCHOR - Add MiniCart
/* -------------- Função para adicionar um produto ao carrinho -------------- */
function addToCart(product: Product): void {
  cartItemCount++;
  updateCartItemCount();
}


// ANCHOR - Att Contador
/* ---------- Função para atualizar o contador de itens no carrinho --------- */
function updateCartItemCount(): void {
  const cartItemCountElement: HTMLElement = document.querySelector(
    ".minicart__count span"
  ) as HTMLElement;
  if (cartItemCountElement) {
    cartItemCountElement.textContent = cartItemCount.toString();
  }
}


// ANCHOR - Formated Price
/* ---------------------- Função para formatar o preço ---------------------- */
function formatPrice(price: number): string {
  return price.toFixed(2).replace(".", ",");
}


// ANCHOR - Formatar o parcelamento
/* ------------------- Função para formatar o parcelamento ------------------ */
function formatParcelamento(parcelamento: number[]): string {
  if (parcelamento.length !== 2) {
    throw new Error("erro de parcelamento");
  }
  return `${parcelamento[0]}x de R$${formatPrice(parcelamento[1])}`;
}



// ANCHOR - Renderizar Prod. Filtrados
/* -------------- Função para renderizar os produtos filtrados -------------- */
function renderFilteredProducts(filteredProducts: Product[]): void {
  const productContainer: HTMLDivElement = document.querySelector(
    ".product-container"
  ) as HTMLDivElement;
  productContainer.innerHTML = "";

  if (filteredProducts.length === 0) {
    productContainer.innerHTML = "<p class='no-products'>Nenhum produto encontrado</p>";
  } else {
    for (let i = 0; i < filteredProducts.length; i += productsPerRow) {
      const productsInRow: Product[] = filteredProducts.slice(i, i + productsPerRow);

      const productRow: HTMLDivElement = document.createElement("div");
      productRow.classList.add("product-row");

      productsInRow.forEach((product) => {
        const productCard: HTMLDivElement = createProductCard(product);
        productRow.appendChild(productCard);
      });

      productContainer.appendChild(productRow);
    }
  }
}


// ANCHOR - Carregamento DOM
/* ---------------------- Evento de carregamento do DOM --------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Busca os produtos do servidor
  fetchProducts();
  // Adiciona eventos de clique nos botões de filtro
  document.querySelectorAll(".btn-size-filter").forEach((button) => {
    button.addEventListener("click", function () {
      button.classList.toggle("active");
      document.querySelectorAll(".btn-size-filter").forEach((otherButton) => {
        if (otherButton !== button) {
          otherButton.classList.remove("active");
        }
      });
      // Aplica os filtros selecionados
      applyFilters();
    });
  });
  // Adiciona eventos de mudança nos filtros de cor e preço
  document
    .querySelectorAll(".color-filter, .price-filter")
    .forEach((filter) => {
      filter.addEventListener("change", applyFilters);
    });
});



// ANCHOR - Carregamento DOM
 /* ---------------------- Evento de carregamento do DOM --------------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Seleciona os botões mobile de filtro e ordenação
  const filterMobileButton: HTMLElement = document.querySelector(".filter-mobile");
  const sortMobileButton: HTMLElement = document.querySelector(".sort-mobile");
  // Seleciona os menus de filtro e ordenação
  const filterMenu: HTMLElement = document.getElementById("filter-menu");
  const sortMenu: HTMLElement = document.getElementById("sort-menu");
  // Seleciona os botões de fechar menu
  const closeButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".close-menu");

  // Adiciona evento de clique para abrir/fechar o menu de filtro no modo mobile
  filterMobileButton.addEventListener("click", function () {
    filterMenu.classList.toggle("open");
  });

  // Adiciona evento de clique para abrir/fechar o menu de ordenação no modo mobile
  sortMobileButton.addEventListener("click", function () {
    sortMenu.classList.toggle("open");
  });

  // Adiciona evento de clique para fechar o menu ao clicar no botão de fechar
  closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      this.closest(".menu").classList.remove("open");
    });
  });

  // Chama a função para renderizar o dropdown de ordenação
  renderSortDropdown();
});


// ANCHOR - Renderizar Dropdown
/* ------------- Função para renderizar o dropdown de ordenação ------------- */
function renderSortDropdown(): void {
  const sortDropdown: HTMLSelectElement = document.querySelector(
    ".sort-dropdown"
  ) as HTMLSelectElement;

  // Adiciona evento de mudança no dropdown de ordenação
  sortDropdown.addEventListener("change", async (event) => {
    // Obtém a opção selecionada no dropdown
    const selectedOption: string = (event.target as HTMLSelectElement).value;
    // Renderiza os produtos com base na opção selecionada
    await renderProducts(selectedOption);
  });
}


// ANCHOR - Renderizar Prod. Restantes
/* ----------------- Função para renderizar os produtos restantes ------------- */
function renderRemainingProducts(startIndex: number): void {
  const productContainer: HTMLDivElement = document.querySelector(
    ".product-container"
  ) as HTMLDivElement;

  // Define o número total de produtos
  const totalProducts: number = products.length;

  // Define o número de produtos a serem exibidos a partir do índice fornecido
  const productsToShow: Product[] = products.slice(startIndex, totalProducts);

  // Renderiza os produtos adicionais na página
  for (let i = 0; i < productsToShow.length; i += productsPerRow) {
    const productsInRow: Product[] = productsToShow.slice(i, i + productsPerRow);

    const productRow: HTMLDivElement = document.createElement("div");
    productRow.classList.add("product-row");

    productsInRow.forEach((product) => {
      const productCard: HTMLDivElement = createProductCard(product);
      productRow.appendChild(productCard);
    });

    productContainer.appendChild(productRow);
  }
}


// ANCHOR - Carregar Mais
/* ----------------- Evento de clique no botão "Carregar Mais" -------------- */
document.querySelector(".load-more-button")?.addEventListener("click", () => {
  // Determina o índice a partir do qual os produtos adicionais serão exibidos
  const startIndex: number = document.querySelectorAll(".product-card").length;

  // Renderiza os produtos restantes
  renderRemainingProducts(startIndex);
});


//ANCHOR - Barra Lateral
/* --------------------- Função para exibir as informações do produto na barra lateral --------------------- */
function displayProductInfo(product: Product): void {
  const drawer: HTMLElement = document.querySelector(".drawer");
  const drawerContent: HTMLElement = document.querySelector(".drawer-content");

  // Limpa o conteúdo anterior do drawer
  //drawerContent.innerHTML = "";

  // Cria os elementos HTML para exibir as informações do produto
  const productInfoContainer: HTMLDivElement = document.createElement("div");
  productInfoContainer.classList.add("product-info");

  productInfoContainer.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="right-col-minicart">
      <h2>${product.name}</h2>
      <p> R$ ${formatPrice(product.price)}</p>
      <p> ou ${formatParcelamento(product.parcelamento)}</p>
    </div>
    
  `;

  // Adiciona as informações do produto ao drawer
  drawerContent.appendChild(productInfoContainer);

  // Abre o drawer
  drawer.classList.add("open");



}




// ANCHOR - Abrir minicart c/ Icone
/* --------------------- Icone minicart abre o carrinho --------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Adiciona evento de clique na div com a classe ".minicart" para abrir o drawer
  const miniCart: HTMLElement = document.querySelector(".minicart");
  const drawer: HTMLElement = document.querySelector(".drawer");
  miniCart.addEventListener("click", () => {
    drawer.classList.add("open");
  });
});

const closeDrawerButton: HTMLButtonElement = document.querySelector(".close-drawer-button");
const drawer: HTMLElement = document.querySelector(".drawer");
closeDrawerButton.addEventListener("click", () => {
  drawer.classList.remove("open");
});



// ANCHOR - Dropdown Order By
/* ------------------------------ DROPDOWN SORT ----------------------------- */
// Função para abrir ou fechar o dropdown
function toggleDropdown() {
  const dropdownMenu: HTMLElement = document.querySelector('.dropdown .dropdown-menu');
  dropdownMenu.classList.toggle('open');
}


// Função para selecionar uma opção do dropdown
function selectOption(option: string) {
  console.log(`Opção selecionada: ${option}`);
  // Aqui você pode adicionar o código para realizar alguma ação com a opção selecionada
  
  // Vamos adicionar o código para renderizar os produtos com base na opção selecionada aqui
  applyFilters();
  renderProducts(option);
}

// Adiciona event listeners para abrir ou fechar o dropdown ao clicar no botão
document.querySelector('.dropdown-toggle').addEventListener('click', toggleDropdown);

// Adiciona event listeners para selecionar uma opção ao clicar em um item do dropdown
document.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    const selectedOption: string = item.getAttribute('data-value');
    selectOption(selectedOption);
    toggleDropdown(); // Fecha o dropdown após selecionar uma opção
  });
});

// Evento de carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  // Busca os produtos do servidor
  fetchProducts();
  // Aplica os filtros selecionados
  applyFilters();
});

document.addEventListener("DOMContentLoaded", () => {
  const showMoreButton: HTMLButtonElement = document.querySelector(".show-more-colors") as HTMLButtonElement;
  const extraColors: HTMLElement = document.querySelector(".extra-colors") as HTMLElement;

  showMoreButton.addEventListener("click", () => {
    extraColors.style.display = extraColors.style.display === "none" ? "block" : "none";
    showMoreButton.textContent = extraColors.style.display === "none" ? "Ver todas as cores" : "Ver menos cores";
    showMoreButton.classList.toggle("active"); // Alternância da classe active
  });
});


/* ---------------------- Evento de carregamento do DOM --------------------- */
document.addEventListener("DOMContentLoaded", main);
