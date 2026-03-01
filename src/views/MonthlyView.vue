<template>
  <div>
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
      <button v-if="hasCollapsibleSections" class="toggle-all-btn" @click="toggleAll">
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

    <!-- Debt payments section (debts with monthlyPayment) -->
    <template v-if="debtPaymentItems.length > 0">
      <div class="checklist-section">
        <div
          class="category-header collapsible-header"
          :class="{ 'category-header--expanded': !debtSectionCollapsed }"
          @click="debtSectionCollapsed = !debtSectionCollapsed"
        >
          <div class="category-header-label">
            <svg class="category-special-icon category-special-icon--debt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3>Skulder och lån</h3>
          </div>
          <svg class="chevron" :class="{ collapsed: debtSectionCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <CollapseTransition>
          <div v-if="!debtSectionCollapsed" class="category-list">
            <div
              v-for="item in debtPaymentItems"
              :key="item.id"
              class="expense-item"
              :class="{ paid: isDebtPaid(item.id) }"
              style="cursor: pointer"
              @click="toggleDebtPayment(item)"
            >
              <div class="expense-info">
                <div class="expense-name">{{ item.name }}</div>
              </div>
              <div class="expense-amount">{{ fmt(item.monthlyPayment) }} kr</div>
              <input
                type="checkbox"
                class="checkbox"
                :checked="isDebtPaid(item.id)"
                @change.stop="toggleDebtPayment(item)"
                @click.stop
              >
            </div>
          </div>
        </CollapseTransition>
      </div>
    </template>

    <!-- Savings payments section (savings goals with monthlyPayment) -->
    <template v-if="savingsPaymentItems.length > 0">
      <div class="checklist-section">
        <div
          class="category-header collapsible-header"
          :class="{ 'category-header--expanded': !savingsSectionCollapsed }"
          @click="savingsSectionCollapsed = !savingsSectionCollapsed"
        >
          <div class="category-header-label">
            <svg class="category-special-icon category-special-icon--savings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>Sparande</h3>
          </div>
          <svg class="chevron" :class="{ collapsed: savingsSectionCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <CollapseTransition>
          <div v-if="!savingsSectionCollapsed" class="category-list">
            <div
              v-for="item in savingsPaymentItems"
              :key="item.id"
              class="expense-item"
              :class="{ paid: isSavingsPaid(item.id) }"
              style="cursor: pointer"
              @click="toggleSavingsPayment(item)"
            >
              <div class="expense-info">
                <div class="expense-name">{{ item.name }}</div>
              </div>
              <div class="expense-amount">{{ fmt(item.monthlyPayment) }} kr</div>
              <input
                type="checkbox"
                class="checkbox"
                :checked="isSavingsPaid(item.id)"
                @change.stop="toggleSavingsPayment(item)"
                @click.stop
              >
            </div>
          </div>
        </CollapseTransition>
      </div>
    </template>

    <!-- Flex section (interactive — edit actuals here) -->
    <template v-if="variableExpenses.length > 0">
      <div class="finans-section">
        <div class="finans-section-header" @click="flexCollapsed = !flexCollapsed">
          <div class="finans-section-title-group">
            <svg class="finans-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="finans-section-title">Flex-utgifter</span>
            <span class="finans-section-badge">{{ variableExpenses.length }} poster</span>
          </div>
          <svg class="finans-chevron" :class="{ collapsed: flexCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <CollapseTransition>
          <div v-if="!flexCollapsed" class="finans-section-body">
            <!-- Month navigator -->
            <div class="month-nav">
              <button class="month-nav-btn" @click="stepMonth(-1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span class="month-nav-label">{{ flexMonthName }}</span>
              <button class="month-nav-btn" @click="stepMonth(1)" :disabled="flexMonthOffset === 0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div
              v-for="expense in variableExpenses"
              :key="expense.name"
              class="flex-item-card"
            >
              <!-- Edit state -->
              <template v-if="editingFlex === expense.name">
                <div class="flex-edit-wrap" @click.stop>
                  <div class="flex-edit-name">{{ expense.name }}</div>
                  <input
                    type="number"
                    class="flex-edit-num"
                    v-model.number="flexEditValue"
                    inputmode="numeric"
                    step="1"
                    @focus="$event.target.select()"
                    @keyup.enter="saveFlexActual(expense.name)"
                  >
                  <div class="flex-edit-row">
                    <button class="btn-cancel" @click="editingFlex = null">Avbryt</button>
                    <button v-if="hasFlexActual(expense.name)" class="btn-reset" @click="resetFlexActual(expense.name)">Återställ</button>
                    <button class="btn-save" @click="saveFlexActual(expense.name)">Spara</button>
                  </div>
                </div>
              </template>

              <!-- Display state -->
              <template v-else>
                <div class="flex-item-row" @click="openFlexEdit(expense)">
                  <div class="flex-item-left">
                    <span class="flex-item-name">{{ expense.name }}</span>
                    <span class="flex-item-sub" v-if="!hasFlexActual(expense.name)">Tryck för att ange faktiskt belopp</span>
                    <span class="flex-item-sub flex-item-sub--confirmed" v-else>Bekräftat</span>
                  </div>
                  <div class="flex-item-amounts">
                    <span class="flex-item-actual" :class="{ 'flex-item-actual--estimate': !hasFlexActual(expense.name) }">
                      <span v-if="!hasFlexActual(expense.name)" class="flex-tilde">~</span>{{ fmt(variableAmount(expense)) }} kr
                    </span>
                    <span v-if="hasFlexActual(expense.name)" class="flex-item-budget">/ {{ fmt(expense.amount) }} kr</span>
                  </div>
                </div>
                <div class="flex-item-bar-track">
                  <div
                    class="flex-item-bar-fill"
                    :class="flexBarClass(expense)"
                    :style="{ width: flexBarPct(expense) + '%' }"
                  ></div>
                </div>
              </template>
            </div>

            <div class="finans-total-row">
              <span>Totalt Flex ({{ flexMonthName }})</span>
              <span>{{ fmt(variableTotal) }} kr</span>
            </div>
          </div>
        </CollapseTransition>
      </div>
    </template>

    <div v-if="store.expenses.length > 0 || debtPaymentItems.length > 0" class="month-controls">
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
const emit = defineEmits(['navigate'])

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

