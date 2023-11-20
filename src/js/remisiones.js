import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert } from './modules/index.js';

const d = document;

let $metodoPago,
  $zona,
  $detalleRemision,
  $liErrors,
  $metodoPagoModal,
  $detalleModal,
  $liErrorsModal,
  // $idTpDocumentModal,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputTpDoc = editar ? $metodoPagoModal : $metodoPago;
  const $inputDetalleDoc = editar ? $detalleModal : $detalleRemision;
  const $listErrors = editar ? $liErrorsModal : $liErrors;


  if (!limpiar) {
    $inputTpDoc.value = $inputTpDoc.value.trim();
    $inputDetalleDoc.value = $inputDetalleDoc.value.trim();

    if (!$inputTpDoc.value)
      errores.push({ tp: 1, error: 'Falta el tipo de documento del producto' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test($inputTpDoc.value)))
      errores.push({ tp: 1, error: 'El tipo de documento introducido no es válido. Sólo se aceptan letras', });

    if ($inputDetalleDoc.value && !(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputDetalleDoc.value)))
      errores.push({ tp: 2, error: 'La descripción del documento no es válida. Sólo se aceptan letras y números.', });

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
    (1 in tpErrors) ? $inputTpDoc.classList.add('error') : $inputTpDoc.classList.remove('error');
    (2 in tpErrors) ? $inputDetalleDoc.classList.add('error') : $inputDetalleDoc.classList.remove('error');
  } else {
    $inputTpDoc.classList.remove('error');
    $inputDetalleDoc.classList.remove('error');
  }

  return errores.length;
}

const cargarTiposDocumento = async () => {
  try {

    const errorCatchProductos = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los tipos de documento');
    };

    let response = await fetchRequest(null, errorCatchProductos, `${API_URL}/type-document/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#type-documents').DataTable({
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
          data: 'name',
          title: 'Nombre',
          render: function (data, type, row) {
            if (type === 'display') {
              return data;
            }
            return data;
          },
        },
        {
          data: 'description',
          title: 'Descripción',
          render: function (data, type, row) {
            if (type === 'display') {
              return data;
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
                  <button type="button" id="btn-edit-product" data-id-tp-document="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editTypeDocumenModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-product" data-id-tp-document="${data}" class="btn btn-secondary btn-sm">
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
  $metodoPago = d.getElementById('tp-documento');
  $detalleRemision = d.getElementById('detalle-documento');
  $liErrors = d.getElementById('errors');


  // INPUTS DE LA MODAL
  $metodoPagoModal = d.querySelector('#editTypeDocumenModal #tp-documento');
  $detalleModal = d.querySelector('#editTypeDocumenModal #detalle-documento');
  $idTpDocumentModal = d.querySelector('#editTypeDocumenModal #id-type-document');
  $liErrorsModal = d.querySelector('#editTypeDocumenModal #errors');


  myModal = new bootstrap.Modal('#editTypeDocumenModal', {
    keyboard: false
  });

  d.getElementById('editTypeDocumenModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarTiposDocumento();
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-type-documents')) {
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
        console.error('Ha ocurrido un error al crear el tipo de documento.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/type-document/create-type-document`, 'POST', {
      name: $metodoPago.value,
      description: $detalleRemision.value,
    });

    if (response) {
      e.target.reset();
      cargarTiposDocumento();
      appendAlert('Tipo de documento creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idTpDocument = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-tp-document')
      : e.target.parentElement.getAttribute('data-id-tp-document');

    console.log(idTpDocument);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el tipo de documento.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/type-document/find/${idTpDocument}`);

    if (response) {
      console.log(response);

      $metodoPagoModal.value = response.data.name;
      $detalleModal.value = response.data.description;
      $idTpDocumentModal.value = idTpDocument;

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el producto.');
    };

    console.log({
      name: $metodoPagoModal.value,
      description: $detalleModal.value,
    });

    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/type-document/update-type-document/${$idTpDocumentModal.value}`, 'PATCH',
      {
        name: $metodoPagoModal.value,
        description: $detalleModal.value,
      }
    );

    if (response) {
      cargarTiposDocumento();
      myModal.hide();
      appendAlert('Tipo de documento editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-product, #btn-delete-product > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idTpDocument = (e.target.matches('#btn-delete-product'))
        ? e.target.getAttribute('data-id-tp-document')
        : e.target.parentElement.getAttribute('data-id-tp-document');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del tipo de documento.');
      };

      const onErrorResponse = (res, response) => {
        deleteConfirmationAlert.fire(
          'Error',
          (res.status === 422) ? 'No se puede eliminar el tipo de documento. El tipo de documento que deseas eliminar ya se encuentra en uso dentro del sistema' : 'No se ha podido eliminar el tipo de documento.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/type-document/delete-type-document/${idTpDocument}`, 'DELETE');

      if (response) {
        cargarTiposDocumento();
        deleteConfirmationAlert.fire(
          'Tipo de documento eliminado',
          'El tipo de documento ha sido eliminado satisfactoriamente.',
          'success'
        );
      } else {
        console.log(response);
      }
    };
    showDeleteConfirmationAlert('Eliminar Producto', 'Sí eliminas un producto, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});