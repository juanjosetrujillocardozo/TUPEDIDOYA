import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();
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
  $address,
  $departament,
  $city,
  $rol,
  $liErrors,
  $liErrorsUserModal,
  $passwordUserModal,
  $oldPassword,
  $changePassword,
  $confirmPasswordModal,
  myModal,
  modalChangePassword;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, limpiar = false) {

  const errors = (serverError) ? serverError : [];

  const $inputName = $name;
  const $inputSurname = $surname;
  const $inputTypeDocument = $typeDocument;
  const $inputDocument = $document;
  const $inputUser = $user;
  const $inputEmail = $email;
  const $inputPhone1 = $phone1;
  const $inputPhone2 = $phone2;
  const $inputAddress = $address;
  const $inputDepartamento = $departament;
  const $inputCiudad = $city;

  const $listErrors = $liErrors;



  if (!limpiar) {

    $inputName.value = $inputName.value.trim();
    $inputSurname.value = $inputSurname.value.trim();
    $inputDocument.value = $inputDocument.value.trim();
    $inputUser.value = $inputUser.value.trim();
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

    if (!$inputAddress.value)
      errors.push({ tp: 14, error: 'Falta la dirección' });
    else if (!(/^[a-zA-Z0-9\s#.,'-áéíóúüñÁÉÍÓÚÜÑ]+$/.test($inputAddress.value)))
      errors.push({ tp: 14, error: 'La dirección introducida no es válida.', });

    if (!$inputDepartamento.selectedIndex)
      errors.push({ tp: 15, error: 'Debe seleccionar un departamento' });

    if (!$inputCiudad.selectedIndex)
      errors.push({ tp: 16, error: 'Debe seleccionar una ciudad' });
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
    (9 in tpErrors) ? $inputEmail.classList.add('error') : $inputEmail.classList.remove('error');
    (10 in tpErrors) ? $inputPhone1.classList.add('error') : $inputPhone1.classList.remove('error');
    (11 in tpErrors) ? $inputPhone2.classList.add('error') : $inputPhone2.classList.remove('error');
    (14 in tpErrors) ? $inputAddress.classList.add('error') : $inputAddress.classList.remove('error');
    (15 in tpErrors) ? $inputDepartamento.classList.add('error') : $inputDepartamento.classList.remove('error');
    (16 in tpErrors) ? $inputCiudad.classList.add('error') : $inputCiudad.classList.remove('error');


  } else {
    $inputName.classList.remove('error');
    $inputSurname.classList.remove('error');
    $inputTypeDocument.classList.remove('error');
    $inputDocument.classList.remove('error');
    $inputUser.classList.remove('error');
    $inputEmail.classList.remove('error');
    $inputPhone1.classList.remove('error');
    $inputPhone2.classList.remove('error');
    $inputAddress.classList.remove('error');
    $inputDepartamento.classList.remove('error');
    $inputCiudad.classList.remove('error');
  }

  return errors.length;
}

const validarErroresContrasena = (limpiar = false, serverError = null) => {

  const errors = serverError ? serverError : [];
  // VALIDACIONES DE LA CONTRASEÑA

  if (!limpiar) {

    $changePassword.value = $changePassword.value.trim();
    $confirmPasswordModal.value = $confirmPasswordModal.value.trim();
    $oldPassword.value = $oldPassword.value.trim();

    // VALIDAMOS QUE SE HAYA INGRESADO LA CONTRASEÑA ANTIGUA
    if (!$oldPassword.value)
      errors.push({ tp: 3, error: 'Falta la contraseña antigua' });

    // VALIDAMOS QUE LA CONTRASEÑA ANTIGUA CONTENGA CARACTERES VÁLIDOS
    if (!/^[a-zA-Z0-9ñÑ_-]+$/.test($oldPassword.value))
      errors.push({ tp: 3, error: 'Contraseña antigua inválida. Sólo se aceptan letras, números, guiones medios y bajos' });

    // VALIDAMOS LA LONGITUD DE LA CONTRASEÑA ANTIGUA
    if ($oldPassword.value.length < 6 || $changePassword.value.length > 20)
      errors.push({ tp: 3, error: 'Longitud de contraseña antigua inválida. La contraseña debe tener como mínimo 6 caracteres y máximo 20' });

    // VALIDAMOS QUE SE HAYA INGRESADO LA CONTRASEÑA
    if (!$changePassword.value)
      errors.push({ tp: 1, error: 'Falta la contraseña' });

    // VALIDAMOS QUE LA CONTRASEÑA CONTENGA CARACTERES VÁLIDOS
    if (!/^[a-zA-Z0-9ñÑ_-]+$/.test($changePassword.value))
      errors.push({ tp: 1, error: 'Contraseña inválida. Sólo se aceptan letras, números, guiones medios y bajos' });

    // VALIDAMOS LA LONGITUD DE LA CONTRASEÑA
    if ($changePassword.value.length < 6 || $changePassword.value.length > 20)
      errors.push({ tp: 1, error: 'Longitud de contraseña inválida. La contraseña debe tener como mínimo 6 caracteres y máximo 20' });

    // VALIDACIONES DE LA CONFIRMACIÓN DE LA CONTRASEÑA

    // VALIDAMOS QUE LA CONFIRMACIÓN DE LA CONTRASEÑA NO ESTÉ VACÍA
    if (!$confirmPasswordModal.value)
      errors.push({ tp: 2, error: 'Falta la confirmación de la contraseña' });

    // VALIDAMOS QUE LA CONTRASEÑA Y LA CONFIRMACIÓN DE LA CONTRASEÑA SEAN IGUALES
    if ($changePassword.value !== $confirmPasswordModal.value)
      errors.push({ tp: 2, error: 'La contraseña y la confirmación de la contraseña no son iguales' });
  } else {
    $changePassword.value = '';
    $confirmPasswordModal.value = '';
    $oldPassword.value = '';
  }

  const tpErrors = {},
    $liErrorsChangePassword = d.getElementById('errors-change-password');
  $liErrorsChangePassword.innerHTML = '';
  if (errors.length) {
    const $fragment = d.createDocumentFragment();
    errors.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    console.log(tpErrors);
    $liErrorsChangePassword.appendChild($fragment);
    (1 in tpErrors) ? $changePassword.classList.add('error') : $changePassword.classList.remove('error');
    (2 in tpErrors) ? $confirmPasswordModal.classList.add('error') : $confirmPasswordModal.classList.remove('error');
    (3 in tpErrors) ? $oldPassword.classList.add('error') : $oldPassword.classList.remove('error');


  } else {
    $changePassword.classList.remove('error');
    $confirmPasswordModal.classList.remove('error');
    $oldPassword.classList.remove('error');
  }

  return errors.length;
};

const obtenerTiposDocumento = async (idGrupo = null) => {
  const errorCatchTiposDocumento = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los tipos de documento ');
  };

  let response = await fetchRequest(null, errorCatchTiposDocumento, `${API_URL}/type-document/all`);
  console.log(response);

  const $selectTipoDocumento = $typeDocument;

  if (!response || !response.data.length) {
    $selectTipoDocumento.innerHTML = `<option>No hay tipos de documento</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectTipoDocumento.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const tpDoc of response.data) {
      const $option = d.createElement('option');
      $option.textContent = tpDoc.name;
      $option.setAttribute('value', tpDoc.id);

      console.log(tpDoc.id, idGrupo);
      if (tpDoc.id == idGrupo)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectTipoDocumento.appendChild($fragment);

  }
};

const obtenerDepartamentos = async (nombreDepartamento = null) => {
  const errorCatchDepartamentos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los departamentos');
  };

  let response = await fetchRequest(null, errorCatchDepartamentos, `${API_URL}/locale/states-all`);
  console.log(response);

  const $selectDepartamentos = $departament;

  if (!response || !response.data.length) {
    $selectDepartamentos.innerHTML = `<option>No hay departamentos</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectDepartamentos.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const departamento of response.data) {
      const $option = d.createElement('option');
      $option.textContent = departamento.state_name;
      $option.setAttribute('value', departamento.state_name);
      if (departamento.state_name === nombreDepartamento)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectDepartamentos.appendChild($fragment);

  }
};

const obtenerCiudades = async (nombreDepartamento, nombreCiudad = null) => {
  const errorCatchCiudades = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener las ciudades');
  };

  let response = await fetchRequest(null, errorCatchCiudades, `${API_URL}/locale/citys-all/${nombreDepartamento}`);
  console.log(response);

  const $selectCiudades = $city;

  if (!response || !response.data.length) {
    $selectCiudades.innerHTML = `<option>No hay ciudades</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectCiudades.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const ciudad of response.data) {
      const $option = d.createElement('option');
      $option.textContent = ciudad.city_name;
      $option.setAttribute('value', ciudad.city_name);
      if (ciudad.city_name === nombreCiudad)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectCiudades.appendChild($fragment);

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
  $address = d.getElementById('address');
  $departament = d.getElementById('departament');
  $rol = d.getElementById('rol');
  $city = d.getElementById('city');
  $liErrors = d.getElementById('errors');
  $changePassword = d.getElementById('change-password');
  $confirmPasswordModal = d.getElementById('confirm-password-modal');
  $oldPassword = d.getElementById('old-password');


  myModal = new bootstrap.Modal('#editUserModal', {
    keyboard: false
  });

  d.getElementById('editUserModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  modalChangePassword = new bootstrap.Modal('#changePasswordModal', {
    keyboard: false
  });

  d.getElementById('changePasswordModal').addEventListener('hide.bs.modal', e => {
    validarErroresContrasena(true);
  });

  const onErrorCatch = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.error('Ha ocurrido un error al obtener el perfil del usuario.');
  };

  // se hace la petición por AJAX al backend
  const response = await fetchRequest(null, onErrorCatch, `${API_URL}/user/profile`);

  if (response) {
    console.log(response);

    $name.value = response.data.names;
    $surname.value = response.data.surnames;
    $document.value = response.data.document;
    $user.value = response.data.user;
    $email.value = response.data.email;
    $phone1.value = response.data.phone1;
    $phone2.value = response.data.phone2;
    $address.value = response.data.address;
    $rol.value = response.data.role.name;

    obtenerTiposDocumento(response.data.type_document_id.id);
    obtenerDepartamentos(response.data.departament_code);
    obtenerCiudades(response.data.departament_code, response.data.city_code);

  }

});

d.addEventListener('submit', async e => {

  console.log(e.target);

  if (e.target.matches('#form-perfil')) {
    e.preventDefault();

    const errors = validarErrores(null);
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
    // se hace la petición por AJAX al backend


    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/update-user`, 'PATCH',
      {
        names: $name.value,
        surnames: $surname.value,
        typeDocument: parseInt($typeDocument[$typeDocument.selectedIndex].value),
        document: $document.value,
        user: $user.value,
        email: $email.value,
        phone1: $phone1.value,
        phone2: $phone2.value,
        address: $address.value,
        departament_code: $departament[$departament.selectedIndex].value,
        city_code: $city[$city.selectedIndex].value,
      }
    );

    console.log(response);

    if (response) {
      myModal.hide();
      appendAlert('Perfil de usuario editado correctamente');
    }
  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-change-password, #btn-change-password *')) {

    e.preventDefault();

    const errors = validarErroresContrasena();

    if (errors > 0)
      return;

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErroresContrasena(false, [{ error: response.message }]);
      }
    };

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al actualizar la contraseña.');
    };

    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/change-password`, 'PATCH',
      {
        oldpassword: $oldPassword.value,
        newpassword: $changePassword.value,
      }
    );


    console.log(response);

    if (response) {
      appendAlert('Contraseña editada correctamente');
      modalChangePassword.hide();
    }
  }
});

d.addEventListener('change', e => {

  if (e.target.matches('#departament')) {
    obtenerCiudades(e.target[e.target.selectedIndex].value);
    return;
  }
});