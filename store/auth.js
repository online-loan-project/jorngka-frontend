import AuthService from '~/services/AuthService.js'
import { useCookies } from 'vue3-cookies'
import { ElMessage } from 'element-plus'

const authService = AuthService.getInstance()

export const useAuthStore = defineStore('auth', () => {
  const { cookies } = useCookies()
  const user = ref(null)
  const token = ref(null)

  const login = async (credentials) => {
    try {

      const data = await authService.login(credentials)
      console.log(data)
      const { data: userData, token: authToken } = data || {}
      if (!authToken) {
        throw new Error('Invalid Credentials')
      }

      user.value = userData
      token.value = authToken
      const cookieOptions = { secure: true, sameSite: 'Strict' }

      cookies.set('access_token', authToken, cookieOptions)
      cookies.set('user', JSON.stringify(userData), cookieOptions)
      cookies.set('tokenType', 'Bearer', cookieOptions)

      return data
    } catch (error) {
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }

  const register = async (credentials) => {
    try {

      const data = await authService.register(credentials)
      console.log(data)
      const { data: userData, token: authToken } = data || {}
      if (!authToken) {
        throw new Error('Invalid Credentials')
      }

      user.value = userData
      token.value = authToken
      const cookieOptions = { secure: true, sameSite: 'Strict' }

      cookies.set('access_token', authToken, cookieOptions)
      cookies.set('user', JSON.stringify(userData), cookieOptions)
      cookies.set('tokenType', 'Bearer', cookieOptions)

      return data
    } catch (error) {
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }

  //getMe function
  const getMe = async () => {
    try {
      const { data } = await authService.getMe()
      if (!data) {
        throw new Error('No data returned')
      }
      user.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }

  const logout = async () => {
    user.value = null
    token.value = null
    await authService.logout()

    cookies.remove('access_token')
    cookies.remove('user')
    cookies.remove('tokenType')
  }

  //telegramChat
  const telegramChat = async (credentials) => {
    try {
      const data = await authService.telegramChat(credentials)
      console.log(data)
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }

  //sendCode get
  const sendCode = async () => {
    try {
      const { data } = await authService.sendCode()
      if (!data) {
        throw new Error('No data returned')
      }


      user.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Failed')
      throw new Error(`Failed: ${error.message || 'Unknown error'}`)
    }
  }

  //verifyCode
  const verifyCode = async (credentials) => {
    try {
      const { data } = await authService.verifyCode(credentials)
      if (!data) {
        throw new Error('No data returned')
      }

      user.value = data;
      const cookieOptions = { secure: true, sameSite: 'Strict' }
      cookies.set('user', JSON.stringify(data), cookieOptions)

      return data
    } catch (error) {
      ElMessage.error(error.message || 'Failed')
      throw new Error(`Failed: ${error.message || 'Unknown error'}`)
    }
  }

  const changePassword = async (credentials) => {
    try {
      const { data } = await authService.changePassword(credentials)
      if (!data) {
        throw new Error('No data returned')
      }
      user.value = data;
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Failed')
      throw new Error(`Failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    user: computed(() => user.value),
    token,
    login,
    logout,
    register,
    getMe,
    telegramChat,
    sendCode,
    verifyCode,
    changePassword,
  }
})
