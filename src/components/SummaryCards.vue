<template>
  <div :class="['summary-cards', sizeClass]">

    <!-- Income -->
    <div class="summary-card" :style="cardStyle(0)" @click="toggleCard(0)">
      <div class="card-main">
        <h4>{{ incomeLabel }}</h4>
        <div class="amount">{{ fmt(displayIncome) }} kr</div>
        <div v-if="tempDiff !== 0" class="temp-badge">
          {{ tempDiff > 0 ? '+' : '' }}{{ fmt(tempDiff) }} kr denna månad
        </div>
        <svg class="card-chevron" :class="{ 'card-chevron--open': openCard === 0 }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <CollapseTransition>
        <div v-if="openCard === 0" class="card-detail">
          <div class="detail-sep" />
          <div v-for="item in store.income" :key="item.name" class="detail-row">
            <span class="detail-name">{{ item.name }}</span>
            <span class="detail-amount">
              <span v-if="tempOverrides[item.name] !== undefined" class="detail-original">{{ fmt(item.amount) }}</span>
              {{ fmt(tempOverrides[item.name] !== undefined ? tempOverrides[item.name] : item.amount) }} kr
            </span>
          </div>
          <div v-if="store.income.length === 0" class="detail-empty">Ingen inkomst tillagd</div>
          <div v-if="tempDiff !== 0" class="detail-row detail-row--temp">
            <span class="detail-name temp-label">Tillfällig justering</span>
            <span class="detail-amount" :class="tempDiff > 0 ? 'temp-pos' : 'temp-neg'">
              {{ tempDiff > 0 ? '+' : '' }}{{ fmt(tempDiff) }} kr
            </span>
          </div>
        </div>
      </CollapseTransition>
    </div>

    <!-- Expenses -->
    <div class="summary-card" :style="cardStyle(1)" @click="toggleCard(1)">
      <div class="card-main">
        <h4>Utgifter</h4>
        <div class="amount">{{ fmt(displayExpenses) }} kr</div>
        <svg class="card-chevron" :class="{ 'card-chevron--open': openCard === 1 }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <CollapseTransition>
        <div v-if="openCard === 1" class="card-detail">
          <div class="detail-sep" />
          <div v-for="(exp, i) in topExpenses" :key="exp.name" class="detail-row">
            <span class="detail-rank">{{ i + 1 }}</span>
            <span class="detail-name">{{ exp.name }}</span>
            <span v-if="exp.category" class="detail-cat">{{ exp.category }}</span>
            <span class="detail-amount">{{ fmt(exp.amount) }} kr</span>
          </div>
          <div v-if="store.expenses.length === 0" class="detail-empty">Inga utgifter tillagda</div>
          <div v-else-if="store.expenses.length > 5" class="detail-more">
            +{{ store.expenses.length - 5 }} till
          </div>
        </div>
      </CollapseTransition>
    </div>

    <!-- Remaining -->
    <div class="summary-card" :style="cardStyle(2)" @click="toggleCard(2)">
      <div class="card-main">
        <h4>Kvar</h4>
        <div class="amount">{{ fmt(displayRemaining) }} kr</div>
        <svg class="card-chevron" :class="{ 'card-chevron--open': openCard === 2 }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <CollapseTransition>
        <div v-if="openCard === 2" class="card-detail">
          <div class="detail-sep" />
          <div class="kvar-body">
            <svg viewBox="0 0 100 100" class="kvar-ring" width="88" height="88">
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8" opacity="0.2"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8"
                :stroke-dasharray="RING_CIRCUMFERENCE"
                :stroke-dashoffset="kvarAnimatedOffset"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
                class="kvar-arc"/>
              <text x="50" y="46" text-anchor="middle" fill="currentColor"
                font-size="19" font-weight="700" font-family="-apple-system,sans-serif">{{ pctRemaining }}%</text>
              <text x="50" y="61" text-anchor="middle" fill="currentColor"
                font-size="10" opacity="0.7" font-family="-apple-system,sans-serif">kvar</text>
            </svg>
            <div class="kvar-stats">
              <div class="kvar-stat">
                <span class="kvar-lbl">Inkomst</span>
                <span class="kvar-val">{{ fmt(store.totalIncome) }} kr</span>
              </div>
              <div class="kvar-stat">
                <span class="kvar-lbl">Utgifter</span>
                <span class="kvar-val">{{ fmt(store.totalExpenses) }} kr</span>
              </div>
              <div class="kvar-stat kvar-stat--hi">
                <span class="kvar-lbl">Kvar</span>
                <span class="kvar-val">{{ fmt(store.remaining) }} kr</span>
              </div>
            </div>
          </div>
        </div>
      </CollapseTransition>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CollapseTransition from './CollapseTransition.vue'

const store = useBudgetStore()

// ── Size / style ─────────────────────────────────────────────
const sizeClass = computed(() => {
  const s = store.overviewSettings?.summaryStyle || 'default'
  return s !== 'default' ? `summary-cards--${s}` : ''
})

const GRADIENTS = {
  'blue':        'linear-gradient(135deg, #007AFF, #007AFF)',
  'blue-purple': 'linear-gradient(135deg, #007AFF, #AF52DE)',
  'orange-pink': 'linear-gradient(135deg, #FF9500, #FF2D92)',
  'green-teal':  'linear-gradient(135deg, #34C759, #5AC8FA)',
  'red-orange':  'linear-gradient(135deg, #FF3B30, #FF9500)',
  'indigo-blue': 'linear-gradient(135deg, #5856D6, #007AFF)',
  'pink-red':    'linear-gradient(135deg, #FF2D92, #FF3B30)',
}
const DEFAULT_COLORS = ['blue-purple', 'orange-pink', 'green-teal']

