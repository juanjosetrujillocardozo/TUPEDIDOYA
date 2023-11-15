import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert } from './modules/index.js';

// DECLARACIÓN DE VARIABLES
const d = document;
let $name,
  $surname,
  $typeDocument,
  $document,
  $user,
  $password,
  $confirmPassword,
  $email,
  $phone1,
  $phone2,
  $roles,
  $typePerson,
  $address,
  $departament,
  $city,
  $status,
  $nameUserModal,
  $surnameUserModal,
  $typeDocumentUserModal,
  $documentUserModal,
  $userUserModal,
  $passwordUserModal,
  $confirmPasswordUserModal,
  $emailUserModal,
  $phone1UserModal,
  $phone2UserModal,
  $rolesUserModal,
  $typePersonUserModal,
  $addressUserModal,
  $departamentUserModal,
  $cityUserModal,
  $statusUserModal,
  $liErrors,
  $liErrorsUserModal,
  $idUserModal,
  dataTable,
  myModal;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, editar = false, limpiar = false) {

  const errors = (serverError) ? serverError : [];

  const $inputName = (editar) ? $nameUserModal : $name;
  const $inputSurname = (editar) ? $surnameUserModal : $surname;
  const $inputTypeDocument = (editar) ? $typeDocumentUserModal : $typeDocument;
  const $inputDocument = (editar) ? $documentUserModal : $document;
  const $inputUser = (editar) ? $userUserModal : $user;
  const $inputPassword = $password;
  const $inputConfirmPassword = $confirmPassword;
  const $inputEmail = (editar) ? $emailUserModal : $email;
  const $inputPhone1 = (editar) ? $phone1UserModal : $phone1;
  const $inputPhone2 = (editar) ? $phone2UserModal : $phone2;
  const $inputRoles = (editar) ? $rolesUserModal : $roles;
  const $inputTypePerson = (editar) ? $typePersonUserModal : $typePerson;
  const $inputAddress = (editar) ? $addressUserModal : $address;

  const $listErrors = (editar) ? $liErrorsUserModal : $liErrors;



  if (!limpiar) {

    $inputName.value = $inputName.value.trim();
    $inputSurname.value = $inputSurname.value.trim();
    $inputDocument.value = $inputDocument.value.trim();
    $inputUser.value = $inputUser.value.trim();
    $inputPassword.value = $inputPassword.value.trim();
    $inputConfirmPassword.value = $inputConfirmPassword.value.trim();
    $inputEmail.value = $inputEmail.value.trim();
    $inputPhone1.value = $inputPhone1.value.trim();
    $inputPhone2.value = $inputPhone2.value.trim();
    $inputAddress.value = $inputAddress.value.trim();


    if (!$inputName.value)
      errors.push({ tp: 1, error: 'Falta el nombre del usuario' });
    else if (!(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test($inputName.value)))
      errors.push({ tp: 1, error: 'El nombre de usuario introducido no es válido. Sólo se aceptan letras y espacios en blanco.', });

    if (!$inputSurname.value)
      errors.push({ tp: 2, error: 'Falta el apellido del usuario' });
    else if (!(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test($inputSurname.value)))
      errors.push({ tp: 2, error: 'El apellido de usuario introducido no es válido. Sólo se aceptan letras y espacios en blanco.', });

    if (!$inputTypeDocument.selectedIndex)
      errors.push({ tp: 4, error: 'Debe seleccionar un tipo de documento' });

    console.log($inputDocument.value);
    if (!$inputDocument.value)
      errors.push({ tp: 5, error: 'Falta el documento del usuario' });
    else if (!(/^[0-9]+$/.test($inputDocument.value)))
      errors.push({ tp: 5, error: 'El documento introducido no es válido. Introduzca el documento sin separadores ni espacios en blanco.', });

    if (!$inputUser.value)
      errors.push({ tp: 6, error: 'Falta el usuario' });
    else if (!(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s0-9-]+$/.test($inputUser.value)))
      errors.push({ tp: 6, error: 'El usuario introducido no es válido. Sólo se aceptan letras, números y guiones medios', });

    if (!editar) {
      if (!$inputPassword.value)
        errors.push({ tp: 7, error: 'Falta la contraseña' });
      else if (!(/^[a-zA-Z0-9ñÑ_-]+$/.test($inputPassword.value)))
        errors.push({ tp: 7, error: 'La contraseña introducida no es válida. Sólo se aceptan letras (sin tildes), números, guiones medios y bajos.', });

      if (!$inputConfirmPassword.value)
        errors.push({ tp: 8, error: 'Falta la confirmación de contraseña' });
      else if ($inputConfirmPassword.value !== $inputPassword.value)
        errors.push({ tp: 8, error: 'Las contraseñas no son iguales' });
    }

    if (!$inputEmail.value)
      errors.push({ tp: 9, error: 'Falta el correo electrónico' });
    else if (!(/^[\w\.-]+@[\w\.-]+\.\w+$/.test($inputEmail.value)))
      errors.push({ tp: 9, error: 'El correo introducido no es válido.', });

    if (!$inputPhone1.value)
      errors.push({ tp: 10, error: 'Falta el número de teléfono 1' });
    else if (!(/^(\d{10})$/.test($inputPhone1.value)))
      errors.push({ tp: 10, error: 'El teléfono 1 no es válido', });

    if (!$inputPhone2.value)
      errors.push({ tp: 11, error: 'Falta el número de teléfono 2' });
    else if (!(/^(\d{10})$/.test($inputPhone2.value)))
      errors.push({ tp: 11, error: 'El teléfono 2 no es válido', });

    if (!$inputRoles.selectedIndex)
      errors.push({ tp: 12, error: 'Debe seleccionar un rol' });

    if (!$inputTypePerson.selectedIndex)
      errors.push({ tp: 13, error: 'Debe seleccionar un tipo de persona' });

    if (!$inputAddress.value)
      errors.push({ tp: 14, error: 'Falta la dirección' });
    else if (!(/^[a-zA-Z0-9\s#.,'-áéíóúüñÁÉÍÓÚÜÑ]+$/.test($inputAddress.value)))
      errors.push({ tp: 14, error: 'La dirección introducida no es válida.', });

    // if (!$departament.selectedIndex)
    //   errors.push({ tp: 15, error: 'Debe seleccionar un departamento' });

    // if (!$city.selectedIndex)
    //   errors.push({ tp: 16, error: 'Debe seleccionar una ciudad' });
  }

  const tpErrors = {};
  $listErrors.innerHTML = '';
  if (errors.length) {
    const $fragment = d.createDocumentFragment();
    errors.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    console.log(tpErrors);
    $listErrors.appendChild($fragment);
    (1 in tpErrors) ? $inputName.classList.add('error') : $inputName.classList.remove('error');
    (2 in tpErrors) ? $inputSurname.classList.add('error') : $inputSurname.classList.remove('error');
    (4 in tpErrors) ? $inputTypeDocument.classList.add('error') : $inputTypeDocument.classList.remove('error');
    (5 in tpErrors) ? $inputDocument.classList.add('error') : $inputDocument.classList.remove('error');
    (6 in tpErrors) ? $inputUser.classList.add('error') : $inputUser.classList.remove('error');
    (7 in tpErrors) ? $inputPassword.classList.add('error') : $inputPassword.classList.remove('error');
    (8 in tpErrors) ? $inputConfirmPassword.classList.add('error') : $inputConfirmPassword.classList.remove('error');
    (9 in tpErrors) ? $inputEmail.classList.add('error') : $inputEmail.classList.remove('error');
    (10 in tpErrors) ? $inputPhone1.classList.add('error') : $inputPhone1.classList.remove('error');
    (11 in tpErrors) ? $inputPhone2.classList.add('error') : $inputPhone2.classList.remove('error');
    (12 in tpErrors) ? $inputRoles.classList.add('error') : $inputRoles.classList.remove('error');
    (13 in tpErrors) ? $inputTypePerson.classList.add('error') : $inputTypePerson.classList.remove('error');
    (14 in tpErrors) ? $inputAddress.classList.add('error') : $inputAddress.classList.remove('error');
    (15 in tpErrors) ? $departament.classList.add('error') : $departament.classList.remove('error');
    (16 in tpErrors) ? $city.classList.add('error') : $city.classList.remove('error');


  } else {
    $inputName.classList.remove('error');
    $inputSurname.classList.remove('error');
    $inputTypeDocument.classList.remove('error');
    $inputDocument.classList.remove('error');
    $inputUser.classList.remove('error');
    $inputPassword.classList.remove('error');
    $inputConfirmPassword.classList.remove('error');
    $inputEmail.classList.remove('error');
    $inputPhone1.classList.remove('error');
    $inputPhone2.classList.remove('error');
    $inputRoles.classList.remove('error');
    $inputTypePerson.classList.remove('error');
    $inputAddress.classList.remove('error');
    $departament.classList.remove('error');
    $city.classList.remove('error');
  }

  return errors.length;
}

const cargarUsuarios = async () => {
  try {

    const errorCatchUsuarios = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener los usuarios');
    };

    let response = await fetchRequest(null, errorCatchUsuarios, `${API_URL}/user/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#users').DataTable({
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
        { "data": 'names' },
        { "data": 'surnames' },
        {
          data: 'type_document_id',
          title: 'Tipo de documento',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.name;
            }
            return data.name;
          },
        },
        { "data": 'document' },
        { "data": 'user' },
        { "data": 'email' },
        { "data": 'phone1' },
        { "data": 'phone2' },
        {
          data: 'role',
          title: 'Rol',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.name;
            }
            return data.name;
          },
        },
        {
          data: 'type_person',
          title: 'Tipo Persona',
          render: function (data, type, row) {
            const txt = data == 1 ? 'Persona' : 'Empresa';
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        { "data": 'address' },
        { "data": 'departament_code' },
        { "data": 'city_code' },
        {
          data: 'status',
          title: 'Estado',
          render: function (data, type, row) {
            if (type === 'display') {
              return data ? 'Activo' : 'Inactivo';
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
                  <button type="button" id="btn-edit-user" data-id-user="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editUserModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-user" data-id-user="${data}" class="btn btn-secondary btn-sm">
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

const obtenerTiposDocumento = async (editar = false, idGrupo = null) => {
  const errorCatchTiposDocumento = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los tipos de documento ');
  };

  let response = await fetchRequest(null, errorCatchTiposDocumento, `${API_URL}/type-document/all`);
  console.log(response);
  // response.data = response.data.filter(g => g.status);

  const $selectTipoDocumento = editar ? $typeDocumentUserModal : $typeDocument;

  if (!response || !response.data.length) {
    $selectTipoDocumento.innerHTML = `<option>No hay tipos de documento</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectTipoDocumento.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const tpDoc of response.data) {
      const $option = d.createElement('option');
      $option.textContent = tpDoc.name;
      $option.setAttribute('value', tpDoc.id);
      if (editar && tpDoc.id === idGrupo)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectTipoDocumento.appendChild($fragment);

  }
};

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $name = d.getElementById('name');
  $surname = d.getElementById('surnames');
  $typeDocument = d.getElementById('type-document');
  $document = d.getElementById('document');
  $user = d.getElementById('user');
  $password = d.getElementById('password');
  $confirmPassword = d.getElementById('confirm-password');
  $email = d.getElementById('email');
  $phone1 = d.getElementById('phone1');
  $phone2 = d.getElementById('phone2');
  $roles = d.getElementById('role');
  $typePerson = d.getElementById('type-person');
  $address = d.getElementById('address');
  $departament = d.getElementById('departament');
  $city = d.getElementById('city');
  $status = d.getElementById('status');
  $nameUserModal = d.getElementById('name-user-modal');
  $surnameUserModal = d.getElementById('surnames-user-modal');
  $typeDocumentUserModal = d.getElementById('type-document-user-modal');
  $documentUserModal = d.getElementById('document-user-modal');
  $userUserModal = d.getElementById('user-user-modal');
  $passwordUserModal = d.getElementById('password-user-modal');
  $confirmPasswordUserModal = d.getElementById('confirm-password-user-modal');
  $emailUserModal = d.getElementById('email-user-modal');
  $phone1UserModal = d.getElementById('phone1-user-modal');
  $phone2UserModal = d.getElementById('phone2-user-modal');
  $rolesUserModal = d.getElementById('role-user-modal');
  $typePersonUserModal = d.getElementById('type-person-user-modal');
  $addressUserModal = d.getElementById('address-user-modal');
  $departamentUserModal = d.getElementById('departament-user-modal');
  $cityUserModal = d.getElementById('city-user-modal');
  $statusUserModal = d.getElementById('status-user-modal');
  $idUserModal = d.getElementById('id-user-modal');
  $liErrors = d.getElementById('errors');
  $liErrorsUserModal = d.getElementById('errors-user-modal');

  myModal = new bootstrap.Modal('#editUserModal', {
    keyboard: false
  });

  d.getElementById('editUserModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  const onErrorCatch = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.error('Ha ocurrido un error al obtener los roles.');
  };

  const response = await fetchRequest(null, onErrorCatch, `${API_URL}/role/all`);

  if (response) {
    console.log(response);

    const $fragment = d.createDocumentFragment();
    response.data.forEach(elem => {
      const $option = d.createElement('option');
      $option.setAttribute('value', elem.id);
      $option.textContent = elem.name;
      $fragment.appendChild($option);
    });
    $roles.appendChild($fragment);
  }

  obtenerTiposDocumento();

  cargarUsuarios();
});

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-users')) {
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
        console.error('Ha ocurrido un error al crear el usuario.');
    };

    console.log({
      names: $name.value,
      surnames: $surname.value,
      typeDocument: parseInt($typeDocument[$typeDocument.selectedIndex].value),
      document: $document.value,
      user: $user.value,
      password: $password.value,
      email: $email.value,
      role: $roles[$roles.selectedIndex].textContent,
      phone1: $phone1.value,
      phone2: $phone2.value,
      typePerson: $typePerson[$typePerson.selectedIndex].value,
      address: $address.value,
      departament_code: '1',
      city_code: '1',
      status: $status[$status.selectedIndex].value,
      is_dropshipping: true,
    });

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/create-user`, 'POST', {
      names: $name.value,
      surnames: $surname.value,
      typeDocument: parseInt($typeDocument[$typeDocument.selectedIndex].value),
      document: $document.value,
      user: $user.value,
      password: $password.value,
      email: $email.value,
      role: $roles[$roles.selectedIndex].textContent,
      phone1: $phone1.value,
      phone2: $phone2.value,
      typePerson: $typePerson[$typePerson.selectedIndex].value,
      address: $address.value,
      departament_code: '1',
      city_code: '1',
      status: ($status[$status.selectedIndex].value === 'true') ? true : false,
      is_dropshipping: false,
    });

    if (response) {
      e.target.reset();
      cargarUsuarios();
      appendAlert('Usuario creado correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-user, #btn-edit-user > *')) {

    const idUser = (e.target.matches('#btn-edit-user'))
      ? e.target.getAttribute('data-id-user')
      : e.target.parentElement.getAttribute('data-id-user');


    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el usuario.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/user/find/${idUser}`);

    if (response) {
      console.log(response);

      $nameUserModal.value = response.data.names;
      $surnameUserModal.value = response.data.surnames;
      $documentUserModal.value = response.data.document;
      $userUserModal.value = response.data.user;
      $emailUserModal.value = response.data.email;
      $phone1UserModal.value = response.data.phone1;
      $phone2UserModal.value = response.data.phone2;
      $addressUserModal.value = response.data.address;

      $typeDocumentUserModal.querySelectorAll('option').forEach(op => {
        if (op.value == response.data.typeDocument) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error al obtener los roles.');
      };

      const roles = await fetchRequest(null, onErrorCatch, `${API_URL}/role/all`);

      if (roles) {

        const $fragment = d.createDocumentFragment();
        roles.data.forEach(elem => {
          const $option = d.createElement('option');
          $option.setAttribute('value', elem.id);
          if (response.data.role.id == elem.id)
            $option.setAttribute('selected', 'true');
          $option.textContent = elem.name;
          $fragment.appendChild($option);
        });
        $rolesUserModal.appendChild($fragment);
      }

      $typePersonUserModal.querySelectorAll('option').forEach(op => {
        if (op.value == response.data.type_person)
          op.setAttribute('selected', 'true');
      });


      $statusUserModal.querySelectorAll('option').forEach(op => {
        if (op.value == response.data.status) op.setAttribute('selected', true);
        else op.removeAttribute('selected');
      });
      $idUserModal.value = idUser;
    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErrores([{ error: response.message }], true);
      }
    };

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el usuario.');
    };
    const $selectTypeDocument = d.getElementById('type-document-user-modal');
    // se hace la petición por AJAX al backend


    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/update-user/${$idUserModal.value}`, 'PATCH',
      {
        names: $nameUserModal.value,
        surnames: $surnameUserModal.value,
        typeDocument: parseInt($typeDocumentUserModal[$typeDocumentUserModal.selectedIndex].value),
        document: $documentUserModal.value,
        user: $userUserModal.value,
        email: $emailUserModal.value,
        role: $rolesUserModal[$rolesUserModal.selectedIndex].textContent,
        phone1: $phone1UserModal.value,
        phone2: $phone2UserModal.value,
        typePerson: $typePersonUserModal[$typePersonUserModal.selectedIndex].value,
        address: $addressUserModal.value,
        departament_code: '1',
        city_code: '1',
        status: ($statusUserModal[$statusUserModal.selectedIndex].value === 'true') ? true : false,
        is_dropshipping: false,
      }
    );

    console.log(response);

    if (response) {
      cargarUsuarios();
      myModal.hide();
      appendAlert('Usuario editado correctamente');
    }
  }

  if (e.target.matches('#btn-delete-user, #btn-delete-user > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idUser = (e.target.matches('#btn-delete-user'))
        ? e.target.getAttribute('data-id-user')
        : e.target.parentElement.getAttribute('data-id-user');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación del usuario.');
      };

      const onErrorResponse = () => {
        deleteConfirmationAlert.fire(
          'Error',
          'No se ha podido eliminar el usuario.',
          'error'
        );
      }
      console.log(`${API_URL}/user/delete-user/${idUser}`);
      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/delete-user/${idUser}`, 'DELETE');

      if (response) {
        cargarUsuarios();
        deleteConfirmationAlert.fire(
          'Usuario eliminado',
          'El usuario ha sido eliminado satisfactoriamente.',
          'success'
        );
      }
    };
    showDeleteConfirmationAlert('Eliminar Usuario', 'Sí eliminas un usuario, no podrás recuperarlo nuevamente.', confirmCallback);
  }
});