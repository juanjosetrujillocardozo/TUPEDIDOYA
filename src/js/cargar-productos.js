// IMPORTACIÓN DE MÓDULOS
import { API_URL } from './../constants/constants.js';
import { validarPermiso, fetchRequest, appendAlert } from './modules/index.js';

validarPermiso();

// DECLARACIÓN DE VARIABLES
const d = document;

let $btnArchivo,
  $inputArchivo,
  $btnSubir,
  $errors,
  dataTable;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, editar = false, limpiar = false) {

  const errors = (serverError) ? serverError : [];

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
  $btnArchivo = d.getElementById('btn-excel');
  $inputArchivo = d.getElementById('archivo-excel');
  $btnSubir = d.getElementById('btn-subir');
  $errors = d.getElementById('errors');

});

d.addEventListener('click', async e => {
  if (e.target.matches('#btn-excel')) {
    $inputArchivo.click();
  }

  if (e.target.matches('#btn-subir')) {
    const formData = new FormData();
    formData.append('file', $inputArchivo.files[0]);

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErrores([{ error: response.message }]);
      }
    };

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al cargar los productos.');
    };

    const responseImg = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/product/change-product`, 'POST', formData, true, false, true);
    appendAlert('Productos cargados correctamente');
  }

});

d.addEventListener('change', e => {
  if (e.target.matches('#archivo-excel')) {


    console.log($inputArchivo.files[0]);
    if (
      !$inputArchivo.files[0] ||
      ($inputArchivo.files[0].type !== "application/vnd.ms-excel" &&
      $inputArchivo.files[0].type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      $inputArchivo.files[0].type !== "text/csv")
    ) {
      d.getElementById('err-formato-archivo').classList.remove('d-none');
      $btnSubir.disabled = true;
    } else {
      $btnSubir.disabled = false;
      d.getElementById('err-formato-archivo').classList.add('d-none');

    }
  }
});