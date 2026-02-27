<template>
  <div>
    <h1 class="page-large-title">Sparande</h1>

    <!-- Summary bar -->
    <div v-if="store.savingsGoals.length > 0" class="spar-summary-card">
      <div class="spar-summary-row">
        <span class="spar-summary-label">Totalt sparat</span>
        <span class="spar-summary-value">{{ fmt(totalSaved) }} / {{ fmt(totalTarget) }} kr</span>
      </div>
      <div class="spar-progress-track">
        <div class="spar-progress-fill" :style="{ width: totalPct + '%' }"></div>
      </div>
      <div class="spar-summary-pct">{{ totalPct }}% av målet</div>
    </div>

    <!-- Goal list -->
    <div v-if="store.savingsGoals.length === 0" class="spar-empty">
      <div class="spar-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 7c0-1.1-.9-2-2-2H7a2 2 0 0 0-2 2v2a4 4 0 0 0 0 8v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a4 4 0 0 0 0-8V7z"/>
          <path d="M12 11v4M10 13h4"/>
        </svg>
      </div>
      <p>Inga sparmål ännu</p>
      <p class="spar-empty-sub">Lägg till ditt första sparmål nedan</p>
    </div>

    <div
      v-for="goal in store.savingsGoals"
      :key="goal.id"
      class="goal-card"
    >
      <div class="goal-header">
        <div class="goal-title">{{ goal.name }}</div>
        <button class="goal-delete-btn" @click="deleteGoal(goal.id)" title="Ta bort">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>

      <div class="goal-amounts">
        <span class="goal-current">{{ fmt(goal.currentAmount) }} kr</span>
        <span class="goal-target">av {{ fmt(goal.targetAmount) }} kr</span>
      </div>

      <div class="goal-progress-track">
        <div class="goal-progress-fill" :style="{ width: goalPct(goal) + '%' }"></div>
      </div>
      <div class="goal-pct">{{ goalPct(goal) }}% klart</div>

      <div class="goal-actions">
        <button class="goal-action-btn goal-action-btn--minus" @click="toggleInput(goal.id, 'withdraw')">−</button>
        <button class="goal-action-btn goal-action-btn--plus" @click="toggleInput(goal.id, 'add')">+</button>
      </div>

      <!-- Inline amount input -->
      <div v-if="activeInput?.id === goal.id" class="goal-inline-input">
        <span class="goal-inline-label">{{ activeInput.mode === 'add' ? 'Lägg till' : 'Ta ut' }}</span>
        <div class="goal-inline-row">
          <input
            ref="amountInputRef"
            type="number"
            v-model.number="inputAmount"
            placeholder="Belopp"
            min="1"
            @keyup.enter="confirmInput(goal.id)"
          >
          <button class="goal-inline-ok" @click="confirmInput(goal.id)">OK</button>
          <button class="goal-inline-cancel" @click="activeInput = null">✕</button>
        </div>
      </div>
    </div>

    <!-- Add goal form -->
    <div class="add-goal-card">
      <h3 class="add-goal-title">Nytt sparmål</h3>
      <div class="input-group">
        <input type="text" v-model="newGoalName" placeholder="Namn (t.ex. Semester)">
        <input type="number" v-model.number="newGoalTarget" placeholder="Målbelopp">
        <button @click="addGoal">Lägg till</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const newGoalName = ref('')
const newGoalTarget = ref(null)
const activeInput = ref(null) // { id, mode: 'add'|'withdraw' }
const inputAmount = ref(null)
const amountInputRef = ref(null)

const totalSaved = computed(() => store.savingsGoals.reduce((s, g) => s + g.currentAmount, 0))
const totalTarget = computed(() => store.savingsGoals.reduce((s, g) => s + g.targetAmount, 0))
const totalPct = computed(() => {
  if (!totalTarget.value) return 0
  return Math.min(100, Math.round((totalSaved.value / totalTarget.value) * 100))
})

function goalPct(goal) {
  if (!goal.targetAmount) return 0
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
}

