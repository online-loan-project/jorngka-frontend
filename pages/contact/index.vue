<script setup>
import { Location, Message, Iphone, Clock, ChatDotRound, Postcard, Promotion, VideoCamera } from '@element-plus/icons-vue'

useSeoMeta({
  title: 'JorngKa | Contact Us',
  description: 'Get in touch with JorngKa - Your trusted digital loan provider in Cambodia',
})

definePageMeta({
  layout: 'default',
})

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  countryCode: '+855',
  subject: '',
  message: ''
})

const submitForm = () => {
  // Handle form submission
  console.log('Form submitted:', contactForm.value)
  ElMessage.success('Your message has been sent successfully!')
  contactForm.value = {
    name: '',
    email: '',
    phone: '',
    countryCode: '+855',
    subject: '',
    message: ''
  }
}
</script>

<template>
  <NavBar />

  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Contact JorngKa</h1>
        <p class="text-xl max-w-3xl mx-auto">
          We're here to help with your digital loan needs. Reach out anytime!
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Contact Form -->
        <div class="lg:w-1/2">
          <el-card shadow="hover" class="p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>

            <el-form :model="contactForm" class="space-y-6">
              <el-form-item label="Full Name" required>
                <el-input
                  v-model="contactForm.name"
                  placeholder="Your name"
                  size="large"
                />
              </el-form-item>

              <el-form-item label="Email" required>
                <el-input
                  v-model="contactForm.email"
                  placeholder="your@email.com"
                  size="large"
                  type="email"
                />
              </el-form-item>

              <el-form-item label="Phone Number">
                <el-input
                  v-model="contactForm.phone"
                  placeholder="+855"
                  size="large"
                >
                  <template #prepend>
                    <el-select v-model="contactForm.countryCode" style="width: 90px">
                      <el-option label="+855" value="+855" />
                      <el-option label="Other" value="other" />
                    </el-select>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="Subject" required>
                <el-select
                  v-model="contactForm.subject"
                  placeholder="Select subject"
                  size="large"
                  class="w-full"
                >
                  <el-option label="Loan Inquiry" value="loan" />
                  <el-option label="Account Support" value="account" />
                  <el-option label="Technical Issue" value="technical" />
                  <el-option label="General Question" value="general" />
                </el-select>
              </el-form-item>

              <el-form-item label="Message" required>
                <el-input
                  v-model="contactForm.message"
                  type="textarea"
                  :rows="5"
                  placeholder="Your message..."
                />
              </el-form-item>

              <el-button
                type="primary"
                size="large"
                class="w-full bg-blue-600 hover:bg-blue-700"
                @click="submitForm"
              >
                Send Message
              </el-button>
            </el-form>
          </el-card>
        </div>

        <!-- Contact Info -->
        <div class="lg:w-1/2 space-y-8">
          <el-card shadow="hover" class="p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Our Contact Information</h2>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <el-icon :size="24" class="text-blue-600 mt-1">
                  <Location />
                </el-icon>
                <div>
                  <h3 class="font-semibold text-gray-800">Address</h3>
                  <p class="text-gray-600">
                    Royal University of Phnom Penh<br>
                    Russian Confederation Blvd, Phnom Penh
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <el-icon :size="24" class="text-blue-600 mt-1">
                  <Message />
                </el-icon>
                <div>
                  <h3 class="font-semibold text-gray-800">Email</h3>
                  <p class="text-gray-600">
                    support@jorngka.com<br>
                    info@jorngka.com
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <el-icon :size="24" class="text-blue-600 mt-1">
                  <Iphone />
                </el-icon>
                <div>
                  <h3 class="font-semibold text-gray-800">Phone</h3>
                  <p class="text-gray-600">
                    +855 23 123 4567<br>
                    +855 89 123 456 (Telegram)
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <el-icon :size="24" class="text-blue-600 mt-1">
                  <Clock />
                </el-icon>
                <div>
                  <h3 class="font-semibold text-gray-800">Working Hours</h3>
                  <p class="text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br>
                    Saturday: 8:00 AM - 12:00 PM<br>
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Social Media -->
          <el-card shadow="hover" class="p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Connect With Us</h2>
            <div class="flex gap-4">
              <el-button circle class="w-12 h-12">
                <el-icon :size="24">
                  <ChatDotRound />
                </el-icon>
              </el-button>
              <el-button circle class="w-12 h-12">
                <el-icon :size="24">
                  <Postcard />
                </el-icon>
              </el-button>
              <el-button circle class="w-12 h-12">
                <el-icon :size="24">
                  <Promotion />
                </el-icon>
              </el-button>
              <el-button circle class="w-12 h-12">
                <el-icon :size="24">
                  <VideoCamera />
                </el-icon>
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
/* Custom styles if needed */
</style>
