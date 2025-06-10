<script setup>
import { useAdminRequestLoanStore } from '~/store/admin/admin_request_loan.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

// Import Element Plus icons
import {
  Document,
  Money,
  Clock,
  CircleCheck,
  Search,
  Filter,
  View,
  Refresh,
  Check,
  Close,
} from '@element-plus/icons-vue'

const requestLoanStore = useAdminRequestLoanStore()
const { index, approve, reject } = requestLoanStore

const apiResponse = ref({})
const loading = ref(false)
const showDetailsDialog = ref(false)
const selectedLoan = ref(null)
const showApproveConfirm = ref(false)
const showRejectDialog = ref(false)
const rejectReason = ref('')

// Search and filter
const searchQuery = ref('')
const statusFilter = ref('')
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'not_eligible', label: 'Not Eligible' },
]

// Pagination controls
const currentPage = ref(1)
const pageSize = ref(10)
const phoneQuery = ref('')

const password = ref('')

const fetchData = async (page = 1) => {
  loading.value = true
  currentPage.value = page
  try {
    const params = {
      page: page,
      search: phoneQuery.value,
      status: statusFilter.value,
      active: true,
    }
    const response = await index(params)
    apiResponse.value = response
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  try {
    loading.value = true
    await approve(selectedLoan.value.id, { password: password.value })
    await fetchData(currentPage.value)
    showDetailsDialog.value = false
    showApproveConfirm.value = false
    ElNotification({
      title: 'Success',
      message: 'Loan approved successfully',
      type: 'success',
    })
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: 'Failed to approve loan',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

const handleReject = async () => {
  if (!rejectReason.value) {
    ElNotification({
      title: 'Warning',
      message: 'Please provide a rejection reason',
      type: 'warning',
    })
    return
  }

  try {
    loading.value = true
    await reject(selectedLoan.value.id, { reason: rejectReason.value, password: password.value })
    await fetchData(currentPage.value)
    showDetailsDialog.value = false
    showRejectDialog.value = false
    rejectReason.value = ''
    ElNotification({
      title: 'Success',
      message: 'Loan rejected successfully',
      type: 'success',
    })
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: 'Failed to reject loan',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

const openApproveConfirm = () => {
  showApproveConfirm.value = true
}

const openRejectDialog = () => {
  rejectReason.value = ''
  showRejectDialog.value = true
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchData()
}

const viewDetails = (loan) => {
  selectedLoan.value = loan
  showDetailsDialog.value = true
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'eligible':
      return 'warning'
    case 'rejected':
      return 'danger'
    case 'not_eligible':
      return 'danger'
    default:
      return 'info'
  }
}

//format status
const formatStatus = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'eligible':
      return 'Eligible'
    case 'rejected':
      return 'Rejected'
    case 'not_eligible':
      return 'Not Eligible'
    default:
      return status
  }
}

// Initial data fetch
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Loan Requests</h1>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl">
              <Document />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Requests</p>
            <p class="text-2xl font-bold">
              {{ apiResponse.summary?.total_requests || 0 }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-purple-50 mr-4">
            <el-icon class="text-purple-500 text-xl">
              <Money />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Amount</p>
            <p class="text-2xl font-bold">
              ${{ apiResponse.summary?.total_request_amount || '0.00' }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-green-50 mr-4">
            <el-icon class="text-green-500 text-xl">
              <CircleCheck />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Eligible</p>
            <p class="text-2xl font-bold">
              {{ apiResponse.summary?.status_counts?.eligible || 0 }}
            </p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-red-50 mr-4">
            <el-icon class="text-red-500 text-xl">
              <Clock />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Rejected</p>
            <p class="text-2xl font-bold">
              {{ apiResponse.summary?.status_counts?.rejected || 0 }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Search and Filter Section - Add this above the table -->
    <el-card shadow="never" class="mb-4">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <!-- Phone Search -->
        <el-input
          v-model="phoneQuery"
          placeholder="Search by phone number"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="handleSearch">
          <el-icon class="mr-1">
            <Search />
          </el-icon>
          Search
        </el-button>

        <!-- Status Filter -->
        <el-select
          v-model="statusFilter"
          placeholder="Filter by status"
          clearable
          @change="handleSearch"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-button @click="resetFilters">
          <el-icon class="mr-1">
            <Refresh />
          </el-icon>
          Reset
        </el-button>
      </div>
    </el-card>

    <!-- Loan Requests Table -->
    <el-card shadow="never" class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Loan Applications</h2>
        <el-button
          type="primary"
          size="small"
          @click="fetchData"
          :loading="loading"
        >
          <el-icon class="mr-1">
            <Refresh />
          </el-icon>
          Refresh
        </el-button>
      </div>

      <el-table
        :data="apiResponse.data"
        v-loading="loading"
        empty-text="No loan requests found"
        class="w-full"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="phone" label="Phone" />
        <el-table-column prop="loan_amount" label="Amount" align="right">
          <template #default="{ row }"> ${{ row.loan_amount }}</template>
        </el-table-column>
        <el-table-column
          prop="loan_duration"
          label="Duration (months)"
          align="center"
        />
        <el-table-column prop="status" label="Status">
          <template #default="{ row }">
            <el-tag :type="statusBadgeClass(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Request Date" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">
              <el-icon class="mr-1">
                <View />
              </el-icon>
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-if="apiResponse.pagination"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="apiResponse.pagination.total"
          :page-count="apiResponse.pagination.last_page"
          layout="prev, pager, next, jumper"
          @current-change="fetchData"
          background
        />
      </div>
    </el-card>

    <!-- Loan Details Dialog -->
    <el-dialog
      v-model="showDetailsDialog"
      align-center
      :title="`Loan Request Details`"
      width="800px"
    >
      <div v-if="selectedLoan" class="space-y-4">
        <!-- Basic Information Section -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="font-medium">Basic Information</div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Name</h3>
              <p class="mt-1 font-semibold">{{ selectedLoan.name }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Phone</h3>
              <p class="mt-1 font-semibold">{{ selectedLoan.phone }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Status</h3>
              <el-tag
                :type="statusBadgeClass(selectedLoan.status)"
                class="mt-1"
              >
                {{ formatStatus(selectedLoan.status) }}
              </el-tag>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Loan Amount</h3>
              <p class="mt-1">${{ selectedLoan.loan_amount }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Duration</h3>
              <p class="mt-1">{{ selectedLoan.loan_duration }} months</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Request Date</h3>
              <p class="mt-1">{{ formatDate(selectedLoan.created_at) }}</p>
            </div>
          </div>
        </el-card>

        <!-- NID and Income Information in same row -->
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Income Information -->
          <el-card shadow="never" class="flex-1">
            <template #header>
              <div class="font-medium">Income Information</div>
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">
                    Employee Type
                  </h3>
                  <p class="mt-1 capitalize">
                    {{
                      selectedLoan.income_information?.employee_type || 'N/A'
                    }}
                  </p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Position</h3>
                  <p class="mt-1">
                    {{ selectedLoan.income_information?.position || 'N/A' }}
                  </p>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">
                  Monthly Income
                </h3>
                <p class="mt-1">
                  ${{ selectedLoan.income_information?.income || '0.00' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">
                  Bank Statement
                </h3>
                <div class="mt-1">
                  <el-image
                    v-if="selectedLoan.income_information?.bank_statement"
                    :src="selectedLoan.income_information.bank_statement"
                    :preview-src-list="[
                      selectedLoan.income_information.bank_statement,
                    ]"
                    fit="contain"
                    class="w-full h-32 border rounded"
                  >
                    <template #error>
                      <div
                        class="flex items-center justify-center h-32 text-gray-400"
                      >
                        Image not available
                      </div>
                    </template>
                  </el-image>
                  <div
                    v-else
                    class="flex items-center justify-center h-32 text-gray-400"
                  >
                    Not provided
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Rejection Reason (if rejected) -->
        <el-card
          shadow="never"
          class="mt-4"
          v-if="selectedLoan.rejection_reason"
        >
          <template #header>
            <div class="font-medium">Rejection Details</div>
          </template>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Reason</h3>
            <p class="mt-1">{{ selectedLoan.rejection_reason }}</p>
          </div>
        </el-card>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div
            v-if="
              selectedLoan?.status === 'eligible' ||
              selectedLoan?.status === 'not_eligible'
            "
            class="flex gap-2"
          >
            <el-button
              type="success"
              @click="openApproveConfirm"
              :loading="loading"
            >
              <el-icon class="mr-1">
                <Check />
              </el-icon>
              Approve
            </el-button>
            <el-button
              type="danger"
              @click="openRejectDialog"
              :loading="loading"
            >
              <el-icon class="mr-1">
                <Close />
              </el-icon>
              Reject
            </el-button>
          </div>
          <div v-else></div>
          <el-button type="primary" @click="showDetailsDialog = false"
          >Close
          </el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- Approve Confirmation Dialog -->
    <el-dialog v-model="showApproveConfirm" title="Confirm Approval" width="400px" :close-on-click-modal="false">
      <el-form
          @submit.native.prevent="handleApprove"
          :require-asterisk-position="'right'"
          class="mt-4"
      >
        <el-form-item label="Password" required label-position="top">
          <el-input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              clearable
              @keyup.enter="handleApprove"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApproveConfirm = false">Cancel</el-button>
        <el-button
            type="success"
            @click="handleApprove"
            :loading="loading"
            :disabled="!password"
        >
          Confirm Approve
        </el-button>
      </template>
    </el-dialog>

    <!-- Reject Dialog with Reason -->
    <el-dialog v-model="showRejectDialog" title="Reject Loan Request" width="500px" :close-on-click-modal="false">
      <el-form
          @submit.native.prevent="handleReject"
          :require-asterisk-position="'right'"
      >
        <el-form-item label="Rejection Reason" required>
          <el-input
              v-model="rejectReason"
              type="textarea"
              :rows="4"
              placeholder="Please provide the reason for rejection"
              clearable
          />
        </el-form-item>
        <el-form-item label="Password" required label-position="top">
          <el-input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              clearable
              @keyup.enter="handleReject"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">Cancel</el-button>
        <el-button
            type="danger"
            @click="handleReject"
            :loading="loading"
            :disabled="!rejectReason || !password"
        >
          Confirm Reject
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.summary-card {
  @apply transition-all duration-200;
}

.summary-card:hover {
  @apply transform translate-y-[-2px] shadow-md;
}

.summary-card :deep(.el-card__body) {
  @apply p-4;
}

.el-pagination {
  @apply justify-end;
}

.el-pagination :deep(.btn-prev),
.el-pagination :deep(.btn-next) {
  @apply border border-gray-200 rounded-md;
}

.el-pagination :deep(.number) {
  @apply border border-gray-200 rounded-md;
}

.el-pagination :deep(.is-active) {
  @apply bg-blue-500 text-white border-blue-500;
}
</style>
