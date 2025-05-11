export const useHttp = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.serverApiUrl}/${config.public.apiVersion}`
  const cookie = useCookie('access_token')
  const token = cookie.value

  // Remove body for GET requests
  if (options.method === 'GET') {
    delete options.body
  }

  // Configure request headers
  options = {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      // Set Content-Type only if not using FormData
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    // Ensure the body is either FormData or JSON
    body: options.body instanceof FormData ? options.body : JSON.stringify(options.body),
    credentials: 'include', // <-- This will send cookies/auth cross-origin
    mode: 'cors',           // <-- Explicitly set CORS mode
  }

  try {
    return await $fetch(url, { baseURL, ...options })
  } catch (error) {
    console.error('HTTP Request failed:', error)

    // Handle error message display based on your API's error structure
    if (error.data) {
      // Check for the alert.message structure
      if (error.data.alert?.message) {
        ElMessage.error(error.data.alert.message)
        // ElNotification({
        //   title: 'Error',
        //   message: error.data.alert.message,
        //   type: 'warning',
        //   duration: 200,
        // })
      }
      // Fallback to other error message formats
      else if (error.data.message) {
        ElNotification({
          title: 'Error',
          message: error.data.message,
          type: 'warning',
          duration: 1000,
        })
      }
      // Handle validation errors if they exist
      else if (error.data.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join('\n')
        ElNotification({
          title: 'Error',
          message: errorMessages,
          type: 'warning',
          duration: 1000,
        })
      }
    } else {
      ElNotification({
        title: 'Error',
        message: error.message || 'Unknown error occurred',
        type: 'warning',
        duration: 1000,
      })
    }

    throw error
  }
}