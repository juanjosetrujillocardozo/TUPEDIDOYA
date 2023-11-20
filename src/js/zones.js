import { API_URL } from './../constants/constants.js';
import { appendAlert, fetchRequest, showDeleteConfirmationAlert } from './modules/index.js';

const d = document;

let $nombreZona,
  $departamento,
  $ciudad,
  $descripcion,
  $descuento,
  $comision,
  $liErrors,
  $nombreZonaModal,
  $departamentoZonaModal,
  $ciudadZonaModal,
  $descripcionZonaModal,
  $descuentoZonaModal,
  $comisionZonaModal,
  $liErrorsZonaModal,
  $idZonaModal,
  myModal,
  dataTable;

// DECLARACIÓN DE FUNCIONES


const validarErrores = function (serverError = null, editar = false, limpiar = false) {
  const errores = (serverError) ? serverError : [];

  const $inputNombre = editar ? $nombreZonaModal : $nombreZona;
  const $inputDepartamento = editar ? $departamentoZonaModal : $departamento;
  const $inputCiudad = editar ? $ciudadZonaModal : $ciudad;
  const $inputDescripcion = editar ? $descripcionZonaModal : $descripcion;

  const $listErrors = editar ? $liErrorsZonaModal : $liErrors;


  if (!limpiar) {
    $inputNombre.value = $inputNombre.value.trim();
    $inputDescripcion.value = $inputDescripcion.value.trim();

    if (!$inputNombre.value)
      errores.push({ tp: 1, error: 'Falta el nombre de la zona' });
    else if (!(/^[a-zA-ZÁáÉéÍíÓóÚúÜüÑñ0-9\s]+$/.test($inputNombre.value)))
      errores.push({ tp: 1, error: 'El nombre de zona no es válido. Sólo se aceptan letras y números', });

    if (!$inputDepartamento.selectedIndex)
      errores.push({ tp: 2, error: 'Debe seleccionar un departamento', });

    if (!$inputCiudad.selectedIndex)
      errores.push({ tp: 3, error: 'Debe seleccionar una ciudad', });

    if (!$inputDescripcion.value)
      errores.push({ tp: 4, error: 'Falta la descripción de la zona' });

  } else {
    $inputDepartamento.innerHTML = '<option disabled selected>Seleccione...</option>';
    $inputCiudad.innerHTML = '<option disabled selected>Seleccione...</option>';
  }

  const tpErrors = {};
  console.log($listErrors);
  $listErrors.innerHTML = '';
  if (errores.length) {
    const $fragment = d.createDocumentFragment();
    errores.forEach(e => {
      tpErrors[e.tp] = true;
      const $li = d.createElement("li");
      $li.textContent = e.error;
      $fragment.appendChild($li);
    });

    $listErrors.appendChild($fragment);
    (1 in tpErrors) ? $inputNombre.classList.add('error') : $inputNombre.classList.remove('error');
    (2 in tpErrors) ? $inputDepartamento.classList.add('error') : $inputDepartamento.classList.remove('error');
    (3 in tpErrors) ? $inputCiudad
      .classList.add('error') : $inputDepartamento
        .classList.remove('error');
    (4 in tpErrors) ? $inputDescripcion.classList.add('error') : $inputDescripcion.classList.remove('error');
  } else {
    $inputNombre.classList.remove('error');
    $inputDepartamento.classList.remove('error');
    $inputCiudad.classList.remove('error');
    $inputDescripcion.classList.remove('error');
  }

  return errores.length;
}

