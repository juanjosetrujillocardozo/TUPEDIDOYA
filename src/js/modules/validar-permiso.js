// RUTAS A LAS QUE EL USUARIO NO TIENE PERMISO
const sinPermisos = [
  '/src/html/tipos-documento.html',
  '/src/html/usuarios.html',
  '/src/html/comisiones.html',
  '/src/html/descuentos.html',
  '/src/html/metodos-pago.html',
  '/src/html/remisiones.html',
  '/src/html/productos.html',
  '/src/html/grupos-inventario.html',
  '/src/html/zonas.html',
  '/src/html/pagos-comisiones.html',
  '/src/html/remisiones-intervalo-fecha.html',
  '/src/html/remisiones-vendedor.html',
  '/src/html/remisiones-cliente.html',
  '/src/html/parametros.html',
];

// SECCIONES DE LA NAV QUE EL USUARIO NO DEBE VISUALIZAR
const seccionesNavSinPermiso = [
  'usuarios',
  'ventas',
  'inventario',
  'zonas',
  'reportes',
  'parametros',
];

const roleUser = localStorage.getItem('ROLE-USER');

export const validarPermiso = () => {

  if (localStorage.getItem('ROLE-USER') === 'ADMIN')
    return;

  for (const ruta of sinPermisos) {
    // SI LA RUTA DE LA PÁGINA ACTUAL COINCIDE CON UNA RUTA DENEGADA REGRESAMOS AL USUARIO A LA PÁGINA ANTERIOR
    if (ruta === location.pathname)
      window.history.back();
  }

  seccionesNavSinPermiso.forEach(id => {
    document.querySelector(`.navbar-nav #${id}`).classList.add('d-none');
  });
};
