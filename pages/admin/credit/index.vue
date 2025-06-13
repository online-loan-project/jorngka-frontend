<script setup>
import {
  Wallet,
  Top,
  Bottom,
  Refresh,
  View,
  Clock,
  Upload,
  Download,
  User,
  Phone,
  Money,
  Document,
} from '@element-plus/icons-vue'
import { useAdminCreditStore } from '~/store/admin/admin_credit.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

const { index, deposit, withdraw } = useAdminCreditStore()

const creditData = ref({})
const amountDeposit = ref(0)
const amountWithdraw = ref(0)
const transactionFilter = ref('all')
const isLoading = ref(false)
const isProcessingTransaction = ref(false)
const passwordDialogRef = ref()
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await index({page: currentPage.value})
    creditData.value = response.data || response

    // If your API returns pagination data differently, adjust accordingly
    if (response.meta) {
      creditData.value.meta = response.meta
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    ElMessage.error('Failed to fetch credit data')
  } finally {
    isLoading.value = false
  }
}

const handleTransaction = async (type) => {
  try {
    isProcessingTransaction.value = true

    // Validate amount
    const amount =
      type === 'deposit' ? amountDeposit.value : amountWithdraw.value
    if (amount <= 0) {
      ElMessage.warning(`Amount must be greater than zero`)
      return
    }

    if (type === 'withdraw' && amount > availableBalance.value) {
      ElMessage.error('Withdrawal amount exceeds available balance')
      return
    }

    // Create a promise to handle the dialog result
    const result = await passwordDialogRef.value?.open()

    const payload = {
      amount,
      password: result.password,
      ...(result.description && { description: result.description }),
    }

    if (type === 'deposit') {
      await deposit(payload)
      ElMessage.success('Deposit successful')
    } else {
      await withdraw(payload)
      ElMessage.success('Withdrawal successful')
    }

    await fetchData()
  } catch (error) {
    if (error !== 'cancelled') {
      console.error(`Error processing ${type}:`, error)
      const action = type === 'deposit' ? 'Deposit' : 'Withdrawal'
      ElMessage.error(error.response?.data?.message || `${action} failed`)
    }
  } finally {
    isProcessingTransaction.value = false
  }
}
const depositCredit = () => handleTransaction('deposit')
const withdrawCredit = () => handleTransaction('withdraw')

const filteredTransactions = computed(() => {
  if (!creditData.value.transactions) return []
  if (transactionFilter.value === 'all') return creditData.value.transactions
  return creditData.value.transactions.filter(
    (t) => t.type === transactionFilter.value,
  )
})

const availableBalance = computed(() => {
  return creditData.value.credit?.balance || 0
})

const showTransactionDetails = (transaction) => {
  ElMessageBox.alert(
    `<div class="transaction-details">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold">${transaction.type_label}</h3>
          <p class="text-sm text-gray-500">${transaction.transaction_code}</p>
        </div>
        <span class="text-xl font-bold ${
          transaction.type === 'admin_deposit'
            ? 'text-green-600'
            : 'text-red-600'
        }">
          ${transaction.formatted_amount} ${creditData.value.credit?.currency || 'USD'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-gray-700">Transaction Info</h4>
          <div class="mt-2 space-y-2">
            <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>
            <p><strong>Balance Before:</strong> ${transaction.balance_before || '0.00'} ${creditData.value.credit?.currency || 'USD'}</p>
            <p><strong>Balance After:</strong> ${transaction.balance_after} ${creditData.value.credit?.currency || 'USD'}</p>
          </div>
        </div>

        <div>
          <h4 class="font-semibold text-gray-700">User Info</h4>
          <div class="mt-2 space-y-2">
            ${
              transaction.user
                ? `
              <p><i class="el-icon-user"></i> ID: ${transaction.user.id}</p>
              <p><i class="el-icon-document"></i> Email: ${transaction.user.email || 'N/A'}</p>
              <p><i class="el-icon-phone"></i> Phone: ${transaction.user.phone || 'N/A'}</p>
            `
                : '<p>No user information</p>'
            }
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold text-gray-700">Description</h4>
        <p class="mt-1">${transaction.description || 'No description provided'}</p>
      </div>

      ${
        transaction.metadata
          ? `
        <div class="mt-4">
          <h4 class="font-semibold text-gray-700">Metadata</h4>
          <pre class="mt-2 rounded bg-gray-100 p-2 text-xs overflow-auto">${JSON.stringify(transaction.metadata, null, 2)}</pre>
        </div>
      `
          : ''
      }
    </div>`,
    'Transaction Details',
    {
      dangerouslyUseHTMLString: true,
      customClass: 'transaction-details-modal',
      customStyle: { maxWidth: '700px' },
    },
  )
}

