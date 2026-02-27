<template>
  <div class="settings-view-root">
    <div class="settings-header">
      <div class="settings-header-left">
        <!-- <button class="back-btn" @click="goBack()" title="Tillbaka">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button> -->
        <h2>Inställningar</h2>
      </div>
    </div>

    <div class="settings-root">

      <!-- Översiktsinställningar -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('overview')">
          <h3>Översikt</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['overview'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['overview']" class="settings-content">
          <div
            v-for="(widget, idx) in store.overviewSettings.widgetOrder"
            :key="widget.id"
            class="widget-order-row"
            :class="{ 'widget-dragging': dragIdx === idx }"
          >
            <div class="widget-order-header">
              <!-- Drag handle: only visible when all sub-settings are collapsed -->
              <div
                class="widget-drag-handle"
                :class="{ 'handle-hidden': !allCollapsed }"
                @pointerdown="startDrag(idx, $event)"
                title="Dra för att ändra ordning"
              >
                <svg viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="3" cy="3"  r="1.5"/>
                  <circle cx="7" cy="3"  r="1.5"/>
                  <circle cx="3" cy="8"  r="1.5"/>
                  <circle cx="7" cy="8"  r="1.5"/>
                  <circle cx="3" cy="13" r="1.5"/>
                  <circle cx="7" cy="13" r="1.5"/>
                </svg>
              </div>

              <!-- Label + expand chevron (clickable for widgets with sub-settings) -->
              <div
                class="widget-order-expandable"
                :class="{ 'has-settings': WIDGETS_WITH_SETTINGS.includes(widget.id) }"
                @click="toggleWidgetSettings(widget.id)"
              >
                <span class="widget-order-label">{{ WIDGET_LABELS[widget.id] }}</span>
                <svg
                  v-if="WIDGETS_WITH_SETTINGS.includes(widget.id)"
                  class="widget-chevron"
                  :class="{ expanded: expandedWidgets[widget.id] }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              <input
                type="checkbox"
                class="ios-toggle"
                :checked="widget.visible"
                @change="toggleWidgetVisible(idx, $event.target.checked)"
              >
            </div>

            <!-- Sub-settings for summary widget -->
            <CollapseTransition><div v-if="expandedWidgets[widget.id] && widget.id === 'summary'" class="widget-sub-settings">
              <div class="chart-type-section">
                <div class="chart-type-label">Storlek</div>
                <div class="chart-type-segment">
                  <button
                    v-for="opt in summaryStyleOptions"
                    :key="opt.value"
                    :class="['segment-btn', { active: store.overviewSettings.summaryStyle === opt.value }]"
                    @click="store.setOverviewSetting('summaryStyle', opt.value)"
                  >{{ opt.label }}</button>
                </div>
              </div>
              <div class="chart-type-section chart-type-section--last">
                <div class="chart-type-label">Färgtema</div>
                <div class="chart-type-segment">
                  <button
                    v-for="p in colorPresets"
                    :key="p.value"
                    :class="['segment-btn', 'preset-btn', { active: activePreset === p.value }]"
                    @click="setPreset(p.value)"
                  >
                    <div class="preset-dots">
                      <span v-for="c in p.colors" :key="c" class="preset-dot" :style="{ background: GRADIENTS[c] }"></span>
                    </div>
                    <span>{{ p.label }}</span>
                  </button>
                </div>
              </div>
            </div></CollapseTransition>

            <!-- Sub-settings for chart widget -->
            <CollapseTransition><div v-if="expandedWidgets[widget.id] && widget.id === 'chart'" class="widget-sub-settings">
              <div class="chart-type-section chart-type-section--last">
                <div class="chart-type-label">Diagramtyp</div>
                <div class="chart-type-segment">
                  <button
                    v-for="opt in chartTypeOptions"
                    :key="opt.value"
                    :class="['segment-btn', { active: store.overviewSettings.chartType === opt.value }]"
                    @click="store.setOverviewSetting('chartType', opt.value)"
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div></CollapseTransition>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Inkomster -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('income')">
          <h3>Inkomster</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['income'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['income']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newIncomeName" placeholder="Namn">
            <input type="number" v-model.number="newIncomeAmount" placeholder="Belopp">
            <button @click="addIncome">Lägg till</button>
          </div>
          <SwipeToDelete
            v-for="(income, idx) in store.income"
            :key="idx"
            @delete="deleteIncome(idx)"
          >
            <template #fixed>
              <div class="expense-name">{{ income.name }}</div>
            </template>
            <div class="expense-amount" style="color: var(--system-green)">{{ fmt(income.amount) }} kr</div>
          </SwipeToDelete>
        </div></CollapseTransition>
      </div>

      <!-- Fasta utgifter -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('expenses')">
          <h3>Utgifter</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['expenses'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['expenses']" class="settings-content">
          <div v-if="store.categories.length === 0" class="no-categories-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Skapa en kategori först innan du lägger till utgifter</span>
          </div>
          <template v-else>
            <div class="input-group">
              <input type="text" v-model="newExpenseName" placeholder="Namn">
              <input type="number" v-model.number="newExpenseAmount" placeholder="Belopp">
            </div>
            <div class="input-group input-group--labeled">
              <div class="field-with-label">
                <span class="field-label">Kategori</span>
                <select v-model="newExpenseCategory">
                  <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="field-with-label field-with-label--narrow">
                <span class="field-label">Dag</span>
                <input type="number" v-model.number="newExpenseDate" placeholder="valfritt" min="1" max="31">
              </div>
              <button class="add-expense-bottom-btn" @click="addExpense">Lägg till</button>
            </div>
          </template>

          <!-- Expenses grouped by category -->
          <template v-for="cat in store.categories" :key="cat">
            <template v-if="expensesByCategory(cat).length > 0">
              <div class="category-header" style="margin-top: 16px;">
                <h4 style="padding: 12px 16px; font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; text-transform: capitalize;">{{ cat }}</h4>
              </div>
              <div class="category-list">
                <div
                  v-for="expense in expensesByCategory(cat)"
                  :key="expense.globalIndex"
                  class="expense-item-wrapper"
                >
                  <SwipeToDelete @delete="deleteExpense(expense.globalIndex)">
                    <template #fixed>
                      <div
                        class="expense-name"
                        :class="{ editing: editingExpense === expense.globalIndex }"
                        @click="toggleEditExpense(expense.globalIndex)"
                      >{{ expense.name }}</div>
                    </template>
                    <div class="expense-row-right">
                      <span class="expense-date-badge" :style="expense.date ? {} : { visibility: 'hidden' }">
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                          <line x1="1" y1="5" x2="11" y2="5"/>
                          <line x1="4" y1="1" x2="4" y2="3"/>
                          <line x1="8" y1="1" x2="8" y2="3"/>
                        </svg>
                        {{ expense.date }}
                      </span>
                      <span class="expense-amount">{{ fmt(expense.amount) }} kr</span>
                    </div>
                  </SwipeToDelete>

                  <div v-show="editingExpense === expense.globalIndex" class="expense-edit-form">
                    <div class="edit-form-content">
                      <div class="edit-input-group">
                        <label>Namn</label>
                        <input type="text" v-model="editForm.name">
                      </div>
                      <div class="edit-input-group">
                        <label>Belopp</label>
                        <input type="number" v-model.number="editForm.amount">
                      </div>
                      <div class="edit-input-group">
                        <label>Kategori</label>
                        <select v-model="editForm.category">
                          <option v-for="c in store.categories" :key="c" :value="c">{{ c }}</option>
                        </select>
                      </div>
                      <div class="edit-input-group">
                        <label>Dag (valfritt)</label>
                        <input type="number" v-model.number="editForm.date" min="1" max="31" placeholder="1–31">
                      </div>
                      <div class="edit-actions">
                        <button class="cancel-edit-btn" @click="editingExpense = null">Avbryt</button>
                        <button class="save-edit-btn" @click="saveExpenseEdit(expense.globalIndex)">Spara</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div></CollapseTransition>
      </div>

      <!-- Kategorier -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('categories')">
          <h3>Kategorier</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['categories'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['categories']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newCategoryName" placeholder="Ny kategori">
            <button @click="addCategory">Lägg till</button>
          </div>
          <SwipeToDelete
            v-for="(cat, idx) in store.categories"
            :key="cat"
            @delete="deleteCategory(idx)"
          >
            <template #fixed>
              <span class="expense-name">{{ cat }}</span>
            </template>
          </SwipeToDelete>
        </div></CollapseTransition>
      </div>

      <!-- Skulder -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('debts')">
          <h3>Skulder</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['debts'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['debts']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newDebtName" placeholder="Namn">
            <input type="number" v-model.number="newDebtAmount" placeholder="Belopp">
            <button @click="addDebt">Lägg till</button>
          </div>
          <div
            v-for="(debt, idx) in store.debts"
            :key="debt.id"
            class="expense-item-wrapper"
          >
            <SwipeToDelete @delete="deleteDebt(idx)">
              <template #fixed>
                <div class="expense-name" @click="toggleEditDebt(idx)">{{ debt.name }}</div>
              </template>
              <div class="expense-amount">{{ fmt(debt.amount) }} kr</div>
            </SwipeToDelete>
            <div v-show="editingDebt === idx" class="expense-edit-form">
              <div class="edit-form-content">
                <div class="edit-input-group">
                  <label>Belopp</label>
                  <input type="number" v-model.number="editDebtAmount">
                </div>
                <div class="edit-actions">
                  <button class="cancel-edit-btn" @click="editingDebt = null">Avbryt</button>
                  <button class="save-edit-btn" @click="saveDebtEdit(idx)">Spara</button>
                </div>
              </div>
            </div>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Data -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('data')">
          <h3>Data</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['data'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['data']" class="settings-content">
          <div class="export-import" style="padding: 12px 16px;">
            <button @click="exportData">Exportera Data</button>
            <button @click="triggerImport">Importera Data</button>
            <button @click="loadTestData">Ladda testdata</button>
            <input
              ref="importFileRef"
              type="file"
              class="file-input"
              accept=".json"
              @change="importFile"
              style="display: none"
            >
          </div>
          <div v-if="statusMsg" style="margin-top:10px; font-size:14px; padding: 0 16px 12px;">{{ statusMsg }}</div>
        </div></CollapseTransition>
      </div>

      <div class="settings-footer">
        <a href="about.html" target="_blank" rel="noopener noreferrer">Om MurvBudget</a>
      </div>

      <button class="support-btn" @click="swish">
        <svg viewBox="0 0 24 24" fill="currentColor" class="support-icon">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>Support this project</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import SwipeToDelete from '../components/SwipeToDelete.vue'
import CollapseTransition from '../components/CollapseTransition.vue'

const store = useBudgetStore()
const goBack = inject('goBack')
const confirm = inject('confirm')

const COLLAPSED_KEY = 'murvbudget-settings-collapsed'
const SECTIONS = ['overview', 'income', 'expenses', 'categories', 'debts', 'data']

const WIDGET_LABELS = {
  summary:    'Sammanfattning',
  chart:      'Diagram',
  debts:      'Skulder',
  checklist:  'Checklista',
  savings:    'Sparkvot',
  categories: 'Kategorier',
}

const WIDGETS_WITH_SETTINGS = ['summary', 'chart']

// Collapsible sub-settings state (all start closed)
const expandedWidgets = reactive({})

const allCollapsed = computed(() =>
  Object.values(expandedWidgets).every(v => !v)
)

function toggleWidgetSettings(id) {
  if (!WIDGETS_WITH_SETTINGS.includes(id)) return
  expandedWidgets[id] = !expandedWidgets[id]
}

function toggleWidgetVisible(idx, value) {
  const order = store.overviewSettings.widgetOrder.map((w, i) =>
    i === idx ? { ...w, visible: value } : w
  )
  store.setOverviewSetting('widgetOrder', order)
}

// Drag-to-reorder
const dragIdx = ref(null)

function startDrag(idx, event) {
  if (!allCollapsed.value) return
  event.preventDefault()
  dragIdx.value = idx
  document.addEventListener('pointermove', onDragMove, { passive: false })
  document.addEventListener('pointerup', onDragEnd)
  document.addEventListener('pointercancel', onDragEnd)
}

function onDragMove(event) {
  if (dragIdx.value === null) return
  event.preventDefault()
  const y = event.clientY
  const rows = document.querySelectorAll('.widget-order-row')
  let newIdx = rows.length - 1
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i].getBoundingClientRect()
    if (y < rect.top + rect.height / 2) {
      newIdx = i
      break
    }
  }
  if (newIdx !== dragIdx.value) {
    const order = [...store.overviewSettings.widgetOrder]
    const [item] = order.splice(dragIdx.value, 1)
    order.splice(newIdx, 0, item)
    store.setOverviewSetting('widgetOrder', order)
    dragIdx.value = newIdx
  }
}

function onDragEnd() {
  dragIdx.value = null
  document.removeEventListener('pointermove', onDragMove)
  document.removeEventListener('pointerup', onDragEnd)
  document.removeEventListener('pointercancel', onDragEnd)
}

const chartTypeOptions = [
  { value: 'pie', label: 'Tårta' },
  { value: 'doughnut', label: 'Munk' },
  { value: 'bar', label: 'Stapel' },
  { value: 'stackedBar', label: 'Staplad' },
]

const summaryStyleOptions = [
  { value: 'compact',  label: 'Kompakt' },
  { value: 'medium',   label: 'Medium' },
  { value: 'default',  label: 'Standard' },
  { value: 'large',    label: 'Stor' },
]

const GRADIENTS = {
  'blue':        'linear-gradient(135deg, #007AFF, #007AFF)',
  'blue-purple': 'linear-gradient(135deg, #007AFF, #AF52DE)',
  'orange-pink': 'linear-gradient(135deg, #FF9500, #FF2D92)',
  'green-teal':  'linear-gradient(135deg, #34C759, #5AC8FA)',
  'red-orange':  'linear-gradient(135deg, #FF3B30, #FF9500)',
  'indigo-blue': 'linear-gradient(135deg, #5856D6, #007AFF)',
  'pink-red':    'linear-gradient(135deg, #FF2D92, #FF3B30)',
  'neutral':     'linear-gradient(135deg, #D1D1D6, #D1D1D6)',
}

const colorPresets = [
  { value: 'colorful', label: 'Färgglad', colors: ['blue-purple', 'orange-pink', 'green-teal'] },
  { value: 'blue',     label: 'Blue',     colors: ['blue', 'blue', 'blue'] },
  { value: 'neutral',  label: 'Neutral',  colors: ['neutral', 'neutral', 'neutral'] },
]

const activePreset = computed(() => {
  const current = JSON.stringify(store.overviewSettings.cardColors || [])
  return colorPresets.find((p) => JSON.stringify(p.colors) === current)?.value ?? null
})

function setPreset(value) {
  const preset = colorPresets.find((p) => p.value === value)
  if (preset) store.setOverviewSetting('cardColors', [...preset.colors])
}

function loadCollapsed() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    const state = {}
    for (const s of SECTIONS) state[s] = saved[s] !== false
    return state
  } catch {
    return Object.fromEntries(SECTIONS.map((s) => [s, true]))
  }
}

const collapsedSections = reactive(loadCollapsed())

watch(() => collapsedSections['overview'], (collapsed) => {
  if (collapsed) {
    for (const id of WIDGETS_WITH_SETTINGS) expandedWidgets[id] = false
  }
})

function toggleSection(key) {
  collapsedSections[key] = !collapsedSections[key]
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedSections }))
  } catch {}
}

