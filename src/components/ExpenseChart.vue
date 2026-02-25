<template>
  <div class="chart-component">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const canvasRef = ref(null)
let chartInstance = null

const chartData = computed(() => {
  const expenses = store.expenses
  const variableExpenses = store.variableExpenses
  const variableExpenseTransactions = store.variableExpenseTransactions
  const monthKey = store.currentMonthKey

  const totalVariableBudget = variableExpenses.reduce((sum, e) => sum + e.budget, 0)

  let totalVariableSpent = 0
  if (variableExpenseTransactions[monthKey]) {
    Object.values(variableExpenseTransactions[monthKey]).forEach((cat) => {
      totalVariableSpent += cat.reduce((sum, t) => sum + t.amount, 0)
    })
  }

  const amountForChart = Math.max(totalVariableBudget, totalVariableSpent)

  const chartExpenses = expenses.map((e) => ({ ...e }))
  if (amountForChart > 0) {
    chartExpenses.push({ name: 'Rörliga', amount: amountForChart, category: 'Rörligt' })
  }

  return chartExpenses
})

function buildChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const data = chartData.value
  if (data.length === 0) return

  const total = data.reduce((sum, e) => sum + e.amount, 0)
  const threshold = total * 0.03

  const mainExpenses = []
  let otherTotal = 0

  data.forEach((e) => {
    if (e.amount >= threshold) {
      mainExpenses.push(e)
    } else {
      otherTotal += e.amount
    }
  })

  if (otherTotal > 0) {
    mainExpenses.push({ name: 'Övrigt', amount: otherTotal })
  }

  mainExpenses.sort((a, b) => b.amount - a.amount)

  const colors = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
    '#5AC8FA', '#FFCC00', '#FF6482', '#30B0C7', '#32D74B',
  ]

  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-primary').trim() || '#000000'

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: mainExpenses.map((e) => e.name),
      datasets: [{
        data: mainExpenses.map((e) => e.amount),
        backgroundColor: colors.slice(0, mainExpenses.length),
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
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 14 },
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
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                }
              })
            },
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const tot = context.dataset.data.reduce((s, v) => s + v, 0)
              const pct = ((context.raw / tot) * 100).toFixed(1)
              return `${context.label}: ${context.raw} kr (${pct}%)`
            },
          },
        },
      },
      cutout: '0%',
    },
  })
}

onMounted(() => {
  buildChart()
})

watch(chartData, () => {
  buildChart()
}, { deep: true })

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
