<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['authenticated', 'face-verification'],
  // requiresBorrower: true,
  // requiresAdmin: true
})
</script>

<template>
  <div>
    <Liveliness />
  </div>
</template>

<style scoped>

</style>
