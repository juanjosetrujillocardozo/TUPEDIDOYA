import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();

const d = document;

let $idPagoComision,
  $estadoPagoComision,
  $descripcionPagoComision,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES

const cargarPagos = async () => {
  try {

    const errorCatchRemisiones = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al cargar los pagos de comisiones');
    };

    let response = await fetchRequest(null, errorCatchRemisiones, `${API_URL}/commission-history/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#pago-comisiones').DataTable({
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
          data: 'description',
          render: function (data, type, row) {
            const txt = data ?? 'Sin descripción';
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'amount',
          render: function (data, type, row) {
            const valorPago = `$${parseInt(data)}`;
            if (type === 'display') {
              return valorPago;
            }
            return valorPago;
          },
        },
        {
          data: 'status',
          render: function (data, type, row) {
            let txt;
            switch (data) {
              case '1':
                txt = 'Pago';
                break;

              case '2':
                txt = 'Sin pago';
                break;

              case '3':
                txt = 'Cancelado';
                break;

              default:
                txt = 'Sin estado';
                break;
            }

            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'referral_id',
          render: function (data, type, row) {
            const txt = data.consecutive;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'referral_id',
          render: function (data, type, row) {
            const txt = `$${parseInt(data.commission_default_value)}`;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'referral_id',
          render: function (data, type, row) {
            const txt = `$${parseInt(data.commission_zone_value)}`;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'referral_id',
          render: function (data, type, row) {
            const txt = `$${parseInt(data.commission_amount_value)}`;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          data: 'referral_id',
          render: function (data, type, row) {
            const txt = `$${parseInt(data.commission_products_value)}`;
            if (type === 'display') {
              return txt;
            }
            return txt;
          },
        },
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: null,
          render: function (data, type, row) {
            if (data.status !== '3') {

              if (type === 'display') {
                return `
                <button type="button" id="btn-edit-product" data-id-payment-commission="${data.id}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editStatusPaymentComision">
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

}; //ok


// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $idPagoComision = d.getElementById('id-pago-comision');
  $estadoPagoComision = d.getElementById('status');
  $descripcionPagoComision = d.getElementById('description');

  myModal = new bootstrap.Modal('#editStatusPaymentComision', {
    keyboard: false
  });

  cargarPagos();
}); //ok

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idPagoComision = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-payment-commission')
      : e.target.parentElement.getAttribute('data-id-payment-commission');

    console.log(idPagoComision);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener el estado del pago de la comisión.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/commission-history/find/${idPagoComision}`);

    if (response) {
      console.log(response);

      $estadoPagoComision.querySelectorAll('option').forEach(op => {
        if (response.data.status === op.value)
          op.selected = true;
        else
          op.removeAttribute('selected');
      });

      $descripcionPagoComision.value = response.data.description;

      $idPagoComision.value = idPagoComision;

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el estado del pago de la comisión.');
    };


    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/commission-history/update/${$idPagoComision.value}`, 'PATCH',
      {
        status: $estadoPagoComision[$estadoPagoComision.selectedIndex].value,
        description: $descripcionPagoComision.value,
      }
    );

    if (response) {
      cargarPagos();
      myModal.hide();
      appendAlert('Estado de pago de comisión editado correctamente');
    }
  }

});