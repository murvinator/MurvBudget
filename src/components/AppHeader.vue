<template>
  <div class="header">
    <!-- Nav bar row: always 44px, holds the small centered title -->
    <div class="nav-bar">
      <span class="title-small" :style="{ opacity: progress }">Budget</span>
    </div>

    <!-- Large title row: collapses in height AND fades as you scroll -->
    <div class="large-title-row" :style="largeTitleRowStyle">
      <h1
        class="title-large"
        :style="{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 6}px)`
        }"
      >Budget</h1>
    </div>

    <!-- Separator hairline: fades in as large title disappears -->
    <div class="header-separator" :style="{ opacity: progress }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
const THRESHOLD = 60

// 0 = top, 1 = scrolled
const progress = computed(() => Math.min(scrollY.value / THRESHOLD, 1))

// Large title row: 34px font + 4px top + 14px bottom ≈ 52px total
// Collapses to 0 as progress → 1
const largeTitleRowStyle = computed(() => ({
  overflow: 'hidden',
  height: `${(1 - progress.value) * 52}px`,
  paddingLeft: '20px',
  paddingRight: '20px',
}))

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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding-top: var(--safe-area-top);
  /* No fixed height — shrinks naturally as large-title-row collapses */
}

@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(0, 0, 0, 0.85);
  }
}

.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-small {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
  pointer-events: none;
}

.large-title-row {
  /* height and padding driven by inline style */
  display: flex;
  align-items: flex-end;
}

.title-large {
  font-size: 34px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1.1;
  will-change: opacity, transform;
  pointer-events: none;
  margin-bottom: 4px;
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
