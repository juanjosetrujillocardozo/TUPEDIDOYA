import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();

const d = document;

let $nombreComision,
  $porcentaje,
  $tipoComision,
  $descripcion,
  $montoMinimo,
  $liErrors,
  $nombreComisionModal,
  $porcentajeComisionModal,
  $tipoComisionComisionModal,
  $descripcionComisionModal,
  $montoMinimoComisionModal,
  $liErrorsComisionModal,
  $idComisionModal,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputNombre = editar ? $nombreComisionModal : $nombreComision;
  const $inputPorcentaje = editar ? $porcentajeComisionModal : $porcentaje;
  const $inputTpComision = editar ? $tipoComisionComisionModal : $tipoComision;
  const $inputDescripcion = editar ? $descripcionComisionModal : $descripcion;
  const $inputMontoMinimo = editar ? $montoMinimoComisionModal : $montoMinimo;

  const $listErrors = editar ? $liErrorsComisionModal : $liErrors;


  if (!limpiar) {
    $inputNombre.value = $inputNombre.value.trim();
    $inputPorcentaje.value = $inputPorcentaje.value.trim();
    $inputDescripcion.value = $inputDescripcion.value.trim();

    if (!$inputNombre.value)
      errores.push({ tp: 1, error: 'Falta el nombre de la comisión' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputNombre.value)))
      errores.push({ tp: 1, error: 'El nombre de comisión no es válido. Sólo se aceptan letras y números', });

    if (!$inputPorcentaje.value)
      errores.push({ tp: 2, error: 'Falta el porcentaje.', });
    else if (!(/^\d+(\.\d+)?$/.test($inputPorcentaje.value)))
      errores.push({ tp: 2, error: 'El porcentaje introducido no es válido. Recuerda que el separador decimal debe ser el punto (.)', });
    else if (parseInt($inputPorcentaje.value) < 0 || parseInt($inputPorcentaje.value) > 100)
      errores.push({ tp: 2, error: 'El porcentaje debe ser mayor a 0 y menor que 100.', });

    if (!$inputTpComision.selectedIndex)
      errores.push({ tp: 3, error: 'Debe seleccionar un tipo de comisión', });

    if (!$inputDescripcion.value)
      errores.push({ tp: 4, error: 'Falta la descripción de la comisión' });


    if (!$inputMontoMinimo.value)
      errores.push({ tp: 5, error: 'Falta el monto mínimo' });
    else if (!(/^[0-9]+$/.test($inputMontoMinimo.value)))
      errores.push({ tp: 5, error: 'El monto mínimo no es válido.', });

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
    (3 in tpErrors) ? $inputTpComision
      .classList.add('error') : $inputTpComision
        .classList.remove('error');
    (4 in tpErrors) ? $inputDescripcion.classList.add('error') : $inputDescripcion.classList.remove('error');
    (5 in tpErrors) ? $inputMontoMinimo.classList.add('error') : $inputMontoMinimo.classList.remove('error');
  } else {
    $inputNombre.classList.remove('error');
    $inputPorcentaje.classList.remove('error');
    $inputTpComision.classList.remove('error');
    $inputDescripcion.classList.remove('error');
    $inputMontoMinimo.classList.remove('error');
  }

  return errores.length;
}

