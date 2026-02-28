<template>
  <Teleport to="body">
    <Transition name="auth">
      <div v-if="visible" class="auth-backdrop" @click="!successMode && dismiss()">
        <div class="auth-card" @click.stop>

          <!-- Success state -->
          <template v-if="successMode">
            <div class="auth-success">
              <div class="auth-success-icon">
                <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                  <circle cx="12" cy="12" r="12" fill="var(--system-green)"/>
                  <path d="M6.5 12.5l4 4 7-8" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="auth-success-title">{{ successMessage }}</p>
            </div>
          </template>

          <template v-else>
            <!-- Segmented control: Logga in / Skapa konto -->
            <div v-if="mode !== 'forgot'" class="auth-segment-wrap">
              <div class="auth-segment">
                <button
                  :class="['seg-btn', { active: mode === 'login' }]"
                  @click="setMode('login')"
                >Logga in</button>
                <button
                  :class="['seg-btn', { active: mode === 'register' }]"
                  @click="setMode('register')"
                >Skapa konto</button>
              </div>
            </div>

            <!-- Forgot password header -->
            <div v-else class="auth-forgot-header">
              <button class="auth-back-btn" @click="setMode('login')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
                Tillbaka
              </button>
              <span class="auth-forgot-title">Glömt lösenord</span>
              <span class="auth-back-spacer"></span>
            </div>

            <!-- Form area -->
            <div class="auth-form">

              <!-- Login / Register -->
              <template v-if="mode !== 'forgot'">
                <div class="auth-input-group">
                  <input
                    v-model="email"
                    type="email"
                    placeholder="E-postadress"
                    class="auth-input"
                    autocomplete="email"
                    @keydown.enter="submit"
                  >
                  <div class="input-sep"></div>
                  <input
                    v-model="password"
                    type="password"
                    placeholder="Lösenord"
                    class="auth-input"
                    :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
                    @keydown.enter="submit"
                  >
                  <template v-if="mode === 'register'">
                    <div class="input-sep"></div>
                    <input
                      v-model="passwordConfirm"
                      type="password"
                      placeholder="Upprepa lösenord"
                      class="auth-input"
                      autocomplete="new-password"
                      @keydown.enter="submit"
                    >
                  </template>
                </div>

                <p v-if="authStore.error || localError" class="auth-error">{{ authStore.error || localError }}</p>

                <button class="auth-submit-btn" :disabled="authStore.loading" @click="submit">
                  <span v-if="authStore.loading" class="spinner"></span>
                  <span v-else>{{ mode === 'login' ? 'Logga in' : 'Skapa konto' }}</span>
                </button>

                <button v-if="mode === 'login'" class="auth-forgot-link" @click="setMode('forgot')">
                  Glömt lösenord?
                </button>
              </template>

              <!-- Forgot password -->
              <template v-else>
                <template v-if="!resetSent">
                  <p class="auth-hint">Ange din e-postadress så skickar vi en återställningslänk.</p>
                  <div class="auth-input-group">
                    <input
                      v-model="email"
                      type="email"
                      placeholder="E-postadress"
                      class="auth-input"
                      autocomplete="email"
                      @keydown.enter="submitReset"
                    >
                  </div>
                  <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>
                  <button class="auth-submit-btn" :disabled="authStore.loading" @click="submitReset">
                    <span v-if="authStore.loading" class="spinner"></span>
                    <span v-else>Skicka återställningslänk</span>
                  </button>
                </template>
                <template v-else>
                  <p class="auth-hint auth-hint--success">Länk skickad till {{ email }}. Kolla din inkorg.</p>
                </template>
              </template>

            </div>

            <!-- Cancel -->
            <div class="auth-cancel-row">
              <button class="auth-cancel-btn" @click="dismiss">Avbryt</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBudgetStore } from '../stores/budget'

const authStore = useAuthStore()
const store = useBudgetStore()

const visible = ref(false)
const mode = ref('login')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const localError = ref('')
const resetSent = ref(false)
const successMode = ref(false)
const successMessage = ref('')
let resolveFn = null

function setMode(m) {
  mode.value = m
  authStore.error = null
  localError.value = ''
  resetSent.value = false
}

