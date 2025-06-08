<script setup>
import {
  Wallet,
  Top,
  Bottom,
  Refresh,
  View,
  Clock,
  Upload,
  Download
} from '@element-plus/icons-vue'
import {useAdminCreditStore} from "~/store/admin/admin_credit.js";

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

const { index, deposit, withdraw } = useAdminCreditStore();

const creditData = ref({});
const amount = ref(500);
const transactionFilter = ref('all');
const isLoading = ref(false);
const isProcessingTransaction = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await index();
    creditData.value = response.data || response;
  } catch (error) {
    console.error('Error fetching data:', error);
    ElMessage.error('Failed to fetch credit data');
  } finally {
    isLoading.value = false;
  }
};

const handleTransaction = async (type) => {
  try {
    isProcessingTransaction.value = true;

    if (amount.value <= 0) {
      ElMessage.warning('Amount must be greater than zero');
      return;
    }

    const { value: password } = await ElMessageBox.prompt(
        'Please enter your password to confirm',
        'Password Confirmation',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          inputType: 'password',
          inputPattern: /\S+/,
          inputErrorMessage: 'Password is required',
        }
    ).catch(() => {
      // User cancelled the prompt
      throw 'cancelled';
    });

    const payload = {
      amount: amount.value,
      password: password
    };

    if (type === 'deposit') {
      await deposit(payload);
      ElMessage.success('Deposit successful');
    } else {
      if (amount.value > (creditData.value.credit?.balance || 0)) {
        ElMessage.error('Withdrawal amount exceeds available balance');
        return;
      }
      await withdraw(payload);
      ElMessage.success('Withdrawal successful');
    }

    await fetchData();

  } catch (error) {
    if (error !== 'cancelled' && error !== 'cancel') {
      console.error(`Error processing ${type}:`, error);
      const action = type === 'deposit' ? 'Deposit' : 'Withdrawal';
      ElMessage.error(error.response?.data?.message || `${action} failed`);
    }
  } finally {
    isProcessingTransaction.value = false;
  }
};

const depositCredit = () => handleTransaction('deposit');
const withdrawCredit = () => handleTransaction('withdraw');

const filteredTransactions = computed(() => {
  if (!creditData.value.transactions) return [];
  if (transactionFilter.value === 'all') return creditData.value.transactions;
  return creditData.value.transactions.filter(t => t.type === transactionFilter.value);
});

const availableBalance = computed(() => {
  return creditData.value.credit?.balance || 0;
});

