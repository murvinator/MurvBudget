<template>
  <Teleport to="body">
    <Transition name="alert">
      <div v-if="visible" class="alert-backdrop" @click="cancel">
        <div class="alert-card" @click.stop>

          <div class="alert-body">
            <p class="alert-title">{{ title }}</p>
            <p v-if="description" class="alert-description">{{ description }}</p>
          </div>

          <div class="alert-separator"></div>

          <div class="alert-actions">
            <button class="alert-btn alert-btn--secondary" @click="cancel">Avbryt</button>
            <button
              class="alert-btn"
              :class="btnStyle === 'destructive' ? 'alert-btn--destructive' : 'alert-btn--primary'"
              @click="doConfirm"
            >{{ btnLabel }}</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const description = ref('')
const btnLabel = ref('Ta bort')
const btnStyle = ref('destructive')
let resolveFn = null

function show(msg, opts = {}) {
  if (opts.title) {
    title.value = opts.title
    description.value = msg || ''
  } else {
    title.value = msg || ''
    description.value = opts.description || ''
  }
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
.alert-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.alert-card {
  width: 100%;
  max-width: 340px;
  background: var(--card-bg, #f2f2f7);
  border-radius: 24px;
  overflow: hidden;
  will-change: transform, opacity;
}

.alert-body {
  padding: 22px 20px 18px;
}

.alert-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.35;
}

.alert-description {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.45;
  letter-spacing: -0.08px;
}

.alert-separator {
  height: 0.5px;
  background: var(--separator, rgba(0,0,0,0.15));
}

.alert-actions {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  background: var(--card-bg, #f2f2f7);
}

.alert-btn {
  flex: 1;
  padding: 13px 10px;
  border: none;
  border-radius: 100px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.1s ease;
}

.alert-btn:active {
  opacity: 0.75;
}

.alert-btn--secondary {
  background: var(--system-gray5, rgba(120,120,128,0.18));
  color: var(--text-primary);
}

.alert-btn--primary {
  background: var(--system-blue, #007aff);
  color: #fff;
}

.alert-btn--destructive {
  background: var(--system-red, #ff3b30);
  color: #fff;
}

/* ── Transition ───────────────────────────────────────────── */
.alert-enter-active {
  transition: opacity 0.2s ease;
}
.alert-leave-active {
  transition: opacity 0.15s ease;
}
.alert-enter-active .alert-card {
  animation: alertPop 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
}
.alert-leave-active .alert-card {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
}
.alert-leave-to .alert-card {
  transform: scale(0.9);
  opacity: 0;
}

@keyframes alertPop {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
</style>
