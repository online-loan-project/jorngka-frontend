<script setup>
import { useAdminLogStore } from '~/store/admin/admin_log.js'
import { Search, View, Close, Refresh } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

const { index } = useAdminLogStore()
const logs = ref([])
const logName = ref(null)
const search = ref(null)
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref(null)
const pagination = ref({
  page: 1,
  per_page: 10,
  total: 0
})

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      log_name: logName.value,
      search: search.value,
    }
    const response = await index(params)
    logs.value = response.data
    pagination.value.total = response.total
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to fetch activity logs',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

const showDetail = (log) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchLogs()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchLogs()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Activity Logs</h1>
      <el-button type="primary" :icon="Refresh" @click="handleSearch">Refresh</el-button>
    </div>

    <el-card shadow="never" class="mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <el-input
            v-model="search"
            placeholder="Search activities..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="w-full md:w-64">
          <el-select
            v-model="logName"
            placeholder="Filter by log type"
            clearable
            @change="handleSearch"
          >
            <el-option label="All Logs" :value="null" />
            <el-option label="User" value="User" />
            <el-option label="Admin" value="Admin" />
            <el-option label="Borrower" value="Borrower" />
            <el-option label="Credit" value="Credit" />
            <el-option label="Credit Transaction" value="CreditTransaction" />
            <el-option label="Credit Score" value="CreditScore" />
            <el-option label="Income Information" value="IncomeInformation" />
            <el-option label="Interest Rate" value="InterestRate" />
            <el-option label="Liveliness" value="Liveliness" />
            <el-option label="Nid Information" value="NidInformation" />
            <el-option label="Phone OTP" value="PhoneOtp" />
            <el-option label="Request Loan" value="RequestLoan" />
            <el-option label="Loan" value="Loan" />
            <el-option label="Schedule Repayment" value="ScheduleRepayment" />

          </el-select>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table
        :data="logs"
        v-loading="loading"
        style="width: 100%"
        empty-text="No activity logs found"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="log_name" label="Log Type" width="180">
          <template #default="{ row }">
            <el-tag effect="plain">
              {{ row.log_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="200" />
        <el-table-column label="User">
          <template #default="{ row }">
            <div v-if="row.causer">
              <div class="font-medium">{{ row.causer.email }}</div>
              <div class="text-xs text-gray-500">ID: {{ row.causer.id }}</div>
            </div>
            <span v-else class="text-gray-400">System</span>
          </template>
        </el-table-column>
        <el-table-column prop="event" label="Event" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.event === 'created' ? 'success' : row.event === 'updated' ? 'warning' : 'danger'"
            >
              {{ row.event }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Date" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              circle
              @click="showDetail(row)"
            >
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.per_page"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="fetchLogs"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`Activity Log Details (ID: ${currentLog?.id})`"
      width="70%"
      align-center
    >
      <div v-if="currentLog" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-gray-700">Basic Information</h3>
            <div class="mt-2 space-y-2">
              <p><span class="font-medium">Log Name:</span> {{ currentLog.log_name }}</p>
              <p><span class="font-medium">Description:</span> {{ currentLog.description }}</p>
              <p><span class="font-medium">Event:</span>
                <el-tag :type="currentLog.event === 'created' ? 'success' : currentLog.event === 'updated' ? 'warning' : 'danger'">
                  {{ currentLog.event }}
                </el-tag>
              </p>
              <p><span class="font-medium">Date:</span> {{ formatDate(currentLog.created_at) }}</p>
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-700">User Information</h3>
            <div class="mt-2 space-y-2">
              <p v-if="currentLog.causer">
                <span class="font-medium">Performed by:</span>
                {{ currentLog.causer.email }} (ID: {{ currentLog.causer.id }})
              </p>
              <p v-else><span class="font-medium">Performed by:</span> System</p>
              <p><span class="font-medium">IP Address:</span> {{ currentLog.properties?.ip }}</p>
              <p><span class="font-medium">User Agent:</span> {{ currentLog.properties?.user_agent }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="font-semibold text-gray-700">Subject Details</h3>
          <div class="mt-2 bg-gray-50 p-4 rounded">
            <pre class="text-sm overflow-auto max-h-60">{{ JSON.stringify(currentLog.subject, null, 2) }}</pre>
          </div>
        </div>

        <div class="mt-4" v-if="currentLog.properties && Object.keys(currentLog.properties).length > 2">
          <h3 class="font-semibold text-gray-700">Additional Properties</h3>
          <div class="mt-2 bg-gray-50 p-4 rounded">
            <pre class="text-sm overflow-auto max-h-60">{{ JSON.stringify(currentLog.properties, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false" :icon="Close">
          Close
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.el-card {
  border-radius: 0.5rem;
}

:deep(.el-table .cell) {
  word-break: normal;
}

.pre-wrap {
  white-space: pre-wrap;
}
</style>