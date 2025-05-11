<script setup>
import { useCreditScoreStore } from '~/store/credit_score.js'

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
  View,
  Edit,
  Refresh
} from '@element-plus/icons-vue'

// Sample data matching your API response
const apiResponse = ref({});

const loading = ref(false);
const showDetailsDialog = ref(false);
const showEditDialog = ref(false);
const showResetConfirmDialog = ref(false);
const selectedLoan = ref(null);
const editForm = ref({
  score: 0,
  status: ''
});

// Pagination controls
const currentPage = ref(1);
const pageSize = ref(10);

const creditScoreStore = useCreditScoreStore()
const { index, reset, update } = creditScoreStore

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await index({page: page});
    apiResponse.value = response;
    // Update pagination
    currentPage.value = page;
  } finally {
    loading.value = false;
  }
};

const resetCredit = async () => {
  loading.value = true;
  try {
    await reset(selectedLoan.value.user_id);
    fetchData();
    showDetailsDialog.value = false;
    showResetConfirmDialog.value = false;
  } finally {
    loading.value = false;
  }
};

const openResetConfirmDialog = () => {
  showResetConfirmDialog.value = true;
};

const openEditDialog = (loan) => {
  selectedLoan.value = loan;
  editForm.value = {
    score: loan.score,
    status: loan.status
  };
  showEditDialog.value = true;
};

const updateCredit = async () => {
  loading.value = true;
  try {
    const data = {
      score: editForm.value.score,
      status: editForm.value.status,
    };
    await update(selectedLoan.value.user_id, data);
    showEditDialog.value = false;
    fetchData();
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
  return status ? 'approved' : 'rejected';
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
      <h1 class="text-2xl font-bold text-gray-800">Credit Scores</h1>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-blue-50 mr-4">
            <el-icon class="text-blue-500 text-xl"><Document /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Users</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_user }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-purple-50 mr-4">
            <el-icon class="text-purple-500 text-xl"><Money /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Min Credit Score</p>
            <p class="text-2xl font-bold">0</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-yellow-50 mr-4">
            <el-icon class="text-yellow-500 text-xl"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Max Credit Score</p>
            <p class="text-2xl font-bold">100</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center">
          <div class="flex p-3 rounded-full bg-green-50 mr-4">
            <el-icon class="text-green-500 text-xl"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total New User</p>
            <p class="text-2xl font-bold">{{ apiResponse?.summary?.total_new_user }}</p>
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
        <el-table-column prop="user_id" label="User ID" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="phone" label="Phone" />
        <el-table-column prop="score" label="Credit Score" />
        <el-table-column prop="status" label="Status">
          <template #default="{ row }">
            <el-tag :type="statusBadgeClass(row.status)">{{ row.status ? 'Active' : 'Inactive' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_update" label="Last Update" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_update) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">
              <el-icon class="mr-1"><View /></el-icon>
              Details
            </el-button>
            <el-button size="small" type="primary" @click="openEditDialog(row)">
              <el-icon class="mr-1"><Edit /></el-icon>
              Edit
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
    <el-dialog v-model="showDetailsDialog" :title="`Credit Score Details`" width="600px">
      <div v-if="selectedLoan" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Name</h3>
            <p class="mt-1 text-lg font-semibold">{{ selectedLoan.name }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Credit Score</h3>
            <p class="mt-1 text-lg font-semibold">{{ selectedLoan.score }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Phone</h3>
            <p class="mt-1">{{ selectedLoan.phone }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">User ID</h3>
            <p class="mt-1">{{ selectedLoan.user_id }} </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Status</h3>
            <el-tag :type="statusBadgeClass(selectedLoan.status)">{{ selectedLoan.status ? 'Active' : 'Inactive' }}</el-tag>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Last Update Date</h3>
            <p class="mt-1">{{ formatDate(selectedLoan.last_update) }}</p>
          </div>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
          <el-button @click="openEditDialog(selectedLoan)">
            <el-icon class="mr-1"><Edit /></el-icon>
            Edit
          </el-button>
          <el-button type="danger" @click="openResetConfirmDialog">
            <el-icon class="mr-1"><Refresh /></el-icon>
            Reset Score
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="showDetailsDialog = false">Close</el-button>
      </template>
    </el-dialog>

    <!-- Edit Credit Score Dialog -->
    <el-dialog v-model="showEditDialog" title="Edit Credit Score" width="500px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="Credit Score">
          <el-input-number v-model="editForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="editForm.status" placeholder="Select status" class="w-full">
            <el-option label="Active" :value="1" />
            <el-option label="Inactive" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">Cancel</el-button>
        <el-button type="primary" @click="updateCredit" :loading="loading">
          Update
        </el-button>
      </template>
    </el-dialog>

    <!-- Reset Confirmation Dialog -->
    <el-dialog
      v-model="showResetConfirmDialog"
      title="Confirm Reset"
      width="400px"
      :close-on-click-modal="false"
    >
      <span>Are you sure you want to reset this user's credit score?</span>
      <template #footer>
        <el-button @click="showResetConfirmDialog = false">Cancel</el-button>
        <el-button type="danger" @click="resetCredit" :loading="loading">
          Confirm Reset
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

.approved {
  @apply bg-green-100 text-green-600;
}

.rejected {
  @apply bg-red-100 text-red-600;
}
</style>