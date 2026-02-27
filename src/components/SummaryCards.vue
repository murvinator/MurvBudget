<template>
  <div :class="['summary-cards', sizeClass]">
    <div class="summary-card" :style="cardStyle(0)">
      <h4>Inkomst</h4>
      <div class="amount">{{ fmt(displayIncome) }} kr</div>
    </div>
    <div class="summary-card" :style="cardStyle(1)">
      <h4>Utgifter</h4>
      <div class="amount">{{ fmt(displayExpenses) }} kr</div>
    </div>
    <div class="summary-card" :style="cardStyle(2)">
      <h4>Kvar</h4>
      <div class="amount">{{ fmt(displayRemaining) }} kr</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const sizeClass = computed(() => {
  const s = store.overviewSettings?.summaryStyle || 'default'
  return s !== 'default' ? `summary-cards--${s}` : ''
})

const displayIncome = ref(0)
const displayExpenses = ref(0)
const displayRemaining = ref(0)

const GRADIENTS = {
  'blue':        'linear-gradient(135deg, #007AFF, #007AFF)',
  'blue-purple': 'linear-gradient(135deg, #007AFF, #AF52DE)',
  'orange-pink': 'linear-gradient(135deg, #FF9500, #FF2D92)',
  'green-teal':  'linear-gradient(135deg, #34C759, #5AC8FA)',
  'red-orange':  'linear-gradient(135deg, #FF3B30, #FF9500)',
  'indigo-blue': 'linear-gradient(135deg, #5856D6, #007AFF)',
  'pink-red':    'linear-gradient(135deg, #FF2D92, #FF3B30)',
}

const DEFAULT_COLORS = ['blue-purple', 'orange-pink', 'green-teal']

function cardStyle(index) {
  const colors = store.overviewSettings?.cardColors || DEFAULT_COLORS
  const key = colors[index] || DEFAULT_COLORS[index]
  if (key === 'neutral') {
    return {
      background: 'var(--card-bg)',
      color: 'var(--text-primary)',
      border: '1px solid var(--separator)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }
  }
  return { background: GRADIENTS[key] || GRADIENTS['blue-purple'] }
}

function animateCount(target, setter, duration = 700) {
  const start = performance.now()
  function step(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(step)
    else setter(target)
  }
  requestAnimationFrame(step)
}

function fmt(n) {
  return n.toLocaleString('sv-SE')
}

onMounted(() => {
  animateCount(store.totalIncome,    (v) => (displayIncome.value = v))
  animateCount(store.totalExpenses,  (v) => (displayExpenses.value = v))
  animateCount(store.remaining,      (v) => (displayRemaining.value = v))
})
</script>
