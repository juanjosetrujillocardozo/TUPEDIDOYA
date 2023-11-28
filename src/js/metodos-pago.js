import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();

const d = document;

let $nombreMetodoPago,
  $estado,
  $liErrors,
  $nombreMetodoPagoModal,
  $estadoMetodoPagoModal,
  $liErrorsMetodoPagoModal,
  $idMetodoPagoModal,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputNombre = editar ? $nombreMetodoPagoModal : $nombreMetodoPago;

  const $listErrors = editar ? $liErrorsMetodoPagoModal : $liErrors;


  if (!limpiar) {
    $inputNombre.value = $inputNombre.value.trim();

    if (!$inputNombre.value)
      errores.push({ tp: 1, error: 'Falta el nombre del método de pago' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputNombre.value)))
      errores.push({ tp: 1, error: 'El nombre del método de pago no es válido. Sólo se aceptan letras y números', });

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
  } else {
    $inputNombre.classList.remove('error');
  }

  return errores.length;
}

const cargarMetodosPago = async () => {
  try {

    const errorCatchMetodosPago = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los métodos de pago');
    };

    let response = await fetchRequest(null, errorCatchMetodosPago, `${API_URL}/payment-method/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#payment-methods').DataTable({
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
          title: 'Estado',
          data: 'status',
          render: function (data, type, row) {
            const txt = data ? 'Activo' : 'Inactivo';
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
                  <button type="button" id="btn-edit-method-payment" data-id-method-payment="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPaymentMethodsModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-payment-method" data-id-method-payment="${data}" class="btn btn-secondary btn-sm">
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
  $nombreMetodoPago = d.getElementById('name');
  $estado = d.getElementById('status');
  $liErrors = d.getElementById('errors');


  // INPUTS DE LA MODAL
  $nombreMetodoPagoModal = d.querySelector('#editPaymentMethodsModal #name');
  $estadoMetodoPagoModal = d.querySelector('#editPaymentMethodsModal #status');
  $idMetodoPagoModal = d.querySelector('#editPaymentMethodsModal #id-method-payment');
  $liErrorsMetodoPagoModal = d.querySelector('#editPaymentMethodsModal #errors');


  myModal = new bootstrap.Modal('#editPaymentMethodsModal', {
    keyboard: false
  });

  d.getElementById('editPaymentMethodsModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarMetodosPago();
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-method-payments')) {
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
        console.error('Ha ocurrido un error al crear el método de pago.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/payment-method/create-payment-method`, 'POST', {
      name: $nombreMetodoPago.value,
      status: ($estado[$estado.selectedIndex].value === '1') ? true : false,
    });

    if (response) {
      e.target.reset();
      cargarMetodosPago();
      appendAlert('Método de pago creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-method-payment, #btn-edit-method-payment > *')) {

    const idMethodPayment = (e.target.matches('#btn-edit-method-payment'))
      ? e.target.getAttribute('data-id-method-payment')
      : e.target.parentElement.getAttribute('data-id-method-payment');

    console.log(idMethodPayment);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el método de pago.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/payment-method/find/${idMethodPayment}`);

    if (response) {
      console.log(response);

      $nombreMetodoPagoModal.value = response.data.name;
      $estadoMetodoPagoModal.querySelectorAll('option').forEach(op => {
        if (op.value == response.data.status)
          op.setAttribute('selected', 'true');
        else
          op.removeAttribute('selected');
      });

      $idMetodoPagoModal.value = idMethodPayment;

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el método de pago.');
    };

    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/payment-method/update-payment-method/${$idMetodoPagoModal.value}`, 'PATCH',
      {
        name: $nombreMetodoPagoModal.value,
        status: ($estadoMetodoPagoModal[$estadoMetodoPagoModal.selectedIndex].value === '1') ? true : false,
      }
    );

    if (response) {
      cargarMetodosPago();
      myModal.hide();
      appendAlert('Método de pago editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-payment-method, #btn-delete-payment-method > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idPaymentMethod = (e.target.matches('#btn-delete-payment-method'))
        ? e.target.getAttribute('data-id-method-payment')
        : e.target.parentElement.getAttribute('data-id-method-payment');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del método de pago.');
      };

      const onErrorResponse = (res, response) => {
        deleteConfirmationAlert.fire(
          'Error',
          (res.status === 422) ? 'No se puede eliminar el método de pago. El método de pago que deseas eliminar ya se encuentra en uso dentro del sistema' : 'No se ha podido eliminar el método de pago.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/payment-method/delete-payment-method/${idPaymentMethod}`, 'DELETE');

      if (response) {
        cargarMetodosPago();
        deleteConfirmationAlert.fire(
          'Método de Pago Eliminado',
          'El método de pago ha sido eliminado satisfactoriamente.',
          'success'
        );
      } else {
        console.log(response);
      }
    };
    showDeleteConfirmationAlert('Eliminar método de pago', 'Sí eliminas un método de pago, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});