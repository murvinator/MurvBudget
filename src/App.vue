<template>
  <div>
    <SplashScreen v-if="!splashDone" @done="splashDone = true" />
    <OnboardingScreen v-if="splashDone && showOnboarding" @done="showOnboarding = false" />

    <!-- Liquid Glass SVG filter (hidden) -->
    <svg style="display:none">
      <filter id="glass-distortion" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence"/>
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" result="specLight">
          <fePointLight x="-200" y="-200" z="300"/>
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k2="1" k3="1"/>
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="50" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>

    <AppHeader v-if="currentView !== 'settings' && !showOnboarding" :current-view="currentView" />

    <div v-show="!showOnboarding" class="container">
      <div class="content">
        <!-- Large title scrolls with content, naturally disappears behind the fixed nav bar -->
        <h1 v-if="currentView !== 'settings'" class="page-large-title">{{ viewTitle }}</h1>
        <component :is="currentViewComponent" ref="activeViewRef" @navigate="showView" />
      </div>
    </div>

    <TabBar v-show="!showOnboarding" :current-view="currentView" @navigate="showView" />

    <DebtPaymentModal />
    <ConfirmSheet ref="confirmSheetRef" />
    <SalaryDaySheet ref="salaryDaySheetRef" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useBudgetStore } from './stores/budget'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
import DebtPaymentModal from './components/DebtPaymentModal.vue'
import ConfirmSheet from './components/ConfirmSheet.vue'
import SalaryDaySheet from './components/SalaryDaySheet.vue'
import SplashScreen from './components/SplashScreen.vue'
import OnboardingScreen from './components/OnboardingScreen.vue'
import OverviewView from './views/OverviewView.vue'
import MonthlyView from './views/MonthlyView.vue'
import SettingsView from './views/SettingsView.vue'

const store = useBudgetStore()
const authStore = useAuthStore()
const confirmSheetRef = ref(null)
const salaryDaySheetRef = ref(null)
const activeViewRef = ref(null)

const splashDone = ref(sessionStorage.getItem('splashShown') === '1')
if (!splashDone.value) sessionStorage.setItem('splashShown', '1')

const currentView = ref('overview')
const lastView = ref('overview')

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'overview': return OverviewView
    case 'monthly': return MonthlyView
    case 'settings': return SettingsView
    default: return OverviewView
  }
})

const viewTitle = computed(() => {
  switch (currentView.value) {
    case 'overview': return 'Budget'
    case 'monthly': return 'Checklista'
    default: return 'MurvBudget'
  }
})

function showView(name) {
  if (name === currentView.value) {
    if (name === 'settings') {
      activeViewRef.value?.toggleAllSections?.()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }
  if (currentView.value !== 'settings') {
    lastView.value = currentView.value
  }
  currentView.value = name
  window.scrollTo(0, 0)
  if (name === 'monthly') {
    checkSalaryDayPopup()
  }
}

const SALARY_POPUP_KEY = 'murvbudget-salary-popup-shown'

function getSalaryPopupId() {
  const today = new Date()
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}

async function checkSalaryDayPopup() {
  const salaryDay = store.salaryDay
  if (!salaryDay) return
  const today = new Date()
  if (today.getDate() !== salaryDay) return

  const popupId = getSalaryPopupId()
  if (localStorage.getItem(SALARY_POPUP_KEY) === popupId) return

  // Mark as shown before awaiting to prevent double-show
  localStorage.setItem(SALARY_POPUP_KEY, popupId)

  const currentOverrides = store.tempMonthlyIncome?.[store.currentMonthKey] ?? {}
  const result = await salaryDaySheetRef.value?.show(store.income, currentOverrides, store.salaryDay)
  applySalarySheetResult(result)
}

async function showSalaryDayManually() {
  const currentOverrides = store.tempMonthlyIncome?.[store.currentMonthKey] ?? {}
  const result = await salaryDaySheetRef.value?.show(store.income, currentOverrides, store.salaryDay, 'income-only')
  applySalarySheetResult(result)
}

function applySalarySheetResult(result) {
  if (!result) return

  // Apply pay day change if edited
  if (result.salaryDay && result.salaryDay !== store.salaryDay) {
    store.salaryDay = result.salaryDay
  }

  // Save per-income overrides — clear if reverted to original, set if changed
  for (const item of store.income) {
    const newAmount = result.amounts[item.name]
    if (newAmount !== item.amount) {
      store.setTempMonthlyIncome(store.currentMonthKey, item.name, newAmount)
    } else {
      store.setTempMonthlyIncome(store.currentMonthKey, item.name, null)
    }
  }
  if (result.resetChecklist) {
    store.resetCurrentMonth()
  }
}

function goBack() {
  currentView.value = lastView.value
  window.scrollTo(0, 0)
}

const localDataTs = ref(localStorage.getItem('murvbudget-local-updated-at'))

const ONBOARDING_KEY = 'murvbudget-onboarding'

function computeShowOnboarding() {
  if (authStore.isLoggedIn) return false
  const stored = localStorage.getItem(ONBOARDING_KEY)
  if (stored === 'never') return false
  // Existing user with data — skip silently and mark done
  const hasData = store.income.length > 0 || store.expenses.length > 0 || store.categories.length > 0
  if (hasData && !stored) {
    localStorage.setItem(ONBOARDING_KEY, 'never')
    return false
  }
  // Shown recently — respect the 14-day cooldown
  if (stored) {
    const daysSince = (Date.now() - new Date(stored).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 14) return false
  }
  return true
}

// Computed synchronously at setup time — prevents any flicker
const showOnboarding = ref(computeShowOnboarding())

provide('goBack', goBack)
provide('confirm', (msg, opts) => confirmSheetRef.value?.show(msg, opts))
provide('localDataTs', localDataTs)
provide('showSalarySheet', showSalaryDayManually)

function hasStoreData() {
  return store.income.length > 0 || store.expenses.length > 0 ||
    store.categories.length > 0 || store.debts.length > 0 ||
    store.variableExpenses.length > 0
}

onMounted(() => {
  history.scrollRestoration = 'manual'
  store.migrateData()
  authStore.init()

  // Also hide if auth resolves to logged-in asynchronously (Supabase session restore)
  watch(() => authStore.isLoggedIn, (loggedIn) => {
    if (loggedIn) showOnboarding.value = false
  })

  // Seed timestamp if we have existing data but no key yet (first run after this feature)
  if (hasStoreData() && !localDataTs.value) {
    const now = new Date().toISOString()
    localStorage.setItem('murvbudget-local-updated-at', now)
    localDataTs.value = now
  }

  let syncTimer = null
  store.$subscribe(() => {
    // Update local-data timestamp reactively
    if (hasStoreData()) {
      const now = new Date().toISOString()
      localStorage.setItem('murvbudget-local-updated-at', now)
      localDataTs.value = now
    } else {
      localStorage.removeItem('murvbudget-local-updated-at')
      localDataTs.value = null
    }

    // Auto-sync to cloud
    if (!authStore.isLoggedIn) return
    clearTimeout(syncTimer)
    syncTimer = setTimeout(async () => {
      await store.syncToCloud()
      authStore.setLastSynced()
    }, 2000)
  })
})
</script>
