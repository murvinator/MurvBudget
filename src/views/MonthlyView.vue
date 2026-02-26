<template>
  <div>
    <!-- Grand total summary (#53/#55) -->
    <div class="monthly-summary">
      <div class="monthly-stat">
        <div class="monthly-stat-label">Totalt</div>
        <div class="monthly-stat-value">{{ fmt(grandTotal) }} kr</div>
      </div>
      <div class="monthly-stat">
        <div class="monthly-stat-label">Betalt</div>
        <div class="monthly-stat-value" style="color: var(--system-green)">{{ fmt(grandPaid) }} kr</div>
      </div>
      <div class="monthly-stat">
        <div class="monthly-stat-label">Kvar</div>
        <div
          class="monthly-stat-value"
          :style="{ color: grandRemaining > 0 ? 'var(--system-orange)' : 'var(--system-green)' }"
        >{{ fmt(grandRemaining) }} kr</div>
      </div>
    </div>

    <!-- Expenses grouped by category (#54 collapsible) -->
    <template v-for="category in store.categories" :key="category">
      <template v-if="categoryExpenses(category).length > 0">
        <div class="category-header collapsible-header" @click="toggleCategory(category)">
          <h3>{{ category }}</h3>
          <svg
            class="chevron"
            :class="{ collapsed: collapsedCategories[category] }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <div v-show="!collapsedCategories[category]" class="category-list">
          <div
            v-for="expense in categoryExpenses(category)"
            :key="expense.index"
            class="expense-item"
            :class="{ paid: isPaid(expense.index) }"
            style="cursor: pointer"
            @click="togglePaid(expense.index)"
          >
            <div class="expense-info">
              <div class="expense-name">{{ expense.name }}</div>
            </div>
            <div class="expense-amount">{{ fmt(expense.amount) }} kr</div>
            <input
              type="checkbox"
              class="checkbox"
              :checked="isPaid(expense.index)"
              @change.stop="togglePaid(expense.index)"
              @click.stop
            >
          </div>

          <!-- Kvar att betala row -->
          <div v-if="categoryHasPaidAndRemaining(category)" class="expense-item remaining-row">
            <div class="expense-info">
              <div class="expense-name">Kvar att betala</div>
            </div>
            <div class="expense-amount">{{ fmt(categoryRemaining(category)) }} kr</div>
          </div>

          <!-- Total row -->
          <div class="expense-item category-total" :class="{ paid: categoryAllPaid(category) }">
            <div class="expense-info">
              <div class="expense-name" style="font-weight: 600">Totalt</div>
            </div>
            <div class="expense-amount" style="font-weight: 600">{{ fmt(categoryTotal(category)) }} kr</div>
          </div>
        </div>
      </template>
    </template>

    <div class="month-controls">
      <button class="reset-btn" @click="resetMonth">Återställ checkboxar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const collapsedCategories = reactive({})

function toggleCategory(category) {
  collapsedCategories[category] = !collapsedCategories[category]
}

function categoryExpenses(category) {
  return store.expenses
    .map((e, index) => ({ ...e, index }))
    .filter((e) => e.category === category)
    .sort((a, b) => b.amount - a.amount)
}

function isPaid(index) {
  return !!(store.monthlyStatus['current']?.[index])
}

function togglePaid(index) {
  store.toggleMonthlyPayment(index, !isPaid(index))
}

function categoryTotal(category) {
  return categoryExpenses(category).reduce((sum, e) => sum + e.amount, 0)
}

function categoryPaidAmount(category) {
  return categoryExpenses(category)
    .filter((e) => isPaid(e.index))
    .reduce((sum, e) => sum + e.amount, 0)
}

function categoryRemaining(category) {
  return categoryTotal(category) - categoryPaidAmount(category)
}

function categoryHasPaidAndRemaining(category) {
  const paid = categoryPaidAmount(category)
  return paid > 0 && categoryRemaining(category) > 0
}

function categoryAllPaid(category) {
  const paid = categoryPaidAmount(category)
  return paid > 0 && categoryRemaining(category) === 0
}

const grandTotal = computed(() =>
  store.categories.reduce((sum, cat) => sum + categoryTotal(cat), 0)
)

const grandPaid = computed(() =>
  store.categories.reduce((sum, cat) => sum + categoryPaidAmount(cat), 0)
)

const grandRemaining = computed(() => grandTotal.value - grandPaid.value)

function resetMonth() {
  if (confirm('Vill du återställa alla checkboxar?')) {
    store.resetCurrentMonth()
  }
}

function fmt(n) {
  return n.toLocaleString('sv-SE')
}
</script>

<style scoped>
.monthly-summary {
  display: flex;
  gap: 12px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.monthly-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.monthly-stat-label {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.monthly-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.collapsible-header {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 4px;
}

.chevron {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}
</style>
