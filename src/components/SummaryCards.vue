<template>
  <div class="summary-cards">
    <div class="summary-card">
      <h4>Inkomst</h4>
      <div class="amount">{{ fmt(store.totalIncome) }} kr</div>
    </div>
    <div class="summary-card">
      <h4>Fasta utgifter</h4>
      <div class="amount">{{ fmt(store.totalExpenses) }} kr</div>
    </div>
    <div class="summary-card">
      <h4>Kvar</h4>
      <div class="amount">{{ fmt(store.remaining) }} kr</div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

function fmt(n) {
  return n.toLocaleString('sv-SE')
}
</script>