function loadSpecialCollapsed(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    return saved[key] !== false
  } catch {
    return true
  }
}

function saveSpecialCollapsed(key, value) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    saved[key] = value
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify(saved))
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

// Debt payment items (debts with monthlyPayment set)
const debtPaymentItems = computed(() =>
  store.debts
    .map((d, i) => ({ ...d, debtIndex: i }))
    .filter(d => d.monthlyPayment > 0)
)

function isDebtPaid(debtId) {
  return !!(store.monthlyStatus['current']?.['debt-' + debtId])
}

function toggleDebtPayment(item) {
  const nowPaid = !isDebtPaid(item.id)
  store.toggleDebtMonthlyPayment(item.id, nowPaid)
  if (nowPaid) {
    store.addDebtPayment(item.debtIndex, item.monthlyPayment, 'Månadsbetalning')
    const payments = store.debtPayments[item.id] || []
    const date = payments[payments.length - 1]?.date
    if (date) store.setChecklistTracking('debt-' + item.id, date)
  } else {
    const trackedDate = store.monthlyChecklistTracking?.['current']?.['debt-' + item.id]
    if (trackedDate) {
      const payments = store.debtPayments[item.id] || []
      const idx = payments.findIndex(p => p.date === trackedDate)
      if (idx !== -1) store.deleteDebtPayment(item.debtIndex, idx)
      store.setChecklistTracking('debt-' + item.id, null)
    }
  }
}

const debtSectionCollapsed = ref(loadSpecialCollapsed('__debt'))
watch(debtSectionCollapsed, (v) => saveSpecialCollapsed('__debt', v))

// Savings payment items (savings goals with monthlyPayment set)
const savingsPaymentItems = computed(() =>
  store.savings
    .map((s, i) => ({ ...s, savingsIndex: i }))
    .filter(s => s.monthlyPayment > 0)
)

const savingsSectionCollapsed = ref(loadSpecialCollapsed('__savings'))
watch(savingsSectionCollapsed, (v) => saveSpecialCollapsed('__savings', v))

function isSavingsPaid(savingsId) {
  return !!(store.monthlyStatus['current']?.['savings-' + savingsId])
}

