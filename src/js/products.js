import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso, } from './modules/index.js';

validarPermiso();

const d = document;

let $code,
  $name,
  $stock,
  $stockMin,
  $price,
  $comision,
  $descuento,
  $status,
  $inventoriable,
  $grupoInventario,
  $typeProduct,
  $imgProduct,
  $liErrors,
  $idProductModal,
  $codeProductModal,
  $nameProductModal,
  $grupoInventarioProductModal,
  $stockProductModal,
  $stockMinProductModal,
  $priceProductModal,
  $comisionProductModal,
  $descuentoProductModal,
  $inventoriableProductModal,
  $statusProductModal,
  $typeProductModal,
  $imgProductModal,
  $liErrorsProductModal,
  $tbody,
  dataTable,
  myModal;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputCode = editar ? $codeProductModal : $code;
  const $inputName = editar ? $nameProductModal : $name;
  const $inputGrupoInventario = editar ? $grupoInventarioProductModal : $grupoInventario;
  const $inputStock = editar ? $stockProductModal : $stock;
  const $inputStockMin = editar ? $stockMinProductModal : $stockMin;
  const $inputPrice = editar ? $priceProductModal : $price;
  const $listErrors = editar ? $liErrorsProductModal : $liErrors;
  const $inputInventoriable = editar ? $inventoriableProductModal : $inventoriable;
  const $inputComision = editar ? $comisionProductModal : $comision;
  const $inputDescuento = editar ? $descuentoProductModal : $descuento;
  const $inputImg = editar ? $imgProductModal : $imgProduct;


  if (!limpiar) {

    $inputName.value = $inputName.value.trim();

    if (!$inputCode.value)
      errores.push({ tp: 1, error: 'Falta el código del producto' });
    else if (!(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test($inputCode.value)))
      errores.push({ tp: 1, error: 'El código de producto introducido no es válido. Sólo se aceptan letras, números y guiones medios.', });

    if (!$inputName.value)
      errores.push({ tp: 2, error: 'Falta el nombre del producto' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputName.value)))
      errores.push({ tp: 2, error: 'El nombre de producto introducido no es válido. Sólo se aceptan letras y números.', });

    if (!$inputGrupoInventario.selectedIndex)
      errores.push({ tp: 4, error: 'Debe seleccionar un grupo de inventario.', });

    if ($inputInventoriable.checked) {

      if (!$inputStock.value)
        errores.push({ tp: 5, error: 'Falta el stock del producto' });
      else if (!(/^[0-9]+$/.test($inputStock.value)))
        errores.push({ tp: 5, error: 'El stock introducido no es válido. Sólo se aceptan números enteros.', });

      if (!$inputStockMin.value)
        errores.push({ tp: 6, error: 'Falta el stock mínimo del producto' });
      else if (!(/^[0-9]+$/.test($inputStockMin.value)) && $inputStockMin > 0)
        errores.push({ tp: 6, error: 'El stock introducido no es válido. Sólo se aceptan números enteros mayores a cero.', });
    }
    if (!$inputPrice.value)
      errores.push({ tp: 7, error: 'Falta el precio del producto' });
    else if (!(/^[0-9]+$/.test($inputPrice.value)))
      errores.push({ tp: 7, error: 'El precio introducido no es válido.', });
    
    if (!editar && !$inputImg.value)
      errores.push({ tp: 8, error: 'Falta la imagen del producto' });

  }

  const tpErrors = {};
  console.log($listErrors);
  $listErrors.innerHTML = '';
  if (errores.length) {
    const $fragment = d.createDocumentFragment();
    errores.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    $listErrors.appendChild($fragment);
    (1 in tpErrors) ? $inputCode.classList.add('error') : $inputCode.classList.remove('error');
    (2 in tpErrors) ? $inputName.classList.add('error') : $inputName.classList.remove('error');
    (4 in tpErrors) ? $inputGrupoInventario.classList.add('error') : $inputGrupoInventario.classList.remove('error');
    (5 in tpErrors) ? $inputStock.classList.add('error') : $inputStock.classList.remove('error');
    (6 in tpErrors) ? $inputStockMin.classList.add('error') : $inputStockMin.classList.remove('error');
    (7 in tpErrors) ? $inputPrice.classList.add('error') : $inputPrice.classList.remove('error');
    (8 in tpErrors) ? $inputImg.classList.add('error') : $inputImg.classList.remove('error');
  } else {
    $inputCode.classList.remove('error');
    $inputName.classList.remove('error');
    $inputStock.classList.remove('error');
    $inputGrupoInventario.classList.remove('error');
    $inputStockMin.classList.remove('error');
    $inputPrice.classList.remove('error');
    $inputImg.classList.remove('error');
  }

  return errores.length;
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
        {
          data: 'code',
          title: 'Código',
          render: function (data, type, row) {
            if (type === 'display') {
              return data;
            }
            return data;
          },
        },
        { "data": 'name' },
        {
          data: 'status',
          title: 'Estado',
          render: function (data, type, row) {
            const txt = data ? 'Activo' : 'Inactivo';
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        { "data": 'stock' },
        { "data": 'min_tock' },
        {
          data: 'price',
          title: 'Precio',
          render: function (data, type, row) {
            const price = parseInt(data);
            if (type === 'display') {
              return price;
            }
            return price;
          },
        },
        {
          data: 'inventoried',
          title: 'Inventariable',
          render: function (data, type, row) {
            const txt = data ? 'Inventariable' : 'No inventariable';
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'type',
          title: 'Tipo',
          render: function (data, type, row) {
            const txt = (parseInt(data) === 1) ? 'Producto' : 'Servicio';
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'commission_id',
          title: 'Comisión',
          render: function (data, type, row) {
            const txt = (!data) ? 'Sin comisión asignada' : data.name;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'discount_id',
          title: 'Descuento',
          render: function (data, type, row) {
            const txt = (!data) ? 'Sin descuento asignado' : data.name;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'inventory_group_id',
          title: 'Grupo de inventario',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.name;
            }
            return data.name;
          },
        },
        {
          data: 'img',
          title: 'Imagen',
          render: function (data, type, row) {
              console.log(data);
              // Personaliza el contenido de la celda para mostrar la imagen
              return `<img
                        src="${API_URL}/${data}"
                        alt="Sin imagen"
                        style="
                          width: 100px;
                          height: 100px;
                          object - fit: cover;
                        "
                      >`;
          }
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

const obtenerGruposDeInventario = async (editar = false, idGrupo = null) => {
  const errorCatchGrupos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los grupos ');
  };

  let response = await fetchRequest(null, errorCatchGrupos, `${API_URL}/group/all`);
  console.log(response);
  response.data = response.data.filter(g => g.status);

  const $selectGrupoInventario = editar ? $grupoInventarioProductModal : $grupoInventario;

  if (!response || !response.data.length) {
    $selectGrupoInventario.innerHTML = `<option>No hay grupos de inventario</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectGrupoInventario.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const grupo of response.data) {
      const $option = d.createElement('option');
      $option.textContent = grupo.name;
      $option.setAttribute('value', grupo.id);
      if (editar && grupo.id === idGrupo)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectGrupoInventario.appendChild($fragment);

  }
};

const obtenerComisiones = async (editar = false, idComision = null) => {
  const errorCatchGrupos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener las comisiones');
  };

  idComision = (!idComision) ? 0 : idComision.id;
  let response = await fetchRequest(null, errorCatchGrupos, `${API_URL}/commission/all`);
  // response.data = response.data.filter(g => g.status);

  const $selectComisiones = editar ? $comisionProductModal : $comision;

  if (!response || !response.data.length) {
    $selectComisiones.innerHTML = `<option>No hay comisiones</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectComisiones.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const comision of response.data) {
      const $option = d.createElement('option');
      $option.textContent = comision.name;
      $option.setAttribute('value', comision.id);
      if (editar && comision.id === idComision)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectComisiones.appendChild($fragment);

  }
};

const obtenerDescuentos = async (editar = false, idDescuento = null) => {
  const errorCatchDescuentos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los descuentos');
  };

  idDescuento = (!idDescuento) ? 0 : idDescuento.id;
  let response = await fetchRequest(null, errorCatchDescuentos, `${API_URL}/discount/all`);
  // response.data = response.data.filter(g => g.status);

  const $selectDescuentos = editar ? $descuentoProductModal : $descuento;

  if (!response || !response.data.length) {
    $selectDescuentos.innerHTML = `<option>No hay descuentos</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectDescuentos.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const descuento of response.data) {
      const $option = d.createElement('option');
      $option.textContent = descuento.name;
      $option.setAttribute('value', descuento.id);
      if (editar && descuento.id === idDescuento)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectDescuentos.appendChild($fragment);

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
  $comision = d.getElementById('comision');
  $descuento = d.getElementById('discount');
  $inventoriable = d.getElementById('inventoriable');
  $grupoInventario = d.getElementById('grupo-inventario');
  $typeProduct = d.getElementById('type-product');
  $imgProduct = d.getElementById('img-product');

  $liErrors = d.getElementById('errors');
  $tbody = d.querySelector('#products > tbody');

  $inventoriable.setAttribute('checked', 'true');

  // INPUTS DE LA MODAL
  $idProductModal = d.querySelector('#editProductModal #id-product');
  $codeProductModal = d.querySelector('#editProductModal #code');
  $nameProductModal = d.querySelector('#editProductModal #name');
  $grupoInventarioProductModal = d.querySelector('#editProductModal #grupo-inventario');
  $stockProductModal = d.querySelector('#editProductModal #stock');
  $stockMinProductModal = d.querySelector('#editProductModal #stock-min');
  $priceProductModal = d.querySelector('#editProductModal #price');
  $comisionProductModal = d.querySelector('#editProductModal #comision');
  $descuentoProductModal = d.querySelector('#editProductModal #discount');
  $statusProductModal = d.querySelector('#editProductModal #status');
  $inventoriableProductModal = d.querySelector('#inventoriable-modal');
  $typeProductModal = d.querySelector('#editProductModal #type-product');
  $imgProductModal = d.querySelector('#editProductModal #img-product');
  $liErrorsProductModal = d.querySelector('#editProductModal #errors');

  // OBTENEMOS LOS GRUPOS DE INVENTARIO

  await obtenerGruposDeInventario();
  await obtenerComisiones();
  await obtenerDescuentos();

  myModal = new bootstrap.Modal('#editProductModal', {
    keyboard: false
  });

  d.getElementById('editProductModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarProductos();
});

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-products')) {
    e.preventDefault();

    const errors = validarErrores();
    if (errors) return;

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErrores([{ error: response.message }]);
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
      inventory_group_id: parseInt($grupoInventario[$grupoInventario.selectedIndex].value),
      stock: $inventoriable.checked ? parseInt($stock.value) : null,
      min_tock: $inventoriable.checked ? parseInt($stockMin.value) : null,
      price: parseInt($price.value),
      inventoried: $inventoriable.checked,
      type: $typeProduct[$typeProduct.selectedIndex].value,
      status: parseInt($status[$status.selectedIndex].value) ? true : false,
      commission: parseInt($comision[$comision.selectedIndex].value),
      discount: parseInt($descuento[$descuento.selectedIndex].value),
    });

    if (response) {
      const formData = new FormData();
      formData.append('image', $imgProduct.files[0]);

      const responseImg = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/product/upload-image-product/${response.data.id}`, 'PATCH', formData, true, false, true);
      e.target.reset();
      cargarProductos();
      appendAlert('Producto creado correctamente');
    }

  }

  if (e.target.matches('#form-edit-product')) {
    e.preventDefault();
  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idProduct = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-product')
      : e.target.parentElement.getAttribute('data-id-product');

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el producto.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/product/find/${idProduct}`);

    if (response) {
      console.log(response);
      d.getElementById('img-product-modal').src = `${API_URL}/${response.data.img}`;


      $codeProductModal.value = response.data.code;
      $nameProductModal.value = response.data.name;
      $stockProductModal.value = response.data.stock;
      $stockMinProductModal.value = response.data.min_tock;
      $priceProductModal.value = parseInt(response.data.price);
      $comisionProductModal.value = "pendiente";
      $inventoriableProductModal.checked = response.data.inventoried;

      $statusProductModal.innerHTML = `
        <option value="1">Activo</option>
        <option value="0">Inactivo</option>
      `;

      $statusProductModal.querySelectorAll('option').forEach(op => {
        console.log(op.value, response.data.status);
        if (op.value == response.data.status) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });

      console.log($typeProductModal);

      $typeProductModal.innerHTML = `
        <option value="1">Producto</option>
        <option value="2">Servicio</option>
      `;

      $typeProductModal.querySelectorAll('option').forEach(op => {
        console.log(op);
        console.log(op.value, response.data.type);
        if (op.value == response.data.type) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });

      $idProductModal.value = idProduct;

      await obtenerGruposDeInventario(true, response.data.inventory_group_id.id);
      await obtenerComisiones(true, response.data.commission_id);
      await obtenerDescuentos(true, response.data.discount_id);
    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {
    const indexStatusSelected = d.querySelector('#editProductModal #status').selectedIndex;

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorResponse = (res, response) => {
      if (res.status == 400) {
        console.log(response);
        validarErrores([{ error: response.message }], true);
      }
    };

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el producto.');
    };

    console.log(parseInt($comisionProductModal[$comisionProductModal.selectedIndex].value));

    console.log({
      id: $idProductModal.value,
      code: $codeProductModal.value,
      name: $nameProductModal.value,
      inventory_group_id: parseInt($grupoInventarioProductModal[$grupoInventarioProductModal.selectedIndex].value),
      stock: $inventoriableProductModal.checked ? parseInt($stockProductModal.value) : null,
      min_tock: $inventoriableProductModal.checked ? parseInt($stockMinProductModal.value) : null,
      price: parseInt($priceProductModal.value),
      inventoried: $inventoriableProductModal.checked,
      typeProduct: $typeProductModal[$typeProductModal.selectedIndex].value,
      status: parseInt($statusProductModal[$statusProductModal.selectedIndex].value) ? true : false,
      commission: parseInt($comisionProductModal[$comisionProductModal.selectedIndex].value),
      discount: parseInt($descuentoProductModal[$descuentoProductModal.selectedIndex].value),
    });

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(
      onErrorResponse, onErrorCatch, `${API_URL}/product/update-product/${$idProductModal.value}`, 'PATCH',
      {
        id: $idProductModal.value,
        code: $codeProductModal.value,
        name: $nameProductModal.value,
        inventory_group_id: parseInt($grupoInventarioProductModal[$grupoInventarioProductModal.selectedIndex].value),
        stock: $inventoriableProductModal.checked ? parseInt($stockProductModal.value) : null,
        min_tock: $inventoriableProductModal.checked ? parseInt($stockMinProductModal.value) : null,
        price: parseInt($priceProductModal.value),
        inventoried: $inventoriableProductModal.checked,
        type: $typeProductModal[$typeProductModal.selectedIndex].value,
        status: parseInt($statusProductModal[$statusProductModal.selectedIndex].value) ? true : false,
        commission: parseInt($comisionProductModal[$comisionProductModal.selectedIndex].value),
        discount: parseInt($descuentoProductModal[$descuentoProductModal.selectedIndex].value),
      }
    );

    if (response) {

      const formData = new FormData();
      formData.append('image', $imgProductModal.files[0]);

      const responseImg = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/product/upload-image-product/${$idProductModal.value}`, 'PATCH', formData, true, false, true);

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

  if (e.target.matches('#btn-img-product-modal')) {
    document.querySelector('#editProductModal #img-product').click();
  }
});

d.addEventListener('change', e => {

  if (e.target == $imgProductModal) {
    const selectedFile = $imgProductModal.files[0];

    const reader = new FileReader();

    const $img = document.getElementById("img-product-modal");
    $img.title = selectedFile.name;

    reader.onload = function(event) {
      $img.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
  }

});