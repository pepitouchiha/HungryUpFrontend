import Swal from 'sweetalert2';

export const AppSwal = Swal.mixin({
  background:       '#1e293b',
  color:            '#f1f5f9',
  confirmButtonColor: '#6366f1',
  cancelButtonColor:  '#334155',
  customClass: {
    popup:         'app-swal-popup',
    confirmButton: 'app-swal-confirm',
    cancelButton:  'app-swal-cancel',
  },
});

export const Toast = AppSwal.mixin({
  toast:             true,
  position:          'top-end',
  showConfirmButton: false,
  timer:             2800,
  timerProgressBar:  true,
});

export function confirmDelete(text: string): Promise<boolean> {
  return AppSwal.fire({
    title:              '¿Estás seguro?',
    text,
    icon:               'warning',
    showCancelButton:   true,
    confirmButtonText:  'Sí, eliminar',
    cancelButtonText:   'Cancelar',
    reverseButtons:     true,
    iconColor:          '#f59e0b',
  }).then(r => r.isConfirmed);
}
