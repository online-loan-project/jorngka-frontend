export default defineNuxtRouteMiddleware(() => {
  const { value: token } = useCookie('access_token')
  if (token) {
    return navigateTo('/')
  }
})

