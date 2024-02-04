import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert, validarPermiso } from './modules/index.js';

validarPermiso();

const d = document;

let $detalleRemision,
  $detalleModal,
  $liErrorsModal,
  $idRemision,
  $estadoRemision,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES

const cargarRemisiones = async () => {
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
      data: response.data,
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
                <button type="button" id="btn-detail-referral" data-id-referral="${data.id}" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#detailReferralModal">
                <i class="bi bi-list-check"></i>
                </button>
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

}; //ok


// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $idRemision = d.getElementById('id-remision');
  $estadoRemision = d.getElementById('estado-remision');

  myModal = new bootstrap.Modal('#editStatusReferralModal', {
    keyboard: false
  });

  cargarRemisiones();
}); //ok

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-product, #btn-edit-product > *')) {

    const idReferral = (e.target.matches('#btn-edit-product'))
      ? e.target.getAttribute('data-id-referral')
      : e.target.parentElement.getAttribute('data-id-referral');

    console.log(idReferral);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener la remisión.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/referral/find/${idReferral}`);

    if (response) {
      console.log(response);

      $estadoRemision.querySelectorAll('option').forEach(op => {
        if (response.data.referralExis.status === op.value)
          op.selected = true;
        else
          op.removeAttribute('selected');
      });

      $idRemision.value = idReferral;

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar el estado de la remisión.');
    };


    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/referral/update-status-referral/${$idRemision.value}`, 'PATCH',
      {
        status_referral: $estadoRemision[$estadoRemision.selectedIndex].value,
      }
    );

    if (response) {
      cargarRemisiones();
      myModal.hide();
      appendAlert('Estado de remisión editado correctamente');
    }
  }

  if (e.target.matches('#btn-detail-referral, #btn-detail-referral > *')) {

    const idReferral = (e.target.matches('#btn-detail-referral'))
      ? e.target.getAttribute('data-id-referral')
      : e.target.parentElement.getAttribute('data-id-referral');

    console.log(idReferral);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener la remisión.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/referral/find/${idReferral}`);

    if (response) {

      const $tbodyDetailReferral = d.querySelector('#detail-referral tbody'),
        $detailReferralFragment = d.createDocumentFragment();

      let subtotal = 0,
          descuentoTotal = 0,
          comisionTotal = 0;

        $tbodyDetailReferral.innerHTML = '';
      for (const product of response.data.arrayProductReferral) {
        const $tr = d.createElement('tr');
        console.log(product);
        let total = product.quantity * product.unit_value,
          descuentoProducto = parseInt(product.discount_value),
          comisionProducto = parseInt(product.commission_value);

        subtotal += total;
        descuentoTotal += descuentoProducto;
        comisionTotal += comisionProducto;
        $tr.innerHTML = `
          <td>${product.product.name}</td>
          <td>${product.quantity}</td>
          <td>$${parseInt(product.unit_value).toLocaleString("en") }</td>
          <td>$${total.toLocaleString("en")}</td>
          <td>$${descuentoProducto.toLocaleString("en")}</td>
          <td>$${comisionProducto.toLocaleString("en")}</td>
          
        `;
        $detailReferralFragment.appendChild($tr);
      }

      const $trTotales = d.createElement('tr');
      $trTotales.innerHTML = `
          <td></td>
          <td></td>
          <td style="font-weight: bold;">Total: </td>
          <td style="font-weight: bold;">$${subtotal.toLocaleString("en")}</td>
          <td style="font-weight: bold;">$${descuentoTotal.toLocaleString("en")}</td>
          <td style="font-weight: bold;">$${comisionTotal.toLocaleString("en")}</td>
        `;
      $detailReferralFragment.appendChild($trTotales);

      $tbodyDetailReferral.appendChild($detailReferralFragment);

      

    }
  }
});