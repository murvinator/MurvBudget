<template>
  <div>
    <!-- Transparent backdrop to close flex edit on outside click -->
    <div v-if="editingVariable" class="flex-edit-backdrop" @click="editingVariable = null"></div>
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
      <span class="monthly-section-title">{{ store.displayMonthName }}</span>
      <span class="monthly-paid-count">{{ paidCount }} av {{ totalCount }} betalt</span>
      <button v-if="hasCategorizedExpenses" class="toggle-all-btn" @click="toggleAll">
        {{ allExpanded ? 'Dölj alla' : 'Visa alla' }}
      </button>
    </div>

    <!-- Uncategorized expenses — shown plainly above all categories -->
    <template v-if="uncategorizedExpenses.length > 0">
      <div class="uncategorized-list">
        <div
          v-for="expense in uncategorizedExpenses"
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
      </div>
    </template>

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

    <!-- Flex section -->
    <template v-if="variableExpenses.length > 0">
      <div class="flex-section">
        <div class="flex-section-label">
          <span class="flex-dot"></span>
          Flex
        </div>

        <div class="flex-cards">
          <div
            v-for="expense in variableExpenses"
            :key="expense.name"
            class="flex-card"
            :class="{
              'flex-card--confirmed': hasActual(expense.name),
              'flex-card--editing': editingVariable === expense.name
            }"
          >
            <!-- Edit state -->
            <template v-if="editingVariable === expense.name">
              <div class="flex-card-editing" @click.stop>
                <div class="flex-card-editing-name">{{ expense.name }}</div>
                <input
                  type="number"
                  class="flex-edit-input"
                  v-model.number="variableEditValue"
                  inputmode="numeric"
                  step="1"
                  @keyup.enter="saveVariableActual(expense.name)"
                >
                <div class="flex-edit-actions">
                  <button class="flex-cancel-btn" @click.stop="editingVariable = null">Avbryt</button>
                  <button v-if="hasActual(expense.name)" class="flex-reset-btn" @click.stop="resetVariableActual(expense.name)">Återställ</button>
                  <button class="flex-save-btn" @click.stop="saveVariableActual(expense.name)">Spara</button>
                </div>
              </div>
            </template>

            <!-- Display state — tap to edit -->
            <template v-else>
              <div class="flex-card-row" @click="openVariableEdit(expense)">
                <div class="flex-card-left">
                  <span class="flex-card-name">{{ expense.name }}</span>
                  <span v-if="!hasActual(expense.name)" class="flex-card-hint">Tryck för att bekräfta belopp</span>
                </div>
                <div class="flex-card-amount" :class="{ 'flex-card-amount--estimate': !hasActual(expense.name) }">
                  <span v-if="!hasActual(expense.name)" class="flex-tilde">~</span>{{ fmt(variableAmount(expense)) }}<span class="flex-currency"> kr</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="flex-total-row">
          <span>Totalt Flex</span>
          <span>{{ fmt(variableTotal) }} kr</span>
        </div>
      </div>
    </template>

    <div v-if="store.expenses.length > 0" class="month-controls">
      <button class="reset-btn" @click="resetMonth">Återställ checkboxar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, inject } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CollapseTransition from '../components/CollapseTransition.vue'

const store = useBudgetStore()
const confirm = inject('confirm')

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

watch(() => store.categories, (cats) => {
  for (const cat of cats) {
    if (collapsedCategories[cat] === undefined) collapsedCategories[cat] = true
  }
}, { deep: true })

function toggleCategory(category) {
  collapsedCategories[category] = !collapsedCategories[category]
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedCategories }))
  } catch {}
}

function categoryExpenses(category) {
  return store.expenses
    .map((e, index) => ({ ...e, index }))
    .filter((e) => e.category === category && !e.variable)
    .sort((a, b) => b.amount - a.amount)
}

const uncategorizedExpenses = computed(() =>
  store.expenses
    .map((e, index) => ({ ...e, index }))
    .filter((e) => !e.variable && (!e.category || !store.categories.includes(e.category)))
    .sort((a, b) => b.amount - a.amount)
)

const hasCategorizedExpenses = computed(() =>
  store.expenses.some((e) => !e.variable && e.category && store.categories.includes(e.category))
)

