<script setup>
import { useAuthStore } from '~/store/auth.js'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'auth',
  middleware: ['redirect-if-authenticated'],
})

useSeoMeta({
  title: 'JorngKa | Register',
  description:
    'Get approved for fast, secure loans up to $1000 with competitive rates. Apply online in minutes with JorngKa.',
})

const authStore = useAuthStore()
const { register } = authStore

const form = ref({
  first_name: '',
  last_name: '',
  gender: '',
  dob: '',
  address: '',
  image: null,
  phone: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const formRef = ref(null) // Add this ref for form validation

const rules = {
  first_name: [
    { required: true, message: 'Please input first name', trigger: 'blur' },
  ],
  last_name: [
    { required: true, message: 'Please input last name', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: 'Please select gender', trigger: 'change' },
  ],
  dob: [
    {
      required: true,
      message: 'Please select date of birth',
      trigger: 'change',
    },
  ],
  address: [
    { required: true, message: 'Please input address', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    {
      type: 'email',
      message: 'Please input correct email format',
      trigger: ['blur', 'change'],
    },
  ],
  phone: [
    { required: true, message: 'Please input phone number', trigger: 'blur' },
  ],
  image: [
    { required: true, message: 'Please upload an image', trigger: 'change' },
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

const googleLoginUrl = () => {
  window.location.href = `https://api.jorngka.online/auth/google`
}

const handleRegister = async () => {
  try {
    // Validate form before submission
    await formRef.value.validate()

    // Create FormData to handle file upload
    const formData = new FormData()
    for (const key in form.value) {
      if (form.value[key] !== null) {
        formData.append(key, form.value[key])
      }
    }
    if (form.value.dob) {
      const dobDate = new Date(form.value.dob)
      const formattedDob = dobDate.toISOString().split('T')[0]
      formData.set('dob', formattedDob)
    }

    //image
    if (form.value.image) {
      formData.append('image', form.value.image[0].raw)
    }

    await register(formData)
    console.log('Registration successful:', form.value)
    navigateTo('/telegram')
  } catch (error) {
    if (error.name !== 'Error') {
      // Skip showing validation errors as they're already shown
      console.error('Registration failed:', error)
      ElMessage.error(error.message || 'Registration failed')
    }
  }
}
</script>

<template>
  <div
    class="relative w-full min-h-screen bg-home flex items-center justify-center p-4"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div
      class="relative w-full max-w-xl bg-white rounded-lg shadow-lg animate-slide-up z-10 overflow-y-auto"
      style="max-height: 95vh"
    >
      <div class="p-6 md:p-8">
        <h1 class="text-2xl md:text-3xl font-bold text-center mb-3">
          Create Account
        </h1>
        <p class="text-center text-gray-500 mb-6">Register to get started</p>

        <el-form
          ref="formRef"
          @submit.prevent="handleRegister"
          :model="form"
          :rules="rules"
          label-position="top"
          class="space-y-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item
              label="First Name"
              prop="first_name"
              class="input-margin"
            >
              <el-input
                v-model="form.first_name"
                placeholder="First name"
                clearable
                class="w-full"
              />
            </el-form-item>

            <el-form-item
              label="Last Name"
              prop="last_name"
              class="input-margin"
            >
              <el-input
                v-model="form.last_name"
                placeholder="Last name"
                clearable
                class="w-full"
              />
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Gender" prop="gender" class="input-margin">
              <el-select
                v-model="form.gender"
                placeholder="Select gender"
                class="w-full"
              >
                <el-option label="Male" value="male" />
                <el-option label="Female" value="female" />
                <el-option label="Other" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="Date of Birth" prop="dob" class="input-margin">
              <el-date-picker
                v-model="form.dob"
                type="date"
                placeholder="Date of birth"
                class="w-full"
              />
            </el-form-item>
          </div>

          <el-form-item label="Address" prop="address" class="input-margin">
            <el-input
              v-model="form.address"
              placeholder="Your address"
              clearable
            />
          </el-form-item>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Email" prop="email" class="input-margin">
              <el-input
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="Phone Number"
              prop="phone"
              class="input-margin"
            >
              <el-input
                v-model="form.phone"
                placeholder="Phone number"
                type="number"
                clearable
              />
            </el-form-item>
          </div>

          <el-form-item label="Image" prop="image" class="input-margin">
            <ImageUpload
              v-model="form.image"
              :max-count="1"
              :max-size="5"
              tip-text="Upload product images"
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

          <div class="flex justify-between items-center mt-1">
            <el-button
              type="primary"
              class="w-full h-10 rounded-lg"
              native-type="submit"
              >Register
            </el-button>
          </div>
          <div class="flex justify-between items-center mt-1">
            <el-button
              type="danger"
              class="w-full h-10 rounded-lg"
              @click="googleLoginUrl"
              >Login with Google
            </el-button>
          </div>
        </el-form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-blue-500 font-semibold hover:underline"
          >
            Login
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-margin {
  margin-bottom: 0;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-in-out;
}

.bg-home {
  background: url('@/assets/image/home.png') no-repeat center center;
  background-size: cover;
}
</style>
