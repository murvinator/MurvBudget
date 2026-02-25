<template>
  <div class="ios-view-wrapper">
    
    <header class="ios-sticky-header">
      <div class="header-background" :style="{ opacity: bgOpacity }"></div>

      <div class="header-content">
        <div class="header-left">
          <slot name="header-left"></slot>
        </div>

        <div 
          class="header-title-small"
          :class="{ 'is-visible': showSmallTitle }"
        >
          {{ title }}
        </div>

        <div class="header-right">
          <slot name="header-right"></slot>
        </div>
      </div>
    </header>

    <main class="ios-scroll-container" ref="scrollContainerRef" @scroll="handleScroll">
      
      <div class="large-header-placeholder">
        <h1 
          class="large-title" 
          :style="{ 
            opacity: largeTitleOpacity, 
            transform: `scale(${largeTitleScale})` 
          }"
        >
          {{ title }}
        </h1>
      </div>

      <div class="page-content">
        <slot></slot>
      </div>
      
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Rubrik' }
})

const scrollContainerRef = ref(null)
const scrollY = ref(0)

const TRIGGER_POINT = 40
const FADE_SPEED = 15

const handleScroll = (e) => {
  scrollY.value = e.target.scrollTop
}

const bgOpacity = computed(() => Math.min(scrollY.value / TRIGGER_POINT, 1))

const largeTitleOpacity = computed(() => {
  const startFade = TRIGGER_POINT - FADE_SPEED
  if (scrollY.value < startFade) return 1
  const opacity = 1 - ((scrollY.value - startFade) / FADE_SPEED)
  return Math.max(0, opacity)
})

const largeTitleScale = computed(() => {
  if (scrollY.value < 0) return 1 + Math.abs(scrollY.value) / 300
  return 1
})

const showSmallTitle = computed(() => scrollY.value > (TRIGGER_POINT - 5))
</script>

<style scoped>
/* --- 1. VIEWPORT LOCK --- */
.ios-view-wrapper {
  position: fixed; /* Låser fast komponenten i skärmen */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #F2F2F7;
  overflow: hidden; /* Ingen scroll på wrappern, bara inuti containern */
  z-index: 1;
}

/* --- 2. HEADER STYLING --- */
.ios-sticky-header {
  position: absolute;
  top: 0; left: 0; right: 0;
  /* Dynamisk höjd: Statusbar (safe-area) + Navbar (44px) */
  height: calc(env(safe-area-inset-top));
  z-index: 100; /* Alltid överst */
  pointer-events: none;
  
  /* Fallback om env inte stöds (t.ex. test i desktop browser) */
  min-height: 88px; 
}

.header-background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(242, 242, 247, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
  will-change: opacity;
}

.header-content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 44px; /* Standard iOS navbar höjd */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  pointer-events: auto;
}

.header-left, .header-right {
  position: absolute;
  bottom: 0;
  height: 44px;
  display: flex;
  align-items: center;
  z-index: 101;
}
.header-left { left: 16px; }
.header-right { right: 16px; }

.header-title-small {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #000;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  /* margin-top: -90px; */
}
.header-title-small.is-visible {
  opacity: 1;
  transform: translateY(0);
  /* margin-top: -90px; */
}

/* --- 3. SCROLL CONTAINER --- */
.ios-scroll-container {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* Native momentum scroll */
  
  /* Padding top måste matcha headerns höjd exakt */
  padding-top: calc(env(safe-area-inset-top) + 44px);
  
  /* Om env inte funkar i browsern, använd fallback */
  padding-top: max(calc(env(safe-area-inset-top) + 44px), 88px);
}

.ios-scroll-container::-webkit-scrollbar {
  display: none;
}

.large-header-placeholder {
  padding: 0 20px 10px 20px;
  min-height: 50px;
  display: flex;
  align-items: flex-end;
}

.large-title {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.35px;
  color: #000;
  will-change: opacity, transform;
}


</style>