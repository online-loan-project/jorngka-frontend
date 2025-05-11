<script setup>
import { ref } from 'vue'
import {
  Document,
  List,
  Money,
  Timer,
  CircleCheck,
  Calendar,
  TrendCharts,
  DocumentRemove,
} from '@element-plus/icons-vue'

definePageMeta({
  layout: 'borrower',
  middleware: ['authenticated'],
})

import { useDashboardStore } from '~/store/dashboard.js'

const now = new Date()

const { value: user } = useCookie('user')
const apiResponse = ref({})
const loading = ref(false)

const dashboardStore = useDashboardStore()
const { getDashboard } = dashboardStore

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const response = await getDashboard({ page: page })
    apiResponse.value = response
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="mb-4">
    <h1 class="text-2xl font-bold">Borrower Dashboard</h1>
    <p>Welcome to the borrower dashboard!</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <el-card shadow="hover" class="summary-card">
      <div class="flex flex-row items-center">
        <div class="flex items-center justify-center rounded-full mr-2">
          <el-image
            v-if="user && user.profile && user.profile.image"
            :src="user.profile.image"
            class="w-10 h-10 rounded-full border-2 border-primary-600 shadow-md transition-all"
            fit="contain"
            :preview-src-list="[user.profile.image]"
          />
        </div>
        <div class="flex flex-col">
          <p class="font-bold my-auto">
            {{ user.profile.first_name }} {{ user.profile.last_name }}
          </p>
          <p class="text-sm text-gray-500">Last Login : {{ now }}</p>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center">
        <div class="rounded-full bg-blue-50 mr-4">
          <el-icon class="text-blue-500 text-xl">
            <Document />
          </el-icon>
        </div>
        <div>
          <p class="text-sm text-gray-500">Your Credit Score</p>
          <p class="text-2xl font-bold">
            {{ apiResponse?.summary?.credit_score }}
          </p>
        </div>
      </div>
    </el-card>
  </div>

  <h1 class="mb-4">Loan Statistics</h1>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center">
        <div class="rounded-full bg-blue-50 mr-4">
          <el-icon class="text-blue-500 text-xl">
            <List />
          </el-icon>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Requests</p>
          <p class="text-2xl font-bold">
            {{ apiResponse?.summary?.total_requests }}
          </p>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center">
        <div class="rounded-full bg-purple-50 mr-4">
          <el-icon class="text-purple-500 text-xl">
            <Money />
          </el-icon>
        </div>
        <div>
          <p class="text-sm text-gray-500">Active Loan</p>
          <p class="text-2xl font-bold">
            ${{ apiResponse?.summary?.total_request_amount }}
          </p>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center">
        <div class="rounded-full bg-yellow-50 mr-4">
          <el-icon class="text-yellow-500 text-xl">
            <Timer />
          </el-icon>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Loan Amount</p>
          <p class="text-2xl font-bold">
            {{ apiResponse?.summary?.total_request_amount }}
          </p>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center">
        <div class="rounded-full bg-green-50 mr-4">
          <el-icon class="text-green-500 text-xl">
            <CircleCheck />
          </el-icon>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Repayment</p>
          <p class="text-2xl font-bold">
            {{ apiResponse?.summary?.status_counts?.approved }}
          </p>
        </div>
      </div>
    </el-card>
  </div>

  <div class="container">
    <h1 class="mb-6">Loan Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Loan Details Card -->
      <el-card
        shadow="hover"
        class="h-full border-none bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div
          slot="header"
          class="flex justify-between items-center pb-3 border-b border-gray-100"
        >
          <div class="flex items-center space-x-3">
            <el-icon class="text-indigo-600" size="20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </el-icon>
            <h2 class="text-lg font-bold text-gray-800">Loan Details</h2>
          </div>
          <el-tag
            :type="
              apiResponse?.summary?.current_loan?.status === '0'
                ? 'warning'
                : 'success'
            "
            effect="dark"
            size="small"
            class="rounded-full px-3 py-1"
          >
            {{
              apiResponse?.summary?.current_loan?.status === '0'
                ? 'Active'
                : 'Completed'
            }}
          </el-tag>
        </div>

        <div v-if="apiResponse?.summary?.current_loan" class="py-2">
          <div class="grid grid-cols-1 gap-4">
            <!-- Loan Amount -->
            <div
              class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <div class="flex items-center space-x-2">
                <el-icon class="text-indigo-500"><money /></el-icon>
                <span class="text-gray-600">Loan Amount</span>
              </div>
              <span class="font-bold text-indigo-600">
                ${{ apiResponse.summary.current_loan.loan_repayment }}
              </span>
            </div>

            <!-- Duration -->
            <div
              class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <div class="flex items-center space-x-2">
                <el-icon class="text-indigo-500"><timer /></el-icon>
                <span class="text-gray-600">Duration</span>
              </div>
              <span class="font-medium text-gray-800">
                {{ apiResponse.summary.current_loan.loan_duration }} months
              </span>
            </div>

            <!-- Interest Rate -->
            <div
              class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <div class="flex items-center space-x-2">
                <el-icon class="text-indigo-500"><TrendCharts /></el-icon>
                <span class="text-gray-600">Interest</span>
              </div>
              <span class="font-medium text-gray-800">
                {{ apiResponse.summary.current_loan.revenue }} $
              </span>
            </div>

            <!-- Start Date -->
            <div
              class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <div class="flex items-center space-x-2">
                <el-icon class="text-indigo-500"><calendar /></el-icon>
                <span class="text-gray-600">Start Date</span>
              </div>
              <span class="font-medium text-gray-800">
                {{ formatDate(apiResponse.summary.current_loan.created_at) }}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex justify-between mb-1 text-sm text-gray-600">
              <span>Repayment Progress</span>
              <span>{{ apiResponse.summary.repayment_progress }}%</span>
            </div>
            <el-progress
              :percentage="apiResponse.summary.repayment_progress"
              :show-text="false"
              stroke-linecap="round"
              color="#6366F1"
              class="h-2"
            />
          </div>
        </div>

        <el-empty v-else description="No active loan" class="py-8">
          <template #image>
            <el-icon class="text-gray-400" size="60"
              ><DocumentRemove
            /></el-icon>
          </template>
        </el-empty>
      </el-card>

      <!-- Repayment Schedule Card -->
      <el-card
        shadow="hover"
        class="h-full border-none bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div slot="header">
          <h2 class="text-lg font-semibold mb-4">Repayment Schedule</h2>
        </div>

        <div v-if="apiResponse?.summary?.current_repayment?.length">
          <el-table
            :data="apiResponse.summary.current_repayment"
            style="width: 100%"
            :show-header="false"
            class="border-none"
          >
            <el-table-column prop="repayment_date" label="Date">
              <template #default="{ row }">
                <div class="flex items-center">
                  <el-icon class="mr-2">
                    <calendar />
                  </el-icon>
                  {{ formatDate(row.repayment_date) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="emi_amount" label="Amount" align="right">
              <template #default="{ row }">
                <span class="font-medium">${{ row.emi_amount }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="Status"
              align="right"
              width="120"
            >
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="
                    row.status === '0'
                      ? 'danger'
                      : row.status !== '1'
                        ? 'warning'
                        : 'success'
                  "
                  effect="plain"
                >
                  {{
                    row.status === '0'
                      ? 'Pending'
                      : row.status === '1'
                        ? 'Paid'
                        : 'Late'
                  }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="mt-4 text-right">
            <el-button
              type="primary"
              size="small"
              @click="navigateTo('/borrower/loans/active')"
            >
              View Loan and Schedule Repayment</el-button
            >
          </div>
        </div>

        <el-empty v-else description="No repayment schedule" />
      </el-card>
    </div>
  </div>
</template>

<style scoped></style>
