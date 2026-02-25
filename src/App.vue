<template>
  <div>
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

    <AppHeader />

    <div class="container">
      <div class="content">
        <!-- Large title scrolls with content, naturally disappears behind the fixed nav bar -->
        <h1 v-if="currentView !== 'settings'" class="page-large-title">Budget</h1>
        <component :is="currentViewComponent" @navigate="showView" />
      </div>
    </div>

    <TabBar :current-view="currentView" @navigate="showView" />

    <DebtPaymentModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from './stores/budget'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
import DebtPaymentModal from './components/DebtPaymentModal.vue'
import OverviewView from './views/OverviewView.vue'
import BudgetView from './views/BudgetView.vue'
import MonthlyView from './views/MonthlyView.vue'
import SettingsView from './views/SettingsView.vue'

const store = useBudgetStore()

const currentView = ref('overview')
const lastView = ref('overview')

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'overview': return OverviewView
    case 'budget': return BudgetView
    case 'monthly': return MonthlyView
    case 'settings': return SettingsView
    default: return OverviewView
  }
})

function showView(name) {
  if (name !== 'settings') lastView.value = currentView.value
  currentView.value = name
  window.scrollTo(0, 0)
}

function goBack() {
  currentView.value = lastView.value
  window.scrollTo(0, 0)
}

// Provide goBack to settings view via provide/inject
import { provide } from 'vue'
provide('goBack', goBack)

onMounted(() => {
  store.migrateData()
})
</script>
