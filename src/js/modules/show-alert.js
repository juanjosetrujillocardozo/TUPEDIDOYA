// DECLARACIÓN DE VARIABLES
const d = document;

let $alertContainer;


// DECLARACIÓN DE FUNCIONES
export const appendAlert = (message, type = 'success') => {
  $alertContainer.classList.remove('hide-alert');
  $alertContainer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  $alertContainer.append(wrapper);
  setTimeout(() => {
    $alertContainer.classList.add('hide-alert');
  }, 7000);
}

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $alertContainer = d.createElement('div');
  $alertContainer.setAttribute('id', 'alert-container');
  $alertContainer.classList.add('col-sm-6');
  $alertContainer.classList.add('col-12');
  d.body.insertAdjacentElement('afterbegin', $alertContainer);
});