function addGoal() {
  const name = newGoalName.value.trim()
  const target = newGoalTarget.value
  if (!name || !target || target <= 0) return
  store.addSavingsGoal(name, target)
  newGoalName.value = ''
  newGoalTarget.value = null
}

function deleteGoal(id) {
  if (confirm('Ta bort sparmålet?')) {
    store.deleteSavingsGoal(id)
    if (activeInput.value?.id === id) activeInput.value = null
  }
}

async function toggleInput(id, mode) {
  if (activeInput.value?.id === id && activeInput.value?.mode === mode) {
    activeInput.value = null
    return
  }
  activeInput.value = { id, mode }
  inputAmount.value = null
  await nextTick()
  // Focus the input
  const el = amountInputRef.value
  if (Array.isArray(el)) el[0]?.focus()
  else el?.focus()
}

function confirmInput(id) {
  const amount = inputAmount.value
  if (!amount || amount <= 0) return
  if (activeInput.value?.mode === 'add') {
    store.addToGoal(id, amount)
  } else {
    store.withdrawFromGoal(id, amount)
  }
  activeInput.value = null
  inputAmount.value = null
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
/* Summary card */
.spar-summary-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 0.5px solid var(--separator);
  padding: 18px 20px;
  margin-bottom: 20px;
}

.spar-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.spar-summary-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.spar-summary-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.spar-progress-track {
  height: 8px;
  background: var(--system-gray4);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.spar-progress-fill {
  height: 100%;
  background: var(--system-green);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.spar-summary-pct {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* Empty state */
.spar-empty {
  text-align: center;
  padding: 40px 20px 20px;
  color: var(--text-secondary);
}

.spar-empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  color: var(--text-tertiary);
}

.spar-empty-icon svg {
  width: 100%;
  height: 100%;
}

.spar-empty p {
  font-size: 17px;
  font-weight: 500;
  margin-bottom: 6px;
}

.spar-empty-sub {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* Goal card */
.goal-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 0.5px solid var(--separator);
  padding: 18px 20px;
  margin-bottom: 14px;
}

.goal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.goal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.goal-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--system-red);
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
}

.goal-delete-btn svg {
  width: 18px;
  height: 18px;
}

.goal-amounts {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
}

.goal-current {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.goal-target {
  font-size: 14px;
  color: var(--text-tertiary);
}

.goal-progress-track {
  height: 7px;
  background: var(--system-gray4);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.goal-progress-fill {
  height: 100%;
  background: var(--system-blue);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.goal-pct {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 14px;
}

.goal-actions {
  display: flex;
  gap: 10px;
}

.goal-action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  font-size: 22px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s, transform 0.15s;
}

.goal-action-btn:active {
  opacity: 0.7;
  transform: scale(0.97);
}

.goal-action-btn--minus {
  background: rgba(255, 59, 48, 0.12);
  color: var(--system-red);
}

.goal-action-btn--plus {
  background: rgba(52, 199, 89, 0.12);
  color: var(--system-green);
}

/* Inline input */
.goal-inline-input {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.5px solid var(--separator);
}

.goal-inline-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  display: block;
  margin-bottom: 8px;
}

.goal-inline-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.goal-inline-row input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 10px;
  font-size: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.goal-inline-row input:focus {
  outline: none;
  border-color: var(--system-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.goal-inline-ok {
  padding: 10px 18px;
  background: var(--system-blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.goal-inline-cancel {
  padding: 10px 14px;
  background: var(--system-gray5);
  color: var(--text-secondary);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}

/* Add goal form card */
.add-goal-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 0.5px solid var(--separator);
  padding: 18px 20px;
  margin-top: 8px;
}

.add-goal-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

@media (prefers-color-scheme: dark) {
  .spar-progress-track,
  .goal-progress-track {
    background: rgba(255, 255, 255, 0.12);
  }

  .goal-action-btn--minus {
    background: rgba(255, 59, 48, 0.2);
  }

  .goal-action-btn--plus {
    background: rgba(52, 199, 89, 0.2);
  }
}
</style>
