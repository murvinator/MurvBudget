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

MurvBudget is a Vue 3 PWA for personal budget tracking. Users can create an account and store encrypted data in the cloud via Supabase.

**Tech stack:** Vue 3 (Composition API + `<script setup>`), Pinia with `pinia-plugin-persistedstate`, Chart.js, Vite. Backend on Supabase (auth + encrypted cloud sync). Deployed to Netlify.

### Navigation model

The app uses a custom single-page navigation system rather than Vue Router. `App.vue` holds `currentView` as a ref and renders the active view via `<component :is="currentViewComponent">`. Navigation events bubble up from children via `emit('navigate', viewName)`. The four views are: `overview`, `economy`, `monthly` (checklist), and `settings`.

Navigation components adapt to context:
- **PWA / mobile**: `TabBar.vue` (bottom tab bar, liquid glass)
- **Mobile web browser**: `MobileWebNav.vue` (bottom nav)
- **Desktop**: `DesktopNav.vue` (sidebar)

`goBack` is provided via `provide('goBack', goBack)`. Additional injected values: `confirm`, `localDataTs`, `showSalarySheet`, `pendingSettingsSection`.

### State (src/stores/budget.js)

Single Pinia store (`useBudgetStore`) persisted to `localStorage` under key `budgetApp`. The store manages:

- **income** / **expenses** — fixed monthly items; expenses have `name`, `amount`, `category`, optional `date`
- **categories** — ordered list of category names; expenses reference categories by name string
- **flex** — flex/variable expenses `{ name, amount }`; separate from `expenses[]`
- **variableActuals** — `{ "YYYY-M": { expenseName: amount } }` — actual spending per flex item per month
- **debts** — each debt has a unique `id` (generated via `genId()`), `name`, `amount`, optional `monthlyPayment`, `date`
- **debtPayments** — keyed by debt `id`; each payment reduces `debt.amount` immediately
- **savings** — savings goals `{ id, name, target, current, date }`; deposits in `savingsDeposits{}`
- **monthlyStatus** — tracks checkbox state for the monthly checklist; keyed by `'current'` then by expense index or `'debt-' + debtId`
- **monthlyChecklistTracking** — tracks checklist item dates per month key
- **overviewSettings** — controls widget visibility, order, appearance, and per-widget sub-settings
- **checklistSettings** — `{ showAmounts, showDates, autoCollapseCompleted, showSummary, sortOrder }`
- **economyViewSettings** — `{ flexShowBars, flexShowEstimates, debtsShowProgress, savingsShowPct, savingsShowRate }`
- **economyOrder** — display order of Economy view sections: `['debts', 'savings', 'flex']`
- **salaryDay** / **salaryMonthOffset** — salary arrival day config; triggers `SalaryDaySheet` popup in MonthlyView
- **tempMonthlyIncome** — per-income-source overrides by month key
- **displayModePreference** — `'auto'`, `'force-pwa'`, or `'force-browser'`

`migrateData()` is called on app mount and handles legacy data migrations (e.g., old `'Skulder'` category → debts, name-keyed debtPayments → id-keyed, `expenses[].variable = true` → `flex[]`).

**Version constants** (both exported from `src/stores/budget.js`):
- `DATA_SCHEMA_VERSION` — integer; stored in JSON export and localStorage. **Must be incremented whenever the JSON data structure changes** (new fields added, fields renamed/removed, format changes). Used for import/cloud-sync compatibility warnings.
- `APP_VERSION` — semver string shown in Settings footer. Update for any release.

### Views

| View | File | Purpose |
|------|------|---------|
| Overview (Översikt) | `src/views/OverviewView.vue` | Customizable widgets: summary cards, pie/bar chart, debt summary, checklist progress, savings rate, category breakdown, flex widget |
| Economy (Ekonomi) | `src/views/EconomyView.vue` | Debts & loans, savings goals, flex expenses — each section collapsible and reorderable |
| Monthly (Checklista) | `src/views/MonthlyView.vue` | Fixed expenses as a pay-as-you-go checklist, grouped by category, collapsible; debt payments and savings shown; collapse state persisted to `localStorage` under key `murvbudget-monthly-collapsed` |
| Settings (Inställningar) | `src/views/SettingsView.vue` | Manage income, expenses, categories, overview/economy widget settings, data export/import, auth, cloud sync |

`src/views/_unused/` contains archived views (BudgetView.vue, etc.) — do not reference these.

### UI conventions

- **Language:** Swedish (UI text, month names, `toLocaleString('sv-SE')` for numbers)
- **Design language:** iOS-native aesthetic — SPECIFICALLY LATEST IOS26 — SF Pro font stack, iOS system colors as CSS variables (`--system-blue`, `--system-red`, etc.), safe-area insets, liquid glass tab bar effect
- **Styling:** Global styles in `src/assets/style.css`; component-scoped `<style scoped>` for local overrides. Dark mode via `@media (prefers-color-scheme: dark)`.
- **No routing library** — view switching is manual via emitted `navigate` events
- **Cloud sync** — `syncToCloud()` / `loadFromCloud()` use encrypted storage via Supabase; `src/utils/crypto.js` handles encryption; `src/stores/auth.js` manages session

### Key patterns

- Amounts stored as integers (SEK), parsed with `parseInt()` on input
- `currentMonthKey` getter returns `"YYYY-M"` (e.g. `"2025-0"` for January 2025)
- `SwipeToDelete.vue` is a reusable swipe-to-reveal-delete wrapper used in settings lists
- `DebtPaymentModal.vue` is a global modal rendered at root level in `App.vue`; it communicates via store state
- `CollapseTransition.vue` is a reusable collapse/expand wrapper used throughout
- `ConfirmSheet.vue` is a global confirm dialog injected via `provide('confirm', ...)`
- `SalaryDaySheet.vue` is a bottom sheet shown on first MonthlyView visit each payday
- `genId(prefix)` generates unique IDs for debts and savings goals
