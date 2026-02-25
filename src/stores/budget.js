import { defineStore } from 'pinia'

const STORAGE_KEY = 'budgetApp'
const DEBT_CATEGORY = 'Skulder'

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

function createDefaultState() {
  return {
    budgetData: {
      income: [],
      expenses: [],
      categories: [],
      monthlyStatus: { current: {} },
      debtStatus: {},
      debts: [],
      debtPayments: {},
      variableExpenses: [],
      variableExpenseTransactions: {}
    },
    initialized: false
  }
}

function formatKr(value) {
  try {
    return `${Number(value || 0).toLocaleString('sv-SE')} kr`
  } catch {
    return `${value} kr`
  }
}

export const useBudgetStore = defineStore('budget', {
  state: () => createDefaultState(),

  getters: {
    totalIncome(state) {
      return state.budgetData.income.reduce((s, i) => s + Number(i.amount || 0), 0)
    },
    totalFixedExpenses(state) {
      return state.budgetData.expenses
        .filter(e => e.category !== DEBT_CATEGORY)
        .reduce((s, e) => s + Number(e.amount || 0), 0)
    },
    remaining(state) {
      return this.totalIncome - this.totalFixedExpenses
    },
    // formatted
    totalIncomeKr() { return formatKr(this.totalIncome) },
    totalFixedExpensesKr() { return formatKr(this.totalFixedExpenses) },
    remainingKr() { return formatKr(this.remaining) },
    currentMonthKey: () => monthKey(),
  },

  actions: {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          // allow both legacy and new shapes
          this.budgetData = this._migrate(parsed)
        } catch (e) {
          console.warn('Failed to parse stored data, using defaults', e)
          this.budgetData = createDefaultState().budgetData
        }
      }
      this.initialized = true
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.budgetData))
    },

    getCurrentMonthKey() { return monthKey() },

    // ============ Variable Expenses ============
    addVariableExpense({ name, budget }) {
      const n = (name || '').trim()
      const b = Number(budget)
      if (!n || isNaN(b)) return false
      this.budgetData.variableExpenses.push({ name: n, budget: b })
      this.save()
      return true
    },
    deleteVariableExpense(index) {
      const arr = this.budgetData.variableExpenses
      if (index < 0 || index >= arr.length) return false
      arr.splice(index, 1)
      this.save()
      return true
    },

    // ============ Categories ============
    addCategory(name) {
      const n = (name || '').trim()
      if (!n || n === DEBT_CATEGORY) return false
      if (!this.budgetData.categories.includes(n)) {
        this.budgetData.categories.push(n)
        this.save()
      }
      return true
    },
    removeCategory(name) {
      // Prevent removal if any fixed expense uses it
      const inUse = this.budgetData.expenses.some(e => e.category === name)
      if (inUse) return false
      this.budgetData.categories = this.budgetData.categories.filter(c => c !== name)
      this.save()
      return true
    },

    // ============ Incomes ============
    addIncome({ name, amount }) {
      const n = (name || '').trim()
      const a = Number(amount)
      if (!n || isNaN(a)) return false
      this.budgetData.income.push({ name: n, amount: a })
      this.save()
      return true
    },
    deleteIncome(index) {
      if (index < 0 || index >= this.budgetData.income.length) return false
      this.budgetData.income.splice(index, 1)
      this.save()
      return true
    },

    // ============ Fixed Expenses ============
    addExpense({ name, amount, category }) {
      const n = (name || '').trim()
      const a = Number(amount)
      const c = (category || '').trim()
      if (!n || isNaN(a) || !c || c === DEBT_CATEGORY) return false
      this.budgetData.expenses.push({ name: n, amount: a, category: c })
      this.save()
      return true
    },
    deleteExpense(index) {
      const arr = this.budgetData.expenses
      if (index < 0 || index >= arr.length) return false
      // block deleting items that are debt-category in case legacy is around
      if (arr[index].category === DEBT_CATEGORY) return false
      arr.splice(index, 1)
      this.save()
      return true
    },

    // Private: migrate various legacy shapes to the current canonical structure
    _migrate(data) {
      const clone = JSON.parse(JSON.stringify(data || {}))

      // Ensure required containers exist
      clone.income ||= []
      clone.expenses ||= []
      clone.categories ||= []
      clone.monthlyStatus ||= { current: {} }
      clone.debts ||= []
      clone.debtPayments ||= {}
      clone.variableExpenses ||= []
      clone.variableExpenseTransactions ||= {}

      // 1) Move any expenses with category === 'Skulder' to debts
      const legacyDebtExpenses = (clone.expenses || []).filter(e => e.category === DEBT_CATEGORY)
      if (legacyDebtExpenses.length) {
        // build name->id map
        const nameToId = {}
        legacyDebtExpenses.forEach(e => {
          const id = `debt-${Math.random().toString(36).slice(2, 8)}`
          nameToId[e.name] = id
          clone.debts.push({ id, name: e.name, amount: Number(e.amount || 0) })
        })
        clone.expenses = clone.expenses.filter(e => e.category !== DEBT_CATEGORY)

        // 2) If legacy debtPayments keyed by name exists, remap to ids
        // Example: { "Banklån": [ {amount, note, date} ] }
        const remapped = {}
        const src = clone.debtPayments || {}
        Object.keys(src).forEach(name => {
          const id = nameToId[name]
          if (id) remapped[id] = src[name]
        })
        // merge any existing id-keyed entries
        Object.assign(remapped, Object.fromEntries(
          Object.entries(src).filter(([k]) => k.startsWith('debt-'))
        ))
        clone.debtPayments = remapped
      }

      // Ensure categories does not contain reserved debt category
      clone.categories = (clone.categories || []).filter(c => c !== DEBT_CATEGORY)
      return clone
    },

    // ============ Debts ============
    addDebt({ name, amount }) {
      const n = (name || '').trim()
      const a = Number(amount)
      if (!n || isNaN(a)) return false
      const id = `debt-${Math.random().toString(36).slice(2, 8)}`
      this.budgetData.debts.push({ id, name: n, amount: a })
      this.budgetData.debtPayments[id] ||= []
      this.save()
      return true
    },
    deleteDebt(index) {
      const arr = this.budgetData.debts
      if (index < 0 || index >= arr.length) return false
      const [removed] = arr.splice(index, 1)
      if (removed?.id) delete this.budgetData.debtPayments[removed.id]
      this.save()
      return true
    },

    // ============ Import/Export ============
    exportAsJson() {
      try {
        return JSON.stringify(this.budgetData, null, 2)
      } catch {
        return '{}'
      }
    },
    replaceAll(data) {
      this.budgetData = this._migrate(data)
      this.save()
    },
  }
})

export { DEBT_CATEGORY, formatKr }
