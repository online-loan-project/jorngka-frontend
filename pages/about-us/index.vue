<script setup>
useSeoMeta({
  title: 'JorngKa | About Us',
  description: 'Learn more about JorngKa - Your trusted digital loan provider in Cambodia',
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <NavBar />

  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">About JorngKa</h1>
        <p class="text-xl max-w-3xl mx-auto">
          Revolutionizing digital lending in Cambodia with fast, secure, and transparent loan services.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16">
      <!-- Our Story Section -->
      <div class="flex flex-col md:flex-row items-center mb-20">
        <div class="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
          <p class="text-gray-600 mb-4">
            JorngKa was born as a school project for Web and Cloud Computing II at the Royal University of Phnom Penh,
            but quickly evolved into a vision for accessible digital financing in Cambodia.
          </p>
          <p class="text-gray-600 mb-4">
            Our team of five IT Engineering students recognized the need for quick, transparent loan services
            that leverage modern technology to serve Cambodians better.
          </p>
          <p class="text-gray-600">
            Today, we're proud to offer instant digital loans up to $1000 with competitive rates and
            a completely online application process.
          </p>
        </div>
        <div class="md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1011&q=80"
            alt="Team working together"
            class="rounded-lg shadow-xl w-full h-auto"
          >
        </div>
      </div>

      <!-- Technology Section -->
      <div class="bg-white rounded-xl shadow-md p-8 mb-20">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Our Technology Stack</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div class="flex flex-col items-center">
            <img src="https://api.iconify.design/logos:nuxt-icon.svg" alt="NuxtJS" class="h-16 mb-3">
            <span class="font-medium text-gray-700">NuxtJS</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="https://api.iconify.design/logos:laravel.svg" alt="Laravel" class="h-16 mb-3">
            <span class="font-medium text-gray-700">Laravel 11</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="https://api.iconify.design/logos:mysql-icon.svg" alt="MySQL" class="h-16 mb-3">
            <span class="font-medium text-gray-700">MySQL</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="https://api.iconify.design/logos:aws.svg" alt="AWS" class="h-16 mb-3">
            <span class="font-medium text-gray-700">AWS</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="https://api.iconify.design/logos:telegram.svg" alt="Telegram" class="h-16 mb-3">
            <span class="font-medium text-gray-700">Telegram API</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="https://plasgate.com/wp-content/uploads/2024/02/cropped-logo-04-120x64.png" alt="Plasgate" class="h-16 mb-3">
            <span class="font-medium text-gray-700">PlasgateSMS</span>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <!-- Team Section -->
      <div class="mb-20">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <!-- Team Member 1 - Female -->
          <el-card shadow="hover" class="text-center">
            <div class="flex justify-center mb-4">
              <el-avatar :size="120" src="/assets/image/la_seavyong.jpg">
                <img src="/assets/image/la_seavyong.jpg" class="object-contain"/>
              </el-avatar>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">La Seavyong</h3>
            <p class="text-gray-600">Frontend Developer</p>
          </el-card>

          <!-- Team Member 2 - Female -->
          <el-card shadow="hover" class="text-center">
            <div class="flex justify-center mb-4">
              <el-avatar :size="120" src="/images/team-lyna.jpg">
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              </el-avatar>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Song Lyna</h3>
            <p class="text-gray-600">Backend Developer</p>
          </el-card>

          <!-- Team Member 3 - Male -->
          <el-card shadow="hover" class="text-center">
            <div class="flex justify-center mb-4">
              <el-avatar :size="120" src="/images/team-channalong.jpg">
                <img src="https://cube.elemecdn.com/e/f/d/4a7954b9b5a3d5b8f8859b3b8d98dpng.png" />
              </el-avatar>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Keo Channalong</h3>
            <p class="text-gray-600">Fullstack Developer</p>
          </el-card>

          <!-- Team Member 4 - Male -->
          <el-card shadow="hover" class="text-center">
            <div class="flex justify-center mb-4">
              <el-avatar :size="120" src="/images/team-rathanak.jpg">
                <img src="https://cube.elemecdn.com/e/f/d/4a7954b9b5a3d5b8f8859b3b8d98dpng.png" />
              </el-avatar>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Rathanak Colindo</h3>
            <p class="text-gray-600">DevOps Engineer</p>
          </el-card>

          <!-- Team Member 5 - No gender specified -->
          <el-card shadow="hover" class="text-center">
            <div class="flex justify-center mb-4">
              <el-avatar :size="120" src="/images/team-sothea.jpg">
                <img src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png" />
              </el-avatar>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Sothea</h3>
            <p class="text-gray-600">UI/UX Designer</p>
          </el-card>
        </div>
      </div>

      <!-- University Section -->
      <div class="bg-blue-50 rounded-xl p-8 text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">A Royal University of Phnom Penh Project</h2>
        <p class="text-gray-600 max-w-3xl mx-auto mb-6">
          This platform was developed as part of our coursework for Web and Cloud Computing II in the
          Information Technology Engineering program, Year 3 Semester 2.
        </p>
        <div class="flex justify-center">
          <img
            src="https://www.rupp.edu.kh/logo/rupp_logo.png"
            alt="Royal University of Phnom Penh"
            class="h-24"
          >
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
/* Custom styles if needed */
</style>
