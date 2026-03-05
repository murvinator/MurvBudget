<template>
  <div class="desktop-nav liquidGlass-wrapper">
    <div class="liquidGlass-effect"></div>
    <div class="liquidGlass-tint"></div>
    <div class="liquidGlass-shine"></div>

    <div class="desktop-nav-inner">
      <!-- Logo -->
      <div class="desktop-nav-logo">
        <img :src="iconUrl" alt="MurvBudget" @error="iconHidden = true" v-show="!iconHidden" />
        <span>MurvBudget</span>
      </div>

      <!-- Tabs -->
      <div class="desktop-nav-tabs">
        <button
          class="desktop-nav-tab"
          :class="{ active: currentView === 'overview' }"
          @click="emit('navigate', 'overview')"
        >
          <svg class="dnt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
          Översikt
        </button>
        <button
          class="desktop-nav-tab"
          :class="{ active: currentView === 'finans' }"
          @click="emit('navigate', 'finans')"
        >
          <svg class="dnt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/>
          </svg>
          Ekonomi
        </button>
        <button
          class="desktop-nav-tab"
          :class="{ active: currentView === 'monthly' }"
          @click="emit('navigate', 'monthly')"
        >
          <svg class="dnt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/>
          </svg>
          Checklista
        </button>
      </div>

      <!-- Settings gear -->
      <div class="desktop-nav-actions">
        <button
          class="desktop-nav-gear"
          :class="{ active: currentView === 'settings' }"
          @click="emit('navigate', 'settings')"
          title="Inställningar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ currentView: String })
const emit = defineEmits(['navigate'])

const iconUrl = '/icons/icon-192.png'
const iconHidden = ref(false)
</script>

<style scoped>
.desktop-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  height: 60px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0;
}

.desktop-nav .liquidGlass-tint {
  background: rgba(255, 255, 255, 0.85);
}

@media (prefers-color-scheme: dark) {
  .desktop-nav .liquidGlass-tint {
    background: rgba(20, 20, 20, 0.88);
  }
  .desktop-nav {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
}

.desktop-nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}

.desktop-nav-logo {
  font-weight: 700;
  font-size: 17px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  white-space: nowrap;
}

.desktop-nav-logo img {
  width: 28px;
  height: 28px;
  border-radius: 7px;
}

.desktop-nav-tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.desktop-nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s, background 0.15s;
}

.desktop-nav-tab:hover {
  background: rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .desktop-nav-tab:hover {
    background: rgba(255, 255, 255, 0.07);
  }
}

.desktop-nav-tab.active {
  color: var(--system-blue);
  background: rgba(0, 122, 255, 0.1);
}

.dnt-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.desktop-nav-actions {
  flex: 0 0 auto;
}

.desktop-nav-gear {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s, background 0.15s;
}

.desktop-nav-gear:hover {
  background: rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .desktop-nav-gear:hover {
    background: rgba(255, 255, 255, 0.07);
  }
}

.desktop-nav-gear.active {
  color: var(--system-blue);
}

.desktop-nav-gear svg {
  width: 20px;
  height: 20px;
}
</style>
