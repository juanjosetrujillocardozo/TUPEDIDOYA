import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert } from './modules/index.js';

const d = document;

let $name,
  $description,
  $status,
  $liErrors,
  $idGroupModal,
  $nameGroupModal,
  $descriptionGroupModal,
  $statusGroupModal,
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
    $liErrors.appendChild($fragment);
    (1 in tpErrors || 3 in tpErrors) ? $name.classList.add('error') : $name.classList.remove('error');
    (2 in tpErrors || 3 in tpErrors) ? $description.classList.add('error') : $description.classList.remove('error');
  } else {
    $description.classList.remove('error');
    $name.classList.remove('error');
  }
}

const cargarGrupos = async () => {
  try {

    const errorCatchGrupos = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los grupos (callback)');
    };

    let response = await fetchRequest(null, errorCatchGrupos, `${API_URL}/group/all`);

    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#groups').DataTable({
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
        { "data": 'name' },
        { "data": 'description' },
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
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'id',
          render: function (data, type, row) {
            if (type === 'display') {
              return `
                  <button type="button" id="btn-edit-group" data-id-group="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editGroupModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-group" data-id-group="${data}" class="btn btn-secondary btn-sm">
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
  $name = d.getElementById('name');
  $description = d.getElementById('description');
  $status = d.getElementById('status');
  $liErrors = d.getElementById('errors');
  $tbody = d.querySelector('#groups > tbody');

  // INPUTS DE LA MODAL
  $idGroupModal = d.querySelector('#editGroupModal #id-group');
  $nameGroupModal = d.querySelector('#editGroupModal #name');
  $descriptionGroupModal = d.querySelector('#editGroupModal #description');
  $statusGroupModal = d.querySelectorAll('#editGroupModal #status > option');

  myModal = new bootstrap.Modal('#editGroupModal', {
    keyboard: false
  });

  cargarGrupos();
});

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-inventory-group')) {
    e.preventDefault();
    const errors = [];
    $name.value = $name.value.trim();
    $description.value = $description.value.trim();

    if (!$name.value)
      errors.push({ tp: 1, error: 'Falta el nombre del grupo' });
    else if (!(/^[a-zA-Z0-9\s]+$/.test($name.value)))
      errors.push({ tp: 1, error: 'El nombre de grupo introducido no es válido. Sólo se aceptan letras y números.', });

    if ($description.value && !(/^[a-zA-Z0-9\s]+$/.test($description.value)))
      errors.push({ tp: 2, error: 'La descripción introducida no es válida. Sólo se aceptan letras y números.', });


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
        console.error('Ha ocurrido un error al crear el grupo.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/group/create-group`, 'POST', { name: $name.value, description: $description.value, status: $status.value });

    if (response) {
      cargarGrupos();
      appendAlert('Grupo creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-group, #btn-edit-group > *')) {

    const idGroup = (e.target.matches('#btn-edit-group'))
      ? e.target.getAttribute('data-id-group')
      : e.target.parentElement.getAttribute('data-id-group');

    console.log(idGroup);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el grupo.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/group/find/${idGroup}`);

    if (response) {
      console.log(response);

      $nameGroupModal.value = response.data.name;
      $descriptionGroupModal.value = response.data.description;
      $statusGroupModal.forEach(op => {
        if (op.value == response.data.status) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });
      $idGroupModal.value = idGroup;
    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {
    const indexStatusSelected = d.querySelector('#editGroupModal #status').selectedIndex;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el grupo.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/group/update-group/${$idGroupModal.value}`, 'PATCH',
      {
        id: $idGroupModal.value,
        name: $nameGroupModal.value,
        description: $descriptionGroupModal.value,
        status: $statusGroupModal[indexStatusSelected].value
      }
    );

    if (response) {
      cargarGrupos();
      myModal.hide();
      appendAlert('Grupo editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-group, #btn-delete-group > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idGroup = (e.target.matches('#btn-delete-group'))
        ? e.target.getAttribute('data-id-group')
        : e.target.parentElement.getAttribute('data-id-group');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del grupo.');
      };

      const onErrorResponse = () => {
        deleteConfirmationAlert.fire(
          'Error',
          'No se ha podido eliminar el grupo.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/group/delete-group/${idGroup}`, 'DELETE');

      if (response) {
        cargarGrupos();
        deleteConfirmationAlert.fire(
          'Grupo eliminado',
          'El grupo ha sido eliminado satisfactoriamente.',
          'success'
        );
      }
    };
    showDeleteConfirmationAlert('Eliminar Grupo', 'Sí eliminas un grupo, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});