<template>
  <div>
    <main ref="mainContent">
      <slot/>
    </main>
  </div>
</template>

<style scoped>
.h-screen {
  height: 100vh;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.p-4 {
  padding: 1rem;
}
</style>

