import { defineStore } from 'pinia'

function genId(prefix = 'd') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const SWEDISH_MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
]

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    income: [],
    expenses: [],
    categories: [],
    monthlyStatus: {},
    debts: [],
    debtPayments: {},
    variableExpenses: [],
    variableExpenseTransactions: {},
    overviewSettings: {
      showSummaryCards: true,
      showVariableMini: true,
      showChart: true,
      showDebts: true,
      chartType: 'pie',
      cardColors: ['blue-purple', 'orange-pink', 'green-teal'],
      summaryStyle: 'default',
    },
  }),

  getters: {
    totalIncome: (state) => state.income.reduce((sum, i) => sum + i.amount, 0),
    totalExpenses: (state) => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    remaining: (state) => {
      const income = state.income.reduce((sum, i) => sum + i.amount, 0)
      const expenses = state.expenses.reduce((sum, e) => sum + e.amount, 0)
      return income - expenses
    },
    currentMonthKey: () => {
      const now = new Date()
      return `${now.getFullYear()}-${now.getMonth()}`
    },
    currentMonthName: () => {
      return SWEDISH_MONTHS[new Date().getMonth()]
    },
  },

  actions: {
    // ── Overview Settings ────────────────────────────────────────────────────
    setOverviewSetting(key, value) {
      this.overviewSettings[key] = value
    },

    // ── Income ──────────────────────────────────────────────────────────────
    addIncome(name, amount) {
      this.income.push({ name, amount: parseInt(amount) })
    },
    deleteIncome(index) {
      this.income.splice(index, 1)
    },

    // ── Expenses ─────────────────────────────────────────────────────────────
    addExpense(name, amount, category, date = null) {
      const item = { name, amount: parseInt(amount), category }
      if (date) item.date = parseInt(date)
      this.expenses.push(item)
    },
    deleteExpense(index) {
      this.expenses.splice(index, 1)
    },
    saveEditExpense(index, name, amount, category, date = null) {
      const item = { name, amount: parseInt(amount), category }
      if (date) item.date = parseInt(date)
      this.expenses[index] = item
    },

    // ── Categories ───────────────────────────────────────────────────────────
    addCategory(name) {
      if (name && !this.categories.includes(name)) {
        this.categories.push(name)
      }
    },
    deleteCategory(index) {
      const name = this.categories[index]
      this.categories.splice(index, 1)
      // Move expenses to first remaining category
      this.expenses.forEach((e) => {
        if (e.category === name) {
          e.category = this.categories[0]
        }
      })
    },

    // ── Variable Expenses ────────────────────────────────────────────────────
    addVariableExpense(name, budget) {
      if (this.variableExpenses.find((e) => e.name === name)) return false
      this.variableExpenses.push({ name, budget: parseInt(budget) })
      return true
    },
    deleteVariableExpense(index) {
      const name = this.variableExpenses[index].name
      this.variableExpenses.splice(index, 1)
      Object.keys(this.variableExpenseTransactions).forEach((monthKey) => {
        if (this.variableExpenseTransactions[monthKey][name]) {
          delete this.variableExpenseTransactions[monthKey][name]
        }
      })
    },

    // ── Debts ────────────────────────────────────────────────────────────────
    addDebt(name, amount) {
      const id = genId('debt')
      this.debts.push({ id, name, amount: parseInt(amount) })
      this.debtPayments[id] = []
    },
    deleteDebt(index) {
      const removed = this.debts.splice(index, 1)[0]
      if (removed?.id) delete this.debtPayments[removed.id]
    },
    saveEditDebt(index, amount) {
      if (this.debts[index]) this.debts[index].amount = parseInt(amount)
    },

    // ── Debt Payments ────────────────────────────────────────────────────────
    addDebtPayment(debtIndex, amount, note) {
      const debt = this.debts[debtIndex]
      if (!debt) return
      if (!this.debtPayments[debt.id]) this.debtPayments[debt.id] = []
      this.debtPayments[debt.id].push({ amount, note: note || '', date: new Date().toISOString() })
      debt.amount = Math.max(0, debt.amount - amount)
    },
    editDebtPayment(debtIndex, paymentIndex, newAmount, newNote) {
      const debt = this.debts[debtIndex]
      if (!debt) return
      const payments = this.debtPayments[debt.id] || []
      const p = payments[paymentIndex]
      if (!p) return
      const delta = newAmount - p.amount
      debt.amount = Math.max(0, debt.amount - delta)
      p.amount = newAmount
      p.note = newNote || ''
      p.date = new Date().toISOString()
    },
    deleteDebtPayment(debtIndex, paymentIndex) {
      const debt = this.debts[debtIndex]
      if (!debt) return
      const payments = this.debtPayments[debt.id] || []
      const p = payments.splice(paymentIndex, 1)[0]
      if (p) debt.amount = (debt.amount || 0) + p.amount
    },

    // ── Variable Transactions ────────────────────────────────────────────────
    addVariableTransaction(expenseName, amount, note) {
      const monthKey = this.currentMonthKey
      if (!this.variableExpenseTransactions[monthKey]) {
        this.variableExpenseTransactions[monthKey] = {}
      }
      if (!this.variableExpenseTransactions[monthKey][expenseName]) {
        this.variableExpenseTransactions[monthKey][expenseName] = []
      }
      this.variableExpenseTransactions[monthKey][expenseName].push({
        amount,
        note: note || '',
        date: new Date().toISOString(),
      })
    },
    deleteVariableTransaction(expenseIndex, transactionIndex) {
      const monthKey = this.currentMonthKey
      const expense = this.variableExpenses[expenseIndex]
      if (!expense) return
      const transactions = this.variableExpenseTransactions[monthKey]?.[expense.name]
      if (transactions) transactions.splice(transactionIndex, 1)
    },

    // ── Monthly ──────────────────────────────────────────────────────────────
    toggleMonthlyPayment(expenseIndex, paid) {
      if (!this.monthlyStatus['current']) this.monthlyStatus['current'] = {}
      this.monthlyStatus['current'][expenseIndex] = paid
    },
    resetCurrentMonth() {
      this.monthlyStatus['current'] = {}
    },

    // ── Data ─────────────────────────────────────────────────────────────────
    exportData() {
      const dataStr = JSON.stringify({
        income: this.income,
        expenses: this.expenses,
        categories: this.categories,
        monthlyStatus: this.monthlyStatus,
        debts: this.debts,
        debtPayments: this.debtPayments,
        variableExpenses: this.variableExpenses,
        variableExpenseTransactions: this.variableExpenseTransactions,
      }, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'budget-data.json'
      link.click()
      URL.revokeObjectURL(url)
    },
    importData(data) {
      this._applyData(data)
    },
    async loadTestData() {
      const paths = [
        '/assets/testdata/testdata.json',
        '/assets/testdata/Testdata.json',
      ]
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: 'no-store' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          this._applyData(data)
          return true
        } catch {
          // try next path
        }
      }
      return false
    },
    _applyData(data) {
      this.income = data.income || []
      this.categories = (data.categories || []).filter((c) => c !== 'Skulder')
      this.monthlyStatus = data.monthlyStatus || {}
      this.variableExpenses = data.variableExpenses || []
      this.variableExpenseTransactions = data.variableExpenseTransactions || {}

      // Migrate debts
      if (data.debts) {
        this.debts = data.debts.map((d) => ({ ...d, id: d.id || genId('debt') }))
        // Filter out any "Skulder" expenses
        this.expenses = (data.expenses || []).filter((e) => e.category !== 'Skulder')
      } else {
        // Migrate from old format where debts were expenses with category Skulder
        const remaining = []
        const migrated = []
        ;(data.expenses || []).forEach((e) => {
          if (e.category === 'Skulder') {
            migrated.push({ id: genId('debt'), name: e.name, amount: e.amount })
          } else {
            remaining.push(e)
          }
        })
        this.expenses = remaining
        this.debts = migrated
      }

      // Migrate debtPayments keys (name → id)
      if (data.debtPayments) {
        const keys = Object.keys(data.debtPayments)
        const alreadyIds = keys.every((k) => this.debts.some((d) => d.id === k))
        if (alreadyIds) {
          this.debtPayments = data.debtPayments
        } else {
          const migrated = {}
          keys.forEach((key) => {
            const match = this.debts.find((d) => d.name === key)
            if (match) migrated[match.id] = data.debtPayments[key]
          })
          this.debtPayments = migrated
        }
      } else {
        this.debtPayments = {}
        this.debts.forEach((d) => { this.debtPayments[d.id] = [] })
      }
    },

    // Backwards compat: called once on app mount to migrate legacy localStorage data
    migrateData() {
      // Ensure all debts have ids
      this.debts = this.debts.map((d) => ({ ...d, id: d.id || genId('debt') }))
      // Ensure debtPayments keys are ids not names
      if (this.debts.length > 0 && Object.keys(this.debtPayments).length > 0) {
        const keys = Object.keys(this.debtPayments)
        const alreadyIds = keys.every((k) => this.debts.some((d) => d.id === k))
        if (!alreadyIds) {
          const migrated = {}
          keys.forEach((key) => {
            const match = this.debts.find((d) => d.name === key)
            if (match) migrated[match.id] = this.debtPayments[key]
          })
          this.debtPayments = migrated
        }
      }
      // Ensure overviewSettings exists with all required keys
      const defaultOverview = { showSummaryCards: true, showVariableMini: true, showChart: true, showDebts: true, chartType: 'pie', cardColors: ['blue-purple', 'orange-pink', 'green-teal'], summaryStyle: 'default' }
      if (!this.overviewSettings) {
        this.overviewSettings = defaultOverview
      } else {
        for (const [k, v] of Object.entries(defaultOverview)) {
          if (this.overviewSettings[k] === undefined) this.overviewSettings[k] = v
        }
      }

      // Remove Skulder category from categories list
      this.categories = this.categories.filter((c) => c !== 'Skulder')
      // Migrate expenses with category Skulder into debts
      const skulderExpenses = this.expenses.filter((e) => e.category === 'Skulder')
      if (skulderExpenses.length > 0) {
        skulderExpenses.forEach((e) => {
          const id = genId('debt')
          this.debts.push({ id, name: e.name, amount: e.amount })
          this.debtPayments[id] = []
        })
        this.expenses = this.expenses.filter((e) => e.category !== 'Skulder')
      }
    },
  },

  persist: {
    key: 'budgetApp',
  },
})
