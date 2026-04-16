<template>
  <Transition name="onboarding">
    <div v-if="visible" class="onboarding-root">
      <!-- Centered content -->
      <div class="onboarding-scroll">
        <div class="onboarding-content">
          <div class="onboarding-header">
            <div class="onboarding-icon">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <h1 class="onboarding-title">{{ props.isRestart ? 'Välkommen tillbaka' : 'MurvBudget' }}</h1>
            <p class="onboarding-sub">{{ props.isRestart ? 'Välj hur du vill lagra din data' : 'Din personliga budgetapp' }}</p>
          </div>

          <!-- Cloud option -->
          <div class="choice-card choice-card--cloud" @click="pickCloud">
            <div class="choice-icon-wrap choice-icon-wrap--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" width="26" height="26">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            </div>
            <div class="choice-body">
              <p class="choice-title">Logga in eller skapa konto</p>
              <p class="choice-desc">Din budget synkas automatiskt i molnet. Kom åt den från alla dina enheter och förlora aldrig din data.</p>
            </div>
            <svg class="choice-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <!-- Local option -->
          <div class="choice-card" @click="pickLocal">
            <div class="choice-icon-wrap choice-icon-wrap--gray">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" width="26" height="26">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>
            <div class="choice-body">
              <p class="choice-title">Fortsätt utan konto</p>
              <p class="choice-desc">All data sparas lokalt på den här enheten. Exportera filer för backup eller vid byte av enhet.</p>
            </div>
            <svg class="choice-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <AuthModal ref="authModalRef" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, inject } from 'vue'
import AuthModal from './AuthModal.vue'

const STORAGE_KEY = 'murvbudget-onboarding'

const props = defineProps({
  isRestart: { type: Boolean, default: false }
})

const emit = defineEmits(['done', 'startWizard'])

const suppressOnboardingClose = inject('suppressOnboardingClose')
const visible = ref(true)
const authModalRef = ref(null)

function closeScreen() {
  visible.value = false
  emit('done')
}

async function pickCloud() {
  suppressOnboardingClose.value = true
  const result = await authModalRef.value?.show()
  suppressOnboardingClose.value = false

  if (result?.success) {
    localStorage.setItem(STORAGE_KEY, 'never')
    if (result.isNewUser) {
      visible.value = false
      emit('startWizard')
    } else {
      visible.value = false
      emit('done')
    }
  }
}

function pickLocal() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  visible.value = false
  emit('startWizard')
}
</script>

<style scoped>
.onboarding-root {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: var(--bg-primary, #f2f2f7);
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top, 20px);
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

@media (prefers-color-scheme: dark) {
  .onboarding-root { background: #000; }
}

/* ── Centered scroll area ──────────────────────────────────────────────────── */
.onboarding-scroll {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px 20px;
}

.onboarding-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.onboarding-header {
  text-align: center;
  padding: 8px 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.onboarding-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(145deg, #007AFF, #5273de);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 36px rgba(0, 122, 255, 0.38);
}
.onboarding-icon svg { width: 42px; height: 42px; }

.onboarding-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.6px;
  line-height: 1.22;
  color: var(--text-primary);
  margin: 0;
}

.onboarding-sub {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Choice cards ──────────────────────────────────────────────────────────── */
.choice-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.choice-card:active {
  transform: scale(0.984);
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}

.choice-icon-wrap {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.choice-icon-wrap--blue {
  background: linear-gradient(145deg, #007AFF, #5856D6);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}
.choice-icon-wrap--gray {
  background: linear-gradient(145deg, #636366, #48484a);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}

.choice-body { flex: 1; min-width: 0; }
.choice-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
  letter-spacing: -0.2px;
}
.choice-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}
.choice-chevron {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.onboarding-leave-active {
  transition: opacity 0.25s ease, transform 0.28s cubic-bezier(0.4, 0, 1, 1);
}
.onboarding-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
