<script setup>
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { useRequestLoanStore } from '~/store/request_loan.js'

definePageMeta({
  layout: 'borrower',
  middleware: ['authenticated'],
})

const requestLoanStore = useRequestLoanStore()
const { storeRequestLoan } = requestLoanStore

const currentStep = ref(1)
const steps = [
  { title: 'Personal Data', icon: 'User' },
  { title: 'Income Information', icon: 'Money' },
  { title: 'Loan Details', icon: 'Document' },
]

const user = useCookie('user').value
if (!user || !user.phone) {
  ElMessage.error('User information not found. Please log in again.')
  navigateTo('/login')
}

const personalData = ref({
  fullName: user.profile.first_name + ' ' + user.profile.last_name,
  email: user.email,
  phone: user.phone,
  address: user.profile.address,
  dateOfBirth: user.profile.dob,
})

const incomeData = ref({
  employeeType: 'employer',
  position: '',
  monthlyIncome: '',
  occupation: '',
  employer: '',
  bankStatement: null,
})

const loanData = ref({
  loanAmount: '',
  loanDuration: 6, // months
  loanType: 'personal',
})

// Validation rules
const rules = {
  required: {
    required: true,
    message: 'This field is required',
    trigger: ['blur', 'change'],
  },
  number: {
    type: 'number',
    message: 'Please input a valid number',
    trigger: ['blur', 'change'],
  },
  email: {
    type: 'email',
    message: 'Please input a valid email address',
    trigger: ['blur', 'change'],
  },
  minLength: (min) => ({
    min,
    message: `Minimum length should be ${min}`,
    trigger: 'blur',
  }),
  bankStatementFile: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('Please upload a bank statement'))
      } else {
        callback()
      }
    },
    trigger: 'change',
  },
}

const handleBankStatementUpload = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('File size should not exceed 5MB')
    return false
  }

  incomeData.value.bankStatement = file.raw
  return true
}

const validateStep1 = () => {
  // Personal data is pre-filled and disabled, so no validation needed
  return true
}

const validateStep2 = () => {
  if (!incomeData.value.position) {
    ElMessage.error('Please enter your position')
    return false
  }

  if (!incomeData.value.monthlyIncome || incomeData.value.monthlyIncome < 100) {
    ElMessage.error('Please enter a valid monthly income (minimum $100)')
    return false
  }

  if (!incomeData.value.occupation) {
    ElMessage.error('Please enter your occupation')
    return false
  }

  if (incomeData.value.employeeType === 'employer' && !incomeData.value.employer) {
    ElMessage.error('Please enter your employer/company name')
    return false
  }

  if (incomeData.value.employeeType === 'employer' && !incomeData.value.bankStatement) {
    ElMessage.error('Please upload your bank statement')
    return false
  }

  return true
}

const validateStep3 = () => {
  if (!loanData.value.loanAmount || loanData.value.loanAmount < 100) {
    ElMessage.error('Please enter a valid loan amount (minimum $100)')
    return false
  }

  if (!loanData.value.loanDuration || loanData.value.loanDuration < 1 || loanData.value.loanDuration > 12) {
    ElMessage.error('Please enter a valid loan duration (1-12 months)')
    return false
  }

  return true
}

