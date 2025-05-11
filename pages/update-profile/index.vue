<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, PhoneFilled } from '@element-plus/icons-vue'
import { useProfileStore } from '~/store/profile.js'

const user = useCookie('user')

const profileStore = useProfileStore()
const { updateProfile } = profileStore

const email = ref(user.value?.email || '')
const form = ref({
  first_name: user.value?.profile?.first_name || '',
  last_name: user.value?.profile?.last_name || '',
  phone: user.value?.phone || '',
  gender: user.value?.profile?.gender || '',
  dob: user.value?.profile?.dob || '',
  address: user.value?.profile?.address || '',
  image: null,
})

const previewImage = ref(user.value?.profile?.image || '')
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]
const loading = ref(false)
const formRef = ref()

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Validate image file
    if (!file.type.match('image.*')) {
      ElMessage.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      ElMessage.error('Image size should be less than 2MB')
      return
    }
    form.value.image = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please input phone number'))
  } else if (!/^[0-9]{9,15}$/.test(value)) {
    callback(new Error('Please enter a valid phone number (9-15 digits)'))
  } else {
    callback()
  }
}

const validateDOB = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please select date of birth'))
  } else {
    const dobDate = new Date(value)
    const today = new Date()
    if (dobDate > today) {
      callback(new Error('Date of birth cannot be in the future'))
    } else {
      callback()
    }
  }
}

const rules = {
  first_name: [
    { required: true, message: 'Please input first name', trigger: 'blur' },
    { max: 255, message: 'Length should be less than 255 characters', trigger: 'blur' }
  ],
  last_name: [
    { required: true, message: 'Please input last name', trigger: 'blur' },
    { max: 255, message: 'Length should be less than 255 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  gender: [
    { required: true, message: 'Please select gender', trigger: 'change' }
  ],
  dob: [
    { required: true, validator: validateDOB, trigger: 'change' }
  ],
  address: [
    { required: true, message: 'Please input address', trigger: 'blur' },
    { max: 255, message: 'Length should be less than 255 characters', trigger: 'blur' }
  ]
}

const submit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    const formData = new FormData()
    formData.append('first_name', form.value.first_name)
    formData.append('last_name', form.value.last_name)
    formData.append('phone', form.value.phone)

    //dob format to YYYY-MM-DD
    const dob = new Date(form.value.dob)
    formData.append('dob', `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`)
    formData.append('gender', form.value.gender)
    //address
    formData.append('address', form.value.address)

    //image
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    await updateProfile(formData)
    // Simulating API call
    setTimeout(() => {
      ElMessage.success('Profile updated successfully')
      loading.value = false
      navigateTo('/telegram')
    }, 1500)
  } catch (error) {
    console.error('Profile update error:', error)
    ElMessage.error(error || 'An error occurred while updating profile')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!user.value) {
    ElMessage.error('You need to login first')
    return navigateTo('/login')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Heading -->
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-gray-800">Update Your Profile</h2>
      <p class="text-gray-600">Keep your information up to date</p>
    </div>

    <!-- Profile Card -->
    <el-card class="max-w-3xl mx-auto">
      <div class="md:flex">
        <!-- Left Column - Profile Image -->
        <div class="md:w-1/3 p-6 flex flex-col items-center">
          <div class="relative mb-4">
            <el-avatar :size="160" :src="previewImage || 'https://via.placeholder.com/160'" />
            <label class="absolute bottom-0 right-0 cursor-pointer bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-200">
              <el-icon><Camera /></el-icon>
              <input type="file" class="hidden" @change="handleImageChange" accept="image/*">
            </label>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">
            {{ form.first_name || '' }} {{ form.last_name || '' }}
          </h3>
          <p class="text-gray-600">{{ email || '' }}</p>
        </div>

        <!-- Right Column - Form -->
        <div class="md:w-2/3 p-6">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            @submit.prevent="submit"
          >
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <el-form-item label="First Name" prop="first_name">
                <el-input
                  v-model="form.first_name"
                  placeholder="Enter your first name"
                  clearable
                />
              </el-form-item>
              <el-form-item label="Last Name" prop="last_name">
                <el-input
                  v-model="form.last_name"
                  placeholder="Enter your last name"
                  clearable
                />
              </el-form-item>
            </div>

            <!-- Phone -->
            <el-form-item label="Phone Number" prop="phone" class="mb-4">
              <el-input
                v-model="form.phone"
                placeholder="Enter your phone number"
                clearable
              >
                <template #prefix>
                  <el-icon><PhoneFilled /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- Gender and DOB -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <el-form-item label="Gender" prop="gender">
                <el-select
                  v-model="form.gender"
                  placeholder="Select your gender"
                  class="w-full"
                  clearable
                >
                  <el-option
                    v-for="option in genderOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Date of Birth" prop="dob">
                <el-date-picker
                  v-model="form.dob"
                  type="date"
                  placeholder="Pick a date"
                  class="w-full"
                  :disabled-date="(date) => date > new Date()"
                />
              </el-form-item>
            </div>

            <!-- Address -->
            <el-form-item label="Address" prop="address" class="mb-6">
              <el-input
                v-model="form.address"
                type="textarea"
                :rows="3"
                placeholder="Enter your address"
                show-word-limit
                :maxlength="255"
              />
            </el-form-item>

            <!-- Submit Button -->
            <div class="flex justify-end gap-3">
              <el-button @click="$router.back()">
                Cancel
              </el-button>
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
              >
                Update Profile
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.el-avatar {
  border: 2px solid #f0f0f0;
}

.el-form-item {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>