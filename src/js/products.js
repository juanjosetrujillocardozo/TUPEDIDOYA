import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert } from './modules/index.js';

const d = document;

let $code,
  $name,
  $stock,
  $stockMin,
  $price,
  $comision,
  $status,
  $inventoriable,
  $liErrors,
  $idProductModal,
  $codeProductModal,
  $nameProductModal,
  $stockProductModal,
  $stockMinProductModal,
  $priceProductModal,
  $comisionProductModal,
  $inventoriableProductModal,
  $statusProductModal,
  $tbody,
  dataTable,
  myModal;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (errores) {
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

    console.log(tpErrors);
    $liErrors.appendChild($fragment);
    (1 in tpErrors || 3 in tpErrors) ? $code.classList.add('error') : $code.classList.remove('error');
    (2 in tpErrors || 3 in tpErrors) ? $name.classList.add('error') : $name.classList.remove('error');
    (4 in tpErrors || 3 in tpErrors) ? $stock.classList.add('error') : $stock.classList.remove('error');
    (5 in tpErrors || 3 in tpErrors) ? $stockMin.classList.add('error') : $stockMin.classList.remove('error');
    (6 in tpErrors || 3 in tpErrors) ? $price.classList.add('error') : $price.classList.remove('error');
  } else {
    $code.classList.remove('error');
    $name.classList.remove('error');
    $stock.classList.remove('error');
    $stockMin.classList.remove('error');
    $price.classList.remove('error');
  }
}

