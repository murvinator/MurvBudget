<template>
  <Teleport to="body">
    <Transition name="salary-sheet">
      <div v-if="visible" class="salary-backdrop" @click.self="dismiss">
        <div class="salary-card">

          <!-- Header -->
          <div class="salary-body">
            <p class="salary-title">{{ fullMode ? 'Lönedag!' : 'Justera inkomsten'}}</p>
            <p class="salary-subtitle">Stäm av inkomsten inför den nya månaden</p>
          </div>

          <div class="salary-sep" />

          <!-- Income section -->
          <div class="salary-section">
            <p class="section-eyebrow">Inkomst den här månaden</p>
            <div class="income-rows">
              <div v-for="item in editableIncome" :key="item.name" class="inc-row">
                <span class="inc-name">{{ item.name }}</span>
                <div class="inc-right">
                  <div class="inc-input-wrap">
                    <input
                      type="number"
                      class="inc-input"
                      v-model.number="item.amount"
                      inputmode="numeric"
                      step="1"
                      :class="{ 'inc-input--changed': item.amount !== item.original }"
                    />
                    <span class="inc-kr">kr</span>
                  </div>
                  <Transition name="diff-fade">
                    <span v-if="item.amount !== item.original" class="inc-original">normalt {{ fmt(item.original) }} kr</span>
                  </Transition>
                </div>
              </div>
              <div v-if="editableIncome.length > 1" class="inc-total-row">
                <span>Totalt</span>
                <span class="inc-total-val">{{ fmt(editableTotal) }} kr</span>
              </div>
            </div>

            <!-- Dynamic diff pill -->
            <Transition name="diff-fade">
              <div v-if="totalDiff !== 0" class="diff-pill" :class="totalDiff > 0 ? 'diff-pill--pos' : 'diff-pill--neg'">
                {{ totalDiff > 0 ? '+ ' : '' }}{{ fmt(totalDiff) }} kr den här månaden
              </div>
            </Transition>
          </div>

          <template v-if="fullMode">
          <div class="salary-sep" />

          <!-- Reset checklist section -->
          <div class="salary-section">
            <p class="section-eyebrow">Checklistan</p>
            <p class="section-desc">Vill du återställa alla checkboxar för den nya månaden?</p>
            <div class="choice-row">
              <button
                class="choice-btn"
                :class="{ 'choice-btn--on': wantReset === true }"
                @click="wantReset = true"
              >Ja, återställ</button>
              <button
                class="choice-btn"
                :class="{ 'choice-btn--on': wantReset === false }"
                @click="wantReset = false"
              >Behåll</button>
            </div>
          </div>

          <div class="salary-sep" />

          <!-- Pay day section -->
          <div class="salary-section salary-section--payday">
            <p class="section-eyebrow">Lönedag</p>
            <div class="payday-row">
              <span class="payday-label">Vilken dag fick du lön?</span>
              <div class="payday-input-wrap">
                <input
                  type="number"
                  class="payday-input"
                  v-model.number="editSalaryDay"
                  inputmode="numeric"
                  min="1"
                  max="31"
                  step="1"
                  placeholder="dag"
                />
              </div>
            </div>
          </div>
          </template>

          <div class="salary-sep" />

          <!-- Actions -->
          <div class="salary-actions">
            <button class="s-btn s-btn--secondary" @click="dismiss">{{ fullMode ? 'Hoppa över' : 'Avbryt' }}</button>
            <button class="s-btn s-btn--primary" @click="confirm">Klar</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(false)
const editableIncome = ref([])
const wantReset = ref(true)
const editSalaryDay = ref(null)
const fullMode = ref(true)
let resolveFn = null

const editableTotal = computed(() =>
  editableIncome.value.reduce((s, i) => s + (i.amount || 0), 0)
)

const originalTotal = computed(() =>
  editableIncome.value.reduce((s, i) => s + (i.original || 0), 0)
)

const totalDiff = computed(() => editableTotal.value - originalTotal.value)

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}

function show(incomeList, currentOverrides = {}, currentSalaryDay = null, mode = 'full') {
  editableIncome.value = (incomeList || []).map((item) => ({
    name: item.name,
    original: item.amount,
    amount: currentOverrides[item.name] ?? item.amount,
  }))
  wantReset.value = true
  editSalaryDay.value = currentSalaryDay
  fullMode.value = mode === 'full'
  visible.value = true
  return new Promise((resolve) => { resolveFn = resolve })
}

