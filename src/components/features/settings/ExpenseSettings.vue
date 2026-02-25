<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore, DEBT_CATEGORY, formatKr } from '@/stores/budget'

const store = useBudgetStore()
const { budgetData } = storeToRefs(store)

const name = ref('')
const amount = ref('')
const category = ref('')

const selectableCategories = computed(() => budgetData.value.categories.filter(c => c !== DEBT_CATEGORY))
const fixedExpenses = computed(() => budgetData.value.expenses.filter(e => e.category !== DEBT_CATEGORY))

function add() {
  const ok = store.addExpense({ name: name.value, amount: amount.value, category: category.value })
  if (ok) { name.value=''; amount.value=''; }
}

function remove(i) { store.deleteExpense(i) }
</script>

<template>
  <div class="settings-section">
    <h3>Fasta utgifter</h3>
    <div class="settings-content">
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Namn" @keyup.enter="add">
        <input v-model.number="amount" type="number" placeholder="Belopp" @keyup.enter="add">
      </div>
      <div class="input-group">
        <select v-model="category">
          <option value="" disabled>Välj kategori</option>
          <option v-for="c in selectableCategories" :key="c" :value="c">{{ c }}</option>
        </select>
        <button @click="add">Lägg till</button>
      </div>

      <div class="expenses-list" style="margin-top:10px; display:grid; gap:8px;">
        <div v-for="(exp, i) in fixedExpenses" :key="i" style="display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div>{{ exp.name }}</div>
            <div style="font-size:13px; color:var(--text-tertiary)">{{ exp.category }}</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span>{{ formatKr(exp.amount) }}</span>
            <button @click="remove(i)">Ta bort</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
