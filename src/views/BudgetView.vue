<template>
  <div>
    <!-- Summary card -->
    <div class="budget-summary-card">
      <div class="budget-summary-header">
        <div class="month-display">{{ store.currentMonthName }}</div>
      </div>
      <div class="budget-summary-stats">
        <div class="budget-stat">
          <span class="budget-stat-label">Budget</span>
          <span class="budget-stat-value">{{ fmt(totalBudget) }} kr</span>
        </div>
        <div class="budget-stat">
          <span class="budget-stat-label">Använt</span>
          <span class="budget-stat-value">{{ fmt(totalSpent) }} kr</span>
        </div>
        <div class="budget-stat">
          <span class="budget-stat-label">Kvar</span>
          <span class="budget-stat-value" :class="totalSpent > totalBudget ? 'over-budget' : ''">
            {{ fmt(totalBudget - totalSpent) }} kr
          </span>
        </div>
      </div>
      <div class="budget-progress-bar">
        <div
          class="budget-progress-fill"
          :style="{ width: totalProgressPct + '%', background: totalProgressColor }"
        ></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.variableExpenses.length === 0" class="empty-state">
      <p>Inga varierande utgifter än.</p>
      <p class="empty-state-hint">Lägg till kategorier i Inställningar</p>
    </div>

    <!-- Expense cards -->
    <div
      v-for="(expense, idx) in store.variableExpenses"
      :key="expense.name"
      class="variable-expense-card"
    >
      <div class="variable-expense-header">
        <h3>{{ expense.name }}</h3>
        <button class="add-expense-btn" @click="showAddPrompt(idx)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="variable-expense-stats">
        <div class="stat-row">
          <span class="stat-label">Budget</span>
          <span class="stat-value">{{ fmt(expense.budget) }} kr</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Använt</span>
          <span class="stat-value spent">{{ fmt(getSpent(expense)) }} kr</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Kvar</span>
          <span class="stat-value" :class="isOver(expense) ? 'over-budget' : 'remaining'">
            {{ fmt(expense.budget - getSpent(expense)) }} kr
          </span>
        </div>
      </div>

      <div class="variable-progress-bar">
        <div
          class="variable-progress-fill"
          :style="{ width: getPct(expense) + '%', background: getProgressColor(expense) }"
        ></div>
      </div>

      <!-- Transactions toggle -->
      <template v-if="getTransactions(expense).length > 0">
        <div class="transactions-toggle" @click="toggleOpen(idx)">
          <span>Transaktioner ({{ getTransactions(expense).length }})</span>
          <svg
            class="chevron"
            :style="{ transform: openCards[idx] ? 'rotate(180deg)' : 'rotate(0deg)' }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <div v-show="openCards[idx]" class="transactions-list">
          <div
            v-for="(t, ti) in [...getTransactions(expense)].reverse()"
            :key="ti"
            class="transaction-item"
          >
            <div class="transaction-info">
              <span class="transaction-note">{{ t.note || 'Utgift' }}</span>
              <span class="transaction-date">{{ formatDate(t.date) }}</span>
            </div>
            <div class="transaction-amount">{{ fmt(t.amount) }} kr</div>
            <button
              class="delete-transaction-btn"
              @click="deleteTransaction(idx, getTransactions(expense).length - 1 - ti)"
            >×</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const openCards = reactive({})

const totalBudget = computed(() =>
  store.variableExpenses.reduce((sum, e) => sum + e.budget, 0)
)

const totalSpent = computed(() => {
  const monthKey = store.currentMonthKey
  let spent = 0
  store.variableExpenses.forEach((e) => {
    const txns = store.variableExpenseTransactions[monthKey]?.[e.name] || []
    spent += txns.reduce((sum, t) => sum + t.amount, 0)
  })
  return spent
})

const totalProgressPct = computed(() => {
  if (totalBudget.value === 0) return 0
  return Math.min((totalSpent.value / totalBudget.value) * 100, 100)
})

const totalProgressColor = computed(() => {
  if (totalSpent.value > totalBudget.value) return 'var(--system-red)'
  if (totalProgressPct.value > 80) return 'var(--system-orange)'
  return 'var(--system-green)'
})

function getTransactions(expense) {
  return store.variableExpenseTransactions[store.currentMonthKey]?.[expense.name] || []
}

function getSpent(expense) {
  return getTransactions(expense).reduce((sum, t) => sum + t.amount, 0)
}

function isOver(expense) {
  return getSpent(expense) > expense.budget
}

function getPct(expense) {
  return Math.min((getSpent(expense) / expense.budget) * 100, 100)
}

function getProgressColor(expense) {
  const pct = getPct(expense)
  if (isOver(expense)) return 'var(--system-red)'
  if (pct > 80) return 'var(--system-orange)'
  return 'var(--system-green)'
}

function toggleOpen(idx) {
  openCards[idx] = !openCards[idx]
}

async function showAddPrompt(expenseIndex) {
  const expense = store.variableExpenses[expenseIndex]
  const amountStr = prompt(`Lägg till utgift för ${expense.name}:\n\nAnge belopp (kr):`)
  if (amountStr === null) return
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) { alert('Vänligen ange ett giltigt belopp.'); return }
  const note = prompt('Anteckning (valfritt):')
  store.addVariableTransaction(expense.name, amount, note || '')
}

function deleteTransaction(expenseIndex, transactionIndex) {
  if (confirm('Ta bort denna transaktion?')) {
    store.deleteVariableTransaction(expenseIndex, transactionIndex)
  }
}

function fmt(n) {
  return n.toLocaleString('sv-SE')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
}
</script>
