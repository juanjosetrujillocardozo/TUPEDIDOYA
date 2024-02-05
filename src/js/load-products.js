import { API_URL } from './../constants/constants.js';
import { fetchRequest, validarPermiso, appendAlert } from './modules/index.js';

validarPermiso();
// DECLARIÓN DE VARIABLES
const d = document;

let perfil,
  $productList,
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
  clickEnBoton = false,
  // esta variable almacena el primer producto que se agrega cuando el carrito de compras no tiene un cliente asignado
  $ultimoInputCantidadModificado = null,
  idProductoSinCliente = null,
  agregarPrimerProducto = false,
  $continueShoppingContainer,
  $finishShoppingContainer,
  $finishShopping,
  $paymentMethod,
  $zone,
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

      new CampoNumerico($cardProduct.querySelector('.cantidad'));

      $labelOferta = $cardProduct.querySelector('.label-oferta');
      $price = $cardProduct.querySelector('.card-product-price')
      $priceWithDiscount = $cardProduct.querySelector('.card-product-price-discount');
      $labelStock = $cardProduct.querySelector('.label-stock');
      const $img = $cardProduct.querySelector('img');

      $cardProduct.querySelector('.card-product-name').textContent = product.name;
      const price = parseInt(product.price);
      $price.textContent = `$${price.toLocaleString("en")}`;
      $img.src = (product.img) ? `${API_URL}/${product.img}` : "./..//assets/img/producto-defecto.jpg";

      if (perfil) {
        const productShoppingCart = await buscarProductoEnCarrito(product.id);
        if (productShoppingCart)
          $cardProduct.querySelector('.cantidad').value = productShoppingCart.data.count;
      }

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
      $cardProduct.querySelector('.descripcion').textContent = product.description;

      $labelStock.textContent = txt;
      $productList.prepend($cardProduct);

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

  const onErrorResponse = (res, response) => {
    console.log(response);
    if (res.status == 400) {
      console.log(response.message);
    }
  };

  let response = await fetchRequest(onErrorResponse, errorCatchClientes, `${API_URL}/user/all`);
  response.data = response.data.filter(g => g.status && g.role.name === 'CLI');

  if (!response || !response.data.length) {
    $selectClientes.innerHTML = `<option>No hay clientes</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectClientes.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const cliente of response.data) {
      const $option = d.createElement('option');
      $option.textContent = cliente.names + ' ' + cliente.surnames;
      $option.setAttribute('value', cliente.id);
      if (editar && cliente.id == idCliente)
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

    const res = await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/add-shopping-cart`, 'POST', {
      product: parseInt(inforProduct.id),
      count: 1,
      customer: (perfil === 'CLI') ? null : parseInt(idCliente),
    });

    if (res)
      inforProduct.cantidad.value = 1;

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
      inforProduct.cantidad.value = product.data.count + 1;

  }
};

