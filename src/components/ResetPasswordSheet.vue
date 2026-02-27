<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="authStore.needsPasswordReset" class="reset-backdrop">
        <div class="reset-sheet">
          <div class="reset-header">
            <h3>Nytt lösenord</h3>
            <p>Välj ett nytt lösenord för ditt konto.</p>
          </div>

          <div class="reset-form">
            <input
              v-model="password"
              type="password"
              placeholder="Nytt lösenord"
              class="reset-input"
              autocomplete="new-password"
              @keydown.enter="submit"
            >
            <input
              v-model="passwordConfirm"
              type="password"
              placeholder="Upprepa lösenord"
              class="reset-input"
              autocomplete="new-password"
              @keydown.enter="submit"
            >

            <p v-if="authStore.error" class="reset-error">{{ authStore.error }}</p>
            <p v-if="localError" class="reset-error">{{ localError }}</p>
            <p v-if="success" class="reset-success">Lösenordet är uppdaterat!</p>

            <button class="reset-submit-btn" :disabled="authStore.loading || success" @click="submit">
              <span v-if="authStore.loading" class="spinner"></span>
              <span v-else>Spara lösenord</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const password = ref('')
const passwordConfirm = ref('')
const localError = ref('')
const success = ref(false)

async function submit() {
  localError.value = ''
  authStore.error = null

  if (password.value.length < 6) {
    localError.value = 'Lösenordet måste vara minst 6 tecken.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    localError.value = 'Lösenorden matchar inte.'
    return
  }

  const ok = await authStore.updatePassword(password.value)
  if (ok) {
    success.value = true
    setTimeout(() => {
      success.value = false
      password.value = ''
      passwordConfirm.value = ''
    }, 1500)
  }
}
</script>

<style scoped>
.reset-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 10px calc(28px + var(--safe-area-bottom, env(safe-area-inset-bottom, 16px)));
}

.reset-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  will-change: transform;
}

.reset-header {
  padding: 20px 16px 4px;
  text-align: center;
  border-bottom: 0.5px solid var(--separator);
}

.reset-header h3 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.reset-header p {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.reset-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reset-input {
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

.reset-input:focus {
  border-color: var(--system-blue);
}

.reset-error {
  margin: 0;
  font-size: 13px;
  color: var(--system-red);
  text-align: center;
}

.reset-success {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--system-green);
  text-align: center;
}

.reset-submit-btn {
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
  transition: opacity 0.15s;
}

.reset-submit-btn:disabled {
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

/* Transition — same as ConfirmSheet */
.sheet-enter-active { transition: opacity 0.22s ease; }
.sheet-leave-active { transition: opacity 0.18s ease; }
.sheet-enter-active .reset-sheet { animation: sheetSlideUp 0.36s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active .reset-sheet { transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-leave-to .reset-sheet { transform: translateY(110%); }

@keyframes sheetSlideUp {
  from { transform: translateY(110%); }
  to   { transform: translateY(0); }
}
</style>
