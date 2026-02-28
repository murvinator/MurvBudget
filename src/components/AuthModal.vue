<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="visible" class="auth-backdrop" @click="dismiss">
        <div class="auth-sheet" @click.stop>

          <!-- Mode tabs (hidden in forgot-password mode) -->
          <div v-if="mode !== 'forgot'" class="auth-tabs">
            <button
              :class="['auth-tab', { active: mode === 'login' }]"
              @click="mode = 'login'; authStore.error = null; localError = ''"
            >Logga in</button>
            <button
              :class="['auth-tab', { active: mode === 'register' }]"
              @click="mode = 'register'; authStore.error = null; localError = ''"
            >Skapa konto</button>
          </div>
          <div v-else class="auth-tabs auth-tabs--back">
            <button class="auth-tab-back" @click="mode = 'login'; authStore.error = null; localError = ''; resetSent = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
              Tillbaka
            </button>
            <span class="auth-tab-title">Glömt lösenord</span>
          </div>

          <!-- Login / Register form -->
          <div v-if="mode !== 'forgot'" class="auth-form">
            <input
              v-model="email"
              type="email"
              placeholder="E-postadress"
              class="auth-input"
              autocomplete="email"
              @keydown.enter="submit"
            >
            <input
              v-model="password"
              type="password"
              placeholder="Lösenord"
              class="auth-input"
              autocomplete="current-password"
              @keydown.enter="submit"
            >
            <input
              v-if="mode === 'register'"
              v-model="passwordConfirm"
              type="password"
              placeholder="Upprepa lösenord"
              class="auth-input"
              autocomplete="new-password"
              @keydown.enter="submit"
            >

            <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>
            <p v-if="localError" class="auth-error">{{ localError }}</p>

            <button class="auth-submit-btn" :disabled="authStore.loading" @click="submit">
              <span v-if="authStore.loading" class="spinner"></span>
              <span v-else>{{ mode === 'login' ? 'Logga in' : 'Skapa konto' }}</span>
            </button>

            <button v-if="mode === 'login'" class="auth-forgot-link" @click="mode = 'forgot'; authStore.error = null; localError = ''">
              Glömt lösenord?
            </button>
          </div>

          <!-- Forgot password form -->
          <div v-else class="auth-form">
            <template v-if="!resetSent">
              <p class="auth-hint">Ange din e-postadress så skickar vi en återställningslänk.</p>
              <input
                v-model="email"
                type="email"
                placeholder="E-postadress"
                class="auth-input"
                autocomplete="email"
                @keydown.enter="submitReset"
              >
              <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>
              <button class="auth-submit-btn" :disabled="authStore.loading" @click="submitReset">
                <span v-if="authStore.loading" class="spinner"></span>
                <span v-else>Skicka återställningslänk</span>
              </button>
            </template>
            <template v-else>
              <p class="auth-hint auth-hint--success">Länk skickad till {{ email }}. Kolla din inkorg.</p>
            </template>
          </div>

          <!-- Cancel -->
          <button class="auth-cancel-btn" @click="dismiss">Avbryt</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBudgetStore } from '../stores/budget'

const authStore = useAuthStore()
const store = useBudgetStore()
const confirm = inject('confirm')

const visible = ref(false)
const mode = ref('login')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const localError = ref('')
const resetSent = ref(false)
let resolveFn = null

function show() {
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  localError.value = ''
  authStore.error = null
  mode.value = 'login'
  resetSent.value = false
  visible.value = true
  return new Promise((resolve) => { resolveFn = resolve })
}

function dismiss() {
  visible.value = false
  resolveFn?.(false)
}

async function submit() {
  localError.value = ''
  authStore.error = null

  if (!email.value || !password.value) {
    localError.value = 'Fyll i e-post och lösenord.'
    return
  }
  if (mode.value === 'register' && password.value !== passwordConfirm.value) {
    localError.value = 'Lösenorden matchar inte.'
    return
  }

  let user
  if (mode.value === 'login') {
    user = await authStore.signIn(email.value, password.value)
  } else {
    user = await authStore.signUp(email.value, password.value)
  }

  if (!user) return

  // Conflict check
  await handleConflict()

  visible.value = false
  resolveFn?.(true)
}

