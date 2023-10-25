export const showDeleteConfirmationAlert = (title, text, confirmCallback) => {
  const deleteConfirmationAlert = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success ms-2',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  });

  deleteConfirmationAlert.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      confirmCallback(deleteConfirmationAlert);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      deleteConfirmationAlert.fire(
        'Cancelado',
        '',
        'error'
      );
    }
  });
};