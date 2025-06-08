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
  Refresh, ArrowRight
} from '@element-plus/icons-vue'

// Sample data matching your API response
const apiResponse = ref({});

const password = ref('');
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
const searchQuery = ref('')

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page: page };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    const response = await index(params);
    apiResponse.value = response;
    currentPage.value = page;
  } finally {
    loading.value = false;
  }
};

const resetCredit = async () => {
  if (!password.value) {
    ElMessage.error('Please enter your password to confirm');
    return;
  }

  loading.value = true;
  try {
    await reset(selectedLoan.value.user_id, { password: password.value });
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
  if (!password.value) {
    ElMessage.error('Please enter your password to confirm');
    return;
  }

  loading.value = true;
  try {
    const data = {
      score: editForm.value.score,
      status: editForm.value.status,
      password: password.value
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
  const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const statusBadgeClass = (status) => {
  return status === 'approved' ? 'success' : 'danger';
};

const navigateToCreate = () => {
  navigateTo('/borrower/request-loan/create');
};

// Add watchers to clear password when dialogs close
watch(showEditDialog, (newVal) => {
  if (!newVal) password.value = '';
});

watch(showResetConfirmDialog, (newVal) => {
  if (!newVal) password.value = '';
});

// Initial data fetch
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Credit Score Management</h1>
      <div class="flex gap-2">
        <el-input
            v-model="searchQuery"
            placeholder="Search by User ID"
            clearable
            style="width: 300px"
            @clear="fetchData"
            @keyup.enter="fetchData"
        />
        <el-button type="primary" :icon="Refresh" @click="fetchData">Refresh</el-button>
      </div>
    </div>

    <el-card shadow="never" class="mb-6">
      <el-table :data="apiResponse.data" v-loading="loading" style="width: 100%">
        <el-table-column prop="user_id" label="User ID" width="120" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="score" label="Score" width="120">
          <template #default="{row}">
            <el-tag :type="row.score >= 700 ? 'success' : row.score >= 600 ? 'warning' : 'danger'">
              {{ row.score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{row}">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? 'Approved' : 'Rejected' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_update" label="Last Updated" width="180">
          <template #default="{row}">
            {{ formatDate(row.last_update) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{row}">
            <el-button size="small" :icon="View" @click="viewDetails(row)">View</el-button>
            <el-button size="small" :icon="Edit" type="primary" @click="openEditDialog(row)">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Showing {{ apiResponse.from }} to {{ apiResponse.to }} of {{ apiResponse.total }} entries
        </div>
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="apiResponse.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="prev, pager, next, sizes"
            @current-change="fetchData"
            @size-change="fetchData"
        />
      </div>
    </el-card>

    <!-- View Details Dialog -->
    <el-dialog v-model="showDetailsDialog" title="Credit Score Details" width="50%">
      <div v-if="selectedLoan" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium text-gray-500">User ID</h3>
            <p>{{ selectedLoan.user_id }}</p>
          </div>
          <div>
            <h3 class="font-medium text-gray-500">Name</h3>
            <p>{{ selectedLoan.name }}</p>
          </div>
          <div>
            <h3 class="font-medium text-gray-500">Score</h3>
            <p>
              <el-tag :type="selectedLoan.score >= 700 ? 'success' : selectedLoan.score >= 600 ? 'warning' : 'danger'">
                {{ selectedLoan.score }}
              </el-tag>
            </p>
          </div>
          <div>
            <h3 class="font-medium text-gray-500">Status</h3>
            <p>
              <el-tag :type="selectedLoan.status ? 'success' : 'danger'">
                {{ selectedLoan.status ? 'Approved' : 'Rejected' }}
              </el-tag>
            </p>
          </div>
          <div>
            <h3 class="font-medium text-gray-500">Last Updated</h3>
            <p>{{ formatDate(selectedLoan.last_update) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailsDialog = false">Close</el-button>
        <el-button type="danger" @click="openResetConfirmDialog">Reset Score</el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog v-model="showEditDialog" title="Edit Credit Score" width="50%">
      <el-form :model="editForm" label-width="120px" :require-asterisk-position="'right'">
        <el-form-item label="Score">
          <el-input-number v-model="editForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="editForm.status" placeholder="Select status">
            <el-option :value="1" label="Approved" />
            <el-option :value="0" label="Rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="Password" required>
          <el-input v-model="password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">Cancel</el-button>
        <el-button type="primary" @click="updateCredit">Save</el-button>
      </template>
    </el-dialog>

    <!-- Reset Confirmation Dialog -->
    <el-dialog v-model="showResetConfirmDialog" title="Confirm Reset" width="50%">
      <p>Are you sure you want to reset this user's credit score? This action cannot be undone.</p>
      <el-form-item label="Password" class="mt-4" required>
        <el-input v-model="password" type="password" show-password />
      </el-form-item>
      <template #footer>
        <el-button @click="showResetConfirmDialog = false">Cancel</el-button>
        <el-button type="danger" @click="resetCredit">Confirm Reset</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Rotate transition */
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s ease;
}
.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  transform: rotate(-90deg);
}

/* Custom scrollbar */
nav::-webkit-scrollbar {
  width: 6px;
}
nav::-webkit-scrollbar-track {
  background: rgba(238, 242, 255, 0.5);
  border-radius: 10px;
}
nav::-webkit-scrollbar-thumb {
  background: rgba(165, 180, 252, 0.6);
  border-radius: 10px;
}
nav::-webkit-scrollbar-thumb:hover {
  background: rgba(129, 140, 248, 0.8);
}

/* Glow effect for active items */
.bg-indigo-100 {
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.2);
}
</style>
