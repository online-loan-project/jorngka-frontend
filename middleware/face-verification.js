export default defineNuxtRouteMiddleware((to, from) => {
  const user = useCookie('user').value

  // If not authenticated, redirect to login
  if (!user) {
    return navigateTo('/login')
  }

  // For face verification page, check if already verified
  if (user?.face_verified_at) {
    return navigateTo('/dashboard')
  }
})