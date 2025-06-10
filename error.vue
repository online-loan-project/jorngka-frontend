<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center p-6 bg">
    <img
        class="w-24 h-24 object-contain mb-4"
      src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXRiZDh4Ymljc2FtYjZjMmZqZXY4cXY5dXB5aXZzeTM3cXZnbnoweiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VEta1IY8NgifNfvSVo/giphy.gif"
      alt="Error"
    />
    <h2 class="text-xl font-semibold text-red-500 mb-2">Oops! Something went wrong.</h2>
    <p class="text-gray-600 mb-6">We're sorry, but an unexpected error has occurred.</p>
    <el-button type="primary" size="large" @click="goHome">Back to Home</el-button>
  </div>
</template>

<script setup>
const router = useRouter()

const goHome = () => {
  router.back()
}
</script>

<style scoped>
.bg {
  background: #F3F3F3;
}
  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }

  .animate-slide-up {
    animation: slide-up 0.5s ease-in-out;
  }
</style>

