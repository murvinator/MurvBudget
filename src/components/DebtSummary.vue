<template>
  <div class="debt-summary-component">
    <div v-if="store.debts.length === 0" class="debt-empty-state">
      <div class="no-debts-text">
      <p>Inga skulder att visa.</p>
      <p>Lägg till skulder under Inställningar.</p>
      </div>  
    </div>

    <template v-else>
    <div class="debt-header-toggle" @click="toggleOpen">
      <h3>Skulder och lån</h3>
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

    <CollapseTransition><div v-if="isOpen" class="debt-content">
      <div
        v-for="debt in store.debts"
        :key="debt.id"
        class="expense-item-wrapper"
      >
        <div class="expense-item">
          <div class="expense-info">
            <div class="expense-name">{{ debt.name }}</div>
          </div>
          <div class="expense-amount">{{ fmt(debt.amount) }} kr</div>
        </div>
      </div>

      <div class="debt-total-container">
        <span>Totalt</span>
        <span>{{ fmt(totalDebt) }} kr</span>
      </div>
    </div></CollapseTransition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CollapseTransition from './CollapseTransition.vue'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

const isOpen = ref(false)
const totalDebt = computed(() => store.debts.reduce((sum, d) => sum + d.amount, 0))

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.debt-header-right {
  display: flex;
  align-items: center;
}

.debt-manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 0.5px solid var(--separator);
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
}

.debt-manage-row:active { opacity: 0.6; }

.debt-empty-state {
  padding: 8px 4px 4px;
}
.debt-empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 4px;
  line-height: 1.4;
}

.no-debts-text{
  padding: 12px;
}
</style>
