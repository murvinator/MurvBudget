<template>
  <div v-if="store.variableExpenses.length > 0" class="variable-expenses-mini" @click="emit('navigate', 'budget')">
    <div class="variable-mini-header">
      <h3>{{ store.currentMonthName }}</h3>
    </div>
    <div
      v-for="expense in store.variableExpenses"
      :key="expense.name"
      class="variable-mini-item"
    >
      <div class="variable-mini-info">
        <span class="variable-mini-name">{{ expense.name }}</span>
        <span class="variable-mini-amount" :class="{ over: isOver(expense) }">
          {{ fmt(remaining(expense)) }} kr kvar
        </span>
      </div>
      <div class="variable-mini-progress">
        <div
          class="variable-mini-progress-fill"
          :style="{ width: pct(expense) + '%', background: progressColor(expense) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

function getTransactions(expense) {
  return store.variableExpenseTransactions[store.currentMonthKey]?.[expense.name] || []
}

function spent(expense) {
  return getTransactions(expense).reduce((sum, t) => sum + t.amount, 0)
}

function remaining(expense) {
  return expense.budget - spent(expense)
}

function isOver(expense) {
  return spent(expense) > expense.budget
}

function pct(expense) {
  return Math.min((spent(expense) / expense.budget) * 100, 100)
}

function progressColor(expense) {
  const p = pct(expense)
  if (isOver(expense)) return 'var(--system-red)'
  if (p > 80) return 'var(--system-orange)'
  return 'var(--system-green)'
}

function fmt(n) {
  return n.toLocaleString('sv-SE')
}
</script>