const cargarProductos = async () => {
  try {

    const errorCatchProductos = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los productos');
    };

    let response = await fetchRequest(null, errorCatchProductos, `${API_URL}/product/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#products').DataTable({
      language: {
        "decimal": "",
        "emptyTable": "No hay información",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
        "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
        "infoFiltered": "(Filtrado de _MAX_ total entradas)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrar _MENU_ Entradas",
        "loadingRecords": "Cargando...",
        "processing": "Procesando...",
        "search": "Buscar:",
        "zeroRecords": "Sin resultados encontrados",
        "paginate": {
          "first": "Primero",
          "last": "Ultimo",
          "next": "Siguiente",
          "previous": "Anterior"
        }
      },
      data: response.data,
      "columns": [
        { "data": 'code' },
        { "data": 'name' },
        {
          data: 'status',
          title: 'Estado',
          render: function (data, type, row) {
            if (type === 'display') {
              return data === 1 ? 'Activo' : 'Inactivo';
            }
            return data;
          },
        },
        { "data": 'stock' },
        { "data": 'min_tock' },
        { "data": 'price' },
        {
          data: 'inventoried',
          title: 'Inventariable',
          render: function (data, type, row) {
            if (type === 'display') {
              return data ? 'Inventariable' : 'No inventariable';
            }
            return data;
          },
        },
        {
          data: 'inventory_group',
          title: 'Grupo de inventario',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.name;
            }
            return data;
          },
        },
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'id',
          render: function (data, type, row) {
            if (type === 'display') {
              return `
                  <button type="button" id="btn-edit-product" data-id-product="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editProductModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-product" data-id-product="${data}" class="btn btn-secondary btn-sm">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                `
            }
            return data;
          }
        }
      ],
    });

  } catch (err) {
    console.log(err);
  }

};

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $code = d.getElementById('code');
  $name = d.getElementById('name');
  $stock = d.getElementById('stock');
  $stockMin = d.getElementById('stock-min');
  $price = d.getElementById('price');
  $status = d.getElementById('status');
  $comision = d.getElementById('comi$comision');
  $inventoriable = d.getElementById('inventoriable');
  $liErrors = d.getElementById('errors');
  $tbody = d.querySelector('#products > tbody');

  // INPUTS DE LA MODAL
  $idProductModal = d.querySelector('#editProductModal #id-product');
  $codeProductModal = d.querySelector('#editProductModal #code');
  $nameProductModal = d.querySelector('#editProductModal #name');
  $stockProductModal = d.querySelector('#editProductModal #stock');
  $stockMinProductModal = d.querySelector('#editProductModal #stock-min');
  $priceProductModal = d.querySelector('#editProductModal #price');
  $comisionProductModal = d.querySelector('#editProductModal #comision');
  $statusProductModal = d.querySelectorAll('#editProductModal #status > option');
  $inventoriableProductModal = d.querySelector('#editProductModal #inventoriable');

  myModal = new bootstrap.Modal('#editProductModal', {
    keyboard: false
  });

  cargarProductos();
});

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-products')) {
    e.preventDefault();
    const errors = [];
    $name.value = $name.value.trim();

    if (!$code.value)
      errors.push({ tp: 1, error: 'Falta el código del producto' });
    else if (!(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test($code.value)))
      errors.push({ tp: 1, error: 'El código de producto introducido no es válido. Sólo se aceptan letras, números y guiones medios.', });

    if (!$name.value)
      errors.push({ tp: 2, error: 'Falta el nombre del producto' });
    else if (!(/^[a-zA-Z0-9\s]+$/.test($name.value)))
      errors.push({ tp: 2, error: 'El nombre de producto introducido no es válido. Sólo se aceptan letras y números.', });

    if (!$stock.value)
      errors.push({ tp: 4, error: 'Falta el stock del producto' });
    else if (!(/^[0-9]+$/.test($stock.value)))
      errors.push({ tp: 4, error: 'El stock introducido no es válido. Sólo se aceptan números enteros.', });

    if (!$stockMin.value)
      errors.push({ tp: 5, error: 'Falta el stock mínimo del producto' });
    else if (!(/^[0-9]+$/.test($stockMin.value)) && $stockMin > 0)
      errors.push({ tp: 5, error: 'El stock introducido no es válido. Sólo se aceptan números enteros mayores a cero.', });

    if (!$price.value)
      errors.push({ tp: 6, error: 'Falta el precio del producto' });
    else if (!(/^[0-9]+$/.test($price.value)))
      errors.push({ tp: 6, error: 'El precio introducido no es válido.', });



    validarErrores(errors);
    if (errors.length) return;

    const onErrorResponse = (res, response) => {
      if (res.status == 400) {
        console.log(response);
        validarErrores([{ error: response.message, tp: 3, }]);
      }
    };

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al crear el producto.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/product/create-product`, 'POST', {
      code: $code.value,
      name: $name.value,
      inventory_group: 1,
      stock: parseInt($stock.value),
      min_tock: parseInt($stockMin.value),
      price: parseInt($price.value),
      inventoried: $inventoriable.checked
    });

    if (response) {
      cargarProductos();
      appendAlert('Grupo creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idProduct = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-product')
      : e.target.parentElement.getAttribute('data-id-product');

    console.log(idProduct);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el grupo.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/product/find/${idProduct}`);

    if (response) {
      console.log(response);

      $codeProductModal.value = response.data.code;
      $nameProductModal.value = response.data.name;
      $stockProductModal.value = response.data.stock;
      $stockMinProductModal.value = response.data.min_tock;
      $priceProductModal.value = response.data.price;
      $comisionProductModal.value = "pendiente";
      $inventoriableProductModal.checked = response.data.inventoried;

      $statusProductModal.forEach(op => {
        if (op.value == response.data.status) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });
      $idProductModal.value = idProduct;
    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {
    const indexStatusSelected = d.querySelector('#editProductModal #status').selectedIndex;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el producto.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/product/update-product/${$idProductModal.value}`, 'PATCH',
      {
        id: $idProductModal.value,
        code: $codeProductModal.value,
        name: $nameProductModal.value,
        inventory_group: 1,
        stock: parseInt($stockProductModal.value),
        min_tock: parseInt($stockMinProductModal.value),
        price: parseInt($priceProductModal.value),
        inventoried: $inventoriableProductModal.checked,
      }
    );

    if (response) {
      cargarProductos();
      myModal.hide();
      appendAlert('Producto editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-product, #btn-delete-product > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idProduct = (e.target.matches('#btn-delete-product'))
        ? e.target.getAttribute('data-id-product')
        : e.target.parentElement.getAttribute('data-id-product');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del producto.');
      };

      const onErrorResponse = () => {
        deleteConfirmationAlert.fire(
          'Error',
          'No se ha podido eliminar el producto.',
          'error'
        );
      }

      // const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/group/delete-group/${idProduct}`, 'DELETE');

      const response = true;
      if (response) {
        cargarProductos();
        deleteConfirmationAlert.fire(
          'Producto eliminado',
          'El producto ha sido eliminado satisfactoriamente.',
          'success'
        );
      }
    };
    showDeleteConfirmationAlert('Eliminar Producto', 'Sí eliminas un producto, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});