// Variable expenses
const variableExpenses = computed(() =>
  store.expenses.filter((e) => e.variable)
)

function hasActual(name) {
  return store.variableActuals?.[store.currentMonthKey]?.[name] !== undefined
}

function variableAmount(expense) {
  const actual = store.variableActuals?.[store.currentMonthKey]?.[expense.name]
  return actual !== undefined ? actual : expense.amount
}

const variableTotal = computed(() =>
  variableExpenses.value.reduce((sum, e) => sum + variableAmount(e), 0)
)

// Inline editing for variable actuals
const editingVariable = ref(null)
const variableEditValue = ref(null)

function openVariableEdit(expense) {
  editingVariable.value = expense.name
  variableEditValue.value = variableAmount(expense)
}

function saveVariableActual(name) {
  const val = variableEditValue.value
  if (val !== null && val >= 0) {
    store.setVariableActual(name, val)
  }
  editingVariable.value = null
}

function resetVariableActual(name) {
  store.setVariableActual(name, null)
  editingVariable.value = null
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

const grandTotal = computed(() => {
  const fixedTotal = store.expenses
    .filter((e) => !e.variable)
    .reduce((sum, e) => sum + e.amount, 0)
  return fixedTotal + variableTotal.value
})

const grandPaid = computed(() =>
  store.expenses.reduce((sum, e, i) => {
    if (e.variable) return sum
    return sum + (isPaid(i) ? e.amount : 0)
  }, 0)
)

const grandRemaining = computed(() => grandTotal.value - grandPaid.value)

const paidCount = computed(() =>
  store.expenses.reduce((n, e, i) => n + (!e.variable && isPaid(i) ? 1 : 0), 0)
)

const totalCount = computed(() => store.expenses.filter((e) => !e.variable).length)

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

async function resetMonth() {
  const ok = await confirm('Återställ checkboxar?', { label: 'Återställ', style: 'destructive', description: 'Alla utgifter markeras som ej betalda.' })
  if (ok) store.resetCurrentMonth()
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.uncategorized-list {
  margin-bottom: 8px;
}

.uncategorized-list :deep(.expense-item) {
  background: transparent;
}

.uncategorized-list :deep(.expense-item:last-child) {
  border-bottom: none;
}

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

/* ── Flex section ──────────────────────────────────────── */
.flex-section {
  margin-top: 28px;
}

.flex-section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--system-blue);
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.flex-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--system-blue);
  flex-shrink: 0;
}

/* Backdrop for closing flex edit on outside click */
.flex-edit-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
}

/* Cards */
.flex-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
}

.flex-card--editing {
  z-index: 11;
}

/* Display row */
.flex-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.flex-card-row:active {
  opacity: 0.7;
}

.flex-card-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.flex-card-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.flex-card-hint {
  font-size: 11px;
  color: var(--text-tertiary);
}

.flex-card-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--system-blue);
  white-space: nowrap;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.flex-card-amount--estimate {
  color: var(--text-tertiary);
}

.flex-tilde {
  font-size: 15px;
  opacity: 0.65;
}

.flex-currency {
  font-size: 13px;
  font-weight: 500;
}

/* Edit state */
.flex-card-editing {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-card-editing-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.flex-edit-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--system-blue);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  outline: none;
  text-align: right;
  -moz-appearance: textfield;
  appearance: textfield;
  box-sizing: border-box;
}

.flex-edit-input::-webkit-inner-spin-button,
.flex-edit-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

.flex-edit-actions {
  display: flex;
  gap: 8px;
}

.flex-save-btn {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 12px;
  background: var(--system-blue);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.flex-save-btn:active { opacity: 0.7; }

.flex-cancel-btn {
  flex: 1;
  padding: 11px;
  border: 1px solid var(--separator);
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.flex-cancel-btn:active { opacity: 0.6; }

.flex-reset-btn {
  flex: 1;
  padding: 11px;
  border: 1px solid var(--separator);
  border-radius: 12px;
  background: transparent;
  color: var(--system-orange);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.flex-reset-btn:active { opacity: 0.6; }

/* Total row */
.flex-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 6px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
}
</style>
