<template>
  <div class="ios-header-wrapper">
    <!-- Compact Header (shows when scrolled) -->
    <div 
      class="compact-header" 
      :style="{ 
        opacity: compactTitleOpacity,
        transform: compactTitleTransform
      }"
    >
      <h1 class="compact-title">{{ title }}</h1>
    </div>

    <!-- Gradient fade mask for scrolling content -->
    <div 
      class="gradient-mask"
      :style="{ opacity: isCompact ? 1 : 0 }"
    />

    <!-- Large Title (scrolls with content) -->
    <div 
      class="large-header"
      :style="{ opacity: largeTitleOpacity }"
    >
      <h1 class="large-title">{{ title }}</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Title'
  }
});

const scrollY = ref(0);

// Threshold where the header becomes compact (when large title reaches top of compact header area)
const COMPACT_THRESHOLD = 52;

const isCompact = computed(() => scrollY.value > COMPACT_THRESHOLD);

// Large title stays at full opacity until it hits the threshold
const largeTitleOpacity = computed(() => {
  return scrollY.value > COMPACT_THRESHOLD ? 0 : 1;
});

// Compact title fades in and slides up when crossing threshold
const compactTitleOpacity = computed(() => {
  if (scrollY.value <= COMPACT_THRESHOLD) return 0;
  // Quick fade in over 15px of scroll
  const fadeProgress = Math.min(1, (scrollY.value - COMPACT_THRESHOLD) / 15);
  return fadeProgress;
});

// Slide up animation for compact title
const compactTitleTransform = computed(() => {
  if (scrollY.value <= COMPACT_THRESHOLD) return 'translateY(10px)';
  const slideProgress = Math.min(1, (scrollY.value - COMPACT_THRESHOLD) / 15);
  const translateY = 10 - (slideProgress * 10);
  return `translateY(${translateY}px)`;
});

function handleScroll() {
  scrollY.value = window.scrollY;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.ios-header-wrapper {
  position: relative;
}

/* Compact Header - Fixed at top, fades in when scrolled */
.compact-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(242, 242, 247, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.compact-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.41px;
}

/* Gradient mask that appears when compact */
.gradient-mask {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  height: 32px;
  background: linear-gradient(to bottom, rgba(242, 242, 247, 1) 0%, transparent 100%);
  z-index: 999;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* Large Header - Scrolls with content */
.large-header {
  padding: 52px 16px 12px;
  background: #f2f2f7;
  transition: opacity 0.15s ease;
}

.large-title {
  font-size: 34px;
  font-weight: 700;
  margin: 0;
  line-height: 41px;
  letter-spacing: 0.37px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .compact-header {
    background: rgba(0, 0, 0, 0.95);
  }
  
  .gradient-mask {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, transparent 100%);
  }
  
  .large-header {
    background: #000;
  }
  
  .compact-title,
  .large-title {
    color: #fff;
  }
}

/* Safe area support for iOS */
@supports (padding-top: env(safe-area-inset-top)) {
  .compact-header {
    padding-top: env(safe-area-inset-top);
    height: calc(44px + env(safe-area-inset-top));
  }
  
  .gradient-mask {
    top: calc(44px + env(safe-area-inset-top));
  }
  
  .large-header {
    padding-top: calc(52px + env(safe-area-inset-top));
  }
}
</style>