function confirm() {
  const amounts = {}
  for (const item of editableIncome.value) {
    amounts[item.name] = item.amount
  }
  resolveFn?.({ amounts, resetChecklist: wantReset.value, salaryDay: editSalaryDay.value })
  visible.value = false
}

function dismiss() {
  resolveFn?.(null)
  visible.value = false
}

defineExpose({ show })
</script>

<style scoped>
.salary-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.salary-card {
  width: 100%;
  max-width: 340px;
  background: var(--card-bg, #f2f2f7);
  border-radius: 24px;
  overflow: hidden;
  will-change: transform, opacity;
}

/* Header */
.salary-body {
  padding: 22px 20px 18px;
  text-align: center;
}

.salary-title {
  margin: 0 0 5px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.salary-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Separator */
.salary-sep {
  height: 0.5px;
  background: var(--separator, rgba(0, 0, 0, 0.15));
}

/* Section */
.salary-section {
  padding: 14px 18px;
}

.salary-section--payday {
  padding-bottom: 12px;
}

.section-eyebrow {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.55px;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.section-desc {
  margin: -4px 0 12px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Income rows */
.income-rows {
  background: var(--system-gray6, rgba(120, 120, 128, 0.08));
  border-radius: 14px;
  overflow: hidden;
}

.inc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 0.5px solid var(--separator, rgba(0, 0, 0, 0.08));
}

.inc-row:last-of-type {
  border-bottom: none;
}

.inc-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inc-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.inc-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inc-input {
  width: 86px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--system-blue, #007aff);
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  text-align: right;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.inc-input--changed {
  color: var(--system-orange, #ff9500);
}

.inc-input::-webkit-inner-spin-button,
.inc-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

.inc-kr {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.inc-original {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 400;
  letter-spacing: 0.1px;
}

.inc-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-top: 0.5px solid var(--separator, rgba(0, 0, 0, 0.1));
  background: var(--system-gray5, rgba(120, 120, 128, 0.12));
}

.inc-total-row span:first-child {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.inc-total-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Diff pill */
.diff-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 9px;
  padding: 5px 11px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.1px;
}

.diff-pill--pos {
  background: rgba(52, 199, 89, 0.15);
  color: var(--system-green, #34c759);
}

.diff-pill--neg {
  background: rgba(255, 59, 48, 0.12);
  color: var(--system-red, #ff3b30);
}

.diff-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.diff-fade-leave-active { transition: opacity 0.15s ease; }
.diff-fade-enter-from { opacity: 0; transform: translateY(-4px); }
.diff-fade-leave-to  { opacity: 0; }

/* Choice buttons */
.choice-row {
  display: flex;
  gap: 8px;
}

.choice-btn {
  flex: 1;
  padding: 11px 8px;
  border: 1.5px solid var(--separator, rgba(120, 120, 128, 0.22));
  border-radius: 12px;
  background: var(--system-gray6, rgba(120, 120, 128, 0.07));
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
  text-align: center;
}

.choice-btn--on {
  border-color: var(--system-blue, #007aff);
  background: rgba(0, 122, 255, 0.1);
  color: var(--system-blue, #007aff);
  font-weight: 600;
}

.choice-btn:active { opacity: 0.7; }

/* Pay day row */
.payday-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--system-gray6, rgba(120, 120, 128, 0.08));
  border-radius: 12px;
  padding: 10px 14px;
}

.payday-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.payday-input-wrap {
  display: flex;
  align-items: center;
}

.payday-input {
  width: 48px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--system-blue, #007aff);
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.payday-input::-webkit-inner-spin-button,
.payday-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

/* Actions */
.salary-actions {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  background: var(--card-bg, #f2f2f7);
}

.s-btn {
  flex: 1;
  padding: 13px 10px;
  border: none;
  border-radius: 100px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.1s ease;
}

.s-btn:active { opacity: 0.75; }

.s-btn--secondary {
  background: var(--system-gray5, rgba(120, 120, 128, 0.18));
  color: var(--text-primary);
}

.s-btn--primary {
  background: var(--system-blue, #007aff);
  color: #fff;
}

/* Transition — same pop as ConfirmSheet */
.salary-sheet-enter-active {
  transition: opacity 0.2s ease;
}
.salary-sheet-leave-active {
  transition: opacity 0.15s ease;
}
.salary-sheet-enter-active .salary-card {
  animation: salaryPop 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
}
.salary-sheet-leave-active .salary-card {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.salary-sheet-enter-from,
.salary-sheet-leave-to {
  opacity: 0;
}
.salary-sheet-leave-to .salary-card {
  transform: scale(0.9);
  opacity: 0;
}

@keyframes salaryPop {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
</style>
