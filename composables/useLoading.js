import { storeToRefs } from 'pinia'
import { useLoadingStore } from '~/store/loading'

export const useLoading = () => {
  const loadingStore = useLoadingStore()
  const { isLoading } = storeToRefs(loadingStore)
  const { showLoading, hideLoading } = loadingStore

  return { isLoading, showLoading, hideLoading }
}
