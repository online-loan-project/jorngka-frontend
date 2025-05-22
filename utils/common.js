export const isFunction = (func) => {
  if (func && typeof func === 'function') {
    return true
  }
  return false
}

export const getHttpValidationMessage = (data) => {
  let message = ''
  if (data?.status_code === 422) {
    if (data?.errors) {
      const errors = data?.errors
      for (const key in errors) {
        if (errors.key) {
          message = errors[key].trim()
          break
        }
      }
    } else {
      message = data?.message
    }
  }
  return message
}
