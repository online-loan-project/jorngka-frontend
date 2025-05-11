<script setup>
import { ref } from 'vue'
import {
  Menu,
  House,
  User,
  Setting,
  Folder,
  ArrowRight,
  ArrowDown,
  Money,
  SwitchButton
} from '@element-plus/icons-vue'


const isOpen = ref(true)
const activeSubmenu = ref(null)

const menuItems = [
  { icon: House, label: 'Dashboard', to: '/borrower/dashboard' },
  { icon: Money, label: 'Request Loan', to: '/borrower/request-loan' },
  {
    icon: Folder,
    label: 'Loans',
    children: [
      { label: 'Active Loans', to: '/borrower/loans/active' },
      { label: 'Loans History', to: '/borrower/loans/history' }
    ]
  },
  { icon: User, label: 'Profile', to: '/borrower/profile' },
  { icon: Setting, label: 'Settings', to: '/borrower/settings' },
  { icon: SwitchButton, label: 'Logout', to: '/borrower/logout' }
]

const toggleSubmenu = (label) => {
  activeSubmenu.value = activeSubmenu.value === label ? null : label
}
</script>


<template>
  <aside
    class="h-screen bg-gradient-to-b bg-white border-r border-primary-300 shadow-lg transition-all duration-300"
    :class="{ 'w-64': isOpen, 'w-20': !isOpen }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-5">
      <h1 class="text-2xl font-extrabold text-primary-700 tracking-wide transition-opacity duration-300" v-if="isOpen">JORNG-KA</h1>
      <el-button
        :icon="Menu"
        size="small"
        @click="isOpen = !isOpen"
        class="!bg-transparent !border-0 !text-black dark:!text-black"
      />
    </div>

    <!-- Navigation -->
    <nav class="px-2">
      <ul class="space-y-1">
        <li v-for="(item, index) in menuItems" :key="index">
          <!-- Menu Item -->
          <div
            class="flex items-center px-3 py-2 rounded-lg hover:bg-primary-500 hover:text-white cursor-pointer transition-all duration-200 group"
            @click="item.children ? toggleSubmenu(item.label) : navigateTo(item.to)"
          >
            <el-icon :size="20" class="mr-3 text-primary-700 group-hover:text-white">
              <component :is="item.icon" />
            </el-icon>
            <span v-if="isOpen" class="text-sm font-medium flex-1">{{ item.label }}</span>
            <el-icon v-if="item.children && isOpen" class="transition-transform">
              <component :is="activeSubmenu === item.label ? ArrowDown : ArrowRight" />
            </el-icon>
          </div>


          <!-- Submenu -->
          <transition name="fade">
            <ul
              v-if="item.children && activeSubmenu === item.label && isOpen"
              class="ml-9 mt-1 space-y-1"
            >
              <li
                v-for="(child, cIndex) in item.children"
                :key="cIndex"
                class="text-sm text-gray-600 dark:text-black hover:text-primary-600 cursor-pointer px-2 py-1 rounded-md transition"
                @click="navigateTo(child.to)"
              >
                {{ child.label }}
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