function toggleAllSections() {
  const anyOpen = SECTIONS.some(s => !collapsedSections[s])
  for (const s of SECTIONS) collapsedSections[s] = anyOpen
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedSections }))
  } catch {}
}

defineExpose({ toggleAllSections })

// New item form state
const newCategoryName = ref('')
const newExpenseName = ref('')
const newExpenseAmount = ref(null)
const newExpenseCategory = ref(store.categories[0] || '')
const newExpenseDate = ref(null)
const newIncomeName = ref('')
const newIncomeAmount = ref(null)
const newDebtName = ref('')
const newDebtAmount = ref(null)
const importFileRef = ref(null)
const statusMsg = ref('')

// Expense editing state
const editingExpense = ref(null)
const editForm = reactive({ name: '', amount: null, category: '', date: null })

function expensesByCategory(cat) {
  return store.expenses
    .map((e, i) => ({ ...e, globalIndex: i }))
    .filter((e) => e.category === cat)
    .sort((a, b) => b.amount - a.amount)
}

function toggleEditExpense(globalIndex) {
  if (editingExpense.value === globalIndex) {
    editingExpense.value = null
    return
  }
  editingExpense.value = globalIndex
  const e = store.expenses[globalIndex]
  editForm.name = e.name
  editForm.amount = e.amount
  editForm.category = e.category
  editForm.date = e.date || null
}

