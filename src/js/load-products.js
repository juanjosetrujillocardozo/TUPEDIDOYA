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
  $priceWithDiscount,
  $modalShoppingCart,
  $selectClientes,
  $tbodyShoppingCart,
  idCliente = null,
  // esta variable almacena el primer producto que se agrega cuando el carrito de compras no tiene un cliente asignado
  idProductoSinCliente = null,
  agregarPrimerProducto = false,
  $liErrors;

// DECLARACIÓN DE FUNCIONES
const obtenerInfoProducto = (elemen) => {
  let etiqueta = elemen;
  while (!etiqueta.hasAttribute('data-id-product')) {
    etiqueta = etiqueta.parentElement;
  }

  return {
    id: etiqueta.getAttribute('data-id-product'),
    cantidad: etiqueta.querySelector('.cantidad'),
  };
};

const construirTarjetasProductos = async (productos, vendedor = false) => {

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



      const productShoppingCart = await buscarProductoEnCarrito(product.id);
      if (productShoppingCart)
        $cardProduct.querySelector('.cantidad').textContent = productShoppingCart.data.count;

      $cardProduct.querySelector('.controls-card').setAttribute('data-id-product', product.id);

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

const obtenerClientes = async (editar = false, idCliente = null) => {
  const errorCatchClientes = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los clientes ');
  };

  let response = await fetchRequest(null, errorCatchClientes, `${API_URL}/user/all`);
  console.log(response);
  response.data = response.data.filter(g => g.status);

  if (!response || !response.data.length) {
    $selectClientes.innerHTML = `<option>No hay clientes</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectClientes.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const cliente of response.data) {
      const $option = d.createElement('option');
      $option.textContent = cliente.names + ' ' + cliente.surnames;
      $option.setAttribute('value', cliente.id);
      if (editar && cliente.id === idGrupo)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectClientes.appendChild($fragment);

  }
};

const buscarProductoEnCarrito = async (idProduct) => {
  const errorCatchFindItem = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al consultar un elemento del carrito');
  };

  const onErrorResponse = (res, response) => {
    console.log(response);
    if (res.status == 400) {
      console.log(response.message);
    }
  };

  // verificamos que el producto no esté en el carrito de compras
  return await fetchRequest(onErrorResponse, errorCatchFindItem, `${API_URL}/shopping-cart/find/${idProduct}`);
};

const addProductCart = async (inforProduct) => {


  const product = await buscarProductoEnCarrito(inforProduct.id);

  // si el producto no existe lo agregamos
  if (!product) {
    console.log('se agrega');

    const errorCatchAddItem = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al agregar un elemento al carrito');
    };

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        console.log(response.message);
      }
    };

    await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/add-shopping-cart`, 'POST', {
      product: parseInt(inforProduct.id),
      count: 1,
      customer: parseInt(idCliente),
    });
  } else {

    // const product = await buscarProductoEnCarrito(inforProduct.id);

    const errorCatchAddItem = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al actualizar un elemento en el carrito');
    };

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        console.log(response.message);
      }
    };

    const res = await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/update-shopping-cart/${inforProduct.id}`, 'PATCH', {
      count: product.data.count + 1,
    });
    if (res)
      inforProduct.cantidad.textContent = product.data.count + 1;

  }
};

const removeProductCart = async (inforProduct) => {


  const product = await buscarProductoEnCarrito(inforProduct.id);

  if (product) {

    // const product = await buscarProductoEnCarrito(inforProduct.id);
    if (product.data.count == 1) {
      console.log('se elimina');
      const errorCatchDeleteItem = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.log('Ha ocurrido un error al eliminar un elemento en el carrito');
      };

      const onErrorResponse = (res, response) => {
        console.log(response);
        if (res.status == 400) {
          console.log(response.message);
        }
      };

      const res = await fetchRequest(onErrorResponse, errorCatchDeleteItem, `${API_URL}/shopping-cart/delete-shopping-cart/${inforProduct.id}`, 'DELETE');
      if (res)
        inforProduct.cantidad.textContent = 0;

    } else {
      console.log('se actualiza');
      const errorCatchAddItem = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.log('Ha ocurrido un error al actualizar un elemento en el carrito');
      };

      const onErrorResponse = (res, response) => {
        console.log(response);
        if (res.status == 400) {
          console.log(response.message);
        }
      };

      const res = await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/update-shopping-cart/${inforProduct.id}`, 'PATCH', {
        count: product.data.count - 1,
      });
      if (res)
        inforProduct.cantidad.textContent = product.data.count - 1;
    }
  }
};

const modificarCarrito = async (elem, agregar = true) => {
  // VALIDAMOS SI EL CARRITO ESTÁ VACÍO
  const errorCatchCarritoCompras = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al consultar el carrito de compras');
  };

  let productos = await fetchRequest(null, errorCatchCarritoCompras, `${API_URL}/shopping-cart/all`);
  console.log(productos);
  if (!productos.data.length) {
    // ABRIMOS EL CARRITO DE COMPRAS PARA QUE EL VENDEDOR SELECCIONE EL CLIENTE
    await obtenerClientes();
    $modalShoppingCart.show();
    $liErrors.innerHTML = `<li>Seleccione un cliente</li>`

    idProductoSinCliente = obtenerInfoProducto(elem);
  } else {
    if (!idCliente) {
      idCliente = productos.data[0].user_id.id;
    }
    // AÑADIR EL PRODUCTO AL CARRITO
    if (agregar)
      addProductCart(obtenerInfoProducto(elem));
    else
      removeProductCart(obtenerInfoProducto(elem))
  }
};
const construirCarrito = async (idProducto) => {
  const $tr = d.createElement('tr');

  const errorCatchClientes = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener el producto ');
  };

  const dataProduct = await fetchRequest(null, errorCatchClientes, `${API_URL}/product/find/${idProducto}`);

  console.log(dataProduct);

  const datos = [dataProduct.data.name, 1, dataProduct.data.price, dataProduct.data.price];

  for (const data of datos) {
    const $td = d.createElement('td');
    $td.textContent = data;
    $tr.appendChild($td)
  }


  console.log($tbodyShoppingCart);
  $tbodyShoppingCart.appendChild($tr);


};

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $productCardTemplate = d.getElementById('card-product-template').content,
    $tabProductsTemplate = d.getElementById('tab-products-template').content,
    $tabButtonTemplate = d.getElementById('tab-button-template').content,
    $selectClientes = d.querySelector('#shoppingCartModal #customer'),
    $tbodyShoppingCart = d.querySelector('#shoppingCartModal tbody'),
    $liErrors = d.getElementById('errors'),
    $modalShoppingCart = new bootstrap.Modal('#shoppingCartModal', {
      keyboard: false,
      backdrop: 'static',
    });

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

d.addEventListener('click', async e => {
  if (e.target.matches('.add-cart, .add-cart *')) {
    agregarPrimerProducto = true;
    modificarCarrito(e.target);
  }

  if (e.target.matches('.minus-cart, .minus-cart *')) {
    modificarCarrito(e.target, false);
  }
  console.log(e.target);
  if (e.target.matches('.btn-shopping-cart')) {
    construirCarrito();
  }

});

d.addEventListener('change', async e => {
  if (e.target.matches('#customer')) {
    if (!idCliente) {
      idCliente = e.target[e.target.selectedIndex].value;
      if (agregarPrimerProducto)
        await addProductCart(idProductoSinCliente);
      $liErrors.innerHTML = '';
      d.querySelector('.btn-close').classList.remove('d-none');
    } else {
      idCliente = e.target[e.target.selectedIndex].value;
    }

  }
});
