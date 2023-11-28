import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();

const d = document;

let $nombreDescuento,
  $porcentaje,
  $descripcion,
  $montoMinimo,
  $tipoDescuento,
  $liErrors,
  $nombreDescuentoModal,
  $porcentajeDescuentoModal,
  $descripcionDescuentoModal,
  $montoMinimoDescuentoModal,
  $tipoDescuentoModal,
  $liErrorsDescuentoModal,
  $idDescuentoModal,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputNombre = editar ? $nombreDescuentoModal : $nombreDescuento;
  const $inputPorcentaje = editar ? $porcentajeDescuentoModal : $porcentaje;
  const $inputDescripcion = editar ? $descripcionDescuentoModal : $descripcion;
  const $inputMontoMinimo = editar ? $montoMinimoDescuentoModal : $montoMinimo;
  const $inputTipoDescuento = editar ? $tipoDescuentoModal : $tipoDescuento;

  const $listErrors = editar ? $liErrorsDescuentoModal : $liErrors;


  if (!limpiar) {
    $inputNombre.value = $inputNombre.value.trim();
    $inputPorcentaje.value = $inputPorcentaje.value.trim();
    $inputDescripcion.value = $inputDescripcion.value.trim();

    if (!$inputNombre.value)
      errores.push({ tp: 1, error: 'Falta el nombre del descuento' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputNombre.value)))
      errores.push({ tp: 1, error: 'El nombre del descuento no es válido. Sólo se aceptan letras y números', });

    if (!$inputPorcentaje.value)
      errores.push({ tp: 2, error: 'Falta el porcentaje.', });
    else if (!(/^\d+(\.\d+)?$/.test($inputPorcentaje.value)))
      errores.push({ tp: 2, error: 'El porcentaje introducido no es válido. Recuerda que el separador decimal debe ser el punto (.)', });
    else if (parseInt($inputPorcentaje.value) < 0 || parseInt($inputPorcentaje.value) > 100)
      errores.push({ tp: 2, error: 'El porcentaje debe ser mayor a 0 y menor que 100.', });

    if (!$inputDescripcion.value)
      errores.push({ tp: 4, error: 'Falta la descripción del descuento' });


    if (!$inputMontoMinimo.value)
      errores.push({ tp: 5, error: 'Falta el monto mínimo' });
    else if (!(/^[0-9]+$/.test($inputMontoMinimo.value)))
      errores.push({ tp: 5, error: 'El monto mínimo no es válido.', });

    if (!$inputTipoDescuento.selectedIndex)
      errores.push({ tp: 6, error: 'Debe seleccionar un tipo de descuento', });

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
    (1 in tpErrors) ? $inputNombre.classList.add('error') : $inputNombre.classList.remove('error');
    (2 in tpErrors) ? $inputPorcentaje.classList.add('error') : $inputPorcentaje.classList.remove('error');
    (4 in tpErrors) ? $inputDescripcion.classList.add('error') : $inputDescripcion.classList.remove('error');
    (5 in tpErrors) ? $inputMontoMinimo.classList.add('error') : $inputMontoMinimo.classList.remove('error');
    (6 in tpErrors) ? $inputTipoDescuento.classList.add('error') : $inputTipoDescuento.classList.remove('error');
  } else {
    $inputNombre.classList.remove('error');
    $inputPorcentaje.classList.remove('error');
    $inputDescripcion.classList.remove('error');
    $inputMontoMinimo.classList.remove('error');
    $inputTipoDescuento.classList.remove('error');
  }

  return errores.length;
}

