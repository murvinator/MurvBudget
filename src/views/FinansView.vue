<template>
  <div class="finans-view">

    <template v-for="sectionId in store.finansOrder" :key="sectionId">

    <!-- Skulder & Lån -->
    <div v-if="sectionId === 'debts'" class="finans-section">
      <div class="finans-section-header" @click="toggleSection('debts')">
        <div class="finans-section-title-group">
          <svg class="finans-section-icon finans-section-icon--debt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="finans-section-title">Skulder och lån</span>
          <span class="finans-section-badge" v-if="store.debts.length > 0">{{ fmt(totalDebt) }} kr</span>
        </div>
        <svg class="finans-chevron" :class="{ collapsed: collapsed.debts }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <CollapseTransition>
      <div v-if="!collapsed.debts" class="finans-section-body">

          <!-- Debt list -->
          <div v-if="store.debts.length === 0" class="finans-empty">
            Inga skulder inlagda.
            <button class="finans-empty-link" @click="emit('navigate', 'settings:debts')">Lägg till under Inställningar →</button>
          </div>

          <div v-for="debt in sortedDebts" :key="debt.id" class="debt-card">
            <div class="debt-card-main" @click="toggleDebt(debt.id)">
              <div class="debt-card-info">
                <div class="debt-name">{{ debt.name }}</div>
                <div class="debt-meta">
                  <span v-if="debt.monthlyPayment" class="debt-monthly-badge">{{ fmt(debt.monthlyPayment) }} kr/mån</span>
                </div>
              </div>
              <div class="debt-card-right">
                <div class="debt-amount">{{ fmt(debt.amount) }} kr</div>
                <svg class="debt-chevron" :class="{ expanded: openDebt === debt.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- Progress bar (only if there are payments and setting is on) -->
            <div v-if="store.finansViewSettings?.debtsShowProgress !== false && debtHasPayments(debt)" class="debt-progress-wrap">
              <div class="debt-progress-track">
                <div class="debt-progress-fill" :style="{ width: debtPaidPct(debt) + '%' }"></div>
              </div>
              <span class="debt-progress-label">{{ Math.round(debtPaidPct(debt)) }}% betalt</span>
            </div>

            <!-- Expanded: payment history + link to settings -->
            <CollapseTransition>
              <div v-if="openDebt === debt.id" class="debt-expand">

                <!-- Payment history -->
                <div class="debt-expand-section" v-if="debtPayments(debt).length > 0">
                  <div class="debt-expand-label">Betalningshistorik</div>
                  <div class="payment-list">
                    <div
                      v-for="{ p, origIdx } in reversedDebtPayments(debt)"
                      :key="origIdx"
                      class="payment-row"
                    >
                      <div class="payment-row-info">
                        <span class="payment-amount">{{ fmt(p.amount) }} kr</span>
                        <span class="payment-note" v-if="p.note">{{ p.note }}</span>
                        <span class="payment-date">{{ formatDate(p.date) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="debt-expand-section" v-else>
                  <p class="debt-no-payments">Inga betalningar registrerade ännu.</p>
                </div>

                <div class="debt-expand-section debt-expand-section--action">
                  <button class="debt-add-payment-btn" @click="openDebtPaymentModal(debt)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till en betalning
                  </button>
                </div>

              </div>
            </CollapseTransition>
          </div>

          <!-- Total -->
          <div v-if="store.debts.length > 0" class="finans-total-row">
            <span>Totalt kvar</span>
            <span>{{ fmt(totalDebt) }} kr</span>
          </div>

      </div>
      </CollapseTransition>
    </div>

    <!-- Sparande -->
    <div v-else-if="sectionId === 'savings'" class="finans-section">
      <div class="finans-section-header" @click="toggleSection('savings')">
        <div class="finans-section-title-group">
          <svg class="finans-section-icon finans-section-icon--savings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="finans-section-title">Sparande</span>
          <span class="finans-section-badge" v-if="store.savings.length > 0">{{ store.savings.length }} mål</span>
        </div>
        <svg class="finans-chevron" :class="{ collapsed: collapsed.savings }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <CollapseTransition>
      <div v-if="!collapsed.savings" class="finans-section-body">

          <div v-if="store.savings.length === 0" class="finans-empty">
            Inga sparmål inlagda.
            <button class="finans-empty-link" @click="emit('navigate', 'settings:savings')">Lägg till under Inställningar →</button>
          </div>

          <div v-for="goal in sortedSavings" :key="goal.id" class="savings-card">
            <div class="savings-card-main" @click="toggleSaving(goal.id)">
              <div class="savings-info">
                <div class="savings-name">{{ goal.name }}</div>
                <div class="savings-amounts">{{ fmt(goal.current) }} / {{ fmt(goal.target) }} kr</div>
              </div>
              <div class="savings-card-right">
                <span class="savings-pct">{{ savingsPct(goal) }}%</span>
                <svg class="debt-chevron" :class="{ expanded: openSaving === goal.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="debt-progress-wrap">
              <div class="debt-progress-track">
                <div
                  class="debt-progress-fill savings-progress-fill"
                  :style="{ width: Math.min(savingsPct(goal), 100) + '%' }"
                ></div>
              </div>
              <span class="debt-progress-label">{{ Math.min(savingsPct(goal), 100) }}% av mål</span>
            </div>
            <!-- Expanded -->
            <CollapseTransition>
              <div v-if="openSaving === goal.id" class="debt-expand">

                <!-- Deposit history -->
                <div class="debt-expand-section" v-if="savingsDeposits(goal).length > 0">
                  <div class="debt-expand-label">Insättningshistorik</div>
                  <div class="payment-list">
                    <div
                      v-for="{ d, origIdx } in reversedDeposits(goal)"
                      :key="origIdx"
                      class="payment-row"
                    >
                      <div class="payment-row-info">
                        <span class="payment-amount">{{ fmt(d.amount) }} kr</span>
                        <span class="payment-note" v-if="d.note">{{ d.note }}</span>
                        <span class="payment-date">{{ formatDate(d.date) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="debt-expand-section" v-else>
                  <p class="debt-no-payments">Inga insättningar registrerade ännu.</p>
                </div>

                <div class="debt-expand-section debt-expand-section--action">
                  <button class="debt-add-payment-btn" @click="openSavingsDepositModal(goal)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till insättning
                  </button>
                </div>

              </div>
            </CollapseTransition>
          </div>

          <!-- Total -->
          <div v-if="store.savings.length > 0" class="finans-total-row">
            <span>Totalt sparande</span>
            <span>{{ fmt(totalSavings) }} kr</span>
          </div>

      </div>
      </CollapseTransition>
    </div>

    <!-- Flex-utgifter -->
    <div v-else-if="sectionId === 'flex' && variableExpenses.length > 0" class="finans-section">
      <div class="finans-section-header" @click="toggleSection('flex')">
        <div class="finans-section-title-group">
          <svg class="finans-section-icon finans-section-icon--flex" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span class="finans-section-title">Flex-utgifter</span>
          <span class="finans-section-badge">{{ variableExpenses.length }} poster</span>
        </div>
        <svg class="finans-chevron" :class="{ collapsed: collapsed.flex }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <CollapseTransition>
        <div v-if="!collapsed.flex" class="finans-section-body">
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
              <div v-if="store.finansViewSettings?.flexShowBars !== false" class="flex-item-bar-track">
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
  </div>

  <br>
  <br>
  <br>
  <br>

  <!-- Savings deposit modal -->
  <Teleport to="body">
    <div v-if="savingsDepositModal.open" class="dp-overlay" @click.self="closeSavingsModal">
      <div class="dp-sheet">
        <div class="dp-header">
          <span class="dp-title">Lägg till insättning</span>
          <button class="dp-close" @click="closeSavingsModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p class="dp-subtitle">{{ savingsDepositModal.goalName }}</p>
        <input
          ref="savingsModalAmountRef"
          type="number"
          class="dp-input"
          v-model.number="savingsDepositModal.amount"
          placeholder="Belopp (kr)"
          inputmode="numeric"
          step="1"
          @focus="$event.target.select()"
          @keyup.enter="saveSavingsDeposit"
        >
        <input
          type="text"
          class="dp-input"
          v-model="savingsDepositModal.note"
          placeholder="Anteckning (valfritt)"
          @keyup.enter="saveSavingsDeposit"
        >
        <div class="dp-actions">
          <button class="btn-cancel" @click="closeSavingsModal">Avbryt</button>
          <button class="btn-save" @click="saveSavingsDeposit" :disabled="!savingsDepositModal.amount || savingsDepositModal.amount <= 0">Spara</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Debt payment modal -->
  <Teleport to="body">
    <div v-if="debtPaymentModal.open" class="dp-overlay" @click.self="closeDebtModal">
      <div class="dp-sheet">
        <div class="dp-header">
          <span class="dp-title">Lägg till betalning</span>
          <button class="dp-close" @click="closeDebtModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p class="dp-subtitle">{{ debtPaymentModal.debtName }}</p>
        <input
          ref="debtModalAmountRef"
          type="number"
          class="dp-input"
          v-model.number="debtPaymentModal.amount"
          placeholder="Belopp (kr)"
          inputmode="numeric"
          step="1"
          @focus="$event.target.select()"
          @keyup.enter="saveDebtPayment"
        >
        <input
          type="text"
          class="dp-input"
          v-model="debtPaymentModal.note"
          placeholder="Anteckning (valfritt)"
          @keyup.enter="saveDebtPayment"
        >
        <div class="dp-actions">
          <button class="btn-cancel" @click="closeDebtModal">Avbryt</button>
          <button class="btn-save" @click="saveDebtPayment" :disabled="!debtPaymentModal.amount || debtPaymentModal.amount <= 0">Spara</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CollapseTransition from '../components/CollapseTransition.vue'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

// ── Section collapse ──────────────────────────────────────────────────────────
const COLLAPSED_KEY = 'murvbudget-finans-collapsed'
const SECTION_KEYS = ['debts', 'savings', 'flex']

function loadCollapsed() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    return {
      debts:   saved.debts   !== undefined ? saved.debts   : false,
      savings: saved.savings !== undefined ? saved.savings : false,
      flex:    saved.flex    !== undefined ? saved.flex    : false,
    }
  } catch {
    return { debts: false, savings: false, flex: false }
  }
}

const collapsed = reactive(loadCollapsed())

function toggleSection(key) {
  collapsed[key] = !collapsed[key]
  try { sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsed })) } catch {}
}