const cargarComisiones = async () => {
  try {

    const errorCatchProductos = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener las comisiones');
    };

    let response = await fetchRequest(null, errorCatchProductos, `${API_URL}/commission/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#comisions').DataTable({
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
            const porcentaje = `${data}%`;
            if (type === 'display') {
              return porcentaje
            }
            return porcentaje;
          }
        },
        {
          title: 'Tipo de Comisión',
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
                txt = 'General';
                break;

              case '4':
                txt = 'Monto';
                break;
            }
            if (type === 'display') {
              return txt
            }
            return txt;
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
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'id',
          render: function (data, type, row) {
            if (type === 'display') {
              return `
                  <button type="button" id="btn-edit-product" data-id-comision="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editComisionsModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-product" data-id-comision="${data}" class="btn btn-secondary btn-sm">
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
  $nombreComision = d.getElementById('name');
  $porcentaje = d.getElementById('percentaje');
  $tipoComision = d.getElementById('type');
  $descripcion = d.getElementById('description');
  $montoMinimo = d.getElementById('min-amount');
  $liErrors = d.getElementById('errors');


  // INPUTS DE LA MODAL
  $nombreComisionModal = d.querySelector('#editComisionsModal #name');
  $porcentajeComisionModal = d.querySelector('#editComisionsModal #percentaje');
  $tipoComisionComisionModal = d.querySelector('#editComisionsModal #type');
  $descripcionComisionModal = d.querySelector('#editComisionsModal #description');
  $montoMinimoComisionModal = d.querySelector('#editComisionsModal #min-amount');
  $idComisionModal = d.querySelector('#editComisionsModal #id-comision-modal');
  $liErrorsComisionModal = d.querySelector('#editComisionsModal #errors');


  myModal = new bootstrap.Modal('#editComisionsModal', {
    keyboard: false
  });

  d.getElementById('editComisionsModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarComisiones();
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-comisions')) {
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
        console.error('Ha ocurrido un error al crear la comisión.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/commission/create-commission`, 'POST', {
      name: $nombreComision.value,
      percentage: parseFloat($porcentaje.value),
      type: $tipoComision[$tipoComision.selectedIndex].value,
      description: $descripcion.value,
      minimum_amount: parseInt($montoMinimo.value),
    });

    if (response) {
      e.target.reset();
      cargarComisiones();
      appendAlert('Comisión creada correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idComision = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-comision')
      : e.target.parentElement.getAttribute('data-id-comision');

    console.log(idComision);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener la comisión.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/commission/find/${idComision}`);

    if (response) {
      console.log(response);

      $nombreComisionModal.value = response.data.name;
      $porcentajeComisionModal.value = response.data.percentage;
      $tipoComisionComisionModal.querySelectorAll('option').forEach(op => {
        if (op.value == response.data.type)
          op.setAttribute('selected', 'true');
        else
          op.removeAttribute('selected');
      });
      $descripcionComisionModal.value = response.data.description;
      $montoMinimoComisionModal.value = parseInt(response.data.minimum_amount);

      $idComisionModal.value = idComision;

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar la comisión.');
    };

    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/commission/update-commission/${$idComisionModal.value}`, 'PATCH',
      {
        name: $nombreComisionModal.value,
        percentage: parseFloat($porcentajeComisionModal.value),
        type: $tipoComisionComisionModal[$tipoComisionComisionModal.selectedIndex].value,
        description: $descripcionComisionModal.value,
        minimum_amount: parseInt($montoMinimoComisionModal.value),
      }
    );

    if (response) {
      cargarComisiones();
      myModal.hide();
      appendAlert('Comisión editada correctamente');
    }
  }

  if (e.target.matches('#btn-delete-product, #btn-delete-product > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idComision = (e.target.matches('#btn-delete-product'))
        ? e.target.getAttribute('data-id-comision')
        : e.target.parentElement.getAttribute('data-id-comision');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación de la comisión.');
      };

      const onErrorResponse = (res, response) => {
        deleteConfirmationAlert.fire(
          'Error',
          (res.status === 422) ? 'No se puede eliminar la comisión. La comisión que deseas eliminar ya se encuentra en uso dentro del sistema' : 'No se ha podido eliminar la comisión.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/commission/delete-commission/${idComision}`, 'DELETE');

      if (response) {
        cargarComisiones();
        deleteConfirmationAlert.fire(
          'Comisión eliminada',
          'La comisión ha sido eliminada satisfactoriamente.',
          'success'
        );
      } else {
        console.log(response);
      }
    };
    showDeleteConfirmationAlert('Eliminar comisión', 'Sí eliminas una comisión, no podrás recuperarla nuevamente.', confirmCallback);
  }
});