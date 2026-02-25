<script setup>
import { storeToRefs } from 'pinia'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { totalIncomeKr, totalFixedExpensesKr, remainingKr } = storeToRefs(store)
</script>

<template>
  <div class="summary-cards">
    <div class="summary-card">
      <h4>Inkomst</h4>
      <div class="amount">{{ totalIncomeKr }}</div>
    </div>
    <div class="summary-card">
      <h4>Fasta utgifter</h4>
      <div class="amount">{{ totalFixedExpensesKr }}</div>
    </div>
    <div class="summary-card">
      <h4>Kvar</h4>
      <div class="amount">{{ remainingKr }}</div>
    </div>
  </div>
</template>

<style scoped>
</style>