const cargarZonas = async () => {
  try {

    const errorCatchZonas = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.log('Ha ocurrido un error al obtener las zonas');
    };

    let response = await fetchRequest(null, errorCatchZonas, `${API_URL}/zone/all`);

    console.log(response);
    if (!response) response = { data: [] };

    if (dataTable !== undefined)
      dataTable.destroy();

    dataTable = $('#zones').DataTable({
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
        { data: 'name', },
        {
          title: 'Departamento',
          data: 'departament_code',
          render: function (data, type, row) {
            if (type === 'display') {
              return data
            }
            return data;
          }
        },
        {
          title: 'Ciudad',
          data: 'city_code',
          render: function (data, type, row) {
            if (type === 'display') {
              return data
            }
            return data;
          }
        },
        { data: 'description' },
        {
          title: 'Descuento',
          data: 'discount_id',
          render: function (data, type, row) {
            const descuento = (!data) ? 'Sin descuento asignado' : data.name;
            if (type === 'display') {
              return descuento
            }
            return descuento;
          }
        },
        {
          title: 'Comisión',
          data: 'commission_id',
          render: function (data, type, row) {
            const comision = (!data) ? 'Sin comisión asignada' : data.name;
            if (type === 'display') {
              return comision
            }
            return comision;
          }
        },
        {
          title: 'Acciones',
          orderable: false, // No permite ordenar esta columna
          data: 'id',
          render: function (data, type, row) {
            if (type === 'display') {
              return `
                  <button type="button" id="btn-edit-zone" data-id-zone="${data}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editZonesModal">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button type="button" id="btn-delete-zone" data-id-zone="${data}" class="btn btn-secondary btn-sm">
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

const obtenerDescuentos = async (editar = false, idDescuento = null) => {
  const errorCatchDescuentos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los descuentos');
  };

  let response = await fetchRequest(null, errorCatchDescuentos, `${API_URL}/discount/all`);
  console.log(response);
  // response.data = response.data.filter(g => g.status);

  const $selectDescuentos = editar ? $descuentoZonaModal : $descuento;

  if (!response || !response.data.length) {
    $selectDescuentos.innerHTML = `<option>No hay descuentos</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectDescuentos.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const descuento of response.data) {
      const $option = d.createElement('option');
      $option.textContent = descuento.name;
      $option.setAttribute('value', descuento.id);
      if (editar && descuento.id === idDescuento)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectDescuentos.appendChild($fragment);

  }
};

const obtenerComisiones = async (editar = false, idComision = null) => {
  const errorCatchComisiones = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener las comisiones');
  };

  let response = await fetchRequest(null, errorCatchComisiones, `${API_URL}/commission/all`);
  console.log(response);
  // response.data = response.data.filter(g => g.status);

  const $selectComisiones = editar ? $comisionZonaModal : $comision;

  if (!response || !response.data.length) {
    $selectComisiones.innerHTML = `<option>No hay comisiones</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectComisiones.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const comision of response.data) {
      const $option = d.createElement('option');
      $option.textContent = comision.name;
      $option.setAttribute('value', comision.id);
      if (editar && comision.id === idComision)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectComisiones.appendChild($fragment);

  }
};

const obtenerDepartamentos = async (editar = false, nombreDepartamento = null) => {
  const errorCatchDepartamentos = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener los departamentos');
  };

  let response = await fetchRequest(null, errorCatchDepartamentos, `${API_URL}/locale/states-all`);
  console.log(response);

  const $selectDepartamentos = editar ? $departamentoZonaModal : $departamento;

  if (!response || !response.data.length) {
    $selectDepartamentos.innerHTML = `<option>No hay departamentos</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectDepartamentos.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const departamento of response.data) {
      const $option = d.createElement('option');
      $option.textContent = departamento.state_name;
      $option.setAttribute('value', departamento.state_name);
      if (editar && departamento.state_name === nombreDepartamento)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectDepartamentos.appendChild($fragment);

  }
};

const obtenerCiudades = async (nombreDepartamento, editar = false, nombreCiudad = null) => {
  const errorCatchCiudades = (e) => {
    console.log(e);
    if (e instanceof TypeError)
      console.log('Ha ocurrido un error al obtener las ciudades');
  };

  let response = await fetchRequest(null, errorCatchCiudades, `${API_URL}/locale/citys-all/${nombreDepartamento}`);
  console.log(response);

  const $selectCiudades = editar ? $ciudadZonaModal : $ciudad;

  if (!response || !response.data.length) {
    $selectCiudades.innerHTML = `<option>No hay ciudades</option>`;
  } else {
    const $fragment = d.createDocumentFragment();
    $selectCiudades.innerHTML = '<option disabled selected>Seleccione...</option>';
    for (const ciudad of response.data) {
      const $option = d.createElement('option');
      $option.textContent = ciudad.city_name;
      $option.setAttribute('value', ciudad.city_name);
      if (editar && ciudad.city_name === nombreCiudad)
        $option.setAttribute('selected', 'true');
      $fragment.appendChild($option);
    }
    $selectCiudades.appendChild($fragment);

  }
};

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', async e => {
  $nombreZona = d.getElementById('name');
  $departamento = d.getElementById('departament');
  $ciudad = d.getElementById('city');
  $descripcion = d.getElementById('description');
  $descuento = d.getElementById('discount');
  $comision = d.getElementById('comission');
  $liErrors = d.getElementById('errors');


  // INPUTS DE LA MODAL
  $nombreZonaModal = d.querySelector('#editZonesModal #name');
  $departamentoZonaModal = d.querySelector('#editZonesModal #departament');
  $ciudadZonaModal = d.querySelector('#editZonesModal #city');
  $descripcionZonaModal = d.querySelector('#editZonesModal #description');
  $descuentoZonaModal = d.querySelector('#editZonesModal #discount');
  $comisionZonaModal = d.querySelector('#editZonesModal #comission');
  $idZonaModal = d.querySelector('#editZonesModal #id-zones-modal');
  $liErrorsZonaModal = d.querySelector('#editZonesModal #errors');

  await obtenerDescuentos();
  await obtenerComisiones();
  await obtenerDepartamentos();


  myModal = new bootstrap.Modal('#editZonesModal', {
    keyboard: false
  });

  d.getElementById('editZonesModal').addEventListener('hide.bs.modal', e => {
    validarErrores(null, true, true);
  });

  cargarZonas();
}); //ok

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-zones')) {
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
        console.error('Ha ocurrido un error al crear la zona.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/zone/create-zone`, 'POST', {
      name: $nombreZona.value,
      departament_code: $departamento[$departamento.selectedIndex].value,
      city_code: $ciudad[$ciudad.selectedIndex].value,
      description: $descripcion.value,
      discount: parseInt((!$descuento.selectedIndex) ? null : $descuento[$descuento.selectedIndex].value),
      commission: parseInt((!$comision.selectedIndex) ? null : $comision[$comision.selectedIndex].value),
    });

    if (response) {
      e.target.reset();
      cargarZonas();
      appendAlert('Zona creada correctamente');
    }

  }
});

