<script setup>
import { useAdminLoanStore } from '~/store/admin/admin_loan.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

import { ref } from 'vue';

// Import Element Plus icons
import {
  Document,
  Money,
  Clock,
  CircleCheck,
  Plus,
  View
} from '@element-plus/icons-vue'

const apiResponse = ref({
  data: [],
  schedule_repayment: [],
  pagination: {},
  summary: {}
});

const loading = ref(false);
const showDetailsDialog = ref(false);
const selectedLoan = ref(null);

// Pagination controls
const currentPage = ref(1);
const pageSize = ref(10);

const loanStore = useAdminLoanStore()
const { getLoan } = loanStore

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await getLoan({page: page, active: 'paid'});
    apiResponse.value = response; // Access the nested data property
    // Update pagination
    currentPage.value = page;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const getStatusText = (statusCode) => {
  const statusMap = {
    '0': 'UNPAID',
    '1': 'PAID',
  };
  return statusMap[statusCode] || statusCode;
};

const getStatusType = (statusCode) => {
  const typeMap = {
    '0': 'warning', // Pending
    '1': 'success', // Approved
  };
  return typeMap[statusCode] || '';
};

const getRepaymentStatusText = (statusCode) => {
  const statusMap = {
    '0': 'Pending',
    '1': 'Paid',
    '2': 'Late',
  };
  return statusMap[statusCode] || statusCode;
};

const getRepaymentStatusType = (statusCode) => {
  const typeMap = {
    '0': 'info',    // Pending
    '1': 'success', // Paid
    '2': 'warning', // Late
    '3': 'danger'   // Overdue
  };
  return typeMap[statusCode] || '';
};

const formatSimpleDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const viewDetails = (loan) => {
  selectedLoan.value = {
    ...loan,
  };
  showDetailsDialog.value = true;
};

// Initial data fetch
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Active Loans</h1>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><Document /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Loans</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_loan || 0 }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-purple-50 mr-4">
            <el-icon class="text-purple-500 text-xl"><Money /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Repayments Amount</p>
            <p class="text-2xl font-bold">${{ (apiResponse?.summary?.total_repayment_amount || 0).toFixed(2) }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-yellow-50 mr-4">
            <el-icon class="text-yellow-500 text-xl"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Repayments Count</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_repayment_count || 0 }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-red-50 mr-4">
            <el-icon class="text-red-500 text-xl"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Late Repayments</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_late_repayment_count || 0 }}</p>
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
        <el-table-column label="Name">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column label="Phone">
          <template #default="{ row }">
            {{ row.phone }}
          </template>
        </el-table-column>
        <el-table-column label="Amount">
          <template #default="{ row }">
            ${{ parseFloat(row.loan_repayment).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="Interest">
          <template #default="{ row }">
            ${{ parseFloat(row.revenue).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="loan_duration" label="Duration">
          <template #default="{ row }">
            {{ row.loan_duration }} months
          </template>
        </el-table-column>
        <el-table-column label="Status">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="light">
              {{ getStatusText(row.status) }}
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
    <el-dialog v-model="showDetailsDialog" :title="`Loan #${selectedLoan?.id}`" width="800px">
      <div v-if="selectedLoan" class="space-y-6">
        <!-- Loan Information Section -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Loan Repayment</h3>
            <p class="mt-1 text-lg font-semibold">${{ parseFloat(selectedLoan.loan_repayment).toFixed(2) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Interest</h3>
            <p class="mt-1 text-lg font-semibold">${{ parseFloat(selectedLoan.revenue).toFixed(2) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Duration</h3>
            <p class="mt-1">{{ selectedLoan.loan_duration }} months</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Status</h3>
            <el-tag :type="getStatusType(selectedLoan.status)" size="medium" effect="light" class="mt-1">
              {{ getStatusText(selectedLoan.status) }}
            </el-tag>
          </div>
        </div>

        <!-- Repayment Schedule Section -->
        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-4">Repayment Schedule</h3>
          <el-table :data="selectedLoan.schedule_repayments" border class="w-full">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="Due Date" width="150">
              <template #default="{ row }">
                {{ formatSimpleDate(row.repayment_date) }}
              </template>
            </el-table-column>
            <el-table-column label="Amount">
              <template #default="{ row }">
                ${{ parseFloat(row.emi_amount).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="getRepaymentStatusType(row.status)" size="small" effect="light">
                  {{ getRepaymentStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Paid Date" width="150">
              <template #default="{ row }">
                {{ row.paid_date ? formatSimpleDate(row.paid_date) : 'Not paid' }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- User Information Section -->
        <div v-if="selectedLoan.user">
          <h3 class="text-lg font-medium text-gray-800 mb-4">User Information</h3>
          <div class="bg-gray-50 p-4 rounded-md">
            <p><span class="font-medium">Email:</span> {{ selectedLoan.user.email }}</p>
            <p><span class="font-medium">Phone:</span> {{ selectedLoan.user.phone }}</p>
            <p><span class="font-medium">Verified:</span> {{ selectedLoan.user.phone_verified_at ? 'Yes' : 'No' }}</p>
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
</style>