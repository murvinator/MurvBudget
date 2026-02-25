<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore, DEBT_CATEGORY } from '@/stores/budget'

const store = useBudgetStore()
const { budgetData } = storeToRefs(store)

const newCategory = ref('')
const error = ref('')

function add() {
  error.value = ''
  if (!store.addCategory(newCategory.value)) {
    error.value = newCategory.value.trim() === DEBT_CATEGORY
      ? 'Skulder är reserverad och kan inte läggas till.'
      : 'Ogiltig eller redan befintlig kategori.'
    return
  }
  newCategory.value = ''
}

function remove(name) {
  error.value = ''
  if (!store.removeCategory(name)) {
    error.value = `Kan inte ta bort '${name}' – används av en utgift.`
  }
}
</script>

<template>
  <div class="settings-section">
    <h3>Kategorier</h3>
    <div class="settings-content">
      <div class="input-group">
        <input v-model="newCategory" type="text" placeholder="Ny kategori" @keyup.enter="add">
        <button @click="add">Lägg till</button>
      </div>
      <div v-if="error" style="color: var(--system-red); font-size: 13px; margin-top: 6px;">{{ error }}</div>

      <div class="category-list" style="margin-top: 10px; display: grid; gap: 8px;">
        <div v-for="name in budgetData.categories" :key="name" style="display:flex; align-items:center; justify-content:space-between;">
          <span>{{ name }}</span>
          <button @click="remove(name)">Ta bort</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
