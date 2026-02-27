<template>
  <div class="savings-rate-card">
    <div class="savings-rate-inner">
      <div class="savings-rate-left">
        <div class="savings-rate-pct">{{ rateDisplay }}</div>
        <div class="savings-rate-label">Sparkvot</div>
        <div class="savings-rate-sub">{{ fmt(store.remaining) }} kr kvar av {{ fmt(store.totalIncome) }} kr</div>
      </div>
      <div class="savings-rate-bar-wrap">
        <div class="savings-rate-bar">
          <div class="savings-rate-fill" :style="fillStyle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const rate = computed(() => {
  if (!store.totalIncome) return null
  return Math.round((store.remaining / store.totalIncome) * 100)
})

const rateDisplay = computed(() => rate.value === null ? '--' : `${rate.value}%`)

const fillStyle = computed(() => {
  const r = rate.value
  if (r === null) return { width: '0%', background: 'var(--system-gray3)' }
  const pct = Math.max(0, Math.min(100, r))
  const color = r > 20 ? 'var(--system-green)' : r >= 10 ? 'var(--system-orange)' : 'var(--system-red)'
  return { width: `${pct}%`, background: color }
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.savings-rate-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 0.5px solid var(--separator);
}

.savings-rate-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.savings-rate-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.savings-rate-pct {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--text-primary);
  line-height: 1;
}

.savings-rate-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.savings-rate-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.savings-rate-bar-wrap {
  width: 100%;
}

.savings-rate-bar {
  height: 6px;
  background: var(--system-gray4);
  border-radius: 999px;
  overflow: hidden;
}

.savings-rate-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@media (prefers-color-scheme: dark) {
  .savings-rate-bar {
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
