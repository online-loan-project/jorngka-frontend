<script setup lang="ts">
import { ref } from 'vue'

interface PasswordDialogProps {
  title?: string
  requireDescription?: boolean
}

const props = withDefaults(defineProps<PasswordDialogProps>(), {
  title: 'Password Confirmation',
  requireDescription: true
})
// Add these at the top with other refs:
let pendingResolve: ((value: any) => void) | null = null
let pendingReject: ((reason?: any) => void) | null = null
const password = ref('')
const description = ref('')
const isVisible = ref(false)

// Define emits for TypeScript support
const emit = defineEmits<{
  (e: 'confirm', value: { password: string; description: string }): void
  (e: 'cancel'): void
}>()

const open = () => {
  resetForm()
  isVisible.value = true

  return new Promise((resolve, reject) => {
    const onConfirm = (data: { password: string; description: string }) => {
      cleanup()
      resolve(data)
    }

    const onCancel = () => {
      cleanup()
      reject('cancelled')
    }

    const cleanup = () => {
      // Remove listeners if needed
    }

    // Store the resolve/reject functions
    pendingResolve = resolve
    pendingReject = reject
  })
}


const resetForm = () => {
  password.value = ''
  description.value = ''
}

const handleConfirm = () => {
  if (pendingResolve) {
    pendingResolve({
      password: password.value,
      description: description.value
    })
    pendingResolve = null
    pendingReject = null
  }
  isVisible.value = false
}

const handleCancel = () => {
  if (pendingReject) {
    pendingReject('cancelled')
    pendingResolve = null
    pendingReject = null
  }
  isVisible.value = false
}

// Expose methods to parent component
defineExpose({ open, close: handleCancel })
</script>

<template>
  <el-dialog
    v-model="isVisible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form label-position="top" :require-asterisk-position="'right'">
      <el-form-item label="Password" required>
        <el-input
          v-model="password"
          type="password"
          placeholder="Enter your password"
          show-password
          clearable
          @keyup.enter="handleConfirm"
        />
      </el-form-item>

      <el-form-item v-if="requireDescription" label="Description" required>
        <el-input
          v-model="description"
          placeholder="Enter transaction description"
          clearable
          @keyup.enter="handleConfirm"
          :rows="2"
          type="textarea"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">
        Cancel
      </el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
      >
        Confirm
      </el-button>
    </template>
  </el-dialog>
</template>