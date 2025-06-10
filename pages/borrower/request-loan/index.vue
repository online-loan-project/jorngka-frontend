<script setup>
definePageMeta({
  layout: 'borrower',
  middleware: ['authenticated'],
})

import { ref } from 'vue';
import { useRequestLoanStore } from '~/store/request_loan.js'

// Import Element Plus icons
import {
  Document,
  Money,
  Clock,
  CircleCheck,
  Plus,
  View
} from '@element-plus/icons-vue'

// Sample data matching your API response
const apiResponse = ref({});

const loading = ref(false);
const showDetailsDialog = ref(false);
const selectedLoan = ref(null);

// Pagination controls
const currentPage = ref(1);
const pageSize = ref(10);

const requestLoanStore = useRequestLoanStore()
const { getRequestLoan } = requestLoanStore

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await getRequestLoan({page: page});
    apiResponse.value = response;
    // Update pagination
    currentPage.value = page;
  } finally {
    loading.value = false;
  }
};

const viewDetails = (loan) => {
  selectedLoan.value = loan;
  showDetailsDialog.value = true;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const statusBadgeClass = (status) => {
  console.log(status);
  switch (status) {
    case 'approved':
      return 'approved';
    case 'eligible':
      return 'eligible';
    case 'rejected':
      return 'rejected';
    default: // pending
      return 'rejected';
  }
};

const formatStatus = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'eligible':
      return 'Eligible';
    case 'rejected':
      return 'Rejected';
    case 'not_eligible':
      return 'Not Eligible';
    default:
      return status;
  }
};

const navigateToCreate = () => {
  navigateTo('/borrower/request-loan/create');
};

// Initial data fetch
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Loan Requests</h1>
      <el-button type="primary" @click="navigateToCreate">
        <el-icon class="mr-2"><Plus /></el-icon>
        Request Loan
      </el-button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><Document /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Requests</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_requests }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-purple-50 mr-4">
            <el-icon class="text-purple-500 text-xl"><Money /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Amount</p>
            <p class="text-2xl font-bold">${{ apiResponse?.summary?.total_request_amount }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-yellow-50 mr-4">
            <el-icon class="text-yellow-500 text-xl"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Pending</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.status_counts?.pending }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-green-50 mr-4">
            <el-icon class="text-green-500 text-xl"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Approved</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.status_counts?.approved }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Loan Requests Table -->
    <el-card shadow="never" class="mb-8">
      <el-table
        :data="apiResponse?.data"
        v-loading="loading"
        empty-text="No loan requests found"
        class="w-full"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="Amount">
          <template #default="{ row }">
            ${{ parseFloat(row.loan_amount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="loan_type" label="Type">
          <template #default="{ row }">
            {{ row.loan_type.charAt(0).toUpperCase() + row.loan_type.slice(1) }}
          </template>
        </el-table-column>
        <el-table-column prop="loan_duration" label="Duration">
          <template #default="{ row }">
            {{ row.loan_duration }} months
          </template>
        </el-table-column>
        <el-table-column label="Status">
          <template #default="{ row }">
            <el-tag :class="statusBadgeClass(row.status)" size="small" effect="light">
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
              <el-icon class="mr-1"><View /></el-icon>
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="apiResponse?.pagination?.total"
          :page-count="apiResponse?.pagination?.last_page"
          layout="prev, pager, next, jumper"
          @current-change="fetchData"
          background
        />
      </div>
    </el-card>

    <!-- Loan Details Dialog -->
    <el-dialog v-model="showDetailsDialog" :title="`Loan Request #${selectedLoan?.id}`" width="600px">
      <div v-if="selectedLoan" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Loan Amount</h3>
            <p class="mt-1 text-lg font-semibold">${{ parseFloat(selectedLoan.loan_amount).toFixed(2) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Approved Amount</h3>
            <p class="mt-1 text-lg font-semibold">${{ parseFloat(selectedLoan.approved_amount).toFixed(2) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Loan Type</h3>
            <p class="mt-1">{{ selectedLoan.loan_type.charAt(0).toUpperCase() + selectedLoan.loan_type.slice(1) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Duration</h3>
            <p class="mt-1">{{ selectedLoan.loan_duration }} months</p>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500">Status</h3>
          <el-tag :class="statusBadgeClass(selectedLoan.status)" size="medium" effect="light" class="mt-1">
            {{ formatStatus(selectedLoan.status) }}
          </el-tag>
        </div>

        <div v-if="selectedLoan.rejection_reason">
          <h3 class="text-sm font-medium text-gray-500">Rejection Reason</h3>
          <p class="mt-1">{{ selectedLoan.rejection_reason }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Request Date</h3>
            <p class="mt-1">{{ formatDate(selectedLoan.created_at) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
            <p class="mt-1">{{ formatDate(selectedLoan.updated_at) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="showDetailsDialog = false">Close</el-button>
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

.pending {
  @apply bg-yellow-100 text-yellow-600;
}

.approved  {
  @apply bg-green-100 text-green-600;
}

.rejected {
  @apply bg-red-100 text-red-600;
}

.eligible {
  @apply bg-blue-100 text-blue-600;
}
</style>
