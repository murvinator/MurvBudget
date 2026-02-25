<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const status = ref('')
const fileInput = ref(null)

function exportData() {
  const json = store.exportAsJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'budget-data.json'
  a.click()
  URL.revokeObjectURL(url)
  status.value = 'Export klar.'
}

function openImport() {
  fileInput.value?.click()
}

async function onImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const obj = JSON.parse(text)
    store.replaceAll(obj)
    status.value = 'Import klar.'
  } catch (err) {
    console.error(err)
    status.value = 'Import misslyckades. Ogiltig fil?'
  } finally {
    e.target.value = ''
  }
}

async function loadTestData() {
  try {
    const res = await fetch('/old-files/assets/testdata/testdata.json')
    const obj = await res.json()
    store.replaceAll(obj)
    status.value = 'Testdata laddat.'
  } catch (err) {
    console.error(err)
    status.value = 'Kunde inte ladda testdata.'
  }
}
</script>

<template>
  <div class="settings-section">
    <h3>Data</h3>
    <div class="settings-content">
      <div class="export-import">
        <button @click="exportData">Exportera Data</button>
        <button @click="openImport">Importera Data</button>
        <button @click="loadTestData">Ladda testdata</button>
        <input ref="fileInput" type="file" accept="application/json" style="display:none" @change="onImport" />
      </div>
      <div class="import-export-status" style="margin-top:10px; font-size:14px;">{{ status }}</div>
    </div>
  </div>
</template>

<style scoped>
</style>
