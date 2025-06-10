<script setup>
import { ref } from 'vue'
import { ElButton, ElAvatar, ElInput, ElMessage } from 'element-plus'
import { useAuthStore } from '~/store/auth.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})
const authStore = useAuthStore()
const { changePassword } = authStore

const { value: userData } = useCookie('user')
const user = ref({
  name: userData.profile.first_name + ' ' + userData.profile.last_name,
  firstName: userData.profile.first_name,
  lastName: userData.profile.last_name,
  email: userData.email,
  avatarUrl: userData.profile.image,
  phone: userData.phone,
  role: 'Admin',
})

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const formRef = ref(null) // Add this ref for form validation

const rules = {
  current_password: [
    { required: true, message: 'Please input current password', trigger: 'blur' },
    {
      min: 6,
      message: 'Current password must be at least 6 characters',
      trigger: ['blur', 'change'],
    },
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    {
      min: 6,
      message: 'Password must be at least 6 characters',
      trigger: ['blur', 'change'],
    },
  ],
  password_confirmation: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('Passwords do not match!'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
}

const isEditing = ref(false)
const tempUser = ref({ ...user.value })

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('Please upload a valid image (JPEG, PNG, GIF)')
    return
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('Image size must be less than 2MB')
    return
  }

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    user.value.avatarUrl = e.target.result
    if (isEditing.value) {
      tempUser.value.avatarUrl = e.target.result
    }
  }
  reader.readAsDataURL(file)
}

const startEditing = () => {
  tempUser.value = { ...user.value }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveChanges = async () => {
  await formRef.value.validate()
  const formData = new FormData()
  formData.append('current_password', form.value.current_password)
  formData.append('password', form.value.password)
  formData.append('password_confirmation', form.value.password_confirmation)

  await changePassword(formData)
  isEditing.value = false
  //clear the form
  form.value.current_password = ''
  form.value.password = ''
  form.value.password_confirmation = ''
  // Show success message
  navigateTo('/admin/settings')
  ElMessage.success('Password updated successfully!')
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6"
    >
      <div class="flex items-center space-x-6">
        <!-- Avatar Upload -->
        <div class="relative group">
          <label for="avatar-upload" class="cursor-pointer">
            <ElAvatar
              :src="user.avatarUrl"
              :size="80"
              class="border-4 border-white shadow-lg hover:border-blue-100 transition-all duration-300"
            />
            <div
              class="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span class="text-white text-sm font-medium">Change</span>
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg, image/png, image/gif"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>

        <!-- User Info -->
        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ user.name }}</h1>
          <p class="text-gray-600">{{ user.email }}</p>
          <p class="text-gray-500 text-sm mt-1">{{ user.role }}</p>
        </div>
      </div>
    </div>

    <!-- Profile Form -->
    <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 class="text-xl font-semibold text-gray-800 border-b pb-3">
        Profile Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name Field -->
        <div>
          <label
            for="firstName"
            class="block text-sm font-medium text-gray-700 mb-1"
            >First Name</label
          >
          <ElInput
            v-model="tempUser.firstName"
            id="name"
            disabled
            placeholder="Enter your first name"
            class="w-full"
          />
        </div>
        <div>
          <label
            for="lastName"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Last Name</label
          >
          <ElInput
            v-model="tempUser.lastName"
            id="name"
            disabled
            placeholder="Enter your last name"
            class="w-full"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Email Address</label
          >
          <ElInput
            v-model="tempUser.email"
            id="email"
            disabled
            placeholder="Enter your email"
            type="text"
            class="w-full"
          />
        </div>

        <!-- Phone Field -->
        <div>
          <label
            for="phone"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Phone Number</label
          >
          <ElInput
            v-model="tempUser.phone"
            id="phone"
            disabled
            placeholder="Enter your phone number"
            class="w-full"
          />
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold text-gray-800 pb-3">
          Update Password
        </h2>

        <ElButton
          v-if="!isEditing"
          type="primary"
          @click="startEditing"
          class="shadow-md"
        >
          Update Password
        </ElButton>
      </div>

      <el-form
        v-if="isEditing"
        ref="formRef"
        @submit.prevent="saveChanges"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-4"
      >
        <el-form-item label="Current Password" prop="current_password" class="input-margin">
          <el-input
            v-model="form.current_password"
            type="password"
            placeholder="Create password"
            show-password
          />
        </el-form-item>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="Password" prop="password" class="input-margin">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Create password"
              show-password
            />
          </el-form-item>

          <el-form-item
            label="Confirm Password"
            prop="password_confirmation"
            class="input-margin"
          >
            <el-input
              v-model="form.password_confirmation"
              type="password"
              placeholder="Confirm password"
              show-password
            />
          </el-form-item>
        </div>
      </el-form>

      <!-- Action Buttons -->
      <div v-if="isEditing" class="flex justify-end space-x-3 pt-4 border-t">
        <ElButton @click="cancelEditing" class="px-6">Cancel</ElButton>
        <ElButton type="primary" @click="saveChanges" class="px-6 shadow-md">
          Save Changes
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper.is-disabled) {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}
</style>
