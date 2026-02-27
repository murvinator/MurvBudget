<template>
  <div class="upcoming-bills-card">
    <h3 class="upcoming-title">Kommande räkningar</h3>

    <div v-if="billsWithDates.length === 0" class="upcoming-empty">
      Lägg till datum på dina utgifter
    </div>

    <template v-else>
      <div
        v-for="bill in visibleBills"
        :key="bill.globalIndex"
        class="bill-row"
        :class="{ paid: bill.paid }"
      >
        <div class="bill-day-badge" :class="{ paid: bill.paid }">{{ bill.date }}</div>
        <div class="bill-info">
          <div class="bill-name">{{ bill.name }}</div>
        </div>
        <div class="bill-amount">{{ fmt(bill.amount) }} kr</div>
        <svg v-if="bill.paid" class="bill-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const today = new Date().getDate()

const billsWithDates = computed(() => {
  return store.expenses
    .map((e, i) => ({ ...e, globalIndex: i }))
    .filter((e) => e.date)
})

const visibleBills = computed(() => {
  const bills = billsWithDates.value.slice()

  // Sort: from today onwards, wrapping around
  bills.sort((a, b) => {
    const da = ((a.date - today + 31) % 31)
    const db = ((b.date - today + 31) % 31)
    return da - db
  })

  return bills.slice(0, 6).map((b) => ({
    ...b,
    paid: !!store.monthlyStatus['current']?.[b.globalIndex],
  }))
})

function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
.upcoming-bills-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  padding: 18px 0 4px;
  border: 0.5px solid var(--separator);
  overflow: hidden;
}

.upcoming-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 0 20px 12px;
  border-bottom: 0.5px solid var(--separator);
}

.upcoming-empty {
  padding: 20px;
  font-size: 15px;
  color: var(--text-tertiary);
  text-align: center;
}

.bill-row {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  border-bottom: 0.5px solid var(--separator);
  transition: opacity 0.2s;
}

.bill-row:last-child {
  border-bottom: none;
}

.bill-row.paid {
  opacity: 0.5;
}

.bill-day-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--system-blue);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bill-day-badge.paid {
  background: var(--system-green);
}

.bill-info {
  flex: 1;
  min-width: 0;
}

.bill-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.bill-check {
  width: 18px;
  height: 18px;
  color: var(--system-green);
  flex-shrink: 0;
}
</style>
