<template>
  <div class="header" :class="{ small: isSmall }">
    <div class="header-content">
      <h1>Budget</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isSmall = ref(false)
const THRESHOLD = 60

function onScroll() {
  isSmall.value = window.scrollY > THRESHOLD
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