function toggleSavingsPayment(item) {
  const nowPaid = !isSavingsPaid(item.id)
  store.toggleSavingsMonthlyPayment(item.id, nowPaid)
  if (nowPaid) {
    store.addSavingsDeposit(item.savingsIndex, item.monthlyPayment, 'Månadsinsättning')
    const deposits = store.savingsDeposits[item.id] || []
    const date = deposits[deposits.length - 1]?.date
    if (date) store.setChecklistTracking('savings-' + item.id, date)
  } else {
    const trackedDate = store.monthlyChecklistTracking?.['current']?.['savings-' + item.id]
    if (trackedDate) {
      const deposits = store.savingsDeposits[item.id] || []
      const idx = deposits.findIndex(d => d.date === trackedDate)
      if (idx !== -1) store.deleteSavingsDeposit(item.savingsIndex, idx)
      store.setChecklistTracking('savings-' + item.id, null)
    }
  }
}

// ── Flex expenses (interactive editing) ───────────────────────
const flexCollapsed = ref(loadSpecialCollapsed('__flex'))
watch(flexCollapsed, (v) => saveSpecialCollapsed('__flex', v))

const SWEDISH_MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
]

const flexMonthOffset = ref(0)

const flexMonthKey = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + flexMonthOffset.value)
  return `${d.getFullYear()}-${d.getMonth()}`
})

const flexMonthName = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + flexMonthOffset.value)
  return `${SWEDISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`
})

function stepMonth(dir) {
  const next = flexMonthOffset.value + dir
  if (next > 0) return
  flexMonthOffset.value = next
}

const variableExpenses = computed(() =>
  store.expenses.filter((e) => e.variable)
)

function hasFlexActual(name) {
  return store.variableActuals?.[flexMonthKey.value]?.[name] !== undefined
}

function variableAmount(expense) {
  const actual = store.variableActuals?.[flexMonthKey.value]?.[expense.name]
  return actual !== undefined ? actual : expense.amount
}

const variableTotal = computed(() =>
  variableExpenses.value.reduce((sum, e) => sum + variableAmount(e), 0)
)

function flexBarPct(expense) {
  const budget = expense.amount
  if (!budget) return 0
  return Math.min((variableAmount(expense) / budget) * 100, 100)
}

function flexBarClass(expense) {
  const pct = expense.amount ? (variableAmount(expense) / expense.amount) * 100 : 0
  if (pct > 120) return 'flex-item-bar-fill--over'
  if (pct > 100) return 'flex-item-bar-fill--warn'
  return ''
}

const editingFlex = ref(null)
const flexEditValue = ref(null)

function openFlexEdit(expense) {
  editingFlex.value = expense.name
  flexEditValue.value = variableAmount(expense)
}

function saveFlexActual(name) {
  const val = flexEditValue.value
  if (val !== null && val >= 0) {
    const mk = flexMonthKey.value
    if (!store.variableActuals[mk]) store.variableActuals[mk] = {}
    store.variableActuals[mk][name] = parseInt(val)
  }
  editingFlex.value = null
}

function resetFlexActual(name) {
  const mk = flexMonthKey.value
  if (store.variableActuals[mk]) delete store.variableActuals[mk][name]
  editingFlex.value = null
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
  const debtTotal = debtPaymentItems.value.reduce((sum, d) => sum + d.monthlyPayment, 0)
  const savingsTotal = savingsPaymentItems.value.reduce((sum, s) => sum + s.monthlyPayment, 0)
  return fixedTotal + debtTotal + savingsTotal
})

const grandPaid = computed(() => {
  const expensesPaid = store.expenses.reduce((sum, e, i) => {
    if (e.variable) return sum
    return sum + (isPaid(i) ? e.amount : 0)
  }, 0)
  const debtsPaid = debtPaymentItems.value.reduce((sum, d) => {
    return sum + (isDebtPaid(d.id) ? d.monthlyPayment : 0)
  }, 0)
  const savingsPaid = savingsPaymentItems.value.reduce((sum, s) => {
    return sum + (isSavingsPaid(s.id) ? s.monthlyPayment : 0)
  }, 0)
  return expensesPaid + debtsPaid + savingsPaid
})

const grandRemaining = computed(() => grandTotal.value - grandPaid.value)

const paidCount = computed(() => {
  const expCount = store.expenses.reduce((n, e, i) => n + (!e.variable && isPaid(i) ? 1 : 0), 0)
  const debtCount = debtPaymentItems.value.reduce((n, d) => n + (isDebtPaid(d.id) ? 1 : 0), 0)
  const savingsCount = savingsPaymentItems.value.reduce((n, s) => n + (isSavingsPaid(s.id) ? 1 : 0), 0)
  return expCount + debtCount + savingsCount
})

const totalCount = computed(() =>
  store.expenses.filter((e) => !e.variable).length +
  debtPaymentItems.value.length +
  savingsPaymentItems.value.length
)

