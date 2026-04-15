<template>
  <div class="wizard-view">
    <!-- "installationsguide" subtitle sits right below the App's page-large-title "Budget" -->
    <p class="wizard-subtitle">installationsguide</p>

    <!-- Step viewport -->
    <div class="step-viewport">
      <Transition :name="slideDirection">

        <!-- ── Step 1: Inkomst ─────────────────────────────────────────── -->
        <div v-if="step === 1" key="step1" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <div class="step-icon step-icon--green">
                  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <h2 class="step-title">Vad tjänar du per månad?</h2>
                <p class="step-sub">Lägg till dina inkomstkällor. Du kan alltid ändra detta senare.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="incomeNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Lön)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--amount">
                  <input v-model="incomeAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Belopp (kr)" min="0" @keyup.enter="addIncomeItem" />
                  <button class="add-btn" @click="addIncomeItem" :disabled="!incomeAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="addedIncomes.length" class="added-list">
                <div v-for="(item, i) in addedIncomes" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--green">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                  </div>
                  <span class="added-row-name">{{ item.name }}</span>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn" @click="removeIncomeItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button class="primary-btn" @click="goForward">Nästa →</button>
            </div>
          </div>
        </div>

        <!-- ── Step 2: Kategorier ──────────────────────────────────────── -->
        <div v-else-if="step === 2" key="step2" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <div class="step-icon step-icon--purple">
                  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                    <path d="M12 2l-5.5 9h11L12 2zm0 3.84L14.6 10h-5.2L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7c-1.38 0-2.5-1.12-2.5-2.5S16.12 15 17.5 15s2.5 1.12 2.5 2.5S18.88 20 17.5 20zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
                  </svg>
                </div>
                <h2 class="step-title">Välj utgiftskategorier</h2>
                <p class="step-sub">Välj de kategorier som passar din ekonomi.</p>
              </div>

              <div class="chip-grid">
                <button
                  v-for="cat in presetCategories"
                  :key="cat.name"
                  class="chip"
                  :class="{ 'chip--selected': selectedCategories.includes(cat.name) }"
                  @click="toggleCategory(cat.name)"
                >
                  <span class="chip-emoji">{{ cat.emoji }}</span>
                  {{ cat.name }}
                  <svg v-if="selectedCategories.includes(cat.name)" class="chip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="13" height="13">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>

              <div class="input-card">
                <div class="input-row input-row--amount">
                  <input v-model="customCatInput" class="text-input" type="text" placeholder="Lägg till egen kategori…" maxlength="40" @keyup.enter="addCustomCategory" />
                  <button class="add-btn" @click="addCustomCategory" :disabled="!customCatInput.trim()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="customCategories.length" class="added-list">
                <div v-for="(cat, i) in customCategories" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--purple">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                    </svg>
                  </div>
                  <span class="added-row-name">{{ cat }}</span>
                  <button class="delete-btn" @click="removeCustomCategory(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button class="primary-btn" @click="goForward">Nästa →</button>
            </div>
          </div>
        </div>

        <!-- ── Step 3: Fasta utgifter ──────────────────────────────────── -->
        <div v-else-if="step === 3" key="step3" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <div class="step-icon step-icon--orange">
                  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                </div>
                <h2 class="step-title">Fasta utgifter</h2>
                <p class="step-sub">Hyra, el, prenumerationer… Lägg till det som återkommer varje månad.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="expenseNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Hyra)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="expenseAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Belopp (kr)" min="0" />
                </div>
                <div v-if="allCategoriesForStep.length" class="input-divider"></div>
                <div v-if="allCategoriesForStep.length" class="input-row">
                  <select v-model="expenseCategoryInput" class="text-input select-input">
                    <option value="">Välj kategori (valfritt)</option>
                    <option v-for="cat in allCategoriesForStep" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--centered">
                  <button class="add-btn add-btn--wide" @click="addExpenseItem" :disabled="!expenseNameInput || !expenseAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till
                  </button>
                </div>
              </div>

              <div v-if="addedExpenses.length" class="added-list">
                <div v-for="(item, i) in addedExpenses" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--orange">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div class="added-row-body">
                    <span class="added-row-name">{{ item.name }}</span>
                    <span v-if="item.category" class="added-row-cat">{{ item.category }}</span>
                  </div>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn" @click="removeExpenseItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button class="primary-btn" @click="goForward">Nästa →</button>
            </div>
          </div>
        </div>

        <!-- ── Step 4: Klart! ──────────────────────────────────────────── -->
        <div v-else-if="step === 4" key="step4" class="step-panel">
          <div class="step-scroll">
            <div class="step-content step-content--center">
              <div class="celebration-icon">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="url(#grad-green)"/>
                  <polyline points="18 33 27 42 46 23" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="grad-green" x1="0" y1="0" x2="64" y2="64">
                      <stop offset="0%" stop-color="#34C759"/>
                      <stop offset="100%" stop-color="#30b550"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 class="step-title step-title--large">Allt är klart!</h2>
              <p class="step-sub step-sub--center">Din budget är redo. Du kan alltid ändra allt under Inställningar.</p>

              <div class="summary-pills">
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedIncomes.length }}</span>
                  <span class="summary-pill-label">{{ addedIncomes.length === 1 ? 'inkomst' : 'inkomster' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ allSelectedCategoryCount }}</span>
                  <span class="summary-pill-label">{{ allSelectedCategoryCount === 1 ? 'kategori' : 'kategorier' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedExpenses.length }}</span>
                  <span class="summary-pill-label">{{ addedExpenses.length === 1 ? 'utgift' : 'utgifter' }}</span>
                </div>
              </div>

              <button class="primary-btn primary-btn--green" @click="finish">Kom igång!</button>
            </div>
          </div>
        </div>

      </Transition>
    </div>

    <!-- ── Fixed bottom bar ────────────────────────────────────────────── -->
    <div class="wizard-bottom-bar">
      <!-- Row 1: back | progress | skip -->
      <div class="bottom-row">
        <button v-if="step > 1" class="btn-back" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Tillbaka
        </button>
        <div v-else class="btn-placeholder"></div>

        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
          <span class="progress-label">{{ step < 4 ? (4 - step) + ' steg kvar' : 'Klar!' }}</span>
        </div>

        <button v-if="step < 4" class="btn-skip" @click="skipStep">Hoppa över</button>
        <div v-else class="btn-placeholder"></div>
      </div>

      <!-- Row 2: close link -->
      <div class="bottom-close-row">
        <button class="btn-close-text" @click="closeWizard">Stäng installationsguiden</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useBudgetStore } from '../stores/budget'

