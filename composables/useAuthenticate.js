export const useAuthenticate = () => {
  const cookie = useCookie('token', { maxAge: 20160 * 60 }) // 2 weeks
  const setAccessToken = (accessToken) => {
    cookie.value = accessToken
  }
  const isLoggedIn = computed(() => cookie.value != null)

  return { setAccessToken, isLoggedIn }
}
