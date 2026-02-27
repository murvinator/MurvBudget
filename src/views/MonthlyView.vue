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

    <!-- Show/Hide all toggle -->
    <div class="monthly-toggle-all">
      <span class="monthly-section-title">{{ store.currentMonthName }}</span>
      <span class="monthly-paid-count">{{ paidCount }} av {{ totalCount }} betalt</span>
      <button class="toggle-all-btn" @click="toggleAll">
        {{ allExpanded ? 'Dölj alla' : 'Visa alla' }}
      </button>
    </div>

    <!-- Expenses grouped by category (#54 collapsible) -->
    <template v-for="category in store.categories" :key="category">
      <template v-if="categoryExpenses(category).length > 0">
        <div class="checklist-section">
        <div
          class="category-header collapsible-header"
          :class="{ 'category-header--expanded': !collapsedCategories[category] }"
          @click="toggleCategory(category)"
        >
          <h3>{{ category }}</h3>
          <svg
            class="chevron"
            :class="{ collapsed: collapsedCategories[category] }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <CollapseTransition><div v-if="!collapsedCategories[category]" class="category-list">
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
            <span v-if="expense.date" class="expense-date-badge">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                <line x1="1" y1="5" x2="11" y2="5"/>
                <line x1="4" y1="1" x2="4" y2="3"/>
                <line x1="8" y1="1" x2="8" y2="3"/>
              </svg>
              {{ expense.date }}
            </span>
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
        </div></CollapseTransition>
        </div><!-- /.checklist-section -->
      </template>
    </template>

    <div v-if="!allCollapsed" class="month-controls">
      <button class="reset-btn" @click="resetMonth">Återställ checkboxar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CollapseTransition from '../components/CollapseTransition.vue'

const store = useBudgetStore()

const COLLAPSED_KEY = 'murvbudget-monthly-collapsed'

function loadCollapsed() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    const state = {}
    for (const cat of store.categories) {
      state[cat] = saved[cat] !== false
    }
    return state
  } catch {
    return Object.fromEntries(store.categories.map((c) => [c, true]))
  }
}

const collapsedCategories = reactive(loadCollapsed())

function toggleCategory(category) {
  collapsedCategories[category] = !collapsedCategories[category]
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedCategories }))
  } catch {}
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

const paidCount = computed(() =>
  store.expenses.filter((_, i) => isPaid(i)).length
)

const totalCount = computed(() => store.expenses.length)

const allCollapsed = computed(() =>
  store.categories
    .filter((cat) => categoryExpenses(cat).length > 0)
    .every((cat) => collapsedCategories[cat])
)

const allExpanded = computed(() =>
  store.categories
    .filter((cat) => categoryExpenses(cat).length > 0)
    .every((cat) => !collapsedCategories[cat])
)

function toggleAll() {
  const expand = !allExpanded.value
  for (const cat of store.categories) {
    if (categoryExpenses(cat).length > 0) {
      collapsedCategories[cat] = !expand
    }
  }
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedCategories }))
  } catch {}
}

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
  border-radius: 30px;
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
  padding-right: 16px;
}

.chevron {
  width: 20px;
  height: 20px;
  color: var(--system-blue);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.monthly-toggle-all {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.monthly-section-title {
  font-size: 22px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 1px;
  padding-left: 12px;
}

.monthly-paid-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  flex: 1;
  text-align: center;
}

.toggle-all-btn {
  padding: 6px 16px;
  background: transparent;
  color: var(--system-blue);
  border: 1px solid var(--system-blue);
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.toggle-all-btn:active {
  opacity: 0.6;
  transform: scale(0.95);
}

/* Ensure reset button is always above the tab bar on small screens */
.month-controls {
  margin-bottom: 60px;
}
</style>