const STORAGE_KEY = 'murvbudget-onboarding'
const DEFAULT_CATEGORIES = ['Boende', 'Mat & Livsmedel', 'Transport', 'Övrigt']

const emit = defineEmits(['navigate'])

const store = useBudgetStore()
const confirm = inject('confirm')

// ── Navigation ───────────────────────────────────────────────────────────────
const step = ref(1)
const direction = ref('forward')

const slideDirection = computed(() =>
  direction.value === 'forward' ? 'slide-left' : 'slide-right'
)

const progressPct = computed(() => ((step.value - 1) / 3) * 100)

function goForward() {
  direction.value = 'forward'
  step.value++
}

function goBack() {
  direction.value = 'backward'
  step.value--
}

function skipStep() {
  if (step.value === 1) {
    addedIncomes.value = []
    incomeNameInput.value = 'Lön'
    incomeAmountInput.value = ''
  } else if (step.value === 2) {
    selectedCategories.value = [...DEFAULT_CATEGORIES]
    customCategories.value = []
    customCatInput.value = ''
  } else if (step.value === 3) {
    addedExpenses.value = []
    expenseNameInput.value = ''
    expenseAmountInput.value = ''
    expenseCategoryInput.value = ''
  }
  direction.value = 'forward'
  step.value++
}

async function closeWizard() {
  const ok = await confirm('Stäng installationsguiden?', {
    label: 'Stäng guiden',
    style: 'destructive',
    description: 'Du kan alltid starta guiden igen från Inställningar.',
  })
  if (!ok) return
  emit('navigate', 'overview')
}

// ── Step 1: Income ───────────────────────────────────────────────────────────
const incomeNameInput = ref('Lön')
const incomeAmountInput = ref('')
const addedIncomes = ref([])

function addIncomeItem() {
  const amount = parseInt(incomeAmountInput.value)
  if (!amount || amount <= 0) return
  const name = incomeNameInput.value.trim() || 'Lön'
  addedIncomes.value.push({ name, amount })
  incomeNameInput.value = ''
  incomeAmountInput.value = ''
}

