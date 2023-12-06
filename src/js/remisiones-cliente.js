// IMPORTACIÓN DE MÓDULOS
import { API_URL } from './../constants/constants.js';
import { validarPermiso, fetchRequest, } from './modules/index.js';

validarPermiso();

// DECLARACIÓN DE VARIABLES
const d = document;

let $clientes,
  $errors,
  dataTable;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (serverError = null, editar = false, limpiar = false) {

  const errors = (serverError) ? serverError : [];

  if (!limpiar) {

    if (!$clientes.selectedIndex)
      errors.push({ tp: 1, error: 'Debe seleccionar un cliente' });

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
    (1 in tpErrors) ? $clientes.classList.add('error') : $clientes.classList.remove('error');

  } else {
    $clientes.classList.remove('error');
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
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'data',
          render: function (data, type, row) {
            if (data.status !== '4') {

              if (type === 'display') {
                return `
                <button type="button" id="btn-edit-product" data-id-referral="${data.id}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editStatusReferralModal">
                <i class="bi bi-pencil-fill"></i>
                </button>
                `
              }
              return data.id;
            } else {
              return '';
            }
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
  $clientes = d.getElementById('clientes');

  const onErrorCatch = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.error('Ha ocurrido un error al obtener los clientes.');
  };

  const onErrorResponse = (res, response) => {
    console.log(response);
    if (res.status == 400) {
      validarErrores([{ error: response.message }]);
    }
  };

  // se hace la petición por AJAX al backend


  const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/user/all`);

  const clientes = response.data.filter(u => u.role.name === 'CLI');
  console.log(clientes);

  const $fragment = d.createDocumentFragment();
  const $option = d.createElement('option');
  $option.textContent = `Seleccione...`;
  $option.value = 0;
  $fragment.appendChild($option);
  for (const ven of clientes) {
    const $option = d.createElement('option');
    $option.textContent = `${ven.names} ${ven.surnames}`;
    $option.value = ven.id;
    $fragment.appendChild($option);
  }

  $clientes.appendChild($fragment);

  $errors = d.getElementById('errors');

});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-cliente')) {

    const errores = validarErrores();
    if (errores > 0)
      return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al consultar las remisiones de este cliente.');
    };

    const onErrorResponse = (res, response) => {
      console.log(response);
      if (res.status == 400) {
        validarErrores([{ error: response.message }]);
      }
    };

    // se hace la petición por AJAX al backend


    console.log($clientes[$clientes.selectedIndex].value);
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/referral/reports-customer/${$clientes[$clientes.selectedIndex].value}`);


    d.querySelector('.table-container').classList.remove('d-none');
    cargarRemisiones(response.data);

  }

  if (e.target.matches('#btn-reporte')) {
    const errorCatchReporte = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al generar el reporte de remisiones');
    };

    let response = await fetchRequest(null, errorCatchReporte, `${API_URL}/referral/excel-referral-download-customer/${$clientes[$clientes.selectedIndex].value}`, 'POST', null, true, true);

    console.log(response);
  }
});
