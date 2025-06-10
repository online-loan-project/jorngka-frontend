export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/dashboard') {
    const user = useCookie('user').value
    //if no user redirect to login
    if (!user) {
      return navigateTo('/login')
    }

    if (user.role === 1) {
      return navigateTo('/admin/dashboard')
    } else if (user.role === 2) {
      return navigateTo('/borrower/dashboard')
    }
  }
})
