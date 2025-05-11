<script setup>
useSeoMeta({
  title: 'JorngKa | How It Works',
  description: 'Learn how to get instant digital loans in Cambodia with JorngKa'
})

definePageMeta({
  layout: 'default',
})

const steps = [
  {
    icon: 'document-add',
    title: '1. Apply Online',
    description: 'Complete our simple application form in just 5 minutes',
    details: 'Provide basic personal and financial information through our secure platform.',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    icon: 'search',
    title: '2. Instant Approval',
    description: 'Get an instant decision using our advanced AI system',
    details: 'Our system analyzes your application in real-time for quick approval.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: 'wallet',
    title: '3. Receive Funds',
    description: 'Money transferred directly to your account',
    details: 'Funds typically arrive within 15 minutes after approval.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: 'refresh',
    title: '4. Repay Easily',
    description: 'Flexible repayment options through multiple channels',
    details: 'Choose automatic payments or manual transfers via our app.',
    color: 'from-rose-500 to-pink-600'
  }
]

const activeStep = ref(0)
</script>

<template>
  <NavBar />

  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[url('https://preview.tailwindcss.com/_next/static/media/docs@tinypng.4f5a1dcb.png')] bg-[length:800px] bg-top"></div>
      </div>
      <div class="container mx-auto px-6 text-center relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">How JorngKa Works</h1>
        <p class="text-xl max-w-3xl mx-auto opacity-90">
          Get up to $1,000 in minutes with our simple 4-step process
        </p>
        <div class="mt-8">
          <el-button
            type="primary"
            size="large"
            class="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 px-8 py-3 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            @click="navigateTo('/register')"
          >
            Apply Now — It's Free
          </el-button>
        </div>
      </div>
    </div>

    <!-- Main Process -->
    <div class="container mx-auto px-6 py-20 -mt-16 relative z-20">
      <!-- Floating Process Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Step Navigation -->
        <div class="bg-gray-50 px-8 py-6 border-b">
          <el-steps :active="activeStep" align-center class="max-w-4xl mx-auto">
            <el-step
              v-for="(step, index) in steps"
              :key="index"
              :title="step.title"
              @click="activeStep = index"
              class="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </el-steps>
        </div>

        <!-- Step Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Left Column - Visual -->
          <div class="p-12 bg-gradient-to-br" :class="steps[activeStep].color">
            <div class="flex flex-col items-center justify-center h-full text-center text-white">
              <div class="bg-white/20 p-6 rounded-full backdrop-blur-sm mb-8">
                <el-icon :size="80">
                  <component :is="steps[activeStep].icon" />
                </el-icon>
              </div>
              <h3 class="text-3xl font-bold mb-4">{{ steps[activeStep].title }}</h3>
              <p class="text-xl opacity-90 mb-8">{{ steps[activeStep].description }}</p>
              <div class="flex space-x-4">
                <button
                  v-for="(step, index) in steps"
                  :key="index"
                  @click="activeStep = index"
                  :class="[
                    'w-3 h-3 rounded-full transition-all',
                    activeStep === index ? 'bg-white' : 'bg-white/30'
                  ]"
                  aria-label="Go to step"
                />
              </div>
            </div>
          </div>

          <!-- Right Column - Details -->
          <div class="p-12">
            <div class="max-w-md mx-auto">
              <h2 class="text-3xl font-bold text-gray-800 mb-6">Our Simple Process</h2>
              <p class="text-gray-600 mb-8 text-lg leading-relaxed">
                {{ steps[activeStep].details }}
              </p>

              <div class="space-y-4 mb-10">
                <div
                  v-for="(step, index) in steps"
                  :key="index"
                  @click="activeStep = index"
                  :class="[
                    'p-5 rounded-xl cursor-pointer transition-all border',
                    activeStep === index
                      ? 'border-transparent bg-gradient-to-r shadow-md' + ' ' + step.color
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  ]"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-12 h-12 rounded-full flex items-center justify-center text-white',
                          activeStep === index
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-gradient-to-r' + ' ' + step.color
                        ]"
                      >
                        <el-icon :size="24">
                          <component :is="step.icon" />
                        </el-icon>
                      </div>
                    </div>
                    <div>
                      <h3 class="font-semibold" :class="activeStep === index ? 'text-white' : 'text-gray-800'">{{ step.title }}</h3>
                      <p :class="activeStep === index ? 'text-white/90' : 'text-gray-600'">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <el-button
                type="primary"
                size="large"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                @click="navigateTo('/register')"
              >
                Start Your Application
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-6 pb-20">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose JorngKa?</h2>
      <p class="text-xl text-center text-gray-600 max-w-2xl mx-auto mb-12">
        Cambodia's fastest growing digital lending platform
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-transparent">
          <div class="bg-blue-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            <el-icon :size="32" class="text-blue-600">
              <timer />
            </el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-3">Lightning Fast</h3>
          <p class="text-gray-600">From application to funds in your account in under 30 minutes</p>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-transparent">
          <div class="bg-green-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            <el-icon :size="32" class="text-green-600">
              <lock />
            </el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-3">Bank-Level Security</h3>
          <p class="text-gray-600">256-bit encryption protects your personal information</p>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-transparent">
          <div class="bg-purple-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            <el-icon :size="32" class="text-purple-600">
              <money />
            </el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-3">Transparent Pricing</h3>
          <p class="text-gray-600">No hidden fees, know exactly what you'll pay upfront</p>
        </div>
      </div>
    </div>

    <!-- Testimonial Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 py-20 text-white">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <el-icon :size="48" class="text-white/50 mb-6 mx-auto">
            <chat-line-round />
          </el-icon>
          <h2 class="text-3xl font-bold mb-8">Trusted by Thousands of Cambodians</h2>

          <div class="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-10">
            <p class="text-xl italic mb-6">
              "I needed emergency funds for my mother's hospital bill. JorngKa approved my loan in 10 minutes and the money was in my ABA account before we reached the hospital. Lifesaver!"
            </p>
            <div class="flex items-center justify-center gap-4">
              <el-avatar :size="50" src="https://randomuser.me/api/portraits/women/42.jpg" />
              <div class="text-left">
                <h4 class="font-semibold">Sokha Chen</h4>
                <p class="text-white/80 text-sm">Phnom Penh</p>
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-2">
            <div v-for="i in 4" :key="i" class="w-3 h-3 rounded-full" :class="i === 2 ? 'bg-white' : 'bg-white/30'"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="container mx-auto px-6 py-20">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">Frequently Asked Questions</h2>
        <p class="text-xl text-center text-gray-600 mb-12">
          Everything you need to know about JorngKa loans
        </p>

        <el-collapse accordion class="bg-white rounded-xl shadow-md overflow-hidden">
          <el-collapse-item name="1" class="p-6 hover:bg-gray-50 transition-colors">
            <template #title>
              <div class="flex items-center">
                <div class="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                  <el-icon class="text-blue-600">
                    <question-filled />
                  </el-icon>
                </div>
                <span class="font-semibold text-lg">How quickly can I get the money?</span>
              </div>
            </template>
            <div class="pl-14 pr-6 pb-6 text-gray-600">
              Most approved applicants receive funds within 15 minutes to their bank account or mobile wallet.
              We partner with all major Cambodian banks and payment providers for instant transfers.
            </div>
          </el-collapse-item>

          <el-collapse-item name="2" class="p-6 hover:bg-gray-50 transition-colors border-t">
            <template #title>
              <div class="flex items-center">
                <div class="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                  <el-icon class="text-blue-600">
                    <question-filled />
                  </el-icon>
                </div>
                <span class="font-semibold text-lg">What documents do I need?</span>
              </div>
            </template>
            <div class="pl-14 pr-6 pb-6 text-gray-600">
              Just your national ID and proof of income. Our digital process requires no physical paperwork.
              You can upload photos directly through our secure app.
            </div>
          </el-collapse-item>

          <el-collapse-item name="3" class="p-6 hover:bg-gray-50 transition-colors border-t">
            <template #title>
              <div class="flex items-center">
                <div class="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                  <el-icon class="text-blue-600">
                    <question-filled />
                  </el-icon>
                </div>
                <span class="font-semibold text-lg">What's the maximum loan amount?</span>
              </div>
            </template>
            <div class="pl-14 pr-6 pb-6 text-gray-600">
              First-time borrowers can access up to $500, while returning customers may qualify for up to $1,000.
              Your limit increases as you build repayment history with us.
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style>
/* Custom animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Element Plus overrides */
.el-step__head.is-process {
  @apply text-blue-600 border-blue-600;
}
.el-step__title.is-process {
  @apply font-semibold text-blue-600;
}
.el-collapse-item__header {
  @apply h-auto !important;
}
</style>
