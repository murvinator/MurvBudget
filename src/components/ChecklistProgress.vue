<template>
  <div class="checklist-progress-card" @click="emit('navigate', 'monthly')">
    <div class="cp-header">
      <span class="cp-title">Checklista</span>
      <span class="cp-month">{{ store.currentMonthName }}</span>
    </div>
    <div class="cp-stats">
      <span class="cp-count">{{ paidCount }} av {{ totalCount }} betalt</span>
      <span class="cp-amounts">{{ fmt(paidAmount) }} / {{ fmt(totalAmount) }} kr</span>
    </div>
    <div class="cp-bar-track">
      <div class="cp-bar-fill" :style="{ width: pct + '%', background: progressColor }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

const paidCount = computed(() => {
  const status = store.monthlyStatus['current'] || {}
  return store.expenses.filter((_, idx) => status[idx]).length
})

const totalCount = computed(() => store.expenses.length)

const totalAmount = computed(() => store.expenses.reduce((s, e) => s + e.amount, 0))

const paidAmount = computed(() => {
  const status = store.monthlyStatus['current'] || {}
  return store.expenses.reduce((s, e, idx) => s + (status[idx] ? e.amount : 0), 0)
})

const pct = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.min((paidAmount.value / totalAmount.value) * 100, 100)
})

const progressColor = computed(() => {
  if (pct.value === 100) return 'var(--system-green)'
  if (pct.value > 0)     return 'var(--system-orange)'
  return 'var(--system-gray3)'
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.checklist-progress-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.checklist-progress-card:active {
  opacity: 0.7;
}

.cp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cp-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.cp-month {
  font-size: 14px;
  color: var(--text-secondary);
}

.cp-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cp-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.cp-amounts {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.cp-bar-track {
  height: 6px;
  background: var(--separator);
  border-radius: 999px;
  overflow: hidden;
}

.cp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
