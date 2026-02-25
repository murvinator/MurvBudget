<template>
  <!-- Fixed nav bar strip only — always 44px + safe area, solid background -->
  <div class="header">
    <span class="title-small" :style="{ opacity: titleOpacity }">Budget</span>
    <div class="header-separator" :style="{ opacity: titleOpacity }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)

// The large title fully disappears behind the nav bar at ~74px of scroll
// (36px gap between header bottom and title top, + ~38px title height).
// Snap the small title in quickly over just 12px so it feels like a crossfade, not an overlap.
const titleOpacity = computed(() => {
  const start = 68
  const end = 80
  return Math.min(Math.max((scrollY.value - start) / (end - start), 0), 1)
})

function onScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: calc(44px + var(--safe-area-top));
  padding-top: var(--safe-area-top);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  .header {
    background: #000000;
  }
}

.title-small {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.header-separator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: var(--separator);
}
</style>
