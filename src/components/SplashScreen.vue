<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="splash-screen">
      <div class="splash-content">
        <div class="splash-icon">
          <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
        <div class="splash-title">Budget</div>
        <div class="splash-sub">MurvBudget</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['done'])
const visible = ref(true)

onMounted(() => {
  setTimeout(() => { visible.value = false }, 950)
  setTimeout(() => { emit('done') }, 1250)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: splashIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.splash-icon {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: linear-gradient(145deg, #007AFF, #5273de);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 40px rgba(0, 122, 255, 0.35);
}

.splash-icon svg {
  width: 46px;
  height: 46px;
}

.splash-title {
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, #007AFF, #5273de);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.splash-sub {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
  margin-top: -8px;
}

@keyframes splashIn {
  from {
    opacity: 0;
    transform: scale(0.82) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.splash-fade-leave-active {
  transition: opacity 0.3s ease;
}
.splash-fade-leave-to {
  opacity: 0;
}
</style>
