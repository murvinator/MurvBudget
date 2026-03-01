<template>
  <!-- Fixed nav bar strip — always 44px + safe area -->
  <div class="header">
    <span class="title-small" :style="{ opacity: titleOpacity }">{{ smallTitle }}</span>
    <div class="header-separator" :style="{ opacity: titleOpacity }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({ currentView: String })

const viewTitles = { overview: 'Budget', monthly: 'Checklista', finans: 'Ekonomi' }
const smallTitle = computed(() => viewTitles[props.currentView] ?? 'MurvBudget')

const scrollY = ref(0)

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
  background: var(--bg-primary);
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