function removeIncomeItem(i) {
  addedIncomes.value.splice(i, 1)
}

// ── Step 2: Categories ───────────────────────────────────────────────────────
const presetCategories = [
  { name: 'Boende', emoji: '🏠' },
  { name: 'Mat & Livsmedel', emoji: '🛒' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Nöje & Fritid', emoji: '🎮' },
  { name: 'Hälsa', emoji: '💊' },
  { name: 'Kläder & Shopping', emoji: '👗' },
  { name: 'Övrigt', emoji: '📦' },
]

const selectedCategories = ref([...DEFAULT_CATEGORIES])
const customCatInput = ref('')
const customCategories = ref([])

function toggleCategory(name) {
  const idx = selectedCategories.value.indexOf(name)
  if (idx >= 0) selectedCategories.value.splice(idx, 1)
  else selectedCategories.value.push(name)
}

function addCustomCategory() {
  const name = customCatInput.value.trim()
  if (!name) return
  if (!customCategories.value.includes(name) && !selectedCategories.value.includes(name)) {
    customCategories.value.push(name)
  }
  customCatInput.value = ''
}

function removeCustomCategory(i) {
  customCategories.value.splice(i, 1)
}

const allSelectedCategoryCount = computed(
  () => selectedCategories.value.length + customCategories.value.length
)

// ── Step 3: Fixed expenses ───────────────────────────────────────────────────
const expenseNameInput = ref('')
const expenseAmountInput = ref('')
const expenseCategoryInput = ref('')
const addedExpenses = ref([])

const allCategoriesForStep = computed(() => [
  ...selectedCategories.value,
  ...customCategories.value,
])

function addExpenseItem() {
  const name = expenseNameInput.value.trim()
  const amount = parseInt(expenseAmountInput.value)
  if (!name || !amount || amount <= 0) return
  addedExpenses.value.push({ name, amount, category: expenseCategoryInput.value || null })
  expenseNameInput.value = ''
  expenseAmountInput.value = ''
  expenseCategoryInput.value = ''
}

function removeExpenseItem(i) {
  addedExpenses.value.splice(i, 1)
}

// ── Step 4: Finish ───────────────────────────────────────────────────────────
function finish() {
  addedIncomes.value.forEach(i => store.addIncome(i.name, i.amount))
  selectedCategories.value.forEach(name => store.addCategory(name))
  customCategories.value.forEach(name => store.addCategory(name))
  addedExpenses.value.forEach(e => store.addExpense(e.name, e.amount, e.category))
  localStorage.setItem(STORAGE_KEY, 'never')
  emit('navigate', 'overview')
}
</script>

<style scoped>
.wizard-view {
  /* Extra padding at the bottom so content clears the fixed bottom bar */
  padding-bottom: 110px;
}

.wizard-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: -18px 0 20px 4px;
  letter-spacing: 0.1px;
}

/* ── Step viewport ──────────────────────────────────────────────────────────── */
.step-viewport {
  position: relative;
  overflow: hidden;
}

.step-panel {
  width: 100%;
}

.step-scroll {
  width: 100%;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 600px;
}

.step-content--center {
  align-items: center;
  text-align: center;
  padding-top: 16px;
}

/* ── Step header ─────────────────────────────────────────────────────────────── */
.step-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 4px;
}

