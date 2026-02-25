<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore, formatKr } from '@/stores/budget'

const store = useBudgetStore()
const { budgetData } = storeToRefs(store)

const name = ref('')
const amount = ref('')

function add() {
  const ok = store.addIncome({ name: name.value, amount: amount.value })
  if (ok) { name.value = ''; amount.value = '' }
}

function remove(i) { store.deleteIncome(i) }
</script>

<template>
  <div class="settings-section">
    <h3>Inkomster</h3>
    <div class="settings-content">
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Namn" @keyup.enter="add">
        <input v-model.number="amount" type="number" placeholder="Belopp" @keyup.enter="add">
        <button @click="add">Lägg till</button>
      </div>
      <div class="income-list" style="margin-top:10px; display:grid; gap:8px;">
        <div v-for="(inc, i) in budgetData.income" :key="i" style="display:flex; align-items:center; justify-content:space-between;">
          <span>{{ inc.name }}</span>
          <div style="display:flex; align-items:center; gap:10px;">
            <span>{{ formatKr(inc.amount) }}</span>
            <button @click="remove(i)">Ta bort</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
