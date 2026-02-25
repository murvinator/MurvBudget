<template>
  <div>
    <SummaryCards />
    <VariableExpensesMini @navigate="emit('navigate', $event)" />
    <ExpenseChart />
    <DebtSummary />
  </div>
</template>

<script setup>
import SummaryCards from '../components/SummaryCards.vue'
import VariableExpensesMini from '../components/VariableExpensesMini.vue'
import ExpenseChart from '../components/ExpenseChart.vue'
import DebtSummary from '../components/DebtSummary.vue'

const emit = defineEmits(['navigate'])
</script>
