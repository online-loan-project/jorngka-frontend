<script setup>
import { ref, onMounted } from 'vue'
import { View, Delete, Search, User, Check, Close } from '@element-plus/icons-vue'
import { useAdminUserManagementStore } from '~/store/admin/admin_user_management.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

const borrowerStore = useAdminUserManagementStore()
const { index, staus } = borrowerStore

// State
const borrowers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')

const detailModalVisible = ref(false)
const selectedBorrower = ref(null)

// Open modal with borrower details
const showBorrowerDetails = (borrower) => {
  selectedBorrower.value = borrower
  detailModalVisible.value = true
}

// Status counts from API
const statusCounts = ref({
  active: 0,
  inactive: 0,
  total: 0
})

const computedStatusCounts = computed(() => {
  if (borrowers.value.length === 0) {
    return {
      active: 0,
      inactive: 0,
      total: 0
    }
  }

  const active = borrowers.value.filter(b => b.user?.status === '1').length
  const inactive = borrowers.value.filter(b => !b.user || b.user?.status !== '1').length

  return {
    active,
    inactive,
    total: active + inactive
  }
})

// Fetch borrowers with pagination and filters
const fetchBorrowers = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: itemsPerPage.value,
      search: searchQuery.value,
    }

    const response = await index(params)
    borrowers.value = response.borrowers.data
    currentPage.value = response.borrowers.current_page
    totalPages.value = response.borrowers.last_page
    itemsPerPage.value = response.borrowers.per_page
    statusCounts.value = {
      active: response.active_count || 0,
      inactive: response.inactive_count || 0,
      total: response.total_count || 0
    }
  } catch (error) {
    console.error('Failed to fetch borrowers:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to fetch borrowers',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

const confirmStatusChange = (borrower) => {
  const isActive = borrower.user?.status === '1'
  const action = isActive ? 'Deactivate' : 'Activate'

  ElMessageBox.confirm(
    `Are you sure you want to ${action.toLowerCase()} this account?`,
    `${action} Account`,
    {
      confirmButtonText: action,
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    await updateStatus(borrower.id, isActive ? '0' : '1')
  }).catch(() => {
    // Cancel action
  })
}

//update staus
const updateStatus = async (borrowerId, status) => {
  try {
    await staus(borrowerId, { status: status })
    ElNotification({
      title: 'Success',
      message: 'Status updated successfully',
      type: 'success',
    })
    // Refresh the data including counts
    await fetchBorrowers(currentPage.value)
  } catch (error) {
    console.error('Failed to update status:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to update status',
      type: 'error',
    })
  }
}

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page
  fetchBorrowers(page)
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchBorrowers()
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

// Get status text and type
const getUserStatus = (user) => {
  if (!user) return { text: 'Inactive', type: 'warning' }
  return user.status === '1'
    ? { text: 'Active', type: 'success' }
    : { text: 'Inactive', type: 'warning' }
}

// Get full name
const getFullName = (borrower) => {
  return `${borrower.first_name} ${borrower.last_name}`
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

// Initial data fetch
onMounted(() => {
  fetchBorrowers()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Borrower Management</h1>

      <div class="flex space-x-4 w-[250px]">
        <el-input
          v-model="searchQuery"
          placeholder="Search Borrower Phone..."
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
    </div>

    <!-- Status Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><Check /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Active Borrowers</p>
            <p class="text-2xl font-bold">{{ statusCounts.active || computedStatusCounts.active }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><Close /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Inactive Borrowers</p>
            <p class="text-2xl font-bold">{{ statusCounts.inactive || computedStatusCounts.inactive }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><User /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Borrowers</p>
            <p class="text-2xl font-bold">{{ statusCounts.total || computedStatusCounts.total }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="never" class="mb-6">
      <el-table :data="borrowers" v-loading="loading" empty-text="No borrowers found">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="Name" width="180">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-avatar :src="row.image" class="mr-3" size="small">
                {{ row.first_name.charAt(0) }}{{ row.last_name.charAt(0) }}
              </el-avatar>
              <span>{{ getFullName(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="User Info">
          <template #default="{ row }">
            <div v-if="row.user">
              <div class="font-medium">{{ row.user.email }}</div>
              <div class="text-sm text-gray-500">{{ row.user.phone }}</div>
            </div>
            <span v-else class="text-gray-400">No user account</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getUserStatus(row.user).type" size="small">
              {{ getUserStatus(row.user).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Details">
          <template #default="{ row }">
            <div class="text-sm">
              <div>DOB: {{ formatDate(row.dob) }}</div>
              <div class="capitalize">{{ row.gender }}</div>
              <div class="text-gray-500 truncate max-w-xs">{{ row.address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Joined" width="120">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="right">
          <template #default="{ row }">
            <el-button
              size="small"
              :icon="View"
              circle
              @click="showBorrowerDetails(row)"
            />
            <el-button
              size="small"
              :icon="row.user?.status === '1' ? Close : Check"
              :type="row.user?.status === '1' ? 'danger' : 'success'"
              circle
              @click="confirmStatusChange(row)"
              :title="row.user?.status === '1' ? 'Deactivate account' : 'Activate account'"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="itemsPerPage"
          :total="borrowers.total || 0"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="detailModalVisible"
      title="Borrower Details"
      width="70%"
      :close-on-click-modal="false"
    >
      <div v-if="selectedBorrower" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left Column - Profile Info -->
        <div class="col-span-1">
          <div class="flex flex-col items-center">
            <el-avatar :src="selectedBorrower.image" :size="120" class="mb-4">
              {{ selectedBorrower.first_name?.charAt(0) }}{{ selectedBorrower.last_name?.charAt(0) }}
            </el-avatar>
            <h3 class="text-xl font-semibold">{{ getFullName(selectedBorrower) }}</h3>
            <el-tag :type="getUserStatus(selectedBorrower.user).type" class="mt-2">
              {{ getUserStatus(selectedBorrower.user).text }}
            </el-tag>
          </div>

          <div class="mt-6">
            <el-divider content-position="left">Basic Information</el-divider>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">Gender:</span>
                <span class="capitalize">{{ selectedBorrower.gender || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Date of Birth:</span>
                <span>{{ formatDate(selectedBorrower.dob) || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Member Since:</span>
                <span>{{ formatDate(selectedBorrower.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Column - Contact Info -->
        <div class="col-span-1">
          <el-divider content-position="left">Contact Information</el-divider>
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-500">Address</h4>
              <p class="mt-1">{{ selectedBorrower.address || 'Not provided' }}</p>
            </div>

            <div v-if="selectedBorrower.user">
              <h4 class="text-sm font-medium text-gray-500">Email</h4>
              <p class="mt-1">{{ selectedBorrower.user.email }}</p>

              <h4 class="text-sm font-medium text-gray-500 mt-3">Phone</h4>
              <div class="flex items-center mt-1">
                <p>0{{ selectedBorrower.user.phone }}</p>
                <el-tag v-if="selectedBorrower.user.phone_verified_at" type="success" size="small" class="ml-2">Verified</el-tag>
                <el-tag v-else type="warning" size="small" class="ml-2">Unverified</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Account Info -->
        <div class="col-span-1">
          <el-divider content-position="left">Account Information</el-divider>
          <div class="space-y-4" v-if="selectedBorrower.user">
            <div>
              <h4 class="text-sm font-medium text-gray-500">User ID</h4>
              <p class="mt-1">{{ selectedBorrower.user.id }}</p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500">Account Status</h4>
              <div class="mt-1">
                <el-tag :type="getUserStatus(selectedBorrower.user).type">
                  {{ getUserStatus(selectedBorrower.user).text }}
                </el-tag>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500">Phone Verified</h4>
              <p class="mt-1">
                {{ selectedBorrower.user.phone_verified_at ? formatDateTime(selectedBorrower.user.phone_verified_at) : 'Not verified' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailModalVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.input-search {
  width: 300px;
}
</style>