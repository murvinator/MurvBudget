<template>
  <div class="savings-rate-card">
    <div class="sr-title">Sparkvot</div>
    <div class="sr-ring-wrap">
      <svg viewBox="0 0 100 100" class="sr-svg">
        <!-- Background ring -->
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="var(--separator)"
          stroke-width="10"
        />
        <!-- Foreground ring -->
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          :stroke="ringColor"
          stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="251.3"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 50 50)"
          style="transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), stroke 0.3s"
        />
        <!-- Center label -->
        <text
          x="50" y="54"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="22"
          font-weight="700"
          fill="var(--text-primary)"
        >{{ displayRate }}</text>
      </svg>
    </div>
    <div class="sr-label">{{ srLabel }}</div>
    <div class="sr-amount" :style="{ color: store.remaining < 0 ? 'var(--system-red)' : undefined }">{{ fmt(store.remaining) }} kr</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const rate = computed(() => {
  if (store.totalIncome === 0) return 0
  return Math.max(-999, Math.min(100, Math.round((store.remaining / store.totalIncome) * 100)))
})

const displayRate = computed(() => {
  if (store.totalIncome === 0) return '–'
  return rate.value + '%'
})

const ringColor = computed(() => {
  if (store.totalIncome === 0) return 'var(--system-gray3)'
  if (rate.value > 0) return 'var(--system-green)'
  if (rate.value < 0) return 'var(--system-red)'
  return 'var(--system-gray3)'
})

const srLabel = computed(() => {
  if (store.totalIncome === 0) return 'ingen inkomst'
  if (rate.value < 0) return 'underskott'
  return 'av inkomsten kvar'
})

const dashOffset = computed(() => {
  const clamped = Math.max(0, Math.min(rate.value, 100))
  return 251.3 * (1 - clamped / 100)
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.savings-rate-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.sr-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  align-self: flex-start;
}

.sr-ring-wrap {
  width: 140px;
  height: 140px;
  margin: 8px 0 4px;
}

.sr-svg {
  width: 100%;
  height: 100%;
}

.sr-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.sr-amount {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