async function handleConflict() {
  const result = await store.loadFromCloud()

  if (result === null) {
    // No cloud data yet — push local up
    await store.syncToCloud()
    authStore.setLastSynced()
    return
  }

  const { payload: cloudData, updatedAt: cloudUpdatedAt } = result

  const localIsEmpty =
    store.income.length === 0 &&
    store.expenses.length === 0 &&
    store.categories.length === 0

  if (localIsEmpty) {
    // Local is blank — load cloud silently
    store.$patch(cloudData)
    return
  }

  // Compare timestamps: if we last synced at or after the cloud was written, data is in sync
  const lastSync = localStorage.getItem('murvbudget-last-cloud-sync')
  if (lastSync && new Date(lastSync) >= new Date(cloudUpdatedAt)) {
    // Already in sync — no popup needed
    await store.syncToCloud()
    authStore.setLastSynced()
    return
  }

  // Cloud is genuinely newer than our last sync — ask user
  const answer = await confirm('Nyare molndata hittades', { label: 'Ersätt', style: 'destructive', description: 'Molnet har nyare data. Vill du ersätta lokal data med molndata?' })
  if (answer) {
    store.$patch(cloudData)
  } else {
    await store.syncToCloud()
    authStore.setLastSynced()
  }
}

async function submitReset() {
  localError.value = ''
  if (!email.value) { localError.value = 'Ange din e-postadress.'; return }
  const ok = await authStore.resetPassword(email.value)
  if (ok) resetSent.value = true
}

defineExpose({ show })
</script>

<style scoped>
.auth-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 10px calc(28px + var(--safe-area-bottom, env(safe-area-inset-bottom, 16px)));
}

.auth-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform;
}

/* Tabs */
.auth-tabs {
  display: flex;
  border-bottom: 0.5px solid var(--separator);
}

.auth-tab {
  flex: 1;
  padding: 14px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s, border-color 0.15s;
  border-bottom: 2px solid transparent;
}

.auth-tab.active {
  color: var(--system-blue);
  border-bottom-color: var(--system-blue);
}

/* Form */
.auth-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--separator);
  border-radius: 10px;
  background: var(--bg-secondary, rgba(120, 120, 128, 0.08));
  color: var(--text-primary);
  font-family: inherit;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.auth-input:focus {
  border-color: var(--system-blue);
}

.auth-error {
  margin: 0;
  font-size: 13px;
  color: var(--system-red);
  text-align: center;
  padding: 4px 0;
}

.auth-submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--system-blue);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
}

.auth-submit-btn:disabled {
  opacity: 0.6;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Password requirements */
.auth-password-reqs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 2px;
}

.req {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.2s;
}

.req svg {
  opacity: 0.3;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.req--met {
  color: var(--system-green);
}

.req--met svg {
  opacity: 1;
}

/* Forgot password link */
.auth-forgot-link {
  background: none;
  border: none;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  opacity: 0.85;
}

.auth-forgot-link:active {
  opacity: 0.5;
}

/* Back header for forgot mode */
.auth-tabs--back {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-tab-back {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 14px 16px;
  -webkit-tap-highlight-color: transparent;
}

.auth-tab-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Hint text */
.auth-hint {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
}

.auth-hint--success {
  color: var(--system-green);
  font-weight: 500;
}

/* Cancel */
.auth-cancel-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-top: 0.5px solid var(--separator);
  background: transparent;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  color: var(--system-blue);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s;
}

.auth-cancel-btn:active {
  background: var(--system-gray5);
}

/* Transition */
.sheet-enter-active {
  transition: opacity 0.22s ease;
}
.sheet-leave-active {
  transition: opacity 0.18s ease;
}
.sheet-enter-active .auth-sheet {
  animation: sheetSlideUp 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active .auth-sheet {
  transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-leave-to .auth-sheet {
  transform: translateY(110%);
}

@keyframes sheetSlideUp {
  from { transform: translateY(110%); }
  to   { transform: translateY(0); }
}
</style>
