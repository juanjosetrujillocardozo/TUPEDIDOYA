const d = document;

let $inputUser,
  $inputPassword,
  $btnSignIn;

d.addEventListener('DOMContentLoaded', e => {
  $inputUser = d.getElementById('user'),
    $inputPassword = d.getElementById('password'),
    $btnSignIn = d.getElementById('sign-in-btn');

});

d.addEventListener('submit', e => {
  if (e.target.matches('#sign-in-form'))
    e.preventDefault();
});

d.addEventListener('click', async e => {
  if (e.target.matches('#sign-in-btn')) {
    // validar el usuario y contraseña
    if (!$inputUser.value.length) {
      return alert('falta usuario');
    }



    // se hace la petición por AJAX al backend
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'PUT',
      headers: {
        'accept': 'application/json; charset=utf-8',
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ username: $inputUser.value, password: $inputPassword.value }),
    });

    console.log(await res.json());
  }
});