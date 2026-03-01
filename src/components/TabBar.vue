<template>
  <div class="tab-bar">
    <div class="tab-bar-container">
      <div class="tab-group liquidGlass-wrapper">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: currentView === 'overview' }"
          @click="emit('navigate', 'overview')"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
          <span>Översikt</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: currentView === 'monthly' }"
          @click="emit('navigate', 'monthly')"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/>
          </svg>
          <span>Checklista</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: currentView === 'finans' }"
          @click="emit('navigate', 'finans')"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/>
          </svg>
          <span>Ekonomi</span>
        </button>
      </div>

      <button
        type="button"
        class="nav-action-btn liquidGlass-wrapper"
        :class="{ active: currentView === 'settings' }"
        @click="onSettingsClick"
      >
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentView: String,
})

const emit = defineEmits(['navigate'])

function onSettingsClick() {
  emit('navigate', 'settings')
}
</script>

<style scoped>
/* Remove glass distortion from the circular button — keeps the border crisp */
.nav-action-btn :deep(.liquidGlass-effect) {
  filter: none;
}

/* Equal-width tabs so the active indicator pill is the same size for all */
.tab-btn {
  flex: 1 1 0;
}
</style>