function toggleAllSections() {
  const anyOpen = SECTION_KEYS.some(k => !collapsed[k])
  for (const k of SECTION_KEYS) collapsed[k] = anyOpen
  try { sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsed })) } catch {}
}

defineExpose({ toggleAllSections })

// ── Formatting ────────────────────────────────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('sv-SE') }
function formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('sv-SE') }

// ══ DEBTS ═════════════════════════════════════════════════════════════════════
const openDebt = ref(null)

const sortedDebts = computed(() =>
  [...store.debts].sort((a, b) => b.amount - a.amount)
)
const totalDebt = computed(() => store.debts.reduce((sum, d) => sum + d.amount, 0))

// ══ SAVINGS ═══════════════════════════════════════════════════════════════════
const sortedSavings = computed(() =>
  [...store.savings].sort((a, b) => b.target - a.target)
)
const totalSavings = computed(() => store.savings.reduce((sum, s) => sum + (s.current || 0), 0))

function toggleDebt(id) {
  openDebt.value = openDebt.value === id ? null : id
}

function debtPayments(debt) {
  return store.debtPayments[debt.id] || []
}

function reversedDebtPayments(debt) {
  return debtPayments(debt).map((p, i) => ({ p, origIdx: i })).reverse()
}

function debtHasPayments(debt) {
  return debtPayments(debt).length > 0
}

