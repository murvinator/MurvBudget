<template>
  <div>
    <!-- Expenses grouped by category -->
    <template v-for="category in store.categories" :key="category">
      <template v-if="categoryExpenses(category).length > 0">
        <div class="category-header">
          <h3>{{ category }}</h3>
        </div>
        <div class="category-list">
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
        </div>
      </template>
    </template>

    <div class="month-controls">
      <button class="reset-btn" @click="resetMonth">Återställ checkboxar</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

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

function resetMonth() {
  if (confirm('Vill du återställa alla checkboxar?')) {
    store.resetCurrentMonth()
  }
}

function fmt(n) {
  return n.toLocaleString('sv-SE')
}
</script>
