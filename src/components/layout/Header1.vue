<template>
  <div class="header-wrapper">
    <div class="header" :class="{ small: isSmall }">
    
      <div class="header-content">
            <!-- Spacer to prevent content from going under the header initially -->
    <div class="header-spacer" :style="{ height: `${headerHeight}px` }"></div>
        <h1
          v-show="!isSmall"
          class="big-title"
          :style="{ opacity: bigTitleOpacity }"
        >
          MurvBudget
        </h1>

        <h1 
          v-show="isSmall" 
          class="small-title"
          :style="{ opacity: smallTitleOpacity }"
        >
          MurvBudget
        </h1>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

const scrollY = ref(0);
const isSmall = ref(false);

// The large header height
const largeHeaderHeight = 96; // Approximate iOS large header height
const smallHeaderHeight = 44; // iOS small header height
const transitionStart = 40; // When to start the transition
const transitionEnd = largeHeaderHeight - smallHeaderHeight; // When transition completes

const headerHeight = computed(() => {
  if (scrollY.value <= transitionStart) {
    return largeHeaderHeight;
  } else if (scrollY.value >= transitionEnd) {
    return smallHeaderHeight;
  } else {
    // Smooth transition between large and small
    console.log("Transitioning header height" + headerHeight.value);
    
    const progress = (scrollY.value - transitionStart) / (transitionEnd - transitionStart);
    console.log("PROGRESS: " + progress.value);
    return largeHeaderHeight - (largeHeaderHeight - smallHeaderHeight) * progress;
  }
});

const bigTitleOpacity = computed(() => {
  if (scrollY.value <= transitionStart) {
    return 1;
  } else if (scrollY.value >= transitionEnd) {
    return 0;
  } else {
    const progress = (scrollY.value - transitionStart) / (transitionEnd - transitionStart);
    return 1 - progress;
  }
});

const smallTitleOpacity = computed(() => {
  if (scrollY.value <= transitionStart) {
    return 0;
  } else if (scrollY.value >= transitionEnd) {
    return 1;
  } else {
    const progress = (scrollY.value - transitionStart) / (transitionEnd - transitionStart);
    return progress;
  }
});

function onScroll() {
  scrollY.value = window.scrollY;
  if (scrollY.value > transitionEnd) {
   headerHeight.value-scrollY.value;
  }



  isSmall.value = scrollY.value > transitionEnd;
  console.log("ScrollY:", scrollY.value, "isSmall:", isSmall.value);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
.header-wrapper {
  position: relative;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 96px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 9999;
  transition: height 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: flex-end;
  padding: 0px 20px 8px;
}

.header.small {
  height: 44px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  position: relative;
  width: 100%;
}

.big-title {
  font-size: 34px;
  font-weight: 700;
  margin: 0;
  transition: opacity 0.2s ease;
  letter-spacing: -0.5px;
}

.small-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.41px;
  margin: 0;
  text-align: center;
  transition: opacity 0.2s ease;
}

.header-spacer {
  transition: height 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .header.small {
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* Add safe area support for iOS */
@supports (padding-top: env(safe-area-inset-top)) {
  .header {
    padding-top: env(safe-area-inset-top);
  }
}
</style>