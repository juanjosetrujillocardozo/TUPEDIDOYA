// DECLARACIÓN DE VARIABLES
const d = document;

let $inputUser,
  $inputPassword,
  $btnSignIn,
  $liErrors;

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
    (1 in tpErrors || 3 in tpErrors) ? $inputUser.classList.add('error') : $inputUser.classList.remove('error');
    (2 in tpErrors || 3 in tpErrors) ? $inputPassword.classList.add('error') : $inputPassword.classList.remove('error');
  } else {
    $inputPassword.classList.remove('error');
    $inputUser.classList.remove('error');
  }
}

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $inputUser = d.getElementById('user'),
    $inputPassword = d.getElementById('password'),
    $btnSignIn = d.getElementById('sign-in-btn'),
    $liErrors = d.getElementById('errors');
});

d.addEventListener('submit', e => {
  if (e.target.matches('#sign-in-form'))
    e.preventDefault();
});

d.addEventListener('click', async e => {
  if (e.target.matches('#sign-in-btn')) {
    const errors = [];
    // VALIDACIONES DE USUARIO
    // quitar espacios en blanco del inicio y del final de la cadena
    $inputUser.value = $inputUser.value.trim();

    if (!$inputUser.value.length)
      errors.push({ error: 'falta el usuario', tp: 1 });

    if (!(/^[a-zA-Z0-9@_-]+$/.test($inputUser.value)))
      errors.push({ error: 'el usuario ingresado no es válido', tp: 1 });

    // VALIDACIONES DE LA CONTRASEÑA
    $inputPassword.value = $inputPassword.value.trim();

    if (!$inputPassword.value.length)
      errors.push({ error: 'falta la contraseña', tp: 2 });

    if (!(/^[a-zA-Z0-9@_-]+$/.test($inputPassword.value)))
      errors.push({ error: 'la contraseña ingresada no es válida', tp: 2 });

    validarErrores(errors);
    if (errors.length) return;

    try {
      // se hace la petición por AJAX al backend
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'accept': 'application/json; charset=utf-8',
          'content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ user: $inputUser.value, password: $inputPassword.value }),
      });


      if (res.ok) {
        const response = await res.json();
        localStorage.setItem('JWT', response.data.msg.access_token);
        location.href = "http://127.0.0.1:5501/src/html/index.html";
      } else {
        if (res.status == 401) {
          // código http para las credenciales inválidas
          validarErrores([{ error: 'usuario ó contraseña incorrectos', tp: 3, }]);
        } else if (res.status == 400) {
          validarErrores([{ error: 'Los datos se han enviado de forma incorrecta. Por favor recargue la página web e inténtelo nuevamente', tp: 3, }]);
        }
      }
    } catch (err) {
      if (err instanceof TypeError)
        console.error('Ha ocurrido un error al realizar el login.');
    }
  }
});