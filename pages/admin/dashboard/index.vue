<script setup>
import { useDashboardStore } from '~/store/admin_dashboard.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

import { Bar, Line, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement)

const now = new Date()

const { value: user } = useCookie('user')
const apiResponse = ref({})
const loading = ref(false)

const requestLoanStore = useDashboardStore()
const { getDashboard } = requestLoanStore

// Remove the initial data structure since we'll compute everything reactively

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const response = await getDashboard({ page: page })
    apiResponse.value = response
  } finally {
    loading.value = false
  }
}

// Make all chart data computed properties based on apiResponse
const loanStatusChart = computed(() => ({
  data: {
    labels: ['Unpaid', 'Paid'],
    datasets: [
      {
        label: 'Loan Applications',
        backgroundColor: ['#FFCE56', '#36A2EB'],
        data: [
          apiResponse.value.total_unpaid || 0,
          apiResponse.value.total_paid || 0
        ]
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Loan Status Distribution'
      }
    }
  }
}))

const monthlyTrendsChart = computed(() => ({
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Loan Applications',
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        data: apiResponse.value.monthly_request_loan || Array(12).fill(0)
      },
      {
        label: 'Approved Loans',
        backgroundColor: '#4BC0C0',
        borderColor: '#4BC0C0',
        data: apiResponse.value.monthly_loan || Array(12).fill(0)
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Loan Trends'
      }
    }
  }
}))

const loanAmountsChart = computed(() => ({
  data: {
    labels: ['< $100', '$100-$200', '$200-$500', '$500-$1k', '> $1k'],
    datasets: [
      {
        label: 'Number of Loans',
        backgroundColor: '#FF9F40',
        data: apiResponse.value.number_loan_stat || Array(5).fill(0)
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Loan Amount Distribution'
      }
    }
  }
}))

// Initial data fetch
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="mb-4">
    <h1 class="text-2xl font-bold">Admin Dashboard</h1>
    <p class="text-gray-600">Overview of platform performance and loan activities</p>
  </div>

  <!-- Loading state -->
  <div v-if="loading" class="flex justify-center items-center h-64">
    <el-icon class="is-loading" size="32">
      <i-material-symbols-refresh />
    </el-icon>
  </div>

  <!-- Content when loaded -->
  <template v-else>
    <!-- User Profile and Quick Stats -->
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
            <p class="text-sm text-gray-500">Last Login : {{ now.toLocaleString() }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-50 mr-4">
            <i class="i-material-symbols-list text-blue-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Users</p>
            <p class="text-2xl font-bold">
              {{ apiResponse?.total_user || '0' }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Loan Statistics -->
    <h2 class="mb-4 text-xl font-semibold">Loan Statistics</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-50 mr-4">
            <i class="i-material-symbols-list text-blue-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Requests</p>
            <p class="text-2xl font-bold">
              {{ apiResponse?.total_request_loan || '0' }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-50 mr-4">
            <i class="i-material-symbols-attach-money text-purple-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Active Loans</p>
            <p class="text-2xl font-bold">
              {{ apiResponse?.total_active_loan || '0' }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-50 mr-4">
            <i class="i-material-symbols-pending-actions text-yellow-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Revenue</p>
            <p class="text-2xl font-bold">
              ${{ (apiResponse?.total_revenue || 0).toLocaleString() }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-50 mr-4">
            <i class="i-material-symbols-check-circle text-green-500 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Repayments</p>
            <p class="text-2xl font-bold">
              ${{ (apiResponse?.total_loan_repayment || 0).toLocaleString() }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Loan Status Distribution -->
      <el-card shadow="hover" class="p-4">
        <div class="h-64">
          <Pie
            :data="loanStatusChart.data"
            :options="loanStatusChart.options"
          />
        </div>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">Loan application status breakdown</p>
        </div>
      </el-card>

      <!-- Monthly Trends -->
      <el-card shadow="hover" class="p-4">
        <div class="h-64">
          <Line
            :data="monthlyTrendsChart.data"
            :options="monthlyTrendsChart.options"
          />
        </div>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">Monthly loan application and approval trends</p>
        </div>
      </el-card>
    </div>

    <!-- Additional Data Section -->
    <div class="grid grid-cols-1 gap-6 mb-8">
      <!-- Loan Amount Distribution -->
      <el-card shadow="hover" class="p-4">
        <div class="h-64">
          <Bar
            :data="loanAmountsChart.data"
            :options="loanAmountsChart.options"
          />
        </div>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">Distribution of loans by amount ranges</p>
        </div>
      </el-card>
    </div>

    <!-- Top Borrowers -->
    <h2 class="mb-4 text-xl font-semibold">Top Borrowers</h2>
    <el-card shadow="hover">
      <el-table :data="apiResponse?.top_borrowers || []" style="width: 100%" v-loading="loading">
        <el-table-column prop="rank" label="Rank" width="80" />
        <el-table-column prop="name" label="Borrower Name" />
        <el-table-column prop="phone" label="Borrower Phone" />
        <el-table-column prop="loans_count" label="Loans Count" />
        <el-table-column prop="loans_sum_loan_repayment" label="Total Borrowed">
          <template #default="{ row }">
            ${{ row.loans_sum_loan_repayment?.toLocaleString() || '0' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </template>
</template>

<style scoped>
.summary-card {
  @apply transition-all duration-300 hover:shadow-lg;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.el-card {
  @apply rounded-lg;
}

h1, h2 {
  @apply text-gray-800;
}
</style>