function debtPaidPct(debt) {
  const payments = debtPayments(debt)
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const original = debt.amount + paid
  if (original === 0) return 0
  return Math.min((paid / original) * 100, 100)
}



// ══ SAVINGS ═══════════════════════════════════════════════════════════════════
const openSaving = ref(null)

function toggleSaving(id) {
  openSaving.value = openSaving.value === id ? null : id
}

function savingsPct(goal) {
  if (!goal.target) return 0
  return Math.round(((goal.current || 0) / goal.target) * 100)
}

function savingsDeposits(goal) {
  return store.savingsDeposits[goal.id] || []
}

function reversedDeposits(goal) {
  return savingsDeposits(goal).map((d, i) => ({ d, origIdx: i })).reverse()
}

// ══ SAVINGS DEPOSIT MODAL ═════════════════════════════════════════════════════
const savingsModalAmountRef = ref(null)
const savingsDepositModal = reactive({ open: false, goalId: null, goalName: '', amount: null, note: '' })

function openSavingsDepositModal(goal) {
  savingsDepositModal.goalId = goal.id
  savingsDepositModal.goalName = goal.name
  savingsDepositModal.amount = null
  savingsDepositModal.note = ''
  savingsDepositModal.open = true
  nextTick(() => savingsModalAmountRef.value?.focus())
}

