<script setup>
import { ref, onMounted } from 'vue'
import { Edit, Check, Close } from '@element-plus/icons-vue'
import { useInterestRateStore } from '~/store/interest_rate.js'

// Page meta configuration
definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

// State management
const loading = ref(false)
const saving = ref(false)
const interestRate = ref(null)
const isEditing = ref(false)
const editForm = ref({
  rate: 0
})
const password = ref('')
const showPasswordDialog = ref(false)

// Store
const interestRateStore = useInterestRateStore()

// Methods
const fetchInterestRate = async () => {
  loading.value = true
  try {
    const response = await interestRateStore.index()
    interestRate.value = response.data || response
    editForm.value.rate = interestRate.value?.rate || 0
  } catch (error) {
    console.error('Failed to fetch interest rate:', error)
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  editForm.value.rate = interestRate.value?.rate || 0
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  password.value = ''
}

const handleSave = () => {
  showPasswordDialog.value = true
}

const saveInterestRate = async () => {
  saving.value = true
  try {
    const updatedRate = await interestRateStore.store({
      rate: editForm.value.rate,
      password: password.value
    })
    interestRate.value = updatedRate
    isEditing.value = false
    password.value = ''
    showPasswordDialog.value = false
    fetchInterestRate()
    ElMessage.success('Interest rate updated successfully')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Failed to update rate')
  } finally {
    saving.value = false
  }
}

const formatRate = (rate) => {
  return `${parseFloat(rate).toFixed(2)}%`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle hooks
onMounted(() => {
  fetchInterestRate()
})
</script>

<template>
  <div class="interest-rate-container">
    <el-card shadow="never" class="max-w-3xl mx-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Current Interest Rate</h2>
          <el-button
            v-if="!isEditing"
            type="primary"
            :icon="Edit"
            @click="startEditing"
          >
            Edit Rate
          </el-button>
          <div v-else class="flex space-x-2">
            <el-button
              type="success"
              :icon="Check"
              :loading="saving"
              @click="handleSave"
            >
              Save
            </el-button>
            <el-button
              :icon="Close"
              @click="cancelEditing"
            >
              Cancel
            </el-button>
          </div>
        </div>
      </template>

      <el-skeleton :rows="3" animated v-if="loading" />

      <div v-else class="rate-details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rate-value bg-gray-50 p-6 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Current Rate</h3>
            <div v-if="!isEditing">
              <p class="text-4xl font-bold text-blue-600">
                {{ formatRate(interestRate?.rate || 0) }}
              </p>
            </div>
            <div v-else>
              <el-input-number
                v-model="editForm.rate"
                :precision="2"
                :step="0.1"
                :min="0.01"
                :max="100"
                controls-position="right"
                size="large"
                class="text-4xl w-full"
              />
              <span class="text-2xl ml-2">%</span>
            </div>
          </div>

          <div class="rate-meta space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Created Date</h3>
              <p class="text-base">
                {{ formatDate(interestRate?.created_at) }}
              </p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
              <p class="text-base">
                {{ formatDate(interestRate?.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Password Dialog -->
    <el-dialog
      v-model="showPasswordDialog"
      title="Confirm Changes"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      required
    >
      <div class="space-y-4">
        <p>Please enter your password to confirm the interest rate change:</p>
        <el-input
          v-model="password"
          type="password"
          placeholder="Enter your password"
          show-password
          @keyup.enter="saveInterestRate"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="saving"
            @click="saveInterestRate"
            :disabled="!password"
          >
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.interest-rate-container {
  @apply p-4;
}

.rate-details {
  @apply p-4;
}

:deep(.el-card__header) {
  @apply border-b border-gray-200;
}

:deep(.el-input-number--large) {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  @apply h-auto;
}

.dialog-footer {
  @apply flex justify-end;
}
</style>
