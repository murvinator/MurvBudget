import { defineStore } from 'pinia'
import supabase from '../lib/supabase'

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
    variableActuals: {},
    variableExpenses: [],
    variableExpenseTransactions: {},
    savings: [],
    savingsDeposits: {},
    monthlyChecklistTracking: {},
    finansOrder: ['debts', 'savings', 'flex'],
    salaryDay: null,
    salaryMonthOffset: false,
    tempMonthlyIncome: {},
    overviewSettings: {
      showSummaryCards: true,
      showVariableMini: true,
      showChart: true,
      showDebts: true,
      chartType: 'pie',
      chartColorScheme: 'colorful',
      cardColors: ['blue-purple', 'orange-pink', 'green-teal'],
      summaryStyle: 'default',
      widgetOrder: [
        { id: 'summary',    visible: true },
        { id: 'chart',      visible: true },
        { id: 'debts',      visible: true },
        { id: 'checklist',  visible: true },
        { id: 'savings',    visible: true },
        { id: 'categories', visible: true },
        { id: 'flex',       visible: true },
      ],
      widgetSettings: {
        flex:       { style: 'default', showBars: true },
        checklist:  { size: 'default' },
        savings:    { size: 'default' },
        categories: { size: 'default', maxItems: 0 },
      },
    },
  }),

  getters: {
    totalIncome: (state) => {
      const mk = `${new Date().getFullYear()}-${new Date().getMonth()}`
      const overrides = state.tempMonthlyIncome?.[mk]
      // Guard: if old format (number) or empty, ignore
      if (!overrides || typeof overrides !== 'object') {
        return state.income.reduce((sum, i) => sum + i.amount, 0)
      }
      return state.income.reduce((sum, i) => {
        return sum + (overrides[i.name] !== undefined ? overrides[i.name] : i.amount)
      }, 0)
    },
    totalExpenses: (state) => {
      const now = new Date()
      const mk = `${now.getFullYear()}-${now.getMonth()}`
      return state.expenses.reduce((sum, e) => {
        if (e.variable) {
          const actual = state.variableActuals?.[mk]?.[e.name]
          return sum + (actual !== undefined ? actual : e.amount)
        }
        return sum + e.amount
      }, 0)
    },
    remaining: (state) => {
      const now = new Date()
      const mk = `${now.getFullYear()}-${now.getMonth()}`
      const overrides = state.tempMonthlyIncome?.[mk]
      const income = (overrides && typeof overrides === 'object')
        ? state.income.reduce((sum, i) => sum + (overrides[i.name] !== undefined ? overrides[i.name] : i.amount), 0)
        : state.income.reduce((sum, i) => sum + i.amount, 0)
      const expenses = state.expenses.reduce((sum, e) => {
        if (e.variable) {
          const actual = state.variableActuals?.[mk]?.[e.name]
          return sum + (actual !== undefined ? actual : e.amount)
        }
        return sum + e.amount
      }, 0)
      return income - expenses
    },
    currentMonthKey: () => {
      const now = new Date()
      return `${now.getFullYear()}-${now.getMonth()}`
    },
    currentMonthName: () => {
      return SWEDISH_MONTHS[new Date().getMonth()]
    },
    displayMonthName: (state) => {
      const today = new Date()
      if (state.salaryMonthOffset && state.salaryDay && today.getDate() >= state.salaryDay) {
        return SWEDISH_MONTHS[(today.getMonth() + 1) % 12]
      }
      return SWEDISH_MONTHS[today.getMonth()]
    },
  },

  actions: {
    // ── Overview Settings ────────────────────────────────────────────────────
    setOverviewSetting(key, value) {
      this.overviewSettings[key] = value
    },

    setWidgetSetting(widgetId, key, value) {
      if (!this.overviewSettings.widgetSettings) this.overviewSettings.widgetSettings = {}
      if (!this.overviewSettings.widgetSettings[widgetId]) this.overviewSettings.widgetSettings[widgetId] = {}
      this.overviewSettings.widgetSettings[widgetId][key] = value
    },

    // ── Income ──────────────────────────────────────────────────────────────
    addIncome(name, amount) {
      this.income.push({ name, amount: parseInt(amount) })
    },
    deleteIncome(index) {
      this.income.splice(index, 1)
    },
    saveEditIncome(index, name, amount) {
      if (this.income[index]) {
        this.income[index].name = name
        this.income[index].amount = parseInt(amount)
      }
    },

    // ── Expenses ─────────────────────────────────────────────────────────────
    addExpense(name, amount, category = null, date = null, variable = false) {
      const item = { name, amount: parseInt(amount), category: category || null }
      if (date) item.date = parseInt(date)
      if (variable) item.variable = true
      this.expenses.push(item)
    },
    deleteExpense(index) {
      this.expenses.splice(index, 1)
    },
    saveEditExpense(index, name, amount, category, date = null, variable = false) {
      const item = { name, amount: parseInt(amount), category: category || null }
      if (date) item.date = parseInt(date)
      if (variable) item.variable = true
      this.expenses[index] = item
    },

    // ── Temp Monthly Income ───────────────────────────────────────────────────
    // Sets or clears a per-income-source override for a given month.
    // amount = null clears the override for that income source.
    setTempMonthlyIncome(monthKey, incomeName, amount) {
      if (!this.tempMonthlyIncome) this.tempMonthlyIncome = {}
      if (!this.tempMonthlyIncome[monthKey] || typeof this.tempMonthlyIncome[monthKey] !== 'object') {
        this.tempMonthlyIncome[monthKey] = {}
      }
      if (amount === null || amount === undefined) {
        delete this.tempMonthlyIncome[monthKey][incomeName]
        if (Object.keys(this.tempMonthlyIncome[monthKey]).length === 0) {
          delete this.tempMonthlyIncome[monthKey]
        }
      } else {
        this.tempMonthlyIncome[monthKey][incomeName] = parseInt(amount)
      }
    },
    clearTempMonthlyIncome(monthKey) {
      if (this.tempMonthlyIncome) delete this.tempMonthlyIncome[monthKey]
    },

    // ── Variable Actuals ─────────────────────────────────────────────────────
    setVariableActual(expenseName, amount) {
      const mk = this.currentMonthKey
      if (!this.variableActuals[mk]) this.variableActuals[mk] = {}
      if (amount === null || amount === undefined) {
        delete this.variableActuals[mk][expenseName]
      } else {
        this.variableActuals[mk][expenseName] = parseInt(amount)
      }
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
      // Uncategorize expenses that belonged to the deleted category
      this.expenses.forEach((e) => {
        if (e.category === name) {
          e.category = null
        }
      })
    },
    reorderCategories(newOrder) {
      this.categories = newOrder
    },
    setFinansOrder(newOrder) {
      this.finansOrder = newOrder
    },
    saveEditCategory(index, newName) {
      const oldName = this.categories[index]
      if (!oldName || !newName || newName === oldName) return
      if (this.categories.includes(newName)) return
      this.categories[index] = newName
      this.expenses.forEach((e) => {
        if (e.category === oldName) e.category = newName
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
    addDebt(name, amount, date) {
      const id = genId('debt')
      this.debts.push({ id, name, amount: parseInt(amount), date: date || null })
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

    // ── Savings Goals ────────────────────────────────────────────────────────
    setSavingsGoal(name, target, date) {
      const id = genId('sav')
      if (!this.savings) this.savings = []
      if (!this.savingsDeposits) this.savingsDeposits = {}
      this.savings.push({ id, name, target: parseInt(target), current: 0, date: date || null })
      this.savingsDeposits[id] = []
    },
    editSavingsGoal(index, name, target) {
      if (this.savings[index]) {
        this.savings[index].name = name
        this.savings[index].target = parseInt(target)
      }
    },
    deleteSavingsGoal(index) {
      const removed = this.savings.splice(index, 1)[0]
      if (removed?.id) delete this.savingsDeposits[removed.id]
    },
    addSavingsDeposit(goalIndex, amount, note) {
      const goal = this.savings[goalIndex]
      if (!goal) return
      if (!this.savingsDeposits[goal.id]) this.savingsDeposits[goal.id] = []
      const amt = parseInt(amount)
      this.savingsDeposits[goal.id].push({ amount: amt, note: note || '', date: new Date().toISOString() })
      goal.current = (goal.current || 0) + amt
    },
    deleteSavingsDeposit(goalIndex, depositIndex) {
      const goal = this.savings[goalIndex]
      if (!goal) return
      const deposits = this.savingsDeposits[goal.id] || []
      const d = deposits.splice(depositIndex, 1)[0]
      if (d) goal.current = Math.max(0, (goal.current || 0) - d.amount)
    },

    // ── Debt Monthly Payment ─────────────────────────────────────────────────
    setDebtMonthlyPayment(debtIndex, amount) {
      if (!this.debts[debtIndex]) return
      if (!amount || parseInt(amount) <= 0) {
        delete this.debts[debtIndex].monthlyPayment
      } else {
        this.debts[debtIndex].monthlyPayment = parseInt(amount)
      }
    },
    toggleDebtMonthlyPayment(debtId, paid) {
      if (!this.monthlyStatus['current']) this.monthlyStatus['current'] = {}
      this.monthlyStatus['current']['debt-' + debtId] = paid
    },

    // ── Savings Monthly Payment ──────────────────────────────────────────────
    setSavingsMonthlyPayment(index, amount) {
      if (!this.savings[index]) return
      if (!amount || parseInt(amount) <= 0) {
        delete this.savings[index].monthlyPayment
      } else {
        this.savings[index].monthlyPayment = parseInt(amount)
      }
    },
    toggleSavingsMonthlyPayment(savingsId, paid) {
      if (!this.monthlyStatus['current']) this.monthlyStatus['current'] = {}
      this.monthlyStatus['current']['savings-' + savingsId] = paid
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
      if (this.monthlyChecklistTracking) this.monthlyChecklistTracking['current'] = {}
    },

    setChecklistTracking(key, date) {
      if (!this.monthlyChecklistTracking['current']) this.monthlyChecklistTracking['current'] = {}
      if (date) {
        this.monthlyChecklistTracking['current'][key] = date
      } else {
        delete this.monthlyChecklistTracking['current'][key]
      }
    },

    // ── Data ─────────────────────────────────────────────────────────────────
    exportData() {
      const date = new Date().toISOString().slice(0, 10)
      const dataStr = JSON.stringify({
        income: this.income,
        expenses: this.expenses,
        categories: this.categories,
        monthlyStatus: this.monthlyStatus,
        debts: this.debts,
        debtPayments: this.debtPayments,
        variableActuals: this.variableActuals,
        variableExpenses: this.variableExpenses,
        variableExpenseTransactions: this.variableExpenseTransactions,
        savings: this.savings,
        savingsDeposits: this.savingsDeposits,
      }, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `murvBudget data - ${date}.json`
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
      this.variableActuals = data.variableActuals || {}
      this.variableExpenses = data.variableExpenses || []
      this.variableExpenseTransactions = data.variableExpenseTransactions || {}
      this.savings = data.savings || []
      this.savingsDeposits = data.savingsDeposits || {}
      this.savings.forEach(g => { if (!this.savingsDeposits[g.id]) this.savingsDeposits[g.id] = [] })

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

    // ── Cloud Sync ───────────────────────────────────────────────────────────
    async syncToCloud() {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const now = new Date().toISOString()
      const payload = JSON.parse(localStorage.getItem('budgetApp') || '{}')
      const { error } = await supabase.from('user_budgets')
        .upsert({ id: user.id, data: payload, updated_at: now })
      if (!error) {
        localStorage.setItem('murvbudget-last-cloud-sync', now)
      }
    },

    async loadFromCloud() {
      if (!supabase) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('user_budgets').select('data, updated_at').eq('id', user.id).single()
      if (error || !data) return null
      return { payload: data.data, updatedAt: data.updated_at }
    },

    clearLocalData() {
      this.$patch({
        income: [],
        expenses: [],
        categories: [],
        monthlyStatus: {},
        debts: [],
        debtPayments: {},
        variableActuals: {},
        variableExpenses: [],
        variableExpenseTransactions: {},
        savings: [],
        savingsDeposits: {},
      })
      localStorage.removeItem('murvbudget-last-cloud-sync')
    },

    // Backwards compat: called once on app mount to migrate legacy localStorage data
    migrateData() {
      // Ensure variableActuals exists
      if (!this.variableActuals) this.variableActuals = {}
      // Ensure savings exists
      if (!this.savings) this.savings = []
      if (!this.savingsDeposits) this.savingsDeposits = {}
      if (!this.monthlyChecklistTracking) this.monthlyChecklistTracking = {}
      if (!this.finansOrder) {
        this.finansOrder = ['debts', 'savings', 'flex']
      } else if (!this.finansOrder.includes('flex')) {
        this.finansOrder = [...this.finansOrder, 'flex']
      }
      this.savings.forEach(g => { if (!this.savingsDeposits[g.id]) this.savingsDeposits[g.id] = [] })
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
      // Migrate widgetOrder
      const ALL_WIDGET_IDS = ['summary', 'chart', 'debts', 'checklist', 'savings', 'categories', 'flex']
      if (!this.overviewSettings.widgetOrder?.length) {
        this.overviewSettings.widgetOrder = [
          { id: 'summary',    visible: this.overviewSettings.showSummaryCards ?? true },
          { id: 'chart',      visible: this.overviewSettings.showChart ?? true },
          { id: 'debts',      visible: this.overviewSettings.showDebts ?? true },
          { id: 'checklist',  visible: true },
          { id: 'savings',    visible: true },
          { id: 'categories', visible: true },
          { id: 'flex',       visible: true },
        ]
      } else {
        for (const id of ALL_WIDGET_IDS) {
          if (!this.overviewSettings.widgetOrder.find(w => w.id === id)) {
            this.overviewSettings.widgetOrder.push({ id, visible: true })
          }
        }
      }
      // Ensure widgetSettings exists and all defaults are populated
      if (!this.overviewSettings.widgetSettings) this.overviewSettings.widgetSettings = {}
      const defaultWidgetSettings = {
        flex:       { style: 'default', showBars: true },
        checklist:  { size: 'default' },
        savings:    { size: 'default' },
        categories: { size: 'default', maxItems: 0 },
      }
      for (const [id, defaults] of Object.entries(defaultWidgetSettings)) {
        if (!this.overviewSettings.widgetSettings[id]) {
          this.overviewSettings.widgetSettings[id] = { ...defaults }
        } else {
          for (const [k, v] of Object.entries(defaults)) {
            if (this.overviewSettings.widgetSettings[id][k] === undefined) {
              this.overviewSettings.widgetSettings[id][k] = v
            }
          }
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
