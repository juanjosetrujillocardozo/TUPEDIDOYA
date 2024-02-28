// IMPORTACIÓN DE MÓDULOS
import { API_URL } from './../constants/constants.js';
import { validarPermiso, fetchRequest, } from './modules/index.js';

validarPermiso();

// DECLARACIÓN DE VARIABLES
const d = document;

let $fechaIni,
  $errors,
  dataTable,
  modalFecha;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, editar = false, limpiar = false) {

  const errors = (serverError) ? serverError : [];

  if (!limpiar) {

    if (!$fechaIni.value)
      errors.push({ tp: 1, error: 'Falta la fecha' });

  }

  const tpErrors = {};
  $errors.innerHTML = '';
  if (errors.length) {
    const $fragment = d.createDocumentFragment();
    errors.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    console.log(tpErrors);
    $errors.appendChild($fragment);
    (1 in tpErrors) ? $fechaIni.classList.add('error') : $fechaIni.classList.remove('error');

  } else {
    $fechaIni.classList.remove('error');
  }

  return errors.length;
}

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $fechaIni = d.getElementById('init-date');
  $errors = d.getElementById('errors');

  modalFecha = new bootstrap.Modal('#reportesModal', {
    keyboard: false
  });
});

d.addEventListener('click', async e => {
  if (e.target.matches('#btn-fechas')) {
    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener las fechas mínima y máxima.');
    };


    // se hace la petición por AJAX al backend

    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/referral/date-min-max`);
    console.log(response);
    $fechaIni.min = response.data.dateMin.split(' ')[0];
    $fechaIni.max = response.data.dateMax.split(' ')[0];
  }

  if (e.target.matches('#btn-gen-report')) {

    const errores = validarErrores();
    if (errores > 0)
      return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el estado de la remisión.');
    };

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErrores([{ error: response.message }]);
      }
    };

    // se hace la petición por AJAX al backend

    console.log($fechaIni);

    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/referral/excel-referral/${$fechaIni.value}`, 'POST', null, true, true, false, `modelo_importacion_remisiones_del_${$fechaIni.value}`);


    modalFecha.hide();

  }

});