const removeProductCart = async (inforProduct) => {


  const product = await buscarProductoEnCarrito(inforProduct.id);

  if (product) {

    // const product = await buscarProductoEnCarrito(inforProduct.id);
    if (product.data.count == 1) {
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
        inforProduct.cantidad.value = 0;

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
        inforProduct.cantidad.value = product.data.count - 1;
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
  if (!productos.data.length) {
    if (perfil !== 'CLI') {
      await obtenerClientes(true, idCliente || null);
      if (idCliente && agregar) {
        addProductCart(obtenerInfoProducto(elem));
      } else if (!idCliente) {
        // ABRIMOS EL CARRITO DE COMPRAS PARA QUE EL VENDEDOR SELECCIONE EL CLIENTE
        $modalShoppingCart.show();
        $liErrors.innerHTML = `<li>Seleccione un cliente</li>`
        idProductoSinCliente = obtenerInfoProducto(elem);
      }
    } else if (agregar) {
      addProductCart(obtenerInfoProducto(elem));
    }
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

const construirCarrito = async () => {
  const errorCatchCarritoCompras = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al consultar el carrito de compras');
  };

  let productos = await fetchRequest(null, errorCatchCarritoCompras, `${API_URL}/shopping-cart/all`);
  d.querySelector('.btn-close').classList.remove('d-none');

  if (localStorage.getItem('ROLE-USER') !== 'CLI') {
    await obtenerClientes(true, productos.data[0]?.user_id.id);
  } else {
    // si el usuario es un cliente no necesita el select de cliente
    const $customerFields = d.querySelectorAll('.customer-fields');
    $customerFields.forEach(cf => {
      d.getElementById('modal-fields').removeChild(cf);
    });
  }

  if (productos && productos.data.length) {

    // AGREGAMOS EL BOTON DE COMPRA
    $continueShoppingContainer.classList.remove('d-none');

    let total = 0;
    for (const data of productos.data) {
      const $tr = d.createElement('tr');

      const $tdProducto = d.createElement('td');
      const $tdCantidad = d.createElement('td');
      const $tdPrecioUnitario = d.createElement('td');
      const $tdTotal = d.createElement('td');

      $tdProducto.textContent = data.product_id.name;
      $tdCantidad.textContent = data.count;
      $tdPrecioUnitario.textContent = `$${parseInt(data.product_id.price).toLocaleString("en")
        }`
      const subtotal = parseInt(data.product_id.price * data.count);
      $tdTotal.textContent = `$${subtotal.toLocaleString("en")}`;

      $tr.appendChild($tdProducto);
      $tr.appendChild($tdCantidad);
      $tr.appendChild($tdPrecioUnitario);
      $tr.appendChild($tdTotal);
      $tbodyShoppingCart.appendChild($tr);
      total += subtotal;
    }

    const $tr = d.createElement('tr');
    for (const val of ['', '', 'Total', `$${total.toLocaleString("en")}`]) {
      const $td = d.createElement("td");
      $td.textContent = val;
      $td.style.fontWeight = 'bold';
      $tr.appendChild($td);
    }

    $tbodyShoppingCart.appendChild($tr);

  }

};

const obtenerZonas = async () => {
  const errorCatchZonas = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener las zonas');
  };

  let response = await fetchRequest(null, errorCatchZonas, `${API_URL}/zone/all`);

  if (!response || !response.data.length) {
    $zone.innerHTML = `<option>No hay zonas</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $zone.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const zona of response.data) {
      const $option = d.createElement('option');
      $option.textContent = zona.name;
      $option.setAttribute('value', zona.id);
      $fragment.appendChild($option);
    }
    $zone.appendChild($fragment);

  }
};

const obtenerMetodosPago = async () => {
  const errorCatchMetodosPago = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los métodos de pago');
  };

  let response = await fetchRequest(null, errorCatchMetodosPago, `${API_URL}/payment-method/all`);
  response.data = response.data.filter(g => g.status);

  if (!response || !response.data.length) {
    $paymentMethod.innerHTML = `<option>No hay métodos de pago</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $paymentMethod.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const metodoPago of response.data) {
      const $option = d.createElement('option');
      $option.textContent = metodoPago.name;
      $option.setAttribute('value', metodoPago.id);
      $fragment.appendChild($option);
    }
    $paymentMethod.appendChild($fragment);

  }
};

const validarErrores = function (serverError = null, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  if (!limpiar) {

    if (!$zone.selectedIndex)
      errores.push({ tp: 1, error: 'Debe seleccionar una zona.', });

    if (!$paymentMethod.selectedIndex)
      errores.push({ tp: 2, error: 'Debe seleccionar un método de pago.', });

  }

  const tpErrors = {};
  $liErrors.innerHTML = '';
  if (errores.length) {
    const $fragment = d.createDocumentFragment();
    errores.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    $liErrors.appendChild($fragment);
    (1 in tpErrors) ? $zone.classList.add('error') : $zone.classList.remove('error');
    (2 in tpErrors) ? $paymentMethod.classList.add('error') : $paymentMethod.classList.remove('error');
  } else {
    $zone.classList.remove('error');
    $paymentMethod.classList.remove('error');
  }

  return errores.length;
}

const buscarProducto = async (idProducto) => {
  const onErrorCatch = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.error('Ha ocurrido un error al obtener el producto.');
  };

  // se hace la petición por AJAX al backend
  return await fetchRequest(null, onErrorCatch, `${API_URL}/product/find/${idProducto}`);
};