function show() {
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  localError.value = ''
  authStore.error = null
  mode.value = 'login'
  resetSent.value = false
  successMode.value = false
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

  const isRegister = mode.value === 'register'
  await handleCloudSync()

  successMessage.value = isRegister ? 'Konto skapat!' : 'Inloggad!'
  successMode.value = true

  setTimeout(() => {
    visible.value = false
    successMode.value = false
    resolveFn?.(true)
  }, 1200)
}

async function handleCloudSync() {
  const result = await store.loadFromCloud()

  if (result === null) {
    // No cloud data yet — upload whatever is local
    await store.syncToCloud()
    authStore.setLastSynced()
    return
  }

  // Save pre-login local snapshot so logout can restore it
  const localSnapshot = localStorage.getItem('budgetApp')
  localStorage.setItem('budgetApp-pre-login', localSnapshot ?? '')

  // Cloud has data — always load it, no questions asked
  store.$patch(result.payload)
  authStore.setLastSynced()
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
/* ── Backdrop ─────────────────────────────────────────────── */
.auth-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ── Card ─────────────────────────────────────────────────── */
.auth-card {
  width: 100%;
  max-width: 360px;
  background: var(--card-bg);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
}

/* ── Success state ────────────────────────────────────────── */
.auth-success {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.auth-success-icon {
  animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.auth-success-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--system-green);
  letter-spacing: -0.3px;
}

@keyframes successPop {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* ── Segmented control ────────────────────────────────────── */
.auth-segment-wrap {
  padding: 16px 16px 0;
}

.auth-segment {
  display: flex;
  background: var(--system-gray5, rgba(120,120,128,0.18));
  border-radius: 10px;
  padding: 2px;
  gap: 2px;
}

.seg-btn {
  flex: 1;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.seg-btn.active {
  background: var(--card-bg);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 0.5px 1px rgba(0,0,0,0.08);
}

/* ── Forgot password header ───────────────────────────────── */
.auth-forgot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 0;
}

.auth-back-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
  -webkit-tap-highlight-color: transparent;
}

.auth-forgot-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.auth-back-spacer {
  width: 80px; /* mirror of back button to center the title */
}

/* ── Form ─────────────────────────────────────────────────── */
.auth-form {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Grouped input card */
.auth-input-group {
  background: var(--system-gray5, rgba(120,120,128,0.18));
  border-radius: 12px;
  overflow: hidden;
}

.auth-input {
  width: 100%;
  padding: 13px 14px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
}

.auth-input::placeholder {
  color: var(--text-tertiary, rgba(60,60,67,0.3));
}

.input-sep {
  height: 0.5px;
  background: var(--separator, rgba(60,60,67,0.18));
  margin: 0 14px;
}

/* Error */
.auth-error {
  margin: 0;
  font-size: 13px;
  color: var(--system-red);
  text-align: center;
  line-height: 1.4;
}

/* Submit button */
.auth-submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 100px;
  background: var(--system-blue);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
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

.auth-submit-btn:active:not(:disabled) {
  opacity: 0.8;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Forgot link */
.auth-forgot-link {
  background: none;
  border: none;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  align-self: center;
}

.auth-forgot-link:active {
  opacity: 0.5;
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

/* ── Cancel row ───────────────────────────────────────────── */
.auth-cancel-row {
  padding: 0 16px 16px;
}

.auth-cancel-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 100px;
  background: var(--system-gray5, rgba(120,120,128,0.18));
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.1s;
}

.auth-cancel-btn:active {
  opacity: 0.7;
}

/* ── Transition ───────────────────────────────────────────── */
.auth-enter-active {
  transition: opacity 0.22s ease;
}
.auth-leave-active {
  transition: opacity 0.18s ease;
}
.auth-enter-active .auth-card {
  animation: authPop 0.3s cubic-bezier(0.34, 1.36, 0.64, 1);
}
.auth-leave-active .auth-card {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.auth-enter-from,
.auth-leave-to {
  opacity: 0;
}
.auth-leave-to .auth-card {
  transform: scale(0.92);
  opacity: 0;
}

@keyframes authPop {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
</style>