const FundTypeStatus = (type) => {
  switch (type) {
    case 'admin_deposit':
      return { label: 'Admin Deposit', color: 'success', class: 'text-green-600' }
    case 'admin_withdrawal':
      return { label: 'Admin Withdrawal', color: 'danger', class: 'text-red-600'}
    case 'loan_disbursement':
      return { label: 'User Disbursement', color: 'danger', class: 'text-red-600' }
    case 'loan_repayment':
      return { label: 'User Repayment', color: 'success', class: 'text-green-600' }
    default:
      return { label: type, color: 'default' }
  }
}

// Add this computed property for pagination info
const paginationInfo = computed(() => {
  return {
    currentPage: creditData.value.meta?.current_page || 1,
    total: creditData.value.meta?.total || 0,
    pageSize: creditData.value.meta?.per_page || 10,
    lastPage: creditData.value.meta?.last_page || 1
  }
})

// Handle page change
const handlePageChange = (newPage) => {
  currentPage.value = newPage
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PasswordConfirmationDialog ref="passwordDialogRef" />
    <!-- Header -->
    <div
      class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-800 md:text-3xl">
          Credit Management
        </h1>
        <p class="text-gray-500">Manage account balance and transactions</p>
      </div>
      <div class="w-full md:w-48">
        <el-select
          v-model="transactionFilter"
          placeholder="Filter transactions"
          class="w-full"
          clearable
        >
          <el-option label="All Transactions" value="all" />
          <el-option label="Admin Deposits" value="admin_deposit" />
          <el-option label="Admin Withdrawals" value="admin_withdrawal" />
          <el-option label="User Disbursements" value="loan_disbursement" />
          <el-option label="User Repayment" value="loan_repayment" />
        </el-select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mb-8 grid gap-6 md:grid-cols-3">
      <!-- Balance Card -->
      <el-card
        shadow="hover"
        class="border-0 bg-gradient-to-r from-blue-50 to-blue-100"
      >
        <div class="flex h-full flex-col justify-between">
          <!-- Header: Balance Title & Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-blue-600">
              <el-icon class="mr-2">
                <Wallet />
              </el-icon>
              <span class="font-medium">Current Balance</span>
            </div>
            <el-tag
              :type="creditData.credit?.is_active ? 'success' : 'danger'"
              effect="dark"
              size="small"
              round
            >
              {{ creditData.credit?.is_active ? 'Active' : 'Inactive' }}
            </el-tag>
          </div>

          <!-- Main Balance Display -->
          <div class="my-6">
            <div class="flex items-baseline">
              <span class="text-3xl font-bold text-gray-800">
                {{ creditData.credit?.formatted_balance || '0.00' }}
              </span>
              <span class="ml-2 text-gray-500">
                {{ creditData.credit?.currency || 'USD' }}
              </span>
            </div>
          </div>

          <!-- Transaction Stats -->
          <div class="grid grid-cols-3 gap-2 text-sm my-2">
            <div class="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <span class="font-semibold text-gray-700">
                {{ creditData.credit?.total_transactions || 0 }}
              </span>
              <span class="text-xs text-gray-500">Transactions</span>
            </div>
            <div class="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <span class="font-semibold text-green-600">
                {{ creditData.credit?.total_deposits || 0 }}
              </span>
              <span class="text-xs text-gray-500">Total Deposits</span>
            </div>
            <div class="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <span class="font-semibold text-red-600">
                {{ creditData.credit?.total_withdrawals || 0 }}
              </span>
              <span class="text-xs text-gray-500">Total Withdrawals</span>
            </div>
          </div>

          <!-- Footer: Last Activity & Dates -->
          <div
            class="mt-4 flex items-center justify-between text-xs text-gray-500"
          >
            <div class="flex items-center">
              <el-icon class="mr-1">
                <Clock />
              </el-icon>
              <span
                >Last Tx:
                {{ creditData.credit?.last_transaction_at || 'None' }}</span
              >
            </div>
          </div>
        </div>
      </el-card>

      <!-- Deposit Card -->
      <el-card
        shadow="hover"
        class="border-0 bg-gradient-to-r from-green-50 to-green-100"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center text-green-600">
            <el-icon class="mr-2">
              <Top />
            </el-icon>
            <span class="font-medium">Deposit Funds</span>
          </div>
          <div class="my-4">
            <el-input-number
              v-model="amountDeposit"
              :min="0"
              :max="100000"
              :precision="2"
              :step="100"
              controls-position="right"
              class="w-full"
              size="large"
            />
          </div>
          <div class="mb-4 grid grid-cols-4 gap-2">
            <el-button
              v-for="quickAmount in [100, 500, 1000, 5000]"
              :key="quickAmount"
              @click="amountDeposit = quickAmount"
              class="!text-xs"
            >
              ${{ quickAmount }}
            </el-button>
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
              <Upload />
            </el-icon>
            Deposit Now
          </el-button>
          <div class="mt-2 text-center text-xs text-gray-500">
            <el-icon class="mr-1">
              <Money />
            </el-icon>
            Instant processing
          </div>
        </div>
      </el-card>

      <!-- Withdraw Card -->
      <el-card
        shadow="hover"
        class="border-0 bg-gradient-to-r from-purple-50 to-purple-100"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center text-purple-600">
            <el-icon class="mr-2">
              <Bottom />
            </el-icon>
            <span class="font-medium">Withdraw Funds</span>
          </div>
          <div class="my-4">
            <el-input-number
              v-model="amountWithdraw"
              :min="0"
              :max="availableBalance"
              :precision="2"
              :step="100"
              controls-position="right"
              class="w-full"
              size="large"
            />
          </div>
          <div class="mb-4 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Available:</span>
              <span class="font-medium"
                >{{ availableBalance }}
                {{ creditData.credit?.currency || 'USD' }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>After withdrawal:</span>
              <span class="font-medium"
                >{{ (availableBalance - amountWithdraw).toFixed(2) }}
                {{ creditData.credit?.currency || 'USD' }}</span
              >
            </div>
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
              <Download />
            </el-icon>
            Withdraw Now
          </el-button>
          <div class="mt-2 text-center text-xs text-gray-500">
            <el-icon class="mr-1">
              <Clock />
            </el-icon>
            Processed within 24 hours
          </div>
        </div>
      </el-card>
    </div>

    <!-- Transactions Table -->
    <el-card shadow="never" class="border border-gray-200">
      <template #header>
        <div
          class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              Transaction History
            </h2>
            <p class="text-sm text-gray-500">
              Showing {{ filteredTransactions.length }} of
              {{ creditData.meta?.total || 0 }} transactions
            </p>
          </div>
          <el-button type="info" plain @click="fetchData" :loading="isLoading">
            <el-icon class="mr-1">
              <Refresh />
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
        <el-table-column
          prop="transaction_code"
          label="Transaction ID"
          width="220"
        >
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.transaction_code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Date">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-gray-800">{{
                new Date(row.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                })
              }}</span>
              <span class="text-xs text-gray-500">
                {{ new Date(row.created_at).toLocaleTimeString() }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type_label" label="Type">
          <template #default="{ row }">
            <el-tag
              :type="FundTypeStatus(row.type).color"
              effect="light"
              size="small"
              class="font-medium"
            >
              {{ row.type_label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="User" prop="user" width="300">
          <template #default="{ row }">
            <div v-if="row.user" class="flex items-center">
              <el-avatar :size="24" class="mr-2">
                {{ row.user.email?.charAt(0)?.toUpperCase() || 'U' }}
              </el-avatar>
              <div>
                <p class="text-sm font-medium">
                  {{ row.user.email || 'No email' }}
                </p>
                <p class="text-xs text-gray-500">ID: {{ row.user.id }}</p>
              </div>
            </div>
            <span v-else class="text-gray-400">System</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="formatted_amount"
          label="Amount"
          align="right"
        >
          <template #default="{ row }">
            <span
              :class="FundTypeStatus(row.type).class"
              class="font-medium"
            >
              {{ row.formatted_amount }}
              {{ creditData.credit?.currency || 'USD' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="balance_after"
          label="Balance"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-medium text-gray-800">
              {{ row.balance_after }} {{ creditData.credit?.currency || 'USD' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description">
          <template #default="{ row }">
            <p class="line-clamp-2 text-gray-600">
              {{ row.description || 'No description provided' }}
            </p>
            <el-tag v-if="row.metadata" size="small" type="info" class="mt-1">
              <el-icon class="mr-1">
                <Document />
              </el-icon>
              Has metadata
            </el-tag>
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
                  <View />
                </el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <!-- Pagination -->
      <div class="mt-6 flex justify-center" v-if="paginationInfo.lastPage > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="paginationInfo.pageSize"
          :total="paginationInfo.total"
          layout="prev, pager, next, jumper"
          @current-change="handlePageChange"
          class="pagination"
          :pager-count="5"
          :hide-on-single-page="true"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.transaction-details-modal {
  max-width: 700px;
}

:deep(.el-card) {
  border-radius: 12px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: rgba(0, 0, 0, 0.02);
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

.custom-table :deep(.el-table__body tr:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-disabled-bg-color: transparent;
}

:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .el-pager li) {
  background-color: white;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin: 0 4px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--el-color-primary);
  color: white;
}

:deep(.el-pagination__jump) {
  margin-left: 12px;
}
</style>
