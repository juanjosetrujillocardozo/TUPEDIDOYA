// IMPORTACIÓN DE MÓDULOS
import { API_URL } from './../../constants/constants.js';
import { fetchRequest, } from './index.js';

// DECLARACIÓN DE VARIABLES
const d = document;

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
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
    d.querySelectorAll('.nombre-empresa-parametro').forEach(el => el.innerHTML += response.data.name_enterprise);
    d.querySelectorAll('.direccion-empresa-parametro').forEach(el => el.innerHTML += response.data.address);
    d.querySelectorAll('.telefono-empresa-parametro').forEach(el => el.innerHTML += response.data.phone);
    d.querySelectorAll('.correo-empresa-parametro').forEach(el => el.innerHTML += response.data.email);
    d.querySelectorAll('.descripcion-empresa-parametro').forEach(el => el.innerHTML += response.data.description);
    // $nombreEmpresa.value = response.data.name_enterprise;
    // $direccion.value = response.data.address;
    // $telefono.value = response.data.phone;
    // $correo.value = response.data.email;
    // $descripcion.value = response.data.description;
  }
});