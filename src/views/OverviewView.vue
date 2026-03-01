<template>
  <div>
    <template v-for="widget in visibleWidgets" :key="widget.id">
      <SummaryCards      v-if="widget.id === 'summary'" />
      <ExpenseChart      v-else-if="widget.id === 'chart'" @navigate="emit('navigate', $event)" />
      <DebtSummary       v-else-if="widget.id === 'debts'" @navigate="emit('navigate', $event)" />
      <ChecklistProgress v-else-if="widget.id === 'checklist'" @navigate="emit('navigate', $event)" />
      <SavingsRate       v-else-if="widget.id === 'savings'" />
      <CategoryBreakdown v-else-if="widget.id === 'categories'" />
      <FlexWidget        v-else-if="widget.id === 'flex'" @navigate="emit('navigate', $event)" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import SummaryCards from '../components/SummaryCards.vue'
import ExpenseChart from '../components/ExpenseChart.vue'
import DebtSummary from '../components/DebtSummary.vue'
import ChecklistProgress from '../components/ChecklistProgress.vue'
import SavingsRate from '../components/SavingsRate.vue'
import CategoryBreakdown from '../components/CategoryBreakdown.vue'
import FlexWidget from '../components/FlexWidget.vue'

const store = useBudgetStore()
const emit = defineEmits(['navigate'])

const visibleWidgets = computed(() =>
  (store.overviewSettings.widgetOrder || []).filter(w => w.visible)
)
</script>