.step-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.step-icon--green  { background: linear-gradient(145deg, #34C759, #2aad4a); box-shadow: 0 6px 20px rgba(52,199,89,0.32); }
.step-icon--purple { background: linear-gradient(145deg, #AF52DE, #9040c4); box-shadow: 0 6px 20px rgba(175,82,222,0.32); }
.step-icon--orange { background: linear-gradient(145deg, #FF9500, #e08000); box-shadow: 0 6px 20px rgba(255,149,0,0.32); }

.step-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0;
}
.step-title--large {
  font-size: 30px;
  letter-spacing: -0.7px;
  margin-top: 8px;
}

.step-sub {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}
.step-sub--center {
  text-align: center;
  max-width: 280px;
}

/* ── Input card ─────────────────────────────────────────────────────────────── */
.input-card {
  background: var(--card-bg);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 0 14px;
  min-height: 50px;
}
.input-row--amount { gap: 10px; }
.input-row--centered { justify-content: center; padding: 12px 14px; }

.input-divider {
  height: 1px;
  background: var(--separator);
  margin: 0 14px;
}

.text-input {
  flex: 1;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  min-width: 0;
  -webkit-user-select: text;
  user-select: text;
}
.text-input::placeholder { color: var(--text-tertiary); }
.select-input { appearance: none; -webkit-appearance: none; cursor: pointer; }

/* ── Add button ─────────────────────────────────────────────────────────────── */
.add-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--system-blue, #007AFF);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s, transform 0.12s;
}
.add-btn:disabled { opacity: 0.35; }
.add-btn:not(:disabled):active { transform: scale(0.92); }
.add-btn--wide {
  width: auto;
  height: 40px;
  padding: 0 20px;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  border-radius: 12px;
}

/* ── Added items list ─────────────────────────────────────────────────────── */
.added-list {
  background: var(--card-bg);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.added-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--separator);
}
.added-row:last-child { border-bottom: none; }

.added-row-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.added-row-icon--green  { background: var(--system-green, #34C759); }
.added-row-icon--purple { background: var(--system-purple, #AF52DE); }
.added-row-icon--orange { background: var(--system-orange, #FF9500); }

.added-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.added-row-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.added-row-cat { font-size: 12px; color: var(--text-secondary); }

.added-row-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.delete-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--system-gray4, #E5E5EA);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s;
}
.delete-btn:active { opacity: 0.6; }

/* ── Category chips ──────────────────────────────────────────────────────── */
.chip-grid { display: flex; flex-wrap: wrap; gap: 9px; }

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 50px;
  border: 1.5px solid var(--separator);
  background: var(--card-bg);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.chip:active { transform: scale(0.96); }
.chip--selected {
  background: var(--system-blue, #007AFF);
  border-color: var(--system-blue, #007AFF);
  color: white;
  box-shadow: 0 3px 12px rgba(0,122,255,0.28);
}
.chip-emoji { font-size: 16px; }
.chip-check { stroke: white; flex-shrink: 0; }

/* ── Primary button ──────────────────────────────────────────────────────── */
.primary-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: var(--system-blue, #007AFF);
  color: white;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s, transform 0.12s;
  box-shadow: 0 4px 16px rgba(0,122,255,0.3);
  margin-top: 4px;
}
.primary-btn--green {
  background: var(--system-green, #34C759);
  box-shadow: 0 4px 16px rgba(52,199,89,0.32);
}
.primary-btn:active { opacity: 0.85; transform: scale(0.985); }

/* ── Celebration (step 4) ────────────────────────────────────────────────── */
.celebration-icon {
  margin-bottom: 4px;
  animation: pop-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
@keyframes pop-in {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.summary-pills {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 4px 0 8px;
}

.summary-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--card-bg);
  border-radius: 14px;
  padding: 14px 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  min-width: 88px;
}
.summary-pill-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1;
}
.summary-pill-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ── Fixed bottom bar ────────────────────────────────────────────────────── */
.wizard-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: var(--bg-primary);
  border-top: 0.5px solid var(--separator);
  padding: 10px 16px;
  /* Default: no tab bar below (desktop layout) */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
}

/* On mobile/mobile-web: lift above the floating tab bar (~72px) */
:global(body.layout-mobile) .wizard-bottom-bar,
:global(body.layout-mobile-web) .wizard-bottom-bar {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 72px);
  padding-bottom: 10px;
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--system-blue, #007AFF);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  min-width: 80px;
}
.btn-back:active { opacity: 0.6; }

.btn-placeholder {
  min-width: 80px;
  flex-shrink: 0;
}

.progress-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.progress-track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--system-gray4, #E5E5EA);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--system-blue, #007AFF);
  transition: width 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 56px;
  text-align: right;
}

.btn-skip {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--system-blue, #007AFF);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  min-width: 80px;
  text-align: right;
}
.btn-skip:active { opacity: 0.6; }

.bottom-close-row {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.btn-close-text {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary, rgba(60,60,67,0.4));
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  -webkit-tap-highlight-color: transparent;
}
.btn-close-text:active { opacity: 0.6; }

/* ── Step transitions (fade-slide in normal flow) ────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}

/* Leaving element: slide and fade out, then hide so it doesn't take up space */
.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  top: 0; left: 0; right: 0;
}

.slide-left-enter-from  { transform: translateX(32px);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-24px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-32px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(24px);  opacity: 0; }
</style>
