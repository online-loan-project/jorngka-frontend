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
const activeItem = ref('Dashboard') // Track active item

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

const goTo = (path, label) => {
  activeItem.value = label
  navigateTo(path)
}
</script>


<template>
  <aside
    class="h-screen bg-gradient-to-b from-indigo-50 to-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex flex-col"
    :class="{ 'w-64': isOpen, 'w-20': !isOpen }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
      <transition name="slide-fade" mode="out-in">
        <h1
          v-if="isOpen"
          class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent"
        >
          JORNG-KA
          <span class="block text-xs font-normal text-gray-500">Digital Loan Platform</span>
        </h1>
      </transition>
      <el-button
        :icon="Menu"
        size="small"
        @click="isOpen = !isOpen"
        class="!bg-transparent !border-0 hover:!bg-indigo-100 !rounded-full !p-2 !text-indigo-600"
      />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li v-for="(item, index) in menuItems" :key="index" :class="item.class || ''">
          <!-- Menu Item -->
          <div
            class="flex items-center px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 group relative"
            :class="{
              'justify-center': !isOpen,
              'bg-indigo-100 text-indigo-700': activeItem === item.label,
              'hover:bg-indigo-50 hover:text-indigo-600': activeItem !== item.label
            }"
            @click="item.children ? toggleSubmenu(item.label) : goTo(item.to, item.label)"
          >
            <!-- Active indicator -->
            <div
              v-if="activeItem === item.label"
              class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"
            ></div>

            <el-icon
              :size="20"
              class="transition-all z-10"
              :class="{
                'mr-3': isOpen,
                'text-indigo-500 group-hover:text-indigo-600': activeItem !== item.label,
                'text-indigo-600': activeItem === item.label
              }"
            >
              <component :is="item.icon" />
            </el-icon>

            <transition name="slide-fade" mode="out-in">
              <span
                v-if="isOpen"
                class="text-sm font-medium flex-1 z-10"
                :class="{
                  'font-semibold': activeItem === item.label
                }"
              >
                {{ item.label }}
              </span>
            </transition>

            <transition name="rotate" mode="out-in">
              <el-icon
                v-if="item.children && isOpen"
                class="transition-transform duration-200 z-10"
                :class="{
                  'transform rotate-90 text-indigo-600': activeSubmenu === item.label,
                  'text-gray-400': activeSubmenu !== item.label
                }"
              >
                <ArrowRight />
              </el-icon>
            </transition>
          </div>

          <!-- Submenu -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0 -translate-y-2"
            enter-to-class="opacity-100 max-h-40 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-40 translate-y-0"
            leave-to-class="opacity-0 max-h-0 -translate-y-2"
          >
            <ul
              v-if="item.children && activeSubmenu === item.label && isOpen"
              class="ml-2 mt-1 space-y-1 overflow-hidden"
            >
              <li
                v-for="(child, cIndex) in item.children"
                :key="cIndex"
                class="flex items-center px-3 py-2 text-sm rounded-md transition cursor-pointer"
                :class="{
                  'bg-indigo-50 text-indigo-600': activeItem === child.label,
                  'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600': activeItem !== child.label
                }"
                @click="goTo(child.to, child.label)"
              >
                <el-icon :size="16" class="mr-2">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.label }}</span>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>

    <!-- Collapsed Tooltips -->
    <div v-if="!isOpen" class="fixed left-20 ml-1 z-50">
      <div
        v-for="item in menuItems.filter(i => !i.children)"
        :key="item.label"
        class="relative group"
      >
        <div class="hidden group-hover:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2">
          <div class="bg-indigo-600 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
            {{ item.label }}
            <div class="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 rotate-45 bg-indigo-600"></div>
          </div>
        </div>
      </div>
    </div>
  </aside>
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