function closeSavingsModal() {
  savingsDepositModal.open = false
}

function saveSavingsDeposit() {
  if (!savingsDepositModal.amount || savingsDepositModal.amount <= 0) return
  const idx = store.savings.findIndex(s => s.id === savingsDepositModal.goalId)
  if (idx === -1) return
  store.addSavingsDeposit(idx, savingsDepositModal.amount, savingsDepositModal.note || '')
  closeSavingsModal()
}

// ══ DEBT PAYMENT MODAL ════════════════════════════════════════════════════════
const debtModalAmountRef = ref(null)
const debtPaymentModal = reactive({ open: false, debtId: null, debtName: '', amount: null, note: '' })

function openDebtPaymentModal(debt) {
  debtPaymentModal.debtId = debt.id
  debtPaymentModal.debtName = debt.name
  debtPaymentModal.amount = null
  debtPaymentModal.note = ''
  debtPaymentModal.open = true
  nextTick(() => debtModalAmountRef.value?.focus())
}

function closeDebtModal() {
  debtPaymentModal.open = false
}

function saveDebtPayment() {
  if (!debtPaymentModal.amount || debtPaymentModal.amount <= 0) return
  const idx = store.debts.findIndex(d => d.id === debtPaymentModal.debtId)
  if (idx === -1) return
  store.addDebtPayment(idx, debtPaymentModal.amount, debtPaymentModal.note || '')
  closeDebtModal()
}

watch(() => debtPaymentModal.open || savingsDepositModal.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

// ══ FLEX EXPENSES ═════════════════════════════════════════════════════════════
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

</script>

<style scoped>
.finans-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 40px;
}

