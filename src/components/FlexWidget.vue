<template>
  <div class="flex-widget-card" :class="`fw--${widgetStyle}`" @click="emit('navigate', 'monthly')">
    <!-- Decorative blue glow in corner -->
    <div class="fw-glow" aria-hidden="true"></div>

    <!-- Header -->
    <div class="fw-header">
      <div class="fw-title-group">
        <span class="fw-dot"></span>
        <span class="fw-title">Flex</span>
      </div>
      <span class="fw-month">{{ store.currentMonthName }}</span>
    </div>

    <!-- Empty state -->
    <p v-if="items.length === 0" class="fw-empty">
      Inga flex-utgifter inlagda
    </p>

    <template v-else>
      <!-- Default: big total + main bar -->
      <template v-if="widgetStyle !== 'compact'">
        <div class="fw-total-row">
          <div class="fw-total-amounts">
            <span class="fw-total-actual">{{ fmt(totalActual) }} kr</span>
            <span class="fw-total-estimate">&nbsp;/ ~{{ fmt(totalEstimate) }} kr</span>
          </div>
          <span class="fw-total-pct" :class="pctClass(totalActual, totalEstimate)">{{ totalPct }}%</span>
        </div>
        <div class="fw-bar-track fw-bar-track--main">
          <div
            class="fw-bar-fill"
            :class="barFillClass(totalActual, totalEstimate)"
            :style="{ width: clampPct(totalActual, totalEstimate) + '%' }"
          ></div>
        </div>
        <div class="fw-sep"></div>
      </template>

      <!-- Items -->
      <div v-for="item in items" :key="item.name" class="fw-item">
        <div class="fw-item-row">
          <span class="fw-item-name">{{ item.name }}</span>
          <span class="fw-item-amount" :class="{ 'fw-confirmed': item.hasActual }">
            <span v-if="!item.hasActual" class="fw-tilde">~</span>{{ fmt(item.actual) }} kr
          </span>
        </div>
        <div v-if="showBars && widgetStyle !== 'compact'" class="fw-bar-track">
          <div
            class="fw-bar-fill"
            :class="barFillClass(item.actual, item.estimate)"
            :style="{ width: clampPct(item.actual, item.estimate) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Compact footer -->
      <div v-if="widgetStyle === 'compact'" class="fw-compact-footer">
        <span class="fw-compact-label">Totalt</span>
        <span class="fw-compact-value">{{ fmt(totalActual) }} / ~{{ fmt(totalEstimate) }} kr</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

const widgetStyle = computed(() => store.overviewSettings.widgetSettings?.flex?.style || 'default')
const showBars    = computed(() => store.overviewSettings.widgetSettings?.flex?.showBars !== false)

const items = computed(() => {
  const mk = store.currentMonthKey
  const actuals = store.variableActuals?.[mk] || {}
  return store.expenses
    .filter(e => e.variable)
    .map(e => {
      const hasActual = actuals[e.name] !== undefined
      const actual = hasActual ? actuals[e.name] : e.amount
      return { name: e.name, estimate: e.amount, actual, hasActual }
    })
})

const totalEstimate = computed(() => items.value.reduce((s, i) => s + i.estimate, 0))
const totalActual   = computed(() => items.value.reduce((s, i) => s + i.actual, 0))
const totalPct      = computed(() => {
  if (totalEstimate.value === 0) return 0
  return Math.round((totalActual.value / totalEstimate.value) * 100)
})

function clampPct(actual, estimate) {
  if (estimate === 0) return 0
  return Math.min((actual / estimate) * 100, 100)
}

function barFillClass(actual, estimate) {
  if (estimate === 0) return ''
  const pct = (actual / estimate) * 100
  if (pct > 120) return 'fw-bar-fill--over'
  if (pct > 100) return 'fw-bar-fill--warn'
  return ''
}

function pctClass(actual, estimate) {
  if (estimate === 0) return ''
  const pct = (actual / estimate) * 100
  if (pct > 120) return 'fw-pct--over'
  if (pct > 100) return 'fw-pct--warn'
  return ''
}

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.flex-widget-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
  position: relative;
  overflow: hidden;
}

.flex-widget-card:active {
  opacity: 0.7;
}

/* Subtle radial glow in top-right corner */
.fw-glow {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 122, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Header ── */
.fw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.fw-title-group {
  display: flex;
  align-items: center;
  gap: 7px;
}

.fw-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--system-blue);
  flex-shrink: 0;
}

.fw-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--system-blue);
}

.fw-month {
  font-size: 14px;
  color: var(--text-secondary);
}

/* ── Total section ── */
.fw-total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 9px;
}

.fw-total-amounts {
  display: flex;
  align-items: baseline;
}

.fw-total-actual {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.fw-total-estimate {
  font-size: 13px;
  color: var(--text-secondary);
}

.fw-total-pct {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.fw-pct--warn { color: var(--system-orange); }
.fw-pct--over { color: var(--system-red); }

/* ── Bars ── */
.fw-bar-track {
  height: 5px;
  background: var(--separator);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}

.fw-bar-track--main {
  height: 8px;
  margin-bottom: 0;
}

.fw-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--system-blue);
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fw-bar-fill--warn { background: var(--system-orange); }
.fw-bar-fill--over { background: var(--system-red); }

.fw-sep {
  height: 0.5px;
  background: var(--separator);
  margin: 14px 0 12px;
}

/* ── Individual items ── */
.fw-item {
  margin-bottom: 8px;
}

.fw-item:last-child {
  margin-bottom: 0;
}

.fw-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.fw-item-name {
  font-size: 14px;
  color: var(--text-primary);
}

.fw-item-amount {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.fw-item-amount.fw-confirmed {
  color: var(--system-blue);
  font-weight: 600;
}

.fw-tilde {
  opacity: 0.5;
}

/* ── Compact style ── */
.fw--compact .fw-header {
  margin-bottom: 10px;
}

.fw--compact .fw-item {
  margin-bottom: 5px;
}

.fw--compact .fw-item-name {
  font-size: 13px;
}

.fw--compact .fw-item-amount {
  font-size: 13px;
}

.fw-compact-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 0.5px solid var(--separator);
}

.fw-compact-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.fw-compact-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ── Empty state ── */
.fw-empty {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 8px;
  text-align: center;
}
</style>
