<template>
  <div class="relative flex items-center justify-center min-h-screen bg-home">
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div class="relative z-10 flex flex-col items-center space-y-6 text-white text-center">
      <img src="@/assets/image/logowhite.png" alt="logo" class="w-32 md:w-40" />
      <h1 class="text-6xl font-bold text-white text-center">Get the loan You need with Jorngka</h1>
      <p class="text-lg md:text-xl font-light leading-relaxed">
        Apply for a loan that you need <br>
        in an easy way just few click <br>
        You will get your laon.
      </p>

      <div class="flex flex-col space-y-5">
        <Locale />
        <el-button type="primary" round @click="navigateTo('login')">
          {{ $t('home.sign_in') }}
        </el-button>
      </div>
    </div>
  </div>
</template>


<script setup>
</script>

<style scoped>
.bg-home {
  background: url('@/assets/image/home.png') no-repeat center center;
  background-size: cover;
}
</style>