function saveExpenseEdit(globalIndex) {
  if (!editForm.name || !editForm.amount || editForm.amount <= 0) {
    alert('Vänligen fyll i giltigt namn och belopp.')
    return
  }
  store.saveEditExpense(globalIndex, editForm.name, editForm.amount, editForm.category, editForm.date)
  editingExpense.value = null
}

function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  if (name === 'Skulder') { alert("'Skulder' är reserverat och kan inte läggas till."); return }
  store.addCategory(name)
  newCategoryName.value = ''
}

async function deleteCategory(idx) {
  if (store.categories.length === 1) return
  const ok = await confirm('Ta bort kategorin? Utgifter i den här kategorin flyttas till den första kategorin.')
  if (ok) store.deleteCategory(idx)
}

function addExpense() {
  const name = newExpenseName.value.trim()
  const amount = newExpenseAmount.value
  const category = newExpenseCategory.value
  if (!name || !amount || amount <= 0 || !category) return
  store.addExpense(name, amount, category, newExpenseDate.value)
  newExpenseName.value = ''
  newExpenseAmount.value = null
  newExpenseDate.value = null
}

async function deleteExpense(idx) {
  const ok = await confirm('Ta bort utgiften?')
  if (ok) store.deleteExpense(idx)
}

function addIncome() {
  const name = newIncomeName.value.trim()
  const amount = newIncomeAmount.value
  if (!name || !amount || amount <= 0) return
  store.addIncome(name, amount)
  newIncomeName.value = ''
  newIncomeAmount.value = null
}

