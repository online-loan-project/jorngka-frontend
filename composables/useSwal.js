import swal from 'sweetalert2'
import { isFunction } from '~/utils/common'

export const useSwal = () => {
  const showSwal = (
    title = '',
    titleText = '',
    type = 'info',
    confirm = () => {},
    reject = () => {},
    options = {},
  ) => {
    swal
      .fire({
        title,
        text: titleText,
        icon: type,
        allowOutsideClick: () => !swal.isLoading(),
        ...options,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swal.close()
          if (isFunction(confirm)) {
            confirm()
          }
        } else {
          swal.close()
          if (isFunction(reject)) {
            reject()
          }
        }
      })
  }

  const success = (title, message, options = {}) => {
    showSwal(title, message, 'success', options)
  }

  const info = (title, message, options = {}) => {
    showSwal(title, message, 'info', options)
  }

  const error = (title, message, options = {}) => {
    showSwal(title, message, 'error', options)
  }

  const warning = (
    title,
    message,
    confirm = () => {},
    reject = () => {},
    options = {},
  ) => {
    showSwal(title, message, 'warning', confirm, reject, options)
  }

  const question = (
    title,
    message,
    confirm = () => {},
    reject = () => {},
    options = {},
  ) => {
    showSwal(title, message, 'question', confirm, reject, options)
  }

  return {
    success,
    info,
    error,
    warning,
    question,
  }
}
