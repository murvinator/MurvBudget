<template>
  <nav class="mwn">
    <button
      class="mwn-tab"
      :class="{ active: currentView === 'overview' }"
      @click="emit('navigate', 'overview')"
    >
      <svg class="mwn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
      <span>Översikt</span>
    </button>

    <button
      class="mwn-tab"
      :class="{ active: currentView === 'finans' }"
      @click="emit('navigate', 'finans')"
    >
      <svg class="mwn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/>
      </svg>
      <span>Ekonomi</span>
    </button>

    <button
      class="mwn-tab"
      :class="{ active: currentView === 'monthly' }"
      @click="emit('navigate', 'monthly')"
    >
      <svg class="mwn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/>
      </svg>
      <span>Checklista</span>
    </button>

    <button
      class="mwn-tab"
      :class="{ active: currentView === 'settings' }"
      @click="emit('navigate', 'settings')"
    >
      <svg class="mwn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span>Inställningar</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({ currentView: String })
const emit = defineEmits(['navigate'])
</script>

<style scoped>
.mwn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  display: flex;
  align-items: stretch;
  background: var(--bg-primary);
  border-top: 0.5px solid var(--separator);
  /* Push content above the home indicator */
  padding-bottom: env(safe-area-inset-bottom);
}

.mwn-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 4px 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s;
}

.mwn-tab.active {
  color: var(--system-blue);
}

.mwn-tab.active .mwn-icon {
  stroke-width: 2.5;
}

.mwn-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
</style>
