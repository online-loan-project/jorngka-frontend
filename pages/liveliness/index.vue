<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['authenticated'],
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
