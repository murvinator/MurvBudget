<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore, formatKr } from '@/stores/budget'

const store = useBudgetStore()
const { budgetData } = storeToRefs(store)

const name = ref('')
const amount = ref('')

function add() {
  const ok = store.addDebt({ name: name.value, amount: amount.value })
  if (ok) { name.value=''; amount.value='' }
}
function remove(i) { store.deleteDebt(i) }
</script>

<template>
  <div class="settings-section">
    <h3>Skulder</h3>
    <div class="settings-content">
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Namn" @keyup.enter="add">
        <input v-model.number="amount" type="number" placeholder="Belopp" @keyup.enter="add">
        <button @click="add">Lägg till</button>
      </div>
      <div class="debts-list" style="margin-top:10px; display:grid; gap:8px;">
        <div v-for="(d, i) in budgetData.debts" :key="d.id" style="display:flex; align-items:center; justify-content:space-between;">
          <span>{{ d.name }}</span>
          <div style="display:flex; align-items:center; gap:10px;">
            <span>{{ formatKr(d.amount) }}</span>
            <button @click="remove(i)">Ta bort</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
