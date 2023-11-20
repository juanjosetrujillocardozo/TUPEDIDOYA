import { API_URL } from './../constants/constants.js';
import { fetchRequest, } from './modules/index.js';

// DECLARIÓN DE VARIABLES
const d = document;

let $productList,
  $productCardTemplate,
  $tabProductsTemplate,
  $tabButtonTemplate,
  $labelOferta,
  $labelStock,
  $price,
  $priceWithDiscount;

// DECLARACIÓN DE FUNCIONES
const construirTarjetasProductos = (productos, vendedor = false) => {

  // FILTRAMOS LOS PRODUCTOS INACTIVOS
  productos = productos.filter(product => product.status);


  // AGRUPAMOS LOS PRODUCTOS
  productos = Object.groupBy(productos, p => p.inventory_group_id.name);
  console.log(productos);

  const $fragmentTabs = d.createDocumentFragment(),
    $fragmentButtonTabs = d.createDocumentFragment();

  let tabActive = false;

  for (const categoria in productos) {
    // CREAMOS EL BOTÓN ASOCIADO A CADA TAB DE CATEGORÍA
    const $tabButton = d.importNode($tabButtonTemplate, true);

    const $aTabButton = $tabButton.querySelector('.tab-button');

    $aTabButton.setAttribute('href', `#tab-${categoria}`);
    $aTabButton.textContent = categoria;

    // CREAMOS LA TAB PARA CADA CATEGORÍA DE PRODUCTOS
    const $tabProducts = d.importNode($tabProductsTemplate, true);
    $tabProducts.querySelector('.tab').setAttribute('id', `tab-${categoria}`);
    if (!tabActive) {
      $tabProducts.querySelector('.tab').classList.add('active');
      $aTabButton.classList.add('active');
      tabActive = true;
    }

    $fragmentButtonTabs.appendChild($tabButton);

    $productList = $tabProducts.querySelector('.product-list');


    for (const product of productos[categoria]) {
      // CREAMOS LA TARJETA PARA CADA PRODUCTO
      const $cardProduct = d.importNode($productCardTemplate, true);

      $labelOferta = $cardProduct.querySelector('.label-oferta');
      $price = $cardProduct.querySelector('.card-product-price')
      $priceWithDiscount = $cardProduct.querySelector('.card-product-price-discount');
      $labelStock = $cardProduct.querySelector('.label-stock');

      $cardProduct.querySelector('.card-product-name').textContent = product.name;
      const price = parseInt(product.price);
      $price.textContent = `$${price.toLocaleString("en")}`;


      $cardProduct.querySelector('.add-cart').setAttribute('data-id-product', product.id);

      if (vendedor && product.commission_id) {
        $labelOferta.style.display = 'block';
      } else if (!vendedor && product.discount_id) {
        $labelOferta.style.display = 'block';
        $priceWithDiscount.classList.remove('d-none');
        $price.classList.add('text-decoration-line-through');
        $priceWithDiscount.textContent = `$${(price - (price * product.discount_id.percentage / 100)).toLocaleString("en")}`;
      }

      $labelOferta.textContent = vendedor ? `Comisión ${product.commission_id?.percentage}%` : `Descuento ${product.discount_id?.percentage}%`;
      let txt = product.stock;
      if (product.inventoried) {
        if (product.stock > 1) {
          txt += ' unidades disponibles';
        } else if (product.stock === 1) {
          txt = '¡última unidad disponible!';
        } else {
          txt = 'sin unidades disponibles';
          $cardProduct.querySelector('.label-agotado').classList.remove('d-none');
        }
      } else {
        txt = 'Sin restricción de inventario';
      }

      $labelStock.textContent = txt;
      $productList.prepend($cardProduct);
      console.log($tabProducts);

    }
    $fragmentTabs.appendChild($tabProducts)
  }

  d.querySelector('.categorias').appendChild($fragmentButtonTabs);
  d.querySelector('.tab-content').appendChild($fragmentTabs);

};

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $productCardTemplate = d.getElementById('card-product-template').content,
    $tabProductsTemplate = d.getElementById('tab-products-template').content,
    $tabButtonTemplate = d.getElementById('tab-button-template').content;

  const errorCatchProductos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los productos');
  };

  let productos = await fetchRequest(null, errorCatchProductos, `${API_URL}/product/all`);
  console.log(productos);

  // OBTENEMOS EL ROL DEL USUARIO
  const errorCatchPerfilUsuario = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los datos del perfil del usuario');
  };

  let resPerfil = await fetchRequest(null, errorCatchPerfilUsuario, `${API_URL}/user/profile`, 'GET', null, false);

  console.log(resPerfil);

  // SI EL USUARIO NO ESTÁ AUTENTICADO O NO ES UN VENDEDOR, SE ASUME QUE ES UN CLIENTE
  if (!resPerfil || resPerfil.data.role.name !== 'VEN') {
    construirTarjetasProductos(productos.data);
  } else {
    construirTarjetasProductos(productos.data, true);
  }

});

d.addEventListener('click', e => {
  if (e.target.matches('.add-cart')) {
    console.log(e.target);

    const errorCatchCarritoCompras = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al agregar el producto al carrito de compras');
    };

    // let productos = await fetchRequest(null, errorCatchCarritoCompras, `${API_URL}/shopping-cart/add-shopping-cart`);
    // console.log(productos);

  }

});
