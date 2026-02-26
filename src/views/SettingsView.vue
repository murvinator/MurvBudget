<template>
  <div>
    <!-- Sticky header with back button -->
    <div class="settings-header">
      <div class="settings-header-left">
        <button class="back-btn" @click="goBack()" title="Tillbaka">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2>Inställningar</h2>
      </div>
    </div>

    <div class="settings-root">

      <!-- Rörliga utgifter -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('varExpenses')">
          <h3>Rörliga utgifter</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['varExpenses'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['varExpenses']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newVarName" placeholder="Namn">
            <input type="number" v-model.number="newVarBudget" placeholder="Belopp">
            <button @click="addVarExpense">Lägg till</button>
          </div>
          <template v-if="store.variableExpenses.length === 0">
            <p style="padding: 12px 16px;">Inga varierande utgifter ännu</p>
          </template>
          <div
            v-for="(e, idx) in store.variableExpenses"
            :key="e.name"
            class="expense-item"
          >
            <div class="expense-info">
              <div class="expense-name">{{ e.name }}</div>
            </div>
            <div class="expense-amount">{{ fmt(e.budget) }} kr</div>
            <button class="delete-btn" @click="deleteVarExpense(idx)">Ta bort</button>
          </div>
        </div>
      </div>

      <!-- Kategorier -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('categories')">
          <h3>Kategorier</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['categories'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['categories']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newCategoryName" placeholder="Ny kategori">
            <button @click="addCategory">Lägg till</button>
          </div>
          <div
            v-for="(cat, idx) in store.categories"
            :key="cat"
            class="category-item"
          >
            <span>{{ cat }}</span>
            <button class="delete-btn" @click="deleteCategory(idx)">Ta bort</button>
          </div>
        </div>
      </div>

      <!-- Fasta utgifter -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('expenses')">
          <h3>Fasta utgifter</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['expenses'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['expenses']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newExpenseName" placeholder="Namn">
            <input type="number" v-model.number="newExpenseAmount" placeholder="Belopp">
          </div>
          <div class="input-group">
            <select v-model="newExpenseCategory">
              <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <button @click="addExpense">Lägg till</button>
          </div>

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
                  <div
                    class="expense-item editable-expense"
                    :class="{ editing: editingExpense === expense.globalIndex }"
                    @click="toggleEditExpense(expense.globalIndex)"
                  >
                    <div class="expense-info">
                      <div class="expense-name">{{ expense.name }}</div>
                    </div>
                    <div class="expense-amount">{{ fmt(expense.amount) }} kr</div>
                    <button class="delete-btn" @click.stop="deleteExpense(expense.globalIndex)">Ta bort</button>
                  </div>

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
        </div>
      </div>

      <!-- Inkomster -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('income')">
          <h3>Inkomster</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['income'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['income']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newIncomeName" placeholder="Namn">
            <input type="number" v-model.number="newIncomeAmount" placeholder="Belopp">
            <button @click="addIncome">Lägg till</button>
          </div>
          <div
            v-for="(income, idx) in store.income"
            :key="idx"
            class="expense-item"
          >
            <div class="expense-info">
              <div class="expense-name">{{ income.name }}</div>
            </div>
            <div class="expense-amount" style="color: var(--system-green)">{{ fmt(income.amount) }} kr</div>
            <button class="delete-btn" @click="deleteIncome(idx)">Ta bort</button>
          </div>
        </div>
      </div>

      <!-- Skulder -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('debts')">
          <h3>Skulder</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['debts'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['debts']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newDebtName" placeholder="Namn">
            <input type="number" v-model.number="newDebtAmount" placeholder="Belopp">
            <button @click="addDebt">Lägg till</button>
          </div>
          <template v-if="store.debts.length === 0">
            <p style="padding: 12px 16px;">Inga skulder registrerade</p>
          </template>
          <div
            v-for="(debt, idx) in store.debts"
            :key="debt.id"
            class="expense-item"
          >
            <div class="expense-info">
              <div class="expense-name">{{ debt.name }}</div>
            </div>
            <div class="expense-amount">{{ fmt(debt.amount) }} kr</div>
            <button class="delete-btn" @click="deleteDebt(idx)">Ta bort</button>
          </div>
        </div>
      </div>

      <!-- Data -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('data')">
          <h3>Data</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['data'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-show="!collapsedSections['data']" class="settings-content">
          <div class="export-import" style="padding: 12px 16px;">
            <button @click="store.exportData()">Exportera Data</button>
            <button @click="triggerImport">Importera Data</button>
            <button @click="loadTestData">Ladda testdata</button>
            <input
              ref="importFileRef"
              type="file"
              class="file-input"
              accept=".json"
              @change="importFile"
            >
          </div>
          <div v-if="statusMsg" style="margin-top:10px; font-size:14px; padding: 0 16px 12px;">{{ statusMsg }}</div>
        </div>
      </div>

      <div class="settings-footer">
        <a href="about.html" target="_blank" rel="noopener noreferrer">Om MurvBudget</a>
      </div>
      <div class="swish-footer">
        <button class="swish-btn" @click="swish">Swisha en gåva</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const goBack = inject('goBack')

const collapsedSections = reactive({})
function toggleSection(key) {
  collapsedSections[key] = !collapsedSections[key]
}

// New item form state
const newVarName = ref('')
const newVarBudget = ref(null)
const newCategoryName = ref('')
const newExpenseName = ref('')
const newExpenseAmount = ref(null)
const newExpenseCategory = ref(store.categories[0] || '')
const newIncomeName = ref('')
const newIncomeAmount = ref(null)
const newDebtName = ref('')
const newDebtAmount = ref(null)
const importFileRef = ref(null)
const statusMsg = ref('')

// Expense editing state
const editingExpense = ref(null)
const editForm = reactive({ name: '', amount: null, category: '' })

function expensesByCategory(cat) {
  return store.expenses
    .map((e, i) => ({ ...e, globalIndex: i }))
    .filter((e) => e.category === cat)
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
}

function saveExpenseEdit(globalIndex) {
  if (!editForm.name || !editForm.amount || editForm.amount <= 0) {
    alert('Vänligen fyll i giltigt namn och belopp.')
    return
  }
  store.saveEditExpense(globalIndex, editForm.name, editForm.amount, editForm.category)
  editingExpense.value = null
}

function addVarExpense() {
  if (!newVarName.value || !newVarBudget.value || newVarBudget.value <= 0) return
  const ok = store.addVariableExpense(newVarName.value.trim(), newVarBudget.value)
  if (!ok) { alert('En kategori med detta namn finns redan.'); return }
  newVarName.value = ''
  newVarBudget.value = null
}

function deleteVarExpense(idx) {
  if (confirm('Är du säker på att du vill ta bort denna varierande utgift? All historik kommer att raderas.')) {
    store.deleteVariableExpense(idx)
  }
}

function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  if (name === 'Skulder') { alert("'Skulder' är reserverat och kan inte läggas till."); return }
  store.addCategory(name)
  newCategoryName.value = ''
}

function deleteCategory(idx) {
  if (store.categories.length === 1) { alert('Du måste ha minst en kategori.'); return }
  if (confirm('Detta kommer att ta bort kategorin. Utgifter i denna kategori kommer att flyttas till första kategorin.')) {
    store.deleteCategory(idx)
  }
}

function addExpense() {
  const name = newExpenseName.value.trim()
  const amount = newExpenseAmount.value
  const category = newExpenseCategory.value
  if (!name || !amount || amount <= 0 || !category) return
  store.addExpense(name, amount, category)
  newExpenseName.value = ''
  newExpenseAmount.value = null
}

function deleteExpense(idx) {
  if (confirm('Är du säker på att du vill ta bort denna utgift?')) {
    store.deleteExpense(idx)
  }
}

function addIncome() {
  const name = newIncomeName.value.trim()
  const amount = newIncomeAmount.value
  if (!name || !amount || amount <= 0) return
  store.addIncome(name, amount)
  newIncomeName.value = ''
  newIncomeAmount.value = null
}

function deleteIncome(idx) {
  if (confirm('Är du säker på att du vill ta bort denna inkomst?')) {
    store.deleteIncome(idx)
  }
}

function addDebt() {
  const name = newDebtName.value.trim()
  const amount = newDebtAmount.value
  if (!name || !amount || amount <= 0) return
  store.addDebt(name, amount)
  newDebtName.value = ''
  newDebtAmount.value = null
}

function deleteDebt(idx) {
  if (confirm('Är du säker på att du vill ta bort denna skuld?')) {
    store.deleteDebt(idx)
  }
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
      if (confirm('Detta kommer att ersätta all nuvarande data. Fortsätt?')) {
        store.importData(data)
        statusMsg.value = 'Data importerad!'
        setTimeout(() => { statusMsg.value = '' }, 3000)
      }
    } catch {
      alert('Fel vid import av data. Kontrollera att filen är korrekt.')
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
  margin-right: 16px;
  color: var(--text-tertiary);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}
</style>
