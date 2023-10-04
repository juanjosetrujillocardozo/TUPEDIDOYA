const d = document;

let $name, $description, $state, $liErrors, $alertPlaceholder;
let prueba;

// DECLARACIÓN DE FUNCIONES
const validarErrores = function (errores) {
  const tpErrors = {};
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
    (1 in tpErrors || 3 in tpErrors) ? $name.classList.add('error') : $name.classList.remove('error');
    (2 in tpErrors || 3 in tpErrors) ? $description.classList.add('error') : $description.classList.remove('error');
  } else {
    $description.classList.remove('error');
    $name.classList.remove('error');
  }
}

const appendAlert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  $alertPlaceholder.append(wrapper)
}

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $name = d.getElementById('name');
  $description = d.getElementById('description');
  $state = d.getElementById('state');
  $liErrors = d.getElementById('errors');
  $alertPlaceholder = document.getElementById('liveAlertPlaceholder');
});

d.addEventListener('submit', async e => {
  if (e.target.matches('#form-inventory-group')) {
    e.preventDefault();
    const errors = [];
    $name.value = $name.value.trim();
    $description.value = $description.value.trim();

    if (!$name.value)
      errors.push({ tp: 1, error: 'Falta el nombre del grupo' });
    else if (!(/^[a-zA-Z0-9\s]+$/.test($name.value)))
      errors.push({ tp: 1, error: 'El nombre de grupo introducido no es válido. Sólo se aceptan letras y números.', });

    if ($description.value && !(/^[a-zA-Z0-9\s]+$/.test($description.value)))
      errors.push({ tp: 2, error: 'La descripción introducida no es válida. Sólo se aceptan letras y números.', });


    validarErrores(errors);
    if (errors.length) return;

    try {
      // se hace la petición por AJAX al backend
      const res = await fetch('http://localhost:3000/group/create-group', {
        method: 'POST',
        headers: {
          'accept': 'application/json; charset=utf-8',
          'content-type': 'application/json; charset=utf-8',
          'authorization': `bearer ${localStorage.getItem('JWT')}`,
        },
        body: JSON.stringify({ name: $name.value, description: $description.value }),
      });


      if (res.ok) {
        const response = await res.json();
        console.log(response);
        appendAlert('Grupo creado correctamente', 'success');

      } else {
        if (res.status == 401) {
          location.href = "http://127.0.0.1:5500/src/html/login.html";
        } else if (res.status == 400) {
          console.log(await res.json());
          validarErrores([{ error: 'Los datos se han enviado de forma incorrecta. Por favor recargue la página web e inténtelo nuevamente', tp: 3, }]);
        }
      }
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError)
        console.error('Ha ocurrido un error al realizar el login.');
    }
  }
});




