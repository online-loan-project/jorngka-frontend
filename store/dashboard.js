import { defineStore } from 'pinia'
import DashboardService from '~/services/DashboardService.js'

export const useDashboardStore = defineStore('dashboard', () => {
  const product = ref({})
  const dashboardService = DashboardService.getInstance()

  const getDashboard = async (params) => {
    try {
      const { data } = await dashboardService.index(params)
      const products = data || {}
      product.value = products
      return products
    } catch (error) {
      ElMessage.error(error.message || 'Get product failed')
      throw new Error(`Get product failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    product: computed(() => product.value),
    getDashboard
  }
})