const hasCollapsibleSections = computed(() =>
  hasCategorizedExpenses.value ||
  debtPaymentItems.value.length > 0 ||
  savingsPaymentItems.value.length > 0 ||
  variableExpenses.value.length > 0
)

const allExpanded = computed(() => {
  const catsExpanded = store.categories
    .filter((cat) => categoryExpenses(cat).length > 0)
    .every((cat) => !collapsedCategories[cat])
  const debtOk = debtPaymentItems.value.length === 0 || !debtSectionCollapsed.value
  const savingsOk = savingsPaymentItems.value.length === 0 || !savingsSectionCollapsed.value
  const flexOk = variableExpenses.value.length === 0 || !flexCollapsed.value
  return catsExpanded && debtOk && savingsOk && flexOk
})

function toggleAll() {
  const expand = !allExpanded.value
  for (const cat of store.categories) {
    if (categoryExpenses(cat).length > 0) collapsedCategories[cat] = !expand
  }
  if (debtPaymentItems.value.length > 0) debtSectionCollapsed.value = !expand
  if (savingsPaymentItems.value.length > 0) savingsSectionCollapsed.value = !expand
  if (variableExpenses.value.length > 0) flexCollapsed.value = !expand
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

.category-header-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 20px;
}

.category-header-label h3 {
  padding-left: 0;
  text-transform: none;
}

.category-special-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.category-special-icon--debt {
  color: var(--system-orange);
}

.category-special-icon--savings {
  color: var(--system-green);
}

/* ── Finans-style section shell (reused for flex) ──────── */
.finans-section {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-top: 28px;
}

.finans-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.finans-section-header:active { opacity: 0.7; }

.finans-section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.finans-section-icon {
  width: 20px;
  height: 20px;
  color: var(--system-blue);
  flex-shrink: 0;
}

.finans-section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.finans-section-badge {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--system-gray5);
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.finans-chevron {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.finans-chevron.collapsed {
  transform: rotate(-90deg);
}

.finans-section-body {
  border-top: 0.5px solid var(--separator);
  padding: 0 0 8px;
}

/* Month nav */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 8px;
}

.month-nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--system-gray5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  color: var(--system-blue);
}

.month-nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.month-nav-btn svg {
  width: 18px;
  height: 18px;
}

.month-nav-btn:not(:disabled):active { opacity: 0.6; }

.month-nav-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.flex-item-card {
  border-bottom: 0.5px solid var(--separator);
  padding: 14px 20px 12px;
}

.flex-item-card:last-child {
  border-bottom: none;
}

.flex-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 8px;
}

.flex-item-row:active { opacity: 0.7; }

.flex-item-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.flex-item-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.flex-item-sub {
  font-size: 11px;
  color: var(--text-tertiary);
}

.flex-item-sub--confirmed {
  color: var(--system-green);
}

.flex-item-amounts {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.flex-item-actual {
  font-size: 18px;
  font-weight: 700;
  color: var(--system-blue);
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.flex-item-actual--estimate {
  color: var(--text-tertiary);
}

.flex-tilde {
  font-size: 14px;
  opacity: 0.6;
}

.flex-item-budget {
  font-size: 12px;
  color: var(--text-tertiary);
}

.flex-item-bar-track {
  height: 4px;
  background: var(--separator);
  border-radius: 999px;
  overflow: hidden;
}

.flex-item-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--system-blue);
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.flex-item-bar-fill--warn { background: var(--system-orange); }
.flex-item-bar-fill--over { background: var(--system-red); }

/* Flex inline edit */
.flex-edit-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-edit-name {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary);
}

.flex-edit-num {
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
  box-sizing: border-box;
  -moz-appearance: textfield;
  appearance: textfield;
}

.flex-edit-num::-webkit-inner-spin-button,
.flex-edit-num::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

.flex-edit-row {
  display: flex;
  gap: 8px;
}

.btn-save {
  flex: 1;
  padding: 10px 14px;
  background: var(--system-blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-save:active { opacity: 0.7; }

.btn-cancel {
  flex: 1;
  padding: 10px 14px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--separator);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-cancel:active { opacity: 0.6; }

.btn-reset {
  flex: 1;
  padding: 10px 14px;
  background: transparent;
  color: var(--system-orange);
  border: 1px solid var(--separator);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-reset:active { opacity: 0.6; }

/* Total row */
.finans-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  border-top: 0.5px solid var(--separator);
}
</style>