/* ── Section shell ─────────────────────────────────────────── */
.finans-section {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.finans-section--last {
  margin-bottom: 0;
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

.finans-section-header:active {
  opacity: 0.7;
}

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

.finans-section-icon--debt { color: var(--system-orange); }
.finans-section-icon--savings { color: var(--system-green); }

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

.finans-empty {
  padding: 20px;
  font-size: 14px;
  color: var(--text-tertiary);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.finans-empty-link {
  background: transparent;
  border: none;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.finans-empty-link:active { opacity: 0.6; }

/* ── Total row ─────────────────────────────────────────────── */
.finans-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  border-top: 0.5px solid var(--separator);
}

/* ── Add section ───────────────────────────────────────────── */
.finans-add-section {
  padding: 16px 20px 8px;
  border-top: 0.5px solid var(--separator);
  margin-top: 8px;
}

.finans-add-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.finans-add-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.finans-add-input {
  flex: 1;
  min-width: 120px;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.finans-add-input:focus {
  border-color: var(--system-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.finans-add-input--narrow {
  min-width: 90px;
  max-width: 120px;
}

.finans-add-btn {
  padding: 10px 18px;
  background: var(--system-blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.finans-add-btn:active { opacity: 0.7; }
.finans-add-btn--done { background: var(--system-green); }

/* ══ DEBT CARDS ═══════════════════════════════════════════════ */
.debt-card {
  border-bottom: 0.5px solid var(--separator);
}

.debt-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.debt-card-main:active { opacity: 0.7; }

.debt-card-info {
  flex: 1;
  min-width: 0;
}

.debt-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.debt-meta {
  margin-top: 3px;
}

.debt-monthly-badge {
  font-size: 12px;
  color: var(--system-blue);
  font-weight: 500;
}

.debt-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.debt-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.debt-chevron {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.debt-chevron.expanded {
  transform: rotate(180deg);
}

/* Progress */
.debt-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 12px;
}

.debt-progress-track {
  flex: 1;
  height: 5px;
  background: var(--separator);
  border-radius: 999px;
  overflow: hidden;
}

.debt-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--system-orange);
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.savings-progress-fill {
  background: var(--system-green);
}

.debt-progress-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* Expanded panel */
.debt-expand {
  background: var(--system-gray5);
  padding: 4px 0;
}

.debt-expand-section {
  padding: 12px 20px;
  border-bottom: 0.5px solid var(--separator);
}

.debt-expand-section:last-child {
  border-bottom: none;
}

.debt-expand-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.debt-pay-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.debt-monthly-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.debt-monthly-hint {
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.debt-pay-input {
  flex: 1;
  min-width: 90px;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.debt-pay-input:focus {
  border-color: var(--system-blue);
}

.debt-pay-btn {
  padding: 10px 18px;
  background: var(--system-blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.debt-pay-btn:active { opacity: 0.7; }

/* Edit form */
.debt-edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.debt-edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.debt-edit-input:focus {
  border-color: var(--system-blue);
}

.debt-edit-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Generic buttons */
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

.btn-delete {
  flex: 1;
  padding: 10px 14px;
  background: var(--system-red);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-delete:active { opacity: 0.7; }

.btn-secondary {
  flex: 1;
  padding: 10px 14px;
  background: var(--system-gray5);
  color: var(--text-primary);
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-secondary:active { opacity: 0.7; }

.btn-delete-outline {
  flex: 1;
  padding: 10px 14px;
  background: transparent;
  color: var(--system-red);
  border: 1px solid var(--system-red);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-delete-outline:active { opacity: 0.6; }

/* Payment history */
.payment-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-bg);
  border-radius: 10px;
  padding: 10px 12px;
}

.payment-row-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.payment-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.payment-note {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-date {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-left: 0;
}

.payment-delete-btn {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--system-red);
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.payment-delete-btn svg {
  width: 18px;
  height: 18px;
}

.payment-delete-btn:active { opacity: 0.6; }

.debt-no-payments {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.debt-settings-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-top: 0.5px solid var(--separator);
  color: var(--system-blue);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
  text-align: left;
}

.debt-settings-link:active { opacity: 0.6; }

/* ══ SAVINGS ══════════════════════════════════════════════════ */
.savings-card {
  border-bottom: 0.5px solid var(--separator);
}

.savings-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.savings-card-main:active { opacity: 0.7; }

.savings-info {
  flex: 1;
  min-width: 0;
}

.savings-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.savings-amounts {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.savings-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.savings-pct {
  font-size: 15px;
  font-weight: 600;
  color: var(--system-green);
}

.savings-rate-label {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 0 20px 10px;
  font-weight: 500;
}

/* ══ FLEX ICON ════════════════════════════════════════════════ */
.finans-section-icon--flex { color: var(--system-blue); }

/* ══ MONTH NAVIGATOR ══════════════════════════════════════════ */
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

/* ══ FLEX ITEM CARDS ══════════════════════════════════════════ */
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

/* ══ FLEX INLINE EDIT ═════════════════════════════════════════ */
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

/* ══ DEBT ADD PAYMENT BUTTON ══════════════════════════════════ */
.debt-add-payment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  color: var(--system-blue);
  border: 1.5px solid var(--system-blue);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.debt-add-payment-btn:active { opacity: 0.7; }

/* ══ DEBT PAYMENT MODAL ═══════════════════════════════════════ */
.dp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: max(80px, 12vh) 24px 24px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dp-sheet {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: dp-pop 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
}

@keyframes dp-pop {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

.dp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.dp-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.dp-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: -8px 0 2px;
}

.dp-close {
  background: var(--system-gray5);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.dp-close:active { opacity: 0.6; }

.dp-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--separator);
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.dp-input:focus {
  border-color: var(--system-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.dp-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
</style>