d.addEventListener('click', async e => {

  if (e.target.matches('#btn-edit-zone, #btn-edit-zone > *')) {

    const idZone = (e.target.matches('#btn-edit-zone'))
      ? e.target.getAttribute('data-id-zone')
      : e.target.parentElement.getAttribute('data-id-zone');

    console.log(idZone);

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al obtener la zona.');
    };

    // se hace la petición por AJAX al backend
    const response = await fetchRequest(null, onErrorCatch, `${API_URL}/zone/find/${idZone}`);

    if (response) {
      console.log(response);

      $nombreZonaModal.value = response.data.name;
      $descripcionZonaModal.value = response.data.description;

      $idZonaModal.value = idZone;

      obtenerDescuentos(true, response.data.discount_id?.id);
      obtenerComisiones(true, response.data.commission_id?.id);
      obtenerDepartamentos(true, response.data.departament_code);
      await obtenerCiudades(response.data.departament_code, true, response.data.city_code);

    }
  }

  if (e.target.matches('#btn-guardar-cambios')) {

    const errors = validarErrores(null, true);
    if (errors) return;

    const onErrorCatch = (e) => {
      console.log(e);
      if (e instanceof TypeError)
        console.error('Ha ocurrido un error al editar la zona.');
    };

    // se hace la petición por AJAX al backend

    const response = await fetchRequest(
      null, onErrorCatch, `${API_URL}/zone/update-zone/${$idZonaModal.value}`, 'PATCH',
      {
        name: $nombreZonaModal.value,
        departament_code: $departamentoZonaModal[$departamentoZonaModal.selectedIndex].value,
        city_code: $ciudadZonaModal[$ciudadZonaModal.selectedIndex].value,
        description: $descripcionZonaModal.value,
        discount: parseInt((!$descuentoZonaModal.selectedIndex) ? null : $descuentoZonaModal[$descuentoZonaModal.selectedIndex].value),
        commission: parseInt((!$comisionZonaModal.selectedIndex) ? null : $comisionZonaModal[$comisionZonaModal.selectedIndex].value),
      }
    );

    if (response) {
      cargarZonas();
      myModal.hide();
      appendAlert('Zona editada correctamente');
    }
  }

  if (e.target.matches('#btn-delete-zone, #btn-delete-zone > *')) {

    const confirmCallback = async (deleteConfirmationAlert) => {
      const idZona = (e.target.matches('#btn-delete-zone'))
        ? e.target.getAttribute('data-id-zone')
        : e.target.parentElement.getAttribute('data-id-zone');

      const onErrorCatch = (e) => {
        console.log(e);
        if (e instanceof TypeError)
          console.error('Ha ocurrido un error durante la eliminación de la zona.');
      };

      const onErrorResponse = (res, response) => {
        deleteConfirmationAlert.fire(
          'Error',
          (res.status === 422) ? 'No se puede eliminar la zona. La zona que deseas eliminar ya se encuentra en uso dentro del sistema' : 'No se ha podido eliminar la zona.',
          'error'
        );
      }

      const response = await fetchRequest(onErrorResponse, onErrorCatch, `${API_URL}/zone/delete-zone/${idZona}`, 'DELETE');

      if (response) {
        cargarZonas();
        deleteConfirmationAlert.fire(
          'Zona eliminada',
          'La zona ha sido eliminada satisfactoriamente.',
          'success'
        );
      } else {
        console.log(response);
      }
    };
    showDeleteConfirmationAlert('Eliminar zona', 'Sí eliminas una zona, no podrás recuperarla nuevamente.', confirmCallback);
  }
});

d.addEventListener('change', e => {

  if (e.target === $departamentoZonaModal) {
    obtenerCiudades(e.target[e.target.selectedIndex].value, true);
    return;
  }


  if (e.target.matches('#departament')) {
    obtenerCiudades(e.target[e.target.selectedIndex].value);
    return;
  }
});