const showTransactionDetails = (transaction) => {
  ElMessageBox.alert(
      `<div class="transaction-details">
      <p><strong>Transaction ID:</strong> ${transaction.transaction_code}</p>
      <p><strong>Type:</strong> ${transaction.type_label}</p>
      <p><strong>Amount:</strong> ${transaction.formatted_amount} ${creditData.value.credit?.currency || 'USD'}</p>
      <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>
      <p><strong>Description:</strong> ${transaction.description || 'N/A'}</p>
      ${transaction.metadata ? `<pre class="mt-4 text-xs">${JSON.stringify(transaction.metadata, null, 2)}</pre>` : ''}
    </div>`,
      'Transaction Details',
      {
        dangerouslyUseHTMLString: true,
        customClass: 'transaction-details-modal'
      }
  )
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 md:text-3xl">Credit Management</h1>
        <p class="text-gray-500 dark:text-gray-400">Manage account balance and transactions</p>
      </div>
      <div class="w-full md:w-48">
        <el-select
            v-model="transactionFilter"
            placeholder="Filter transactions"
            class="w-full"
            clearable
        >
          <el-option label="All Transactions" value="all"/>
          <el-option label="Deposits" value="admin_deposit"/>
          <el-option label="Withdrawals" value="admin_withdrawal"/>
        </el-select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mb-8 grid gap-6 md:grid-cols-3">
      <!-- Balance Card -->
      <el-card shadow="hover"
               class="border-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
        <div class="flex h-full flex-col">
          <div class="flex items-center text-blue-600 dark:text-blue-200">
            <el-icon class="mr-2">
              <Wallet/>
            </el-icon>
            <span class="font-medium">Current Balance</span>
          </div>
          <div class="my-4 flex items-baseline">
            <span class="text-3xl font-bold text-gray-800 dark:text-white">{{
                creditData.credit?.balance || '0.00'
              }}</span>
            <span class="ml-2 text-gray-500 dark:text-gray-300">{{ creditData.credit?.currency || 'USD' }}</span>
          </div>
          <div class="mt-auto flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              <el-icon class="mr-1"><Clock/></el-icon>
              {{ creditData.credit?.last_transaction_at || 'No transactions' }}
            </span>
            <el-tag
                :type="creditData.credit?.is_active ? 'success' : 'danger'"
                effect="dark"
                size="small"
                round
            >
              {{ creditData.credit?.is_active ? 'Active' : 'Inactive' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- Deposit Card -->
      <el-card shadow="hover"
               class="border-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50">
        <div class="flex h-full flex-col">
          <div class="flex items-center text-green-600 dark:text-green-200">
            <el-icon class="mr-2">
              <Top/>
            </el-icon>
            <span class="font-medium">Deposit Funds</span>
          </div>
          <div class="my-4">
            <el-input-number
                v-model="amount"
                :min="0"
                :max="100000"
                :precision="2"
                controls-position="right"
                class="w-full"
                size="large"
            />
          </div>
          <el-button
              type="success"
              size="large"
              class="w-full"
              @click="depositCredit"
              :loading="isProcessingTransaction"
              :disabled="isProcessingTransaction"
          >
            <el-icon class="mr-1">
              <Upload/>
            </el-icon>
            Deposit
          </el-button>
        </div>
      </el-card>

      <!-- Withdraw Card -->
      <el-card shadow="hover"
               class="border-0 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50">
        <div class="flex h-full flex-col">
          <div class="flex items-center text-purple-600 dark:text-purple-200">
            <el-icon class="mr-2">
              <Bottom/>
            </el-icon>
            <span class="font-medium">Withdraw Funds</span>
          </div>
          <div class="my-4">
            <el-input-number
                v-model="amount"
                :min="0"
                :max="availableBalance"
                :precision="2"
                controls-position="right"
                class="w-full"
                size="large"
            />
          </div>
          <el-button
              type="warning"
              size="large"
              class="w-full"
              @click="withdrawCredit"
              :loading="isProcessingTransaction"
              :disabled="isProcessingTransaction || availableBalance <= 0"
          >
            <el-icon class="mr-1">
              <Download/>
            </el-icon>
            Withdraw
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Transactions Table -->
    <el-card shadow="never" class="border border-gray-200 dark:border-gray-700">
      <template #header>
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Transaction History</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Showing {{ filteredTransactions.length }} of {{ creditData.meta?.total || 0 }} transactions
            </p>
          </div>
          <el-button
              type="info"
              plain
              @click="fetchData"
              :loading="isLoading"
          >
            <el-icon class="mr-1">
              <Refresh/>
            </el-icon>
            Refresh
          </el-button>
        </div>
      </template>

      <el-table
          :data="filteredTransactions"
          v-loading="isLoading"
          stripe
          style="width: 100%"
          empty-text="No transactions found"
          class="custom-table"
      >
        <el-table-column prop="transaction_code" label="Transaction ID" width="220">
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.transaction_code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Date" width="180">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-gray-800">{{ new Date(row.created_at).toLocaleDateString() }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  new Date(row.created_at).toLocaleTimeString()
                }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type_label" label="Type" width="150">
          <template #default="{ row }">
            <el-tag
                :type="row.type === 'admin_deposit' ? 'success' : 'danger'"
                effect="light"
                size="small"
                class="font-medium"
            >
              {{ row.type_label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="formatted_amount" label="Amount" width="150" align="right">
          <template #default="{ row }">
            <span :class="{
              'text-green-600 dark:text-green-400': row.type === 'admin_deposit',
              'text-red-600 dark:text-red-400': row.type === 'admin_withdrawal'
            }" class="font-medium">
              {{ row.formatted_amount }} {{ creditData.credit?.currency || 'USD' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance_after" label="Balance" width="150" align="right">
          <template #default="{ row }">
            <span class="font-medium text-gray-800">
              {{ row.balance_after }} {{ creditData.credit?.currency || 'USD' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="200">
          <template #default="{ row }">
            <p class="line-clamp-2 text-gray-600">
              {{ row.description || 'No description provided' }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="80" align="center">
          <template #default="{ row }">
            <el-tooltip content="View details" placement="top">
              <el-button
                  size="small"
                  type="info"
                  plain
                  circle
                  @click="showTransactionDetails(row)"
              >
                <el-icon>
                  <View/>
                </el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-6 flex justify-center" v-if="creditData.meta?.last_page > 1">
        <el-pagination
            v-model:current-page="creditData.meta.current_page"
            :page-size="creditData.meta.per_page"
            :total="creditData.meta.total"
            layout="prev, pager, next, jumper"
            @current-change="fetchData"
            class="pagination"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.transaction-details-modal {
  max-width: 600px;
}
</style>