const crearProductoEnCarrito = async (productos, inforProduct, e) => {

  if (!idCliente)
    idCliente = productos.data[0].user_id.id;

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

  return await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/add-shopping-cart`, 'POST', {
    product: parseInt(inforProduct.id),
    count: parseInt(e.target.value),
    customer: (perfil === 'CLI') ? null : parseInt(idCliente),
  });
};

const actualizarProductoEnCarrito = async (inforProduct, e) => {
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
  return await fetchRequest(onErrorResponse, errorCatchAddItem, `${API_URL}/shopping-cart/update-shopping-cart/${inforProduct.id}`, 'PATCH', {
    count: parseInt(e.target.value),
  });
};

const eliminarProductoCarrito = async (inforProduct) => {
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

  await fetchRequest(onErrorResponse, errorCatchDeleteItem, `${API_URL}/shopping-cart/delete-shopping-cart/${inforProduct.id}`, 'DELETE');
};

class CampoNumerico {

  constructor(nodo) {
    this.nodo = nodo;
    this.valor = '';

    this.empezarAEscucharEventos();
  }

  empezarAEscucharEventos() {
    this.nodo.addEventListener('keydown', function (evento) {
      const teclaPresionada = evento.key;
      const teclaPresionadaEsUnNumero =
        Number.isInteger(parseInt(teclaPresionada));

      const sePresionoUnaTeclaNoAdmitida =
        teclaPresionada != 'ArrowDown' &&
        teclaPresionada != 'ArrowUp' &&
        teclaPresionada != 'ArrowLeft' &&
        teclaPresionada != 'ArrowRight' &&
        teclaPresionada != 'Backspace' &&
        teclaPresionada != 'Delete' &&
        teclaPresionada != 'Enter' &&
        !teclaPresionadaEsUnNumero;
      const comienzaPorCero =
        this.nodo.value.length === 0 &&
        teclaPresionada == 0;

      if (sePresionoUnaTeclaNoAdmitida || comienzaPorCero) {
        evento.preventDefault();
      } else if (teclaPresionadaEsUnNumero) {
        this.valor += String(teclaPresionada);
      }

    }.bind(this));

    this.nodo.addEventListener('input', function (evento) {
      const cumpleFormatoEsperado = new RegExp(/^[0-9]+/).test(this.nodo.value);

      if (!cumpleFormatoEsperado) {
        this.nodo.value = '0';
      } else {
        this.valor = this.nodo.value;
      }
    }.bind(this));
  }

}



// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  perfil = localStorage.getItem('ROLE-USER');

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

  d.getElementById('shoppingCartModal').addEventListener('hidden.bs.modal', function (event) {
    clickEnBoton = false;
  });

  $continueShoppingContainer = d.getElementById('continue-shopping-container');
  $finishShoppingContainer = d.getElementById('finish-shopping-container');
  $paymentMethod = d.getElementById('payment-method');
  $zone = d.getElementById('zone');

  if (perfil) {
    await obtenerZonas();
    await obtenerMetodosPago();
  }

  const errorCatchProductos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los productos');
  };

  let productos = await fetchRequest(null, errorCatchProductos, `${API_URL}/product/all`);

  // SI EL USUARIO NO ESTÁ AUTENTICADO SE ASUME QUE ES UN CLIENTE
  if (!perfil || perfil === 'CLI') {
    construirTarjetasProductos(productos.data);
  } else {
    construirTarjetasProductos(productos.data, true);
  }

  d.getElementById('shoppingCartModal').addEventListener('hidden.bs.modal', event => {
    $tbodyShoppingCart.innerHTML = '';
    d.getElementById('cart-payment-method').classList.add('d-none');
    d.getElementById('cart-zone').classList.add('d-none');
    $finishShoppingContainer.classList.add('d-none');

    validarErrores(null, true);
  })

});

d.addEventListener('click', async e => {
  if (e.target.matches('.add-cart, .add-cart *')) {
    agregarPrimerProducto = true;
    clickEnBoton = true;
    modificarCarrito(e.target);
  }

  if (e.target.matches('.minus-cart, .minus-cart *')) {
    modificarCarrito(e.target, false);
  }
  if (e.target.matches('.btn-shopping-cart, .btn-shopping-cart *')) {
    construirCarrito();
  }

  if (e.target.matches('#continue-shopping')) {
    d.getElementById('cart-payment-method').classList.remove('d-none');
    d.getElementById('cart-zone').classList.remove('d-none');
    $finishShoppingContainer.classList.remove('d-none');
    $continueShoppingContainer.classList.add('d-none');
  }

  if (e.target.matches('#finish-shopping')) {
    const errors = validarErrores();

    if (!errors) {

      const errorCatchCrearRemision = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.log('Ha ocurrido un error al crear la remisión');
      };

      const remision = await fetchRequest(null, errorCatchCrearRemision, `${API_URL}/referral/create-referral`, 'POST', {
        payment_method: parseInt($paymentMethod[$paymentMethod.selectedIndex].value),
        zone: parseInt($zone[$zone.selectedIndex].value),
        description: "prueba de remison"
      });

      if (remision) {
        appendAlert(`Pedido Realizado Correctamente. El consecutivo de tu orden es: ${remision.data.referralSave.consecutive}`, 'success', 90000);
        $modalShoppingCart.hide();
        d.getElementById('form-shopping-cart').reset();
        d.querySelectorAll('input.cantidad').forEach(input => input.value = 0);
      }

    }
  }

});

d.addEventListener('change', async e => {
  if (e.target.matches('#customer')) {

    // VALIDAMOS SI EL CARRITO ESTÁ VACÍO
    const errorCatchCarritoCompras = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al consultar el carrito de compras');
    };

    let productos = await fetchRequest(null, errorCatchCarritoCompras, `${API_URL}/shopping-cart/all`);

    // si cambia el cliente actualizamos todos los registros del carrito de compras, si ya tenía un cliente asignado

    if (productos.data.length) {
      const errorCatchActualizarCliente = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.log('Ha ocurrido un error al actualizar el cliente del carrito de compras');
      };

      let productos = await fetchRequest(null, errorCatchActualizarCliente, `${API_URL}/shopping-cart/update-customer-cart`, 'PATCH', { customer: parseInt(e.target[e.target.selectedIndex].value) });
    }

    if (!idCliente && !productos.data.length) {
      idCliente = e.target[e.target.selectedIndex].value;
      if (agregarPrimerProducto) {
        if (clickEnBoton) {
          await addProductCart(idProductoSinCliente);
        } else {
          await crearProductoEnCarrito(productos, idProductoSinCliente, $ultimoInputCantidadModificado);
        }
      }
      $liErrors.innerHTML = '';
      if (agregarPrimerProducto)
        construirCarrito();
    } else {

      idCliente = e.target[e.target.selectedIndex].value;
    }

  }

  if (e.target.matches('.cantidad')) {


    $ultimoInputCantidadModificado = e;

    // VALIDAMOS SI EL CARRITO ESTÁ VACÍO
    const errorCatchCarritoCompras = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al consultar el carrito de compras');
    };

    let productos = await fetchRequest(null, errorCatchCarritoCompras, `${API_URL}/shopping-cart/all`);
    const inforProduct = obtenerInfoProducto(e.target);
    const productCart = await buscarProductoEnCarrito(inforProduct.id);
    const product = await buscarProducto(inforProduct.id);

    if (parseInt(e.target.value) < 0) {
      e.target.parentElement.nextElementSibling.textContent = "La cantidad no puede ser un número negativo";
      return e.target.parentElement.nextElementSibling.classList.remove('d-none');
    } else if (parseInt(e.target.value) > product.data.stock) {
      e.target.parentElement.nextElementSibling.textContent = "Unidades disponibles insuficientes";
      return e.target.parentElement.nextElementSibling.classList.remove('d-none');
    } else if (!e.target.parentElement.nextElementSibling.classList.contains('d-none')) {
      e.target.parentElement.nextElementSibling.classList.add('d-none');
      if (parseInt(e.target.value) === 0) return;
    }

    let res;


    if (!productos.data.length) {
      if (perfil !== 'CLI') {
        await obtenerClientes(true, idCliente || null);
        if (idCliente) {
          console.log('1 febrero');
          crearProductoEnCarrito(productos, inforProduct, e)
        } else if (!idCliente) {
          // ABRIMOS EL CARRITO DE COMPRAS PARA QUE EL VENDEDOR SELECCIONE EL CLIENTE
          $modalShoppingCart.show();
          $liErrors.innerHTML = `<li>Seleccione un cliente</li>`
          idProductoSinCliente = inforProduct;
          agregarPrimerProducto = true;
          return;
        }
      } else if (agregar) {
        crearProductoEnCarrito(productos, inforProduct, e)
      }
    } else {

      // si el producto no existe lo creamos
      if (!productCart) {
        console.log('1 febrero');
        crearProductoEnCarrito(productos, inforProduct, e);
      } else if (e.target.value > 0) {
        actualizarProductoEnCarrito(inforProduct, e);
      } else {
        eliminarProductoCarrito(inforProduct);
      }
    }

    if (res)
      inforProduct.cantidad.value = e.target.value;
  }
});
