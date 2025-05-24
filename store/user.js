import UserService from '~/services/UserService.js'
import { ElMessage } from 'element-plus'

const userService = UserService.getInstance()

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  //getMe function
  const getUsers = async (params = {}) => {
    try {
      const { data } = await userService.getUsers(params)
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

  //show user
  const showUser = async (id) => {
    try {
      const { data } = await userService.getUserById(id)
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

  //updateProfile function
  const updateUser = async (id ,req) => {
    try {
      const { data } = await userService.updateProfile(id, req)
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

  return {
    user: computed(() => user.value),
    getUsers,
    showUser,
    updateUser
  }
})