const nextStep = async () => {
  let isValid = false

  switch (currentStep.value) {
    case 1:
      isValid = validateStep1()
      break
    case 2:
      isValid = validateStep2()
      break
  }

  if (isValid && currentStep.value < steps.length) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitLoanRequest = async () => {
  if (!validateStep3()) {
    return
  }

  try {
    const formData = new FormData()

    // Append income data
    formData.append('employee_type', incomeData.value.employeeType)
    formData.append('position', incomeData.value.position)
    formData.append('income', incomeData.value.monthlyIncome)

    if (incomeData.value.bankStatement) {
      formData.append('bank_statement', incomeData.value.bankStatement)
    }

    // Append loan data
    formData.append('loan_amount', loanData.value.loanAmount)
    formData.append('loan_duration', loanData.value.loanDuration)
    formData.append('loan_type', loanData.value.loanType)

    formData.append('occupation', incomeData.value.occupation)
    formData.append('employer', incomeData.value.employer)

    await storeRequestLoan(formData)
    ElMessage.success('Loan request submitted successfully!')
    navigateTo('/borrower/request-loan')
  } catch (error) {
    console.error('Error submitting loan request:', error)
    ElMessage.error('Failed to submit loan request. Please try again.')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Request New Loan</h1>

    <!-- Stepper -->
    <el-steps :active="currentStep" align-center class="mb-8">
      <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :icon="step.icon"
      />
    </el-steps>

    <!-- Step 1: Personal Data -->
    <div v-if="currentStep === 1" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-6">Personal Information</h2>

      <el-form
          :model="personalData"
          label-width="150px"
          label-position="top"
          :rules="rules"
      >
        <el-form-item label="Full Name" prop="fullName" :rules="rules.required">
          <el-input
              v-model="personalData.fullName"
              placeholder="Enter your full name"
              disabled
          />
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="Email Address" prop="email" :rules="[rules.required, rules.email]">
            <el-input
                v-model="personalData.email"
                type="text"
                placeholder="your@email.com"
                disabled
            />
          </el-form-item>

          <el-form-item label="Phone Number" prop="phone" :rules="rules.required">
            <el-input
                v-model="personalData.phone"
                placeholder="092000000"
                disabled
            />
          </el-form-item>
        </div>

        <el-form-item label="Date of Birth" prop="dateOfBirth" :rules="rules.required">
          <el-date-picker
              v-model="personalData.dateOfBirth"
              type="date"
              placeholder="Select your date of birth"
              class="w-full"
              disabled
          />
        </el-form-item>

        <el-form-item label="Address" prop="address" :rules="rules.required">
          <el-input
              v-model="personalData.address"
              type="textarea"
              :rows="3"
              placeholder="Enter your full address"
              disabled
          />
        </el-form-item>
      </el-form>

      <div class="flex justify-between mt-6">
        <el-button @click="navigateTo('/borrower/request-loan')"> Back </el-button>

        <el-button type="primary" @click="nextStep">
          Continue to Income Information
          <i class="i-material-symbols-arrow-forward ml-2"></i>
        </el-button>
      </div>
    </div>

    <!-- Step 2: Income Information -->
    <div v-if="currentStep === 2" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-6">Income Information</h2>

      <el-form
          :model="incomeData"
          label-width="150px"
          label-position="top"
          :rules="rules"
      >
        <el-form-item label="Employment Type" prop="employeeType" :rules="rules.required">
          <el-radio-group v-model="incomeData.employeeType">
            <el-radio label="employer">Employed</el-radio>
            <el-radio label="self-employer">Self-Employed</el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="Position" prop="position" :rules="rules.required">
            <el-input
                v-model="incomeData.position"
                placeholder="Your position/job title"
            />
          </el-form-item>

          <el-form-item
              label="Monthly Income (USD)"
              prop="monthlyIncome"
              :rules="[
              rules.required,
              rules.number,
              { type: 'number', min: 100, message: 'Minimum income must be at least $100' }
            ]"
          >
            <el-input-number
                v-model="incomeData.monthlyIncome"
                :min="100"
                :step="100"
                controls-position="right"
                class="w-full"
            />
          </el-form-item>
        </div>

        <el-form-item label="Occupation" prop="occupation" :rules="rules.required">
          <el-input
              v-model="incomeData.occupation"
              placeholder="Your profession"
          />
        </el-form-item>

        <el-form-item
            v-if="incomeData.employeeType === 'employer'"
            label="Employer/Company Name"
            prop="employer"
            :rules="incomeData.employeeType === 'employer' ? rules.required : []"
        >
          <el-input
              v-model="incomeData.employer"
              placeholder="Where you work"
          />
        </el-form-item>

        <el-form-item
            v-if="incomeData.employeeType === 'employer'"
            label="Bank Statement (Last 3 months)"
            prop="bankStatement"
            :rules="incomeData.employeeType === 'employer' ? rules.bankStatementFile : []"
        >
          <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleBankStatementUpload"
              accept=".pdf,.jpg,.jpeg,.png"
              class="bank-statement-upload"
          >
            <el-button type="primary">
              <i class="i-material-symbols-upload mr-2"></i>
              Upload Bank Statement
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                Upload PDF or image of your bank statement (Max 5MB)
              </div>
            </template>
          </el-upload>

          <div v-if="incomeData.bankStatement" class="mt-4">
            <el-tag closable @close="incomeData.bankStatement = null">
              {{ incomeData.bankStatement.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>

      <div class="flex justify-between mt-6">
        <el-button @click="prevStep"> Back </el-button>
        <el-button type="primary" @click="nextStep">
          Continue to Loan Details
          <i class="i-material-symbols-arrow-forward ml-2"></i>
        </el-button>
      </div>
    </div>

    <!-- Step 3: Loan Details -->
    <div v-if="currentStep === 3" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-6">Loan Details</h2>

      <el-form :model="loanData" label-width="150px" label-position="top" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item
              label="Loan Amount (USD)"
              prop="loanAmount"
              :rules="[
              rules.required,
              rules.number,
              { type: 'number', min: 100, message: 'Minimum loan amount must be at least $100' }
            ]"
          >
            <el-input-number
                v-model="loanData.loanAmount"
                :min="100"
                :step="100"
                controls-position="right"
                class="w-full"
            />
          </el-form-item>

          <el-form-item
              label="Loan Duration (Months)"
              prop="loanDuration"
              :rules="[
              rules.required,
              rules.number,
              { type: 'number', min: 1, max: 12, message: 'Loan duration must be between 1-12 months' }
            ]"
          >
            <div class="space-y-2">
              <el-input-number
                  v-model="loanData.loanDuration"
                  :min="1"
                  :max="12"
                  :step="1"
                  controls-position="right"
                  class="w-full"
                  size="large"
              />
              <div class="flex items-start text-sm text-gray-500 mt-1">
                <el-icon class="mr-1.5 mt-0.5"><info-filled /></el-icon>
                <span>Loan duration must be between 1 to 12 months.</span>
              </div>
            </div>
          </el-form-item>
        </div>

        <el-form-item label="Loan Type" prop="loanType" :rules="rules.required">
          <el-radio-group v-model="loanData.loanType">
            <el-radio label="personal">Personal Loan</el-radio>
            <el-radio label="business">Business Loan</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="flex justify-between mt-6">
        <el-button @click="prevStep"> Back </el-button>
        <el-button type="primary" @click="submitLoanRequest">
          Submit Loan Request
          <i class="i-material-symbols-check-circle ml-2"></i>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer transition-colors;
}

.upload-area:hover {
  @apply border-blue-500;
}

.upload-placeholder {
  @apply flex flex-col items-center justify-center text-center p-6 text-gray-500;
}

.preview-container {
  @apply relative h-40;
}

.preview-image {
  @apply w-full h-full object-contain rounded-lg;
}

.preview-overlay {
  @apply absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg;
}

.selfie-upload {
  @apply max-w-md mx-auto;
}

.bank-statement-upload {
  @apply w-full;
}

.el-step {
  @apply cursor-pointer;
}

.el-step:deep(.el-step__title) {
  @apply font-medium;
}

.el-step.is-process:deep(.el-step__title) {
  @apply font-semibold text-blue-600;
}
</style>