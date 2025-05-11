<template>
  <div class="app-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <img
          class="loading-gif"
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExczlodmc1azdsMWoxN29xOTBtY3pqampvMTlhYWk0NjlhbmwwNmljMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZLSlxoLbVvdrSFz599/giphy.gif"
          alt="Loading..."
        />
        <p class="loading-text">Loading...</p>
      </div>
    </div>

    <!-- Main Layout -->
    <div v-else class="app-layout">
      <SideBarAdmin class="sidebar" />

      <main class="main-content">
        <div class="content-wrapper">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated'],
})

const loading = ref(true)
const { value: user } = useCookie('user')
const role = user?.role

onMounted(() => {
  // Simulate async check
  setTimeout(() => {
    if (role !== 1) {
      console.log('Unauthorized access: Borrower role required')
      navigateTo('/unauthorized')
    } else {
      loading.value = false
    }

    loading.value = false
  }, 1000) // Reduced delay for better UX
})

// Handle route changes
const route = useRoute()
watch(() => route.path, () => {
  if (loading.value) return
  // Add any route-specific logic here
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-gif {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.loading-text {
  font-size: 1.2rem;
  color: #333;
  font-weight: 500;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex: 0 0 250px; /* Fixed width sidebar */
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  width: 100%;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 1rem;
  }

  .loading-gif {
    width: 60px;
    height: 60px;
  }

  .loading-text {
    font-size: 1rem;
  }
}
</style>
