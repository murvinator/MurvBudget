# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production (output: dist/)
npm run preview  # Preview production build locally
```

No test suite or linter is configured.

## Architecture

MurvBudget is a Vue 3 PWA for personal budget tracking. User can create account and store data in the cloud.

**Tech stack:** Vue 3 (Composition API + `<script setup>`), Pinia with `pinia-plugin-persistedstate`, Chart.js, Vite. Backend on SupaBase, user data and accounts. Deployed to Netlify.

### Navigation model

The app uses a custom single-page navigation system rather than Vue Router. `App.vue` holds `currentView` as a ref and renders the active view via `<component :is="currentViewComponent">`. Navigation events bubble up from children via `emit('navigate', viewName)`. The four views are: `overview`, `monthly` (checklist), and `settings`.

The `goBack` function is provided via `provide('goBack', goBack)` but not used at the moment.

### State (src/stores/budget.js)

Single Pinia store (`useBudgetStore`) persisted to `localStorage` under key `budgetApp`. The store manages:

- **income** / **expenses** — fixed monthly items; expenses have `name`, `amount`, `category`, optional `date`
- **categories** — ordered list of category names; expenses reference categories by name string
- **debts** — each debt has a unique `id` (generated via `genId()`), `name`, and remaining `amount`
- **debtPayments** — keyed by debt `id`; each payment reduces `debt.amount` immediately
- **monthlyStatus** — tracks checkbox state for the monthly checklist; keyed by `'current'` then by expense index
- **overviewSettings** — controls widget visibility and appearance on the Overview tab

`migrateData()` is called on app mount and handles legacy data migrations (e.g., old `'Skulder'` category → debts, name-keyed debtPayments → id-keyed).

### Views

| View | File | Purpose |
|------|------|---------|
| Overview | `src/views/OverviewView.vue` | Summary cards, pie/bar chart, debt summary — each widget togglable via `overviewSettings` |
| Budget | `src/views/BudgetView.vue` | Variable expense envelopes with per-month transaction tracking and progress bars |
| Monthly (Checklista) | `src/views/MonthlyView.vue` | Fixed expenses as a pay-as-you-go checklist, grouped by category, collapsible; collapse state persisted to `localStorage` under key `murvbudget-monthly-collapsed` |
| Settings | `src/views/SettingsView.vue` | Manage income, expenses, categories, variable expenses, debts; data export/import |

### UI conventions

- **Language:** Swedish (UI text, month names, `toLocaleString('sv-SE')` for numbers)
- **Design language:** iOS-native aesthetic - SPECIFICALLY LATEST IOS26 — SF Pro font stack, iOS system colors as CSS variables (`--system-blue`, `--system-red`, etc.), safe-area insets, liquid glass tab bar effect
- **Styling:** Global styles in `src/assets/style.css`; component-scoped `<style scoped>` for local overrides. Dark mode via `@media (prefers-color-scheme: dark)`.
- **No routing library** — view switching is manual via emitted `navigate` events
- **No HTTP calls** — all data is local; `loadTestData()` fetches from `/assets/testdata/testdata.json`

### Key patterns

- Amounts stored as integers (SEK), parsed with `parseInt()` on input
- `currentMonthKey` getter returns `"YYYY-M"` (e.g. `"2025-0"` for January 2025)
- `SwipeToDelete.vue` is a reusable swipe-to-reveal-delete wrapper used in settings lists
- `DebtPaymentModal.vue` is a global modal rendered at root level in `App.vue`; it communicates via store state
