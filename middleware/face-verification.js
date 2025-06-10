export default defineNuxtRouteMiddleware((to, from) => {
  const user = useCookie('user').value

  // If not authenticated, redirect to login
  if (!user) {
    return navigateTo('/login')
  }

  if (user.face_verified_at === null) {
    return navigateTo('/identity-unverified') // Redirect if not verified
  }
})