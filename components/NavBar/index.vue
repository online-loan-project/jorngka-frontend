<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const activeLink = ref('home')
const { value: user } = useCookie('user')

const navLinks = [
  { name: 'home', label: 'Home', path: '/' },
  { name: 'how-it-works', label: 'How It Works', path: '/how-it-works' },
  { name: 'about', label: 'About', path: '/about-us' },
  { name: 'contact', label: 'Contact', path: '/contact' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const navigate = (path, name) => {
  activeLink.value = name
  router.push(path)
  mobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Set active link based on current route
  const currentRoute = router.currentRoute.value.path
  const matchedLink = navLinks.find(link => link.path === currentRoute)
  if (matchedLink) {
    activeLink.value = matchedLink.name
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'bg-white py-4 px-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-300',
      isScrolled ? 'shadow-md' : 'shadow-sm'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center space-x-3">
      <img
        src="https://dummyimage.com/100x100/000/fff"
        alt="JorngKa Logo"
        class="h-10 w-10 rounded-full transition-transform hover:scale-105"
      />
      <span class="text-2xl font-bold text-primary-600 tracking-wide hover:text-primary-700 transition-colors">
        JorngKa
      </span>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex flex-1 justify-center gap-8 mx-8">
      <a
        v-for="link in navLinks"
        :key="link.name"
        @click="navigate(link.path, link.name)"
        :class="[
          'text-gray-700 hover:text-primary-600 transition-colors font-medium text-lg relative cursor-pointer',
          activeLink === link.name ? 'text-primary-600 font-semibold' : ''
        ]"
      >
        {{ link.label }}
        <span
          :class="[
            'absolute -bottom-1 left-0 h-[2px] bg-primary-600 transition-all duration-300',
            activeLink === link.name ? 'w-full' : 'w-0 hover:w-full'
          ]"
        ></span>
      </a>
    </nav>

    <!-- Auth Buttons - Desktop -->
    <div class="hidden md:flex items-center gap-4">
      <Locale class="mr-2" />
      <el-button
        v-if="!user"
        @click="navigate('/login', 'login')"
        type="primary"
        class="!rounded-full !px-6 !py-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        Login / Register
      </el-button>
      <el-image
        v-if="user && user.profile && user.profile.image"
        :src="user.profile.image"
        class="w-10 h-10 rounded-full border-2 border-primary-600 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
        @click="navigate('/dashboard')"
        fit="contain"
        />
    </div>

    <!-- Mobile Menu Button -->
    <button
      @click="mobileMenuOpen = !mobileMenuOpen"
      class="md:hidden focus:outline-none"
      aria-label="Toggle menu"
    >
      <div class="w-6 flex flex-col gap-1.5">
        <span
          :class="[
            'h-0.5 bg-gray-700 rounded-full transition-all duration-300',
            mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
          ]"
        ></span>
        <span
          :class="[
            'h-0.5 bg-gray-700 rounded-full transition-all duration-300',
            mobileMenuOpen ? 'opacity-0' : 'opacity-100'
          ]"
        ></span>
        <span
          :class="[
            'h-0.5 bg-gray-700 rounded-full transition-all duration-300',
            mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
          ]"
        ></span>
      </div>
    </button>

    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        @click="mobileMenuOpen = false"
      ></div>
    </transition>

    <!-- Mobile Menu Content -->
    <transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 p-6 flex flex-col md:hidden"
      >
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center space-x-3">
            <img
              src="https://dummyimage.com/100x100/000/fff"
              alt="JorngKa Logo"
              class="h-10 w-10 rounded-full"
            />
            <span class="text-xl font-bold text-primary-600">JorngKa</span>
          </div>
          <button
            @click="mobileMenuOpen = false"
            class="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <nav class="flex flex-col gap-4 flex-1">
          <a
            v-for="link in navLinks"
            :key="link.name"
            @click="navigate(link.path, link.name)"
            :class="[
              'py-3 px-4 rounded-lg transition-colors',
              activeLink === link.name
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ link.label }}
          </a>
        </nav>
        <div class="mt-auto pt-6 border-t border-gray-100">
          <Locale class="mb-4" />
          <el-button
            v-if="!user"
            @click="navigate('/login', 'login')"
            type="primary"
            class="w-full !rounded-lg !py-3"
          >
            Login / Register
          </el-button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Custom scrollbar for mobile menu */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
