// DECLARACIÓN DE VARIABLES
const d = document;

let $alertContainer;


// DECLARACIÓN DE FUNCIONES
export const appendAlert = (message, type = 'success') => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  $alertContainer.append(wrapper)
}

// DELEGACIÓN DE EVENTOS
d.addEventListener('DOMContentLoaded', e => {
  $alertContainer = d.createElement('div');
  $alertContainer.setAttribute('id', 'alert-container')
  d.body.insertAdjacentElement('afterbegin', $alertContainer);
});