const cargarDescuentos = async () => {
  try {

    const errorCatchDescuentos = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los descuentos');
    };

    let response = await fetchRequest(null, errorCatchDescuentos, `${API_URL}/discount/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#discounts').DataTable({
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
        { data: 'name', },
        {
          title: 'Porcentaje',
          data: 'percentage',
          render: function (data, type, row) {
            const porcentaje = `${parseInt(data)}%`;
            if (type === 'display') {
              return porcentaje
            }
            return porcentaje;
          }
        },
        { data: 'description' },
        {
          title: 'Monto Mínimo',
          data: 'minimum_amount',
          render: function (data, type, row) {
            const montoMinino = parseInt(data);
            if (type === 'display') {
              return montoMinino
            }
            return montoMinino;
          }
        },
        {
          title: 'Tipo Descuento',
          data: 'type',
          render: function (data, type, row) {
            let txt;
            switch (data) {
              case '1':
                txt = 'Producto';
                break;

              case '2':
                txt = 'Zona';
                break;

              case '3':
                txt = 'Monto';
                break;
            }
            if (type === 'display') {
              return txt
            }
            return txt;
          }
        },
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'id',
          render: function (data, type, row) {
            if (type === 'display') {
              return `
                  <button type="button" id="btn-edit-discount" data-id-discount="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDiscountsModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-discount" data-id-discount="${data}" class="btn btn-secondary btn-sm">
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

}; //ok


// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $nombreDescuento = d.getElementById('name');
  $porcentaje = d.getElementById('percentaje');
  $descripcion = d.getElementById('description');
  $montoMinimo = d.getElementById('min-amount');
  $tipoDescuento = d.getElementById('type');
  $liErrors = d.getElementById('errors');


  // INPUTS DE LA MODAL
  $nombreDescuentoModal = d.querySelector('#editDiscountsModal #name');
  $porcentajeDescuentoModal = d.querySelector('#editDiscountsModal #percentaje');
  $descripcionDescuentoModal = d.querySelector('#editDiscountsModal #description');
  $montoMinimoDescuentoModal = d.querySelector('#editDiscountsModal #min-amount');
  $idDescuentoModal = d.querySelector('#editDiscountsModal #id-discount-modal');
  $tipoDescuentoModal = d.querySelector('#editDiscountsModal #type');
  $liErrorsDescuentoModal = d.querySelector('#editDiscountsModal #errors');


  myModal = new bootstrap.Modal('#editDiscountsModal', {
    keyboard: false
  });

  d.getElementById('editDiscountsModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarDescuentos();
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-discounts')) {
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
        console.error('Ha ocurrido un error al crear el descuento.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/discount/create-discount`, 'POST', {
      name: $nombreDescuento.value,
      percentage: parseFloat($porcentaje.value),
      description: $descripcion.value,
      minimum_amount: parseInt($montoMinimo.value),
      type: $tipoDescuento[$tipoDescuento.selectedIndex].value,
    });

    if (response) {
      e.target.reset();
      cargarDescuentos();
      appendAlert('Descuento creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-discount, #btn-edit-discount > *')) {

    const idDescuento = (e.target.matches('#btn-edit-discount'))
      ? e.target.getAttribute('data-id-discount')
      : e.target.parentElement.getAttribute('data-id-discount');

    console.log(idDescuento);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el descuento.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/discount/find/${idDescuento}`);

    if (response) {
      console.log(response);

      $nombreDescuentoModal.value = response.data.name;
      $porcentajeDescuentoModal.value = response.data.percentage;

      $descripcionDescuentoModal.value = response.data.description;
      $montoMinimoDescuentoModal.value = parseInt(response.data.minimum_amount);

      $tipoDescuentoModal.querySelectorAll('option').forEach(op => {
        if (op.value === response.data.type)
          op.setAttribute('selected', 'true');
        else
          op.removeAttribute('selected');
      });

      $idDescuentoModal.value = idDescuento;
    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el descuento.');
    };

    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/discount/update-discount/${$idDescuentoModal.value}`, 'PATCH',
      {
        name: $nombreDescuentoModal.value,
        percentage: parseFloat($porcentajeDescuentoModal.value),
        description: $descripcionDescuentoModal.value,
        minimum_amount: parseInt($montoMinimoDescuentoModal.value),
        type: $tipoDescuentoModal[$tipoDescuentoModal.selectedIndex].value,
      }
    );

    if (response) {
      cargarDescuentos();
      myModal.hide();
      appendAlert('Descuento editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-discount, #btn-delete-discount > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idDescuento = (e.target.matches('#btn-delete-discount'))
        ? e.target.getAttribute('data-id-discount')
        : e.target.parentElement.getAttribute('data-id-discount');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del descuento.');
      };

      const onErrorResponse = (res, response) => {
        deleteConfirmationAlert.fire(
          'Error',
          (res.status === 422) ? 'No se puede eliminar el descuento. El descuento que deseas eliminar ya se encuentra en uso dentro del sistema' : 'No se ha podido eliminar el descuento.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/discount/delete-discount/${idDescuento}`, 'DELETE');

      if (response) {
        cargarDescuentos();
        deleteConfirmationAlert.fire(
          'Descuento eliminado',
          'El descuento ha sido eliminado satisfactoriamente.',
          'success'
        );
      } else {
        console.log(response);
      }
    };
    showDeleteConfirmationAlert('Eliminar descuento', 'Sí eliminas un descuento, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});