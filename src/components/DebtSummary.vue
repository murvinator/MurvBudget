<template>
  <div v-if="store.debts.length > 0" class="debt-summary-component">
    <div class="debt-header-toggle" @click="toggleOpen">
      <h3>Skulder</h3>
      <div class="debt-header-right">
        <svg
          class="chevron-debt"
          :style="{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div v-show="isOpen" class="debt-content">
      <div
        v-for="(debt, idx) in store.debts"
        :key="debt.id"
        class="expense-item-wrapper"
      >
        <!-- Main row -->
        <div
          class="expense-item editable-expense"
          :class="{ editing: openDebt === idx }"
          @click="toggleDebt(idx)"
        >
          <div class="expense-info">
            <div class="expense-name">{{ debt.name }}</div>
          </div>
          <div class="expense-amount">{{ fmt(debt.amount) }} kr</div>
        </div>

        <!-- Inline payment form -->
        <div v-show="openDebt === idx" class="expense-edit-form">
          <div class="edit-form-content">
            <div class="edit-input-group">
              <label>Belopp att betala</label>
              <input
                type="number"
                v-model.number="payAmounts[idx]"
                placeholder="Belopp"
                min="0"
                step="0.01"
              >
            </div>
            <div class="edit-actions">
              <button class="save-edit-btn" @click="payDebt(idx)">Betala</button>
              <button class="cancel-edit-btn" @click="openDebt = null">Stäng</button>
            </div>

            <!-- Payment history -->
            <div class="payments-history" v-if="payments(debt).length > 0">
              <div
                v-for="(p, pi) in [...payments(debt)].reverse()"
                :key="pi"
                class="payment-item"
              >
                <template v-if="editingPayment?.debtIdx === idx && editingPayment?.payIdx === (payments(debt).length - 1 - pi)">
                  <div class="payment-info">
                    <input type="number" v-model.number="editingPayment.amount" min="0" step="0.01" style="width:80px; padding:4px 8px; border-radius:6px; border:1px solid var(--separator);">
                  </div>
                  <div class="payment-actions">
                    <button @click="saveEditPayment">Spara</button>
                    <button @click="editingPayment = null">Avbryt</button>
                  </div>
                </template>
                <template v-else>
                  <div class="payment-info">
                    <span class="payment-amount">{{ fmt(p.amount) }} kr</span>
                    <span class="payment-date">{{ formatDate(p.date) }}</span>
                  </div>
                  <div class="payment-actions">
                    <button @click="startEdit(idx, payments(debt).length - 1 - pi, p)">Ändra</button>
                    <button @click="deletePayment(idx, payments(debt).length - 1 - pi)">Ta bort</button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="debt-total-container">
        <span>Totalt</span>
        <span>{{ fmt(totalDebt) }} kr</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const isOpen = ref(false)
const openDebt = ref(null)
const payAmounts = reactive({})
const editingPayment = ref(null)

const totalDebt = computed(() => store.debts.reduce((sum, d) => sum + d.amount, 0))

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function toggleDebt(idx) {
  openDebt.value = openDebt.value === idx ? null : idx
  if (openDebt.value !== null) {
    payAmounts[idx] = null
  }
}

function payments(debt) {
  return store.debtPayments[debt.id] || []
}

function payDebt(idx) {
  const amount = parseFloat(payAmounts[idx])
  if (isNaN(amount) || amount <= 0) {
    alert('Ange ett giltigt belopp')
    return
  }
  store.addDebtPayment(idx, amount, '')
  payAmounts[idx] = null
}

function startEdit(debtIdx, payIdx, p) {
  editingPayment.value = { debtIdx, payIdx, amount: p.amount }
}

function saveEditPayment() {
  const { debtIdx, payIdx, amount } = editingPayment.value
  if (isNaN(amount) || amount <= 0) { alert('Ange ett giltigt belopp'); return }
  store.editDebtPayment(debtIdx, payIdx, amount, store.debtPayments[store.debts[debtIdx].id][payIdx]?.note || '')
  editingPayment.value = null
}

function deletePayment(debtIdx, payIdx) {
  if (confirm('Ta bort denna betalning?')) {
    store.deleteDebtPayment(debtIdx, payIdx)
  }
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('sv-SE')
}
</script>
