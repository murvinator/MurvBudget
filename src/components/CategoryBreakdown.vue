<template>
  <div class="category-breakdown-card">
    <div class="cb-title">Kategorier</div>
    <template v-if="categories.length > 0">
      <div v-for="cat in categories" :key="cat.name" class="cb-row">
        <div class="cb-row-header">
          <span class="cb-name">{{ cat.name }}</span>
          <span class="cb-amount">{{ fmt(cat.total) }} kr</span>
        </div>
        <div class="cb-bar-track">
          <div class="cb-bar-fill" :style="{ width: cat.pct + '%', background: cat.color }"></div>
        </div>
      </div>
    </template>
    <p v-else class="cb-empty">Inga utgifter registrerade</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const COLORS = [
  'var(--system-blue)',
  'var(--system-orange)',
  'var(--system-green)',
  'var(--system-purple)',
  'var(--system-red)',
  'var(--system-teal)',
  'var(--system-indigo)',
  'var(--system-pink)',
]

const categories = computed(() => {
  const grandTotal = store.expenses.reduce((s, e) => s + e.amount, 0)
  return store.categories
    .map((name, i) => {
      const total = store.expenses
        .filter(e => e.category === name)
        .reduce((s, e) => s + e.amount, 0)
      return {
        name,
        total,
        pct: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        color: COLORS[i % COLORS.length],
      }
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.category-breakdown-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.cb-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.cb-row {
  margin-bottom: 12px;
}

.cb-row:last-child {
  margin-bottom: 0;
}

.cb-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.cb-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.cb-amount {
  font-size: 14px;
  color: var(--text-secondary);
}

.cb-bar-track {
  height: 6px;
  background: var(--separator);
  border-radius: 999px;
  overflow: hidden;
}

.cb-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cb-empty {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
