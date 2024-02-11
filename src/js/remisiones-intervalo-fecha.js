// IMPORTACIÓN DE MÓDULOS
import { API_URL } from './../constants/constants.js';
import { validarPermiso, fetchRequest, } from './modules/index.js';

validarPermiso();

// DECLARACIÓN DE VARIABLES
const d = document;

let $fechaIni,
    $fechaFin,
    $errors,
    dataTable,
    modalFecha;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, editar = false, limpiar = false) {

  const errors = (serverError) ? serverError : [];

  if (!limpiar) {

    if (!$fechaIni.value)
      errors.push({ tp: 1, error: 'Falta la fecha inicial' });
    
    if (!$fechaFin.value)
      errors.push({ tp: 2, error: 'Falta la fecha final' });

    if ($fechaIni.value > $fechaFin.value)
      errors.push({ error: 'La fecha inicial no puede ser mayor a la fecha final' });
    
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
    (2 in tpErrors) ? $fechaFin.classList.add('error') : $fechaFin.classList.remove('error');

  } else {
    $fechaIni.classList.remove('error');
    $fechaFin.classList.remove('error');
  }

  if (errors.length)
    d.getElementById('btn-reporte').setAttribute('disabled', 'true');
  else
    d.getElementById('btn-reporte').removeAttribute('disabled');

  return errors.length;
}


const cargarRemisiones = async (data) => {
  try {

    const errorCatchRemisiones = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al crear las remisiones');
    };

    let response = await fetchRequest(null, errorCatchRemisiones, `${API_URL}/referral/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#remisiones').DataTable({
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
      data,
      "columns": [
        {
          data: 'data',
          title: 'Consecutivo',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.consecutive;
            }
            return data.consecutive;
          },
        },
        {
          data: 'data',
          title: 'Fecha',
          render: function (data, type, row) {

            const fecha = new Date(data.date_of_elaboration).toLocaleString();
            if (type === 'display') {
              return fecha;
            }
            return fecha;
          },
        },
        {
          data: 'data',
          render: function (data, type, row) {
            if (type === 'display') {
              return data.payment_method_value;
            }
            return data.payment_method_value;
          },
        },
        {
          data: 'data',
          render: function (data, type, row) {
            let txt = '';
            switch (data.status) {
              case '1':
                txt = 'Pendiente Pago';
                break;

              case '2':
                txt = 'Pendiente Entrega';
                break;

              case '3':
                txt = 'Entregado';
                break;

              case '4':
                txt = 'Cancelado';
                break;
            }
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'data',
          render: function (data, type, row) {
            const vendedor = data.seller_id;

            const nomVendedor = `${vendedor?.names ?? 'Pedido realizado por cliente'} ${vendedor?.surnames ?? ''}`;
            if (type === 'display') {
              return nomVendedor;
            }
            return nomVendedor;
          },
        },
        {
          data: 'data',
          render: function (data, type, row) {
            const cliente = data.user_id;

            const nomVendedor = `${cliente?.names} ${cliente?.surnames}`;
            if (type === 'display') {
              return nomVendedor;
            }
            return nomVendedor;
          },
        },
        {
          data: 'data',
          render: function (data, type, row) {
            const zona = data.zone_id.name;
            if (type === 'display') {
              return zona;
            }
            return zona;
          },
        },
      ],
    });

  } catch (err) {
    console.log(err);
  }

};
// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $fechaIni = d.getElementById('init-date');
  $fechaFin = d.getElementById('end-date');
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
    $fechaIni.min = response.data.dateMin.split(' ')[0];
    $fechaIni.max = response.data.dateMax.split(' ')[0];
    $fechaFin.min = response.data.dateMin.split(' ')[0];
    $fechaFin.max = response.data.dateMax.split(' ')[0];
  }

  if (e.target.matches('#btn-gen-report')) {
    console.log($fechaIni.value === $fechaFin.value);

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

    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/referral/reports-date?date-init=${$fechaIni.value}&date-end=${$fechaFin.value}`);


    d.querySelector('.table-container').classList.remove('d-none');
    cargarRemisiones(response.data);
    modalFecha.hide();

  }

  if (e.target.matches('#btn-reporte')) { 
    const errorCatchReporte = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al generar el reporte de remisiones');
    };

    let response = await fetchRequest(null, errorCatchReporte, `${API_URL}/referral/excel-referral-download-date?date-init=${$fechaIni.value}&date-end=${$fechaFin.value}`, 'POST', null, true, true);

    console.log(response);
  }
});