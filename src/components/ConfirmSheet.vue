<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="visible" class="confirm-backdrop" @click="cancel">
        <div class="confirm-sheet" @click.stop>

          <!-- Action group: message + action button -->
          <div class="confirm-group">
            <p v-if="message" class="confirm-message">{{ message }}</p>
            <div v-if="message" class="confirm-sep"></div>
            <button
              class="confirm-btn"
              :class="btnStyle === 'primary' ? 'confirm-btn--primary' : 'confirm-btn--destructive'"
              @click="doConfirm"
            >{{ btnLabel }}</button>
          </div>

          <!-- Cancel — separate card, per iOS HIG -->
          <div class="confirm-group confirm-group--cancel">
            <button class="confirm-btn confirm-btn--cancel" @click="cancel">Avbryt</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const btnLabel = ref('Ta bort')
const btnStyle = ref('destructive')
let resolveFn = null

function show(msg, opts = {}) {
  message.value = msg || ''
  btnLabel.value = opts.label || 'Ta bort'
  btnStyle.value = opts.style || 'destructive'
  visible.value = true
  return new Promise((resolve) => { resolveFn = resolve })
}

function doConfirm() {
  visible.value = false
  resolveFn?.(true)
}

function cancel() {
  visible.value = false
  resolveFn?.(false)
}

defineExpose({ show })
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 10px calc(28px + var(--safe-area-bottom, env(safe-area-inset-bottom, 16px)));
}

.confirm-sheet {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  will-change: transform;
}

.confirm-group {
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg);
}

.confirm-message {
  margin: 0;
  padding: 16px 16px 14px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.45;
  letter-spacing: -0.08px;
}

.confirm-sep {
  height: 0.5px;
  background: var(--separator);
  margin: 0;
}

.confirm-btn {
  display: block;
  width: 100%;
  padding: 17px 16px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 17px;
  letter-spacing: -0.2px;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s ease;
}

.confirm-btn:active {
  background: var(--system-gray5);
}

.confirm-btn--destructive {
  color: var(--system-red);
  font-weight: 400;
}

.confirm-btn--primary {
  color: var(--system-blue);
  font-weight: 600;
}

.confirm-btn--cancel {
  color: var(--system-blue);
  font-weight: 600;
}

/* ── Transition ───────────────────────────────────────────── */
.sheet-enter-active {
  transition: opacity 0.22s ease;
}
.sheet-leave-active {
  transition: opacity 0.18s ease;
}
.sheet-enter-active .confirm-sheet {
  animation: sheetSlideUp 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active .confirm-sheet {
  transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-leave-to .confirm-sheet {
  transform: translateY(110%);
}

@keyframes sheetSlideUp {
  from { transform: translateY(110%); }
  to   { transform: translateY(0); }
}
</style>
