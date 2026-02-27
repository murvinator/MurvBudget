<template>
  <div>
    <SummaryCards v-if="store.overviewSettings.showSummaryCards" />
    <SavingsRate v-if="store.overviewSettings.showSavingsRate" />
    <UpcomingBills v-if="store.overviewSettings.showUpcomingBills" />
    <ExpenseChart v-if="store.overviewSettings.showChart" />
    <DebtSummary v-if="store.overviewSettings.showDebts" />
  </div>
</template>

<script setup>
import { useBudgetStore } from '../stores/budget'
import SummaryCards from '../components/SummaryCards.vue'
import SavingsRate from '../components/SavingsRate.vue'
import UpcomingBills from '../components/UpcomingBills.vue'
import ExpenseChart from '../components/ExpenseChart.vue'
import DebtSummary from '../components/DebtSummary.vue'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])
</script>