async function deleteIncome(idx) {
  const ok = await confirm('Ta bort inkomsten?')
  if (ok) store.deleteIncome(idx)
}

function addDebt() {
  const name = newDebtName.value.trim()
  const amount = newDebtAmount.value
  if (!name || !amount || amount <= 0) return
  store.addDebt(name, amount)
  newDebtName.value = ''
  newDebtAmount.value = null
}

async function deleteDebt(idx) {
  const ok = await confirm('Ta bort skulden?')
  if (ok) store.deleteDebt(idx)
}

const editingDebt = ref(null)
const editDebtAmount = ref(null)

function toggleEditDebt(idx) {
  if (editingDebt.value === idx) { editingDebt.value = null; return }
  editingDebt.value = idx
  editDebtAmount.value = store.debts[idx].amount
}

function saveDebtEdit(idx) {
  if (!editDebtAmount.value || editDebtAmount.value <= 0) return
  store.saveEditDebt(idx, editDebtAmount.value)
  editingDebt.value = null
}

function exportData() {
  store.exportData()
  statusMsg.value = 'Data exporterad!'
  setTimeout(() => { statusMsg.value = '' }, 3000)
}

function triggerImport() {
  importFileRef.value?.click()
}

function importFile(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const required = ['income', 'expenses', 'categories']
      const missing = required.filter(k => !Array.isArray(data[k]))
      if (missing.length) {
        alert(`Filen saknar obligatoriska fält: ${missing.join(', ')}. Kontrollera att det är en giltig MurvBudget-fil.`)
        event.target.value = ''
        return
      }
      if (confirm('Detta kommer att ersätta all nuvarande data. Fortsätt?')) {
        store.importData(data)
        statusMsg.value = 'Data importerad!'
        setTimeout(() => { statusMsg.value = '' }, 3000)
      }
    } catch {
      alert('Fel vid import av data. Kontrollera att filen är korrekt JSON.')
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

async function loadTestData() {
  if (!confirm('Detta kommer att ersätta all nuvarande data. Fortsätt?')) return
  const ok = await store.loadTestData()
  if (ok) {
    statusMsg.value = 'Testdata laddad!'
    setTimeout(() => { statusMsg.value = '' }, 3000)
  } else {
    alert('Kunde inte ladda testdata.')
  }
}


function swish() {
  window.location.href = 'https://app.swish.nu/1/p/sw/?sw=46701484473&amt=10.0&msg=Cool%20app&edit=amt,msg'
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
/* Pull the settings view up to cancel the body's nav-bar padding (no AppHeader here) */
.settings-view-root {
  margin-top: -60px;
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--separator);
}

/* Override the global .settings-section h3 border since section-toggle now owns it */
.section-toggle h3 {
  border-bottom: none;
  flex: 1;
}

.chevron {
  width: 18px;
  height: 18px;
  margin-right: 20px;
  color: var(--system-blue);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

/* Overview toggle rows */
.overview-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--separator);
}

