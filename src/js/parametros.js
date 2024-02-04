import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso, } from './modules/index.js';

validarPermiso();

const d = document;

let $nombreEmpresa,
  $direccion,
  $telefono,
  $correo,
  $descripcion,
  $liErrors;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  if (!limpiar) {
    $nombreEmpresa.value = $nombreEmpresa.value.trim();
    $direccion.value = $direccion.value.trim();
    $telefono.value = $telefono.value.trim();
    $correo.value = $correo.value.trim();
    $descripcion.value = $descripcion.value.trim();

    if (!$nombreEmpresa.value)
      errores.push({ tp: 1, error: 'Falta el nombre de la empresa' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9.\s]+$/.test($nombreEmpresa.value)))
      errores.push({ tp: 1, error: 'El nombre de empresa introducido no es válido. Sólo se aceptan letras y números', });

    if (!(/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9/\s.,#-]+$/.test($direccion.value)))
      errores.push({ tp: 2, error: 'La dirección introducida no es válida.', });

    if (!(/^\d{10}$/.test($telefono.value)))
      errores.push({ tp: 3, error: 'El teléfono introducido no es válido', });


    if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test($correo.value)))
    errores.push({ tp: 4, error: 'El correo electrónico introducido no es válido', });

    if ($descripcion.value && !(/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ0-9\s.,#-]+$/.test($descripcion.value)))
      errores.push({ tp: 5, error: 'La descripción introducida no es válida.', });


    

  }

  const tpErrors = {};
  console.log($liErrors);
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
    (1 in tpErrors) ? $nombreEmpresa.classList.add('error') : $nombreEmpresa.classList.remove('error');
    (2 in tpErrors) ? $direccion.classList.add('error') : $direccion.classList.remove('error');
    (3 in tpErrors) ? $telefono.classList.add('error') : $telefono.classList.remove('error');
    (4 in tpErrors) ? $correo.classList.add('error') : $correo.classList.remove('error');
    (5 in tpErrors) ? $descripcion.classList.add('error') : $descripcion.classList.remove('error');
  } else {
    $nombreEmpresa.classList.remove('error');
    $direccion.classList.remove('error');
    $telefono.classList.remove('error');
    $correo.classList.remove('error');
    $descripcion.classList.remove('error');
  }

  return errores.length;
}


// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $nombreEmpresa = d.getElementById('nombre-empresa');
  $direccion = d.getElementById('direccion');
  $telefono = d.getElementById('telefono');
  $correo = d.getElementById('correo');
  $descripcion = d.getElementById('descripcion');
  $liErrors = d.getElementById('errors');

  const onErrorResponse = (res, response) => {
    console.log(response);
    if (res.status == 400) {
      validarErrores([{ error: response.message }]);
    }
  };

  const onErrorCatch = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.error('Ha ocurrido un error al obtener los parámetros.');
  };

  // se hace la petición por AJAX al backend
  const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/parameter/all`);

  if (response) {
    $nombreEmpresa.value = response.data.name_enterprise;
    $direccion.value = response.data.address;
    $telefono.value = response.data.phone;
    $correo.value = response.data.email;
    $descripcion.value = response.data.description;
  }
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-parameters')) {
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
        console.error('Ha ocurrido un error al guardar los parámetros.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/parameter/update`, 'PATCH', {
      name_enterprise: $nombreEmpresa.value,
      address: $direccion.value,
      phone: $telefono.value,
      email: $correo.value,
      description: $descripcion.value,
    });

    if (response) {
      const onErrorResponse = (res, response) => {
        console.log(response);
        if (res.status == 400) {
          validarErrores([{ error: response.message }]);
        }
      };

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error al obtener los parámetros.');
      };

      // se hace la petición por AJAX al backend
      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/parameter/all`);

      if (response) {
        d.querySelectorAll('.nombre-empresa-parametro').forEach(el => el.innerHTML = response.data.name_enterprise);
        d.querySelectorAll('.direccion-empresa-parametro').forEach(el => el.innerHTML = response.data.address);
        d.querySelectorAll('.telefono-empresa-parametro').forEach(el => el.innerHTML = response.data.phone);
        d.querySelectorAll('.correo-empresa-parametro').forEach(el => {
          el.innerHTML = response.data.email;
          el.href = `mailto:${response.data.email}`;
        });
        d.querySelectorAll('.descripcion-empresa-parametro').forEach(el => el.innerHTML = response.data.description);
        // $nombreEmpresa.value = response.data.name_enterprise;
        // $direccion.value = response.data.address;
        // $telefono.value = response.data.phone;
        // $correo.value = response.data.email;
        // $descripcion.value = response.data.description;
      }
      appendAlert('Información actualizada correctamente');
    }

  }
});