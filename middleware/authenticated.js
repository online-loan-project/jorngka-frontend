export default defineNuxtRouteMiddleware(async () => {
  const { value: token } = useCookie('access_token')
  const { value: user } = useCookie('user')

  if (!token) {
    return navigateTo('/login')
  }

  if (!user || user.phone_verified_at === null) {
    return navigateTo('/unverified') // Redirect if not verified
  }
})