.overview-toggle-row.no-separator {
  border-bottom: none;
}

.chart-type-section--last {
  border-bottom: 0.5px solid var(--separator);
}

.overview-toggle-label {
  font-size: 16px;
  color: var(--text-primary);
}

/* Widget order rows */
.widget-order-row {
  border-bottom: 0.5px solid var(--separator);
  transition: background 0.15s;
}

.widget-order-row.widget-dragging {
  background: rgba(120, 120, 128, 0.1);
  border-radius: 10px;
  border-bottom-color: transparent;
}

.widget-order-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
}

/* Drag handle */
.widget-drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--text-tertiary);
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  opacity: 1;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.widget-drag-handle.handle-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.6);
}

.widget-drag-handle:active {
  cursor: grabbing;
}

.widget-drag-handle svg {
  width: 10px;
  height: 16px;
}

/* Expandable label area */
.widget-order-expandable {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.widget-order-expandable.has-settings {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.widget-order-label {
  font-size: 16px;
  color: var(--text-primary);
}

/* Per-widget expand chevron */
.widget-chevron {
  width: 16px;
  height: 16px;
  color: var(--system-blue);
  flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.widget-chevron.expanded {
  transform: rotate(180deg);
}

/* Sub-settings panel */
.widget-sub-settings {
  border-top: 0.5px solid var(--separator);
}

/* iOS 26 toggle — wider, flatter, near-transparent off-state with border */
.ios-toggle {
  position: relative;
  width: 65px;
  height: 27px;
  flex-shrink: 0;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(120, 120, 128, 0.1);
  border: 1px solid rgba(120, 120, 128, 0.3);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              border-color 0.25s;
  outline: none;
}

.ios-toggle:checked {
  background: var(--system-green);
  border-color: transparent;
}

.ios-toggle::after {
  content: '';
  position: absolute;
  width: 36px;
  height: 23px;
  background: #ffffff;
  border-radius: 999px;
  top: 1px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22), 0 0.5px 2px rgba(0, 0, 0, 0.12);
}

.ios-toggle:checked::after {
  transform: translateX(24px);
}

@media (prefers-color-scheme: dark) {
  .ios-toggle {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
  }
}

/* Preset buttons (color theme + chart type share segment-btn, preset-btn adds column layout) */
.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  min-height: unset;
  white-space: nowrap;
}

.preset-dots {
  display: flex;
  gap: 4px;
}

.preset-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: block;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Chart type pill chips */
.chart-type-section {
  padding: 14px 16px 16px;
}

.chart-type-label {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.chart-type-segment {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}

.segment-btn {
  flex: 1;
  padding: 10px 8px;
  border: 1.5px solid var(--separator);
  background: transparent;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.segment-btn.active {
  background: var(--system-blue);
  border-color: var(--system-blue);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.4);
}

@media (prefers-color-scheme: dark) {
  .segment-btn {
    border-color: rgba(255, 255, 255, 0.14);
    color: var(--text-secondary);
  }

  .segment-btn.active {
    box-shadow: 0 2px 10px rgba(0, 122, 255, 0.55);
  }
}

/* Labeled field layout for add-expense form */
.input-group--labeled {
  align-items: flex-end;
  flex-wrap: nowrap;
}

.field-with-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.field-with-label--narrow {
  flex: 0 0 84px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding-left: 7px;
}

.no-categories-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 16px;
  padding: 12px 14px;
  background: rgba(255, 149, 0, 0.1);
  border-radius: 10px;
  color: var(--system-orange);
  font-size: 14px;
  line-height: 1.4;
}

.no-categories-notice svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.add-expense-bottom-btn {
  align-self: flex-end;
}

/* Support button */
.support-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 32px);
  margin: 8px 22px 32px;
  padding: 12px 22px;
  background: rgba(255, 45, 85, 0.1);
  border: none;
  border-radius: 999px;
  color: #FF2D55;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.support-btn:active {
  opacity: 0.6;
}

.support-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .support-btn {
    background: rgba(255, 45, 85, 0.15);
  }
}
</style>