function cardStyle(index) {
  const colors = store.overviewSettings?.cardColors || DEFAULT_COLORS
  const key = colors[index] || DEFAULT_COLORS[index]
  if (key === 'neutral') {
    return {
      background: 'var(--card-bg)',
      color: 'var(--text-primary)',
      border: '1px solid var(--separator)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }
  }
  return { background: GRADIENTS[key] || GRADIENTS['blue-purple'] }
}

// ── Animated counts ──────────────────────────────────────────
const displayIncome    = ref(0)
const displayExpenses  = ref(0)
const displayRemaining = ref(0)

function animateCount(target, setter, duration = 700) {
  const start = performance.now()
  function step(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(step)
    else setter(target)
  }
  requestAnimationFrame(step)
}

function runAnimation() {
  animateCount(store.totalIncome,   (v) => (displayIncome.value = v))
  animateCount(store.totalExpenses, (v) => (displayExpenses.value = v))
  animateCount(store.remaining,     (v) => (displayRemaining.value = v))
}

onMounted(runAnimation)
watch([() => store.totalIncome, () => store.totalExpenses, () => store.remaining], runAnimation)

// ── Expand / collapse ────────────────────────────────────────
const openCard = ref(null)

function toggleCard(idx) {
  openCard.value = openCard.value === idx ? null : idx
}

// ── Income label ─────────────────────────────────────────────
const incomeLabel = computed(() =>
  store.income.length === 1 ? 'Inkomst' : 'Inkomster'
)

// ── Temp income indicator ─────────────────────────────────────
const tempOverrides = computed(() => {
  const mk = `${new Date().getFullYear()}-${new Date().getMonth()}`
  const ov = store.tempMonthlyIncome?.[mk]
  return (ov && typeof ov === 'object') ? ov : {}
})

const normalTotalIncome = computed(() =>
  store.income.reduce((sum, i) => sum + i.amount, 0)
)

const tempDiff = computed(() => store.totalIncome - normalTotalIncome.value)

// ── Top 5 expenses ───────────────────────────────────────────
const topExpenses = computed(() =>
  [...store.expenses].sort((a, b) => b.amount - a.amount).slice(0, 5)
)

// ── Remaining ring ───────────────────────────────────────────
const RING_CIRCUMFERENCE = 2 * Math.PI * 38  // ≈ 238.76

const pctRemaining = computed(() => {
  if (!store.totalIncome) return 0
  return Math.max(0, Math.min(100, Math.round((store.remaining / store.totalIncome) * 100)))
})

const ringOffset = computed(() =>
  RING_CIRCUMFERENCE * (1 - pctRemaining.value / 100)
)

// Animate the ring when the card opens
const kvarAnimatedOffset = ref(RING_CIRCUMFERENCE)

watch(openCard, (val) => {
  if (val === 2) {
    kvarAnimatedOffset.value = RING_CIRCUMFERENCE
    nextTick(() => {
      setTimeout(() => { kvarAnimatedOffset.value = ringOffset.value }, 80)
    })
  }
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
/* ── Expand chevron ───────────────────────────────────────── */
.card-chevron {
  opacity: 0.75;
  transition: transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}
.card-chevron--open {
  transform: rotate(180deg);
}

/* ── card-main: wraps label + amount + chevron ────────────── */
.card-main {
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Default: chevron at top-right, h4 + amount stacked */
.card-main .card-chevron {
  position: absolute;
  top: 1px;
  right: 0;
}

/* ── Detail section ───────────────────────────────────────── */
.detail-sep {
  height: 0.5px;
  background: currentColor;
  opacity: 0.25;
  margin: 12px 0 10px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 0;
  font-size: 14px;
}

.detail-rank {
  opacity: 0.55;
  font-size: 12px;
  font-weight: 600;
  min-width: 14px;
}

.detail-name {
  flex: 1;
  font-weight: 500;
  opacity: 0.92;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.detail-cat {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.6;
  background: rgba(255,255,255,0.18);
  padding: 2px 7px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-amount {
  font-weight: 600;
  font-size: 14px;
  opacity: 0.92;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-empty,
.detail-more {
  font-size: 13px;
  opacity: 0.6;
  text-align: center;
  padding: 4px 0;
}

/* ── Kvar detail ──────────────────────────────────────────── */
.kvar-body {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 0 4px;
}

.kvar-ring {
  flex-shrink: 0;
}

.kvar-arc {
  transition: stroke-dashoffset 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.kvar-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kvar-stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.kvar-lbl {
  font-size: 13px;
  opacity: 0.7;
  font-weight: 500;
}

.kvar-val {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
}

.kvar-stat--hi .kvar-lbl,
.kvar-stat--hi .kvar-val {
  opacity: 1;
  font-size: 15px;
  font-weight: 700;
}

/* ── Temp income indicator ────────────────────────────────── */
.temp-badge {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.85;
  margin-top: 3px;
  letter-spacing: -0.1px;
}

.detail-original {
  text-decoration: line-through;
  opacity: 0.45;
  font-size: 12px;
  margin-right: 3px;
}

.detail-row--temp {
  border-top: 0.5px solid currentColor;
  opacity: 0.85;
  margin-top: 4px;
  padding-top: 4px;
}

.temp-label {
  font-style: italic;
}

.temp-pos { color: inherit; }
.temp-neg { opacity: 0.7; }

/* ── Neutral card: tint detail-cat differently ────────────── */
/* When cardStyle returns neutral, currentColor is --text-primary,
   so rgba(255,255,255,...) looks bad. Override with a muted bg. */
</style>
