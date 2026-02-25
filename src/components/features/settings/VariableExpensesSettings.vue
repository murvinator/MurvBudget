<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore, formatKr } from '@/stores/budget'

const store = useBudgetStore()
const { budgetData } = storeToRefs(store)

const name = ref('')
const budget = ref('')

function add() {
  const ok = store.addVariableExpense({ name: name.value, budget: budget.value })
  if (ok) { name.value = ''; budget.value = '' }
}
function remove(i) { store.deleteVariableExpense(i) }
</script>

<template>
  <div class="settings-section">
    <h3>Rörliga utgifter</h3>
    <div class="settings-content">
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Namn" @keyup.enter="add">
        <input v-model.number="budget" type="number" placeholder="Belopp" @keyup.enter="add">
        <button @click="add">Lägg till</button>
      </div>
      <div class="variable-expenses-list" style="margin-top:10px; display:grid; gap:8px;">
        <div v-for="(v, i) in budgetData.variableExpenses" :key="i" style="display:flex; align-items:center; justify-content:space-between;">
          <span>{{ v.name }}</span>
          <div style="display:flex; align-items:center; gap:10px;">
            <span>{{ formatKr(v.budget) }}</span>
            <button @click="remove(i)">Ta bort</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
