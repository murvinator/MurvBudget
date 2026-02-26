<template>
  <div>
    <SummaryCards v-if="store.overviewSettings.showSummaryCards" />
    <VariableExpensesMini v-if="store.overviewSettings.showVariableMini" @navigate="emit('navigate', $event)" />
    <ExpenseChart v-if="store.overviewSettings.showChart" />
    <DebtSummary v-if="store.overviewSettings.showDebts" />
  </div>
</template>

<script setup>
import { useBudgetStore } from '../stores/budget'
import SummaryCards from '../components/SummaryCards.vue'
import VariableExpensesMini from '../components/VariableExpensesMini.vue'
import ExpenseChart from '../components/ExpenseChart.vue'
import DebtSummary from '../components/DebtSummary.vue'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])
</script>
