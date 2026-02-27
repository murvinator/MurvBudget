<template>
  <div class="chart-component">
    <div :style="chartContainerStyle">
      <canvas ref="canvasRef"></canvas>
    </div>
    <div v-if="isStackedBar && stackedLegendItems.length" class="stacked-legend">
      <div v-for="item in stackedLegendItems" :key="item.label" class="stacked-legend-item">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const canvasRef = ref(null)
let chartInstance = null
let darkModeQuery = null

const chartData = computed(() => {
  const expenses = store.expenses
  return expenses.map((e) => ({ ...e }))
})

const COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
  '#5AC8FA', '#FFCC00', '#FF6482', '#30B0C7', '#32D74B',
]

const isStackedBar = computed(() => (store.overviewSettings?.chartType || 'pie') === 'stackedBar')

const stackedLegendItems = ref([])

const chartContainerStyle = computed(() => {
  const t = store.overviewSettings?.chartType || 'pie'
  if (t === 'stackedBar') return { height: '46px', marginTop: '12px' }
  if (t === 'bar') return { minHeight: '380px' }
  return {}
})

function getTextColor() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#000000'
}

function prepareData() {
  const data = chartData.value
  if (data.length === 0) return null

  const total = data.reduce((sum, e) => sum + e.amount, 0)
  const threshold = total * 0.03
  const main = []
  let otherTotal = 0

  data.forEach((e) => {
    if (e.amount >= threshold) main.push(e)
    else otherTotal += e.amount
  })

  if (otherTotal > 0) main.push({ name: 'Övrigt', amount: otherTotal })
  main.sort((a, b) => b.amount - a.amount)
  return main
}

function buildChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  stackedLegendItems.value = []

  const main = prepareData()
  if (!main) return

  const rawType = store.overviewSettings?.chartType || 'pie'
  const chartType = rawType === 'polarArea' ? 'pie' : rawType
  const textColor = getTextColor()
  const labels = main.map((e) => e.name)
  const amounts = main.map((e) => e.amount)
  const bgColors = main.map((_, i) => COLORS[i % COLORS.length])
  const grandTotal = amounts.reduce((s, v) => s + v, 0)

  if (chartType === 'stackedBar') {
    stackedLegendItems.value = main.map((e, i) => ({
      label: `${e.name}: ${((e.amount / grandTotal) * 100).toFixed(0)}%`,
      color: COLORS[i % COLORS.length],
    }))

    const datasets = main.map((e, i) => ({
      label: e.name,
      data: [e.amount],
      backgroundColor: COLORS[i % COLORS.length],
      barThickness: 30,
    }))

    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: { labels: [''], datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 4, bottom: 4, left: 0, right: 0 } },
        scales: {
          x: { stacked: true, display: false },
          y: { stacked: true, display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                const pct = ((context.raw / grandTotal) * 100).toFixed(1)
                return `${context.dataset.label}: ${context.raw.toLocaleString('sv-SE')} kr (${pct}%)`
              },
            },
          },
        },
      },
    })
    return
  }

  if (chartType === 'bar') {
    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, bottom: 10, left: 4, right: 4 } },
        plugins: {
          legend: { display: false, onClick: () => {} },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.raw.toLocaleString('sv-SE')} kr`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 11 }, maxRotation: 40 },
            grid: { display: false },
          },
          y: {
            ticks: { color: textColor },
            grid: { color: textColor === '#ffffff' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
          },
        },
      },
    })
    return
  }

  // pie or doughnut
  const cutout = chartType === 'doughnut' ? '60%' : '0%'

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: amounts,
        backgroundColor: bgColors,
        borderWidth: 0,
        spacing: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: false },
        legend: {
          position: 'right',
          onClick: () => {},
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 14 },
            color: textColor,
            generateLabels(chart) {
              const d = chart.data
              const tot = d.datasets[0].data.reduce((s, v) => s + v, 0)
              return d.labels.map((label, i) => {
                const value = d.datasets[0].data[i]
                const pct = ((value / tot) * 100).toFixed(0)
                return {
                  text: `${label}: ${pct}%`,
                  fillStyle: d.datasets[0].backgroundColor[i],
                  strokeStyle: d.datasets[0].backgroundColor[i],
                  fontColor: textColor,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                }
              })
            },
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const tot = context.dataset.data.reduce((s, v) => s + v, 0)
              const pct = ((context.raw / tot) * 100).toFixed(1)
              return `${context.label}: ${context.raw.toLocaleString('sv-SE')} kr (${pct}%)`
            },
          },
        },
      },
      cutout,
    },
  })
}

onMounted(() => {
  buildChart()
  darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  darkModeQuery.addEventListener('change', buildChart)
})

watch(chartData, () => { buildChart() }, { deep: true })

watch(() => store.overviewSettings?.chartType, () => { buildChart() })

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
  if (darkModeQuery) darkModeQuery.removeEventListener('change', buildChart)
})
</script>

<style scoped>
.stacked-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 14px;
  padding: 8px 4px 16px;
}

.stacked-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
