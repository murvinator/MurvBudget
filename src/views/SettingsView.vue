<template>
  <div class="settings-view-root">
    <div class="settings-header">
      <div class="settings-header-left">
        <!-- <button class="back-btn" @click="goBack()" title="Tillbaka">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button> -->
        <h2>Inställningar</h2>
      </div>
    </div>

    <div class="settings-root">

      <!-- Översiktsinställningar -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('overview')">
          <h3>Översikt</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['overview'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['overview']" class="settings-content">
          <div
            v-for="(widget, idx) in store.overviewSettings.widgetOrder"
            :key="widget.id"
            class="widget-order-row"
            :class="{ 'widget-dragging': dragIdx === idx }"
          >
            <div class="widget-order-header">
              <!-- Drag handle: only visible when all sub-settings are collapsed -->
              <div
                class="widget-drag-handle"
                :class="{ 'handle-hidden': !allCollapsed }"
                @pointerdown="startDrag(idx, $event)"
                title="Dra för att ändra ordning"
              >
                <svg viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="3" cy="3"  r="1.5"/>
                  <circle cx="7" cy="3"  r="1.5"/>
                  <circle cx="3" cy="8"  r="1.5"/>
                  <circle cx="7" cy="8"  r="1.5"/>
                  <circle cx="3" cy="13" r="1.5"/>
                  <circle cx="7" cy="13" r="1.5"/>
                </svg>
              </div>

              <!-- Label + expand chevron (clickable for widgets with sub-settings) -->
              <div
                class="widget-order-expandable"
                :class="{ 'has-settings': WIDGETS_WITH_SETTINGS.includes(widget.id) }"
                @click="toggleWidgetSettings(widget.id)"
              >
                <span class="widget-order-label">{{ WIDGET_LABELS[widget.id] }}</span>
                <svg
                  v-if="WIDGETS_WITH_SETTINGS.includes(widget.id)"
                  class="widget-chevron"
                  :class="{ expanded: expandedWidgets[widget.id] }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              <input
                type="checkbox"
                class="ios-toggle"
                :checked="widget.visible"
                @change="toggleWidgetVisible(idx, $event.target.checked)"
              >
            </div>

            <!-- Sub-settings for summary widget -->
            <CollapseTransition><div v-if="expandedWidgets[widget.id] && widget.id === 'summary'" class="widget-sub-settings">
              <div class="chart-type-section">
                <div class="chart-type-label">Storlek</div>
                <div class="chart-type-segment">
                  <button
                    v-for="opt in summaryStyleOptions"
                    :key="opt.value"
                    :class="['segment-btn', { active: store.overviewSettings.summaryStyle === opt.value }]"
                    @click="store.setOverviewSetting('summaryStyle', opt.value)"
                  >{{ opt.label }}</button>
                </div>
              </div>
              <div class="chart-type-section chart-type-section--last">
                <div class="chart-type-label">Färgtema</div>
                <div class="chart-type-segment">
                  <button
                    v-for="p in colorPresets"
                    :key="p.value"
                    :class="['segment-btn', 'preset-btn', { active: activePreset === p.value }]"
                    @click="setPreset(p.value)"
                  >
                    <div class="preset-dots">
                      <span v-for="c in p.colors" :key="c" class="preset-dot" :style="{ background: GRADIENTS[c] }"></span>
                    </div>
                    <span>{{ p.label }}</span>
                  </button>
                </div>
              </div>
            </div></CollapseTransition>

            <!-- Sub-settings for chart widget -->
            <CollapseTransition><div v-if="expandedWidgets[widget.id] && widget.id === 'chart'" class="widget-sub-settings">
              <div class="chart-type-section chart-type-section--last">
                <div class="chart-type-label">Diagramtyp</div>
                <div class="chart-type-segment">
                  <button
                    v-for="opt in chartTypeOptions"
                    :key="opt.value"
                    :class="['segment-btn', { active: store.overviewSettings.chartType === opt.value }]"
                    @click="store.setOverviewSetting('chartType', opt.value)"
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div></CollapseTransition>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Inkomster -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('income')">
          <h3>Inkomster</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['income'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['income']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newIncomeName" placeholder="Namn">
            <input type="number" v-model.number="newIncomeAmount" placeholder="Belopp">
            <button :class="{ 'btn-added': addFeedback.income }" @click="addIncome">{{ addFeedback.income ? 'Tillagt' : 'Lägg till' }}</button>
          </div>
          <div
            v-for="(income, idx) in store.income"
            :key="idx"
            class="expense-item-wrapper"
          >
            <SwipeToDelete @delete="deleteIncome(idx)">
              <template #fixed>
                <div
                  class="expense-name"
                  :class="{ editing: editingIncome === idx }"
                  @click="toggleEditIncome(idx)"
                >{{ income.name }}</div>
              </template>
              <div class="expense-amount" style="color: var(--system-green)">{{ fmt(income.amount) }} kr</div>
            </SwipeToDelete>
            <CollapseTransition>
              <div v-if="editingIncome === idx" class="expense-edit-form">
                <div class="edit-form-content">
                  <div class="edit-input-group">
                    <label>Namn</label>
                    <input type="text" v-model="editIncomeForm.name">
                  </div>
                  <div class="edit-input-group">
                    <label>Belopp</label>
                    <input type="number" v-model.number="editIncomeForm.amount">
                  </div>
                  <div class="edit-actions">
                    <button class="save-edit-btn" @click="saveIncomeEdit(idx)">Spara</button>
                    <button class="cancel-edit-btn" @click="editingIncome = null">Avbryt</button>
                    <button class="delete-edit-btn" @click="deleteIncomeFromEdit(idx)">Radera</button>
                  </div>
                </div>
              </div>
            </CollapseTransition>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Fasta utgifter -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('expenses')">
          <h3>Utgifter</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['expenses'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['expenses']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newExpenseName" placeholder="Namn">
            <input type="number" v-model.number="newExpenseAmount" placeholder="Belopp">
          </div>
          <div class="input-group input-group--labeled">
            <div class="field-with-label">
              <span class="field-label">Kategori</span>
              <select v-model="newExpenseCategory">
                <option value="">Ingen kategori</option>
                <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="field-with-label field-with-label--narrow">
              <span class="field-label">Dag</span>
              <input type="number" v-model.number="newExpenseDate" placeholder="valfritt" min="1" max="31">
            </div>
            <button class="add-expense-bottom-btn" :class="{ 'btn-added': addFeedback.expense }" @click="addExpense">{{ addFeedback.expense ? 'Tillagt' : 'Lägg till' }}</button>
          </div>

          <!-- Uncategorized expenses -->
          <template v-if="uncategorizedExpenses.length > 0">
            <div class="category-header" style="margin-top: 16px;">
              <h4 style="padding: 12px 16px; font-size: 16px; font-weight: 600; color: var(--text-secondary); margin: 0;">Utan kategori</h4>
            </div>
            <div class="category-list">
              <div
                v-for="expense in uncategorizedExpenses"
                :key="expense.globalIndex"
                class="expense-item-wrapper"
              >
                <SwipeToDelete @delete="deleteExpense(expense.globalIndex)">
                  <template #fixed>
                    <div
                      class="expense-name"
                      :class="{ editing: editingExpense === expense.globalIndex }"
                      @click="toggleEditExpense(expense.globalIndex)"
                    >{{ expense.name }}</div>
                  </template>
                  <div class="expense-row-right">
                    <span class="expense-date-badge" :style="expense.date ? {} : { visibility: 'hidden' }">
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                        <line x1="1" y1="5" x2="11" y2="5"/>
                        <line x1="4" y1="1" x2="4" y2="3"/>
                        <line x1="8" y1="1" x2="8" y2="3"/>
                      </svg>
                      {{ expense.date }}
                    </span>
                    <span class="expense-amount">{{ fmt(expense.amount) }} kr</span>
                  </div>
                </SwipeToDelete>
                <CollapseTransition>
                  <div v-if="editingExpense === expense.globalIndex" class="expense-edit-form">
                    <div class="edit-form-content">
                      <div class="edit-input-group">
                        <label>Namn</label>
                        <input type="text" v-model="editForm.name">
                      </div>
                      <div class="edit-input-group">
                        <label>Belopp</label>
                        <input type="number" v-model.number="editForm.amount">
                      </div>
                      <div class="edit-input-group">
                        <label>Kategori</label>
                        <select v-model="editForm.category">
                          <option value="">Ingen kategori</option>
                          <option v-for="c in store.categories" :key="c" :value="c">{{ c }}</option>
                        </select>
                      </div>
                      <div class="edit-input-group">
                        <label>Dag (valfritt)</label>
                        <input type="number" v-model.number="editForm.date" min="1" max="31" placeholder="1–31">
                      </div>
                      <div class="edit-actions">
                        <button class="save-edit-btn" @click="saveExpenseEdit(expense.globalIndex)">Spara</button>
                        <button class="cancel-edit-btn" @click="editingExpense = null">Avbryt</button>
                        <button class="delete-edit-btn" @click="deleteExpenseFromEdit(expense.globalIndex)">Radera</button>
                      </div>
                    </div>
                  </div>
                </CollapseTransition>
              </div>
            </div>
          </template>

          <!-- Expenses grouped by category -->
          <template v-for="cat in store.categories" :key="cat">
            <template v-if="expensesByCategory(cat).length > 0">
              <div class="category-header" style="margin-top: 16px;">
                <h4 style="padding: 12px 16px; font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; text-transform: capitalize;">{{ cat }}</h4>
              </div>
              <div class="category-list">
                <div
                  v-for="expense in expensesByCategory(cat)"
                  :key="expense.globalIndex"
                  class="expense-item-wrapper"
                >
                  <SwipeToDelete @delete="deleteExpense(expense.globalIndex)">
                    <template #fixed>
                      <div
                        class="expense-name"
                        :class="{ editing: editingExpense === expense.globalIndex }"
                        @click="toggleEditExpense(expense.globalIndex)"
                      >{{ expense.name }}</div>
                    </template>
                    <div class="expense-row-right">
                      <span class="expense-date-badge" :style="expense.date ? {} : { visibility: 'hidden' }">
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                          <line x1="1" y1="5" x2="11" y2="5"/>
                          <line x1="4" y1="1" x2="4" y2="3"/>
                          <line x1="8" y1="1" x2="8" y2="3"/>
                        </svg>
                        {{ expense.date }}
                      </span>
                      <span class="expense-amount">{{ fmt(expense.amount) }} kr</span>
                    </div>
                  </SwipeToDelete>

                  <CollapseTransition>
                    <div v-if="editingExpense === expense.globalIndex" class="expense-edit-form">
                      <div class="edit-form-content">
                        <div class="edit-input-group">
                          <label>Namn</label>
                          <input type="text" v-model="editForm.name">
                        </div>
                        <div class="edit-input-group">
                          <label>Belopp</label>
                          <input type="number" v-model.number="editForm.amount">
                        </div>
                        <div class="edit-input-group">
                          <label>Kategori</label>
                          <select v-model="editForm.category">
                            <option value="">Ingen kategori</option>
                            <option v-for="c in store.categories" :key="c" :value="c">{{ c }}</option>
                          </select>
                        </div>
                        <div class="edit-input-group">
                          <label>Dag (valfritt)</label>
                          <input type="number" v-model.number="editForm.date" min="1" max="31" placeholder="1–31">
                        </div>
                        <div class="edit-actions">
                          <button class="save-edit-btn" @click="saveExpenseEdit(expense.globalIndex)">Spara</button>
                          <button class="cancel-edit-btn" @click="editingExpense = null">Avbryt</button>
                          <button class="delete-edit-btn" @click="deleteExpenseFromEdit(expense.globalIndex)">Radera</button>
                        </div>
                      </div>
                    </div>
                  </CollapseTransition>
                </div>
              </div>
            </template>
          </template>
        </div></CollapseTransition>
      </div>

      <!-- Kategorier -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('categories')">
          <h3>Kategorier</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['categories'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['categories']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newCategoryName" placeholder="Ny kategori">
            <button :class="{ 'btn-added': addFeedback.category }" @click="addCategory">{{ addFeedback.category ? 'Tillagt' : 'Lägg till' }}</button>
          </div>
          <div ref="catListRef">
            <div
              v-for="(cat, idx) in store.categories"
              :key="cat"
              class="cat-order-row"
              :class="{ 'widget-dragging': catDragIdx === idx }"
            >
              <SwipeToDelete @delete="deleteCategorySwipe(idx)">
                <template #fixed>
                  <div class="cat-row-inner">
                    <div
                      class="widget-drag-handle"
                      :class="{ 'handle-hidden': editingCategory !== null }"
                      @pointerdown="startCatDrag(idx, $event)"
                      @touchstart.stop
                      title="Dra för att ändra ordning"
                    >
                      <svg viewBox="0 0 10 16" fill="currentColor">
                        <circle cx="3" cy="3"  r="1.5"/>
                        <circle cx="7" cy="3"  r="1.5"/>
                        <circle cx="3" cy="8"  r="1.5"/>
                        <circle cx="7" cy="8"  r="1.5"/>
                        <circle cx="3" cy="13" r="1.5"/>
                        <circle cx="7" cy="13" r="1.5"/>
                      </svg>
                    </div>
                    <span
                      class="widget-order-label"
                      @click="toggleEditCategory(idx)"
                    >{{ cat }}</span>
                  </div>
                </template>
              </SwipeToDelete>
              <CollapseTransition>
                <div v-if="editingCategory === idx" class="widget-sub-settings">
                  <div class="edit-form-content" style="padding: 16px 16px 8px;">
                    <div class="edit-input-group">
                      <label>Namn</label>
                      <input type="text" v-model="editCategoryName">
                    </div>
                    <div class="edit-actions">
                      <button class="save-edit-btn" @click="saveCategoryEdit(idx)">Spara</button>
                      <button class="cancel-edit-btn" @click="editingCategory = null">Avbryt</button>
                      <button class="delete-edit-btn" @click="deleteCategoryFromEdit(idx)">Radera</button>
                    </div>
                  </div>
                </div>
              </CollapseTransition>
            </div>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Skulder -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('debts')">
          <h3>Skulder</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['debts'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['debts']" class="settings-content">
          <div class="input-group">
            <input type="text" v-model="newDebtName" placeholder="Namn">
            <input type="number" v-model.number="newDebtAmount" placeholder="Belopp">
            <button :class="{ 'btn-added': addFeedback.debt }" @click="addDebt">{{ addFeedback.debt ? 'Tillagt' : 'Lägg till' }}</button>
          </div>
          <div
            v-for="(debt, idx) in store.debts"
            :key="debt.id"
            class="expense-item-wrapper"
          >
            <SwipeToDelete @delete="deleteDebt(idx)">
              <template #fixed>
                <div class="expense-name" @click="toggleEditDebt(idx)">{{ debt.name }}</div>
              </template>
              <div class="expense-amount">{{ fmt(debt.amount) }} kr</div>
            </SwipeToDelete>
            <CollapseTransition>
              <div v-if="editingDebt === idx" class="expense-edit-form">
                <div class="edit-form-content">
                  <div class="edit-input-group">
                    <label>Belopp</label>
                    <input type="number" v-model.number="editDebtAmount">
                  </div>
                  <div class="edit-actions">
                    <button class="save-edit-btn" @click="saveDebtEdit(idx)">Spara</button>
                    <button class="cancel-edit-btn" @click="editingDebt = null">Avbryt</button>
                    <button class="delete-edit-btn" @click="deleteDebtFromEdit(idx)">Radera</button>
                  </div>
                </div>
              </div>
            </CollapseTransition>
          </div>
        </div></CollapseTransition>
      </div>

      <!-- Lönedag -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('salary')">
          <h3>Lönedag</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['salary'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['salary']" class="settings-content">

          <div class="salary-row">
            <div class="salary-row-text">
              <p class="salary-row-title">Vilken dag får du lön?</p>
              <p class="salary-row-sub">Används för att visa rätt månadsnamn i checklistan</p>
            </div>
            <input
              type="number"
              class="salary-day-input"
              :value="store.salaryDay"
              placeholder="1-31"
              min="1"
              max="31"
              @input="store.salaryDay = $event.target.value ? parseInt($event.target.value) : null"
            >
          </div>

          <div class="salary-row salary-row--sep">
            <div class="salary-row-text">
              <p class="salary-row-title">Visa nästa månads namn</p>
              <p class="salary-row-sub">Om du betalar räkningar samma dag du får lön visas nästa månads namn i checklistan från lönedagen till månadens slut</p>
            </div>
            <input
              type="checkbox"
              class="ios-toggle"
              :checked="store.salaryMonthOffset"
              :disabled="!store.salaryDay"
              @change="store.salaryMonthOffset = $event.target.checked"
            >
          </div>

        </div></CollapseTransition>
      </div>

      <!-- Konto -->
      <div class="settings-section">
        <div class="section-toggle" @click="toggleSection('account')">
          <h3>Konto och data</h3>
          <svg class="chevron" :class="{ collapsed: collapsedSections['account'] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <CollapseTransition><div v-if="!collapsedSections['account']" class="settings-content">

          <!-- Logged out -->
          <div v-if="!authStore.isLoggedIn" class="konto-login-block">
            <div class="konto-login-text">
              <p class="konto-login-title">Synka din budget</p>
              <p class="konto-login-sub">Skapa ett konto för att spara din data i molnet och komma åt den från flera enheter. Använd exportera/importera knapparna nedan för att kunna spara data utan konto.</p>
            </div>
            <button class="konto-primary-btn" @click="openAuthModal">Logga in / Skapa konto</button>
          </div>

          <!-- Logged in -->
          <template v-else>
            <div class="konto-row">
              <span class="konto-email">{{ authStore.user.email }}</span>
              <button class="konto-signout-btn" @click="signOut">Logga ut</button>
            </div>
            <div class="konto-sync-row">
              <div class="konto-sync-status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" class="konto-sync-check"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="konto-sync-main">{{ authStore.lastSynced ? `Synkad ${authStore.lastSynced}` : 'Synkad med molnet' }}</span>
              </div>
              <span class="konto-sync-sub">Uppdateras automatiskt vid varje ändring</span>
            </div>
          </template>

          <!-- Data buttons — always visible -->
          <div class="konto-data-row">
            <button class="data-chip" @click="exportData">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportera
            </button>
            <button class="data-chip" @click="triggerImport">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Importera
            </button>
            <button class="data-chip data-chip--muted" @click="loadTestData">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
              Testdata
            </button>
            <input ref="importFileRef" type="file" accept=".json" @change="importFile" style="display:none">
          </div>
          <p v-if="statusMsg" class="konto-status-msg">{{ statusMsg }}</p>

          <!-- Radera sub-section -->
          <div class="radera-toggle" @click="deleteExpanded = !deleteExpanded">
            <span class="radera-toggle-label">Radera</span>
            <svg class="chevron-sm" :class="{ 'chevron-sm--open': deleteExpanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <CollapseTransition>
            <div v-if="deleteExpanded" class="radera-content">

              <!-- Radera lokal data -->
              <div class="radera-row">
                <div class="radera-row-text">
                  <p class="radera-row-title">Lokal data</p>
                  <p class="radera-row-sub">{{ hasLocalData ? (localDataDate ? `Senast ändrad ${localDataDate}` : 'Sparad lokalt') : 'Ingen lokal data' }}</p>
                </div>
                <button class="radera-btn" :disabled="!hasLocalData" @click="doDeleteLocal">Radera</button>
              </div>

              <!-- Radera molndata + konto (only if logged in) -->
              <template v-if="authStore.isLoggedIn">
                <div class="radera-row radera-row--sep">
                  <div class="radera-row-text">
                    <p class="radera-row-title">Molndata</p>
                    <p class="radera-row-sub">{{ localDataDate ? `Senast synkad ${localDataDate}` : 'Data i ditt konto' }}</p>
                  </div>
                  <button class="radera-btn" @click="doDeleteCloud">Radera</button>
                </div>
                <div class="radera-row radera-row--sep">
                  <div class="radera-row-text">
                    <p class="radera-row-title">Konto</p>
                    <p class="radera-row-sub">{{ authStore.user.email }}</p>
                  </div>
                  <button class="radera-btn" @click="doDeleteAccount">Radera</button>
                </div>
              </template>

            </div>
          </CollapseTransition>

        </div></CollapseTransition>
      </div>

      <div class="settings-footer">
        <a href="about.html" target="_blank" rel="noopener noreferrer">Om MurvBudget   <br>
        © Jonathan Belloni 2026</a>
      
      </div>

      <div class="settings-footer">
        <span> </span>
      </div>

      <!-- <button class="support-btn" @click="swish">
        <svg viewBox="0 0 24 24" fill="currentColor" class="support-icon">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>Support this project</span>
      </button> -->
    </div>
  </div>

  <AuthModal ref="authModalRef" />
</template>

<script setup>
import { ref, reactive, computed, inject, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useAuthStore } from '../stores/auth'
import SwipeToDelete from '../components/SwipeToDelete.vue'
import CollapseTransition from '../components/CollapseTransition.vue'
import AuthModal from '../components/AuthModal.vue'

const store = useBudgetStore()
const authStore = useAuthStore()
const confirm = inject('confirm')

const COLLAPSED_KEY = 'murvbudget-settings-collapsed'
const SECTIONS = ['overview', 'income', 'expenses', 'categories', 'debts', 'salary', 'account']

const authModalRef = ref(null)
const deleteExpanded = ref(false)
const localDataTs = inject('localDataTs')

const hasLocalData = computed(() =>
  store.income.length > 0 || store.expenses.length > 0 ||
  store.categories.length > 0 || store.debts.length > 0 ||
  store.variableExpenses.length > 0
)

const localDataDate = computed(() => {
  if (!localDataTs.value) return null
  return new Date(localDataTs.value).toLocaleDateString('sv-SE')
})

async function openAuthModal() {
  await authModalRef.value?.show()
}

async function signOut() {
  const ok = await confirm(
    'Logga ut?',
    { label: 'Logga ut', style: 'destructive', description: 'Du loggas ut. Lokal data återgår till läget innan inloggning.' }
  )
  if (!ok) return

  authStore.signOut()

  const preLogin = localStorage.getItem('budgetApp-pre-login')
  if (preLogin !== null) {
    store.$reset()
    if (preLogin) {
      try { store.$patch(JSON.parse(preLogin)) } catch {}
    }
    localStorage.removeItem('budgetApp-pre-login')
  }
}

async function doDeleteLocal() {
  const ok = await confirm(
    'Radera lokal data?',
    { label: 'Radera lokal data', style: 'destructive', description: 'All lokal data på den här enheten raderas permanent. Molndata påverkas inte.' }
  )
  if (!ok) return
  store.clearLocalData()
  statusMsg.value = 'Lokal data raderad.'
  setTimeout(() => { statusMsg.value = '' }, 3000)
}

async function doDeleteCloud() {
  const ok = await confirm(
    'Radera molndata?',
    { label: 'Radera molndata', style: 'destructive', description: 'All molndata på ditt konto raderas permanent. Lokal data på den här enheten påverkas inte.' }
  )
  if (!ok) return
  const success = await authStore.deleteCloudData()
  if (success) {
    statusMsg.value = 'Molndata raderad.'
    setTimeout(() => { statusMsg.value = '' }, 3000)
  }
}

async function doDeleteAccount() {
  const ok = await confirm(
    'Radera konto?',
    { label: 'Radera konto', style: 'destructive', description: 'Ditt konto och all molndata raderas permanent. Lokal data på enheten behålls. Åtgärden kan inte ångras.' }
  )
  if (!ok) return
  await authStore.deleteAccount()
}

const WIDGET_LABELS = {
  summary:    'Sammanfattning',
  chart:      'Diagram',
  debts:      'Skulder',
  checklist:  'Checklista',
  savings:    'Sparkvot',
  categories: 'Kategorier',
}

const WIDGETS_WITH_SETTINGS = ['summary', 'chart']

// Collapsible sub-settings state (all start closed)
const expandedWidgets = reactive({})

const allCollapsed = computed(() =>
  Object.values(expandedWidgets).every(v => !v)
)

function toggleWidgetSettings(id) {
  if (!WIDGETS_WITH_SETTINGS.includes(id)) return
  expandedWidgets[id] = !expandedWidgets[id]
}

function toggleWidgetVisible(idx, value) {
  const order = store.overviewSettings.widgetOrder.map((w, i) =>
    i === idx ? { ...w, visible: value } : w
  )
  store.setOverviewSetting('widgetOrder', order)
}

// Drag-to-reorder
const dragIdx = ref(null)

function startDrag(idx, event) {
  if (!allCollapsed.value) return
  event.preventDefault()
  dragIdx.value = idx
  document.addEventListener('pointermove', onDragMove, { passive: false })
  document.addEventListener('pointerup', onDragEnd)
  document.addEventListener('pointercancel', onDragEnd)
}

function onDragMove(event) {
  if (dragIdx.value === null) return
  event.preventDefault()
  const y = event.clientY
  const rows = document.querySelectorAll('.widget-order-row')
  let newIdx = rows.length - 1
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i].getBoundingClientRect()
    if (y < rect.top + rect.height / 2) {
      newIdx = i
      break
    }
  }
  if (newIdx !== dragIdx.value) {
    const order = [...store.overviewSettings.widgetOrder]
    const [item] = order.splice(dragIdx.value, 1)
    order.splice(newIdx, 0, item)
    store.setOverviewSetting('widgetOrder', order)
    dragIdx.value = newIdx
  }
}

function onDragEnd() {
  dragIdx.value = null
  document.removeEventListener('pointermove', onDragMove)
  document.removeEventListener('pointerup', onDragEnd)
  document.removeEventListener('pointercancel', onDragEnd)
}

// Category drag-to-reorder
const catListRef = ref(null)
const catDragIdx = ref(null)

function startCatDrag(idx, event) {
  if (editingCategory.value !== null) return
  event.preventDefault()
  catDragIdx.value = idx
  document.addEventListener('pointermove', onCatDragMove, { passive: false })
  document.addEventListener('pointerup', onCatDragEnd)
  document.addEventListener('pointercancel', onCatDragEnd)
}

function onCatDragMove(event) {
  if (catDragIdx.value === null) return
  event.preventDefault()
  const y = event.clientY
  const rows = catListRef.value?.querySelectorAll('.cat-order-row')
  if (!rows || rows.length === 0) { catDragIdx.value = null; return }
  let newIdx = rows.length - 1
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i].getBoundingClientRect()
    if (y < rect.top + rect.height / 2) { newIdx = i; break }
  }
  if (newIdx !== catDragIdx.value) {
    const cats = [...store.categories]
    const [item] = cats.splice(catDragIdx.value, 1)
    cats.splice(newIdx, 0, item)
    store.reorderCategories(cats)
    catDragIdx.value = newIdx
  }
}

function onCatDragEnd() {
  catDragIdx.value = null
  document.removeEventListener('pointermove', onCatDragMove)
  document.removeEventListener('pointerup', onCatDragEnd)
  document.removeEventListener('pointercancel', onCatDragEnd)
}

const chartTypeOptions = [
  { value: 'pie', label: 'Tårta' },
  { value: 'doughnut', label: 'Munk' },
  { value: 'bar', label: 'Stapel' },
  { value: 'stackedBar', label: 'Staplad' },
]

const summaryStyleOptions = [
  { value: 'compact',  label: 'Kompakt' },
  { value: 'medium',   label: 'Medium' },
  { value: 'default',  label: 'Standard' },
  { value: 'large',    label: 'Stor' },
]

const GRADIENTS = {
  'blue':        'linear-gradient(135deg, #007AFF, #007AFF)',
  'blue-purple': 'linear-gradient(135deg, #007AFF, #AF52DE)',
  'orange-pink': 'linear-gradient(135deg, #FF9500, #FF2D92)',
  'green-teal':  'linear-gradient(135deg, #34C759, #5AC8FA)',
  'red-orange':  'linear-gradient(135deg, #FF3B30, #FF9500)',
  'indigo-blue': 'linear-gradient(135deg, #5856D6, #007AFF)',
  'pink-red':    'linear-gradient(135deg, #FF2D92, #FF3B30)',
  'neutral':     'linear-gradient(135deg, #D1D1D6, #D1D1D6)',
}

const colorPresets = [
  { value: 'colorful', label: 'Färgglad', colors: ['blue-purple', 'orange-pink', 'green-teal'] },
  { value: 'blue',     label: 'Blue',     colors: ['blue', 'blue', 'blue'] },
  { value: 'neutral',  label: 'Neutral',  colors: ['neutral', 'neutral', 'neutral'] },
]

const activePreset = computed(() => {
  const current = JSON.stringify(store.overviewSettings.cardColors || [])
  return colorPresets.find((p) => JSON.stringify(p.colors) === current)?.value ?? null
})

function setPreset(value) {
  const preset = colorPresets.find((p) => p.value === value)
  if (preset) store.setOverviewSetting('cardColors', [...preset.colors])
}

function loadCollapsed() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '{}')
    const state = {}
    for (const s of SECTIONS) state[s] = saved[s] !== false
    return state
  } catch {
    return Object.fromEntries(SECTIONS.map((s) => [s, true]))
  }
}

const collapsedSections = reactive(loadCollapsed())

watch(() => collapsedSections['overview'], (collapsed) => {
  if (collapsed) {
    for (const id of WIDGETS_WITH_SETTINGS) expandedWidgets[id] = false
  }
})

function toggleSection(key) {
  collapsedSections[key] = !collapsedSections[key]
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedSections }))
  } catch {}
}

function toggleAllSections() {
  const anyOpen = SECTIONS.some(s => !collapsedSections[s])
  for (const s of SECTIONS) collapsedSections[s] = anyOpen
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify({ ...collapsedSections }))
  } catch {}
}

defineExpose({ toggleAllSections })

// New item form state
const newCategoryName = ref('')
const newExpenseName = ref('')
const newExpenseAmount = ref(null)
const newExpenseCategory = ref('')
const newExpenseDate = ref(null)
const newIncomeName = ref('')
const newIncomeAmount = ref(null)
const newDebtName = ref('')
const newDebtAmount = ref(null)
const importFileRef = ref(null)
const statusMsg = ref('')
const addFeedback = reactive({})
function showAddFeedback(key) {
  addFeedback[key] = true
  setTimeout(() => { addFeedback[key] = false }, 2000)
}

// Income editing state
const editingIncome = ref(null)
const editIncomeForm = reactive({ name: '', amount: null })

function toggleEditIncome(idx) {
  if (editingIncome.value === idx) { editingIncome.value = null; return }
  editingIncome.value = idx
  editIncomeForm.name = store.income[idx].name
  editIncomeForm.amount = store.income[idx].amount
}

async function saveIncomeEdit(idx) {
  if (!editIncomeForm.name || !editIncomeForm.amount || editIncomeForm.amount <= 0) {
    await confirm('Ogiltigt värde', { label: 'OK', style: 'primary', description: 'Vänligen fyll i giltigt namn och belopp.' })
    return
  }
  store.saveEditIncome(idx, editIncomeForm.name, editIncomeForm.amount)
  editingIncome.value = null
}

async function deleteIncomeFromEdit(idx) {
  const ok = await confirm('Ta bort inkomsten?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) {
    store.deleteIncome(idx)
    editingIncome.value = null
  }
}

// Category editing state
const editingCategory = ref(null)
const editCategoryName = ref('')

function toggleEditCategory(idx) {
  if (editingCategory.value === idx) { editingCategory.value = null; return }
  editingCategory.value = idx
  editCategoryName.value = store.categories[idx]
}

async function saveCategoryEdit(idx) {
  const name = editCategoryName.value.trim()
  if (!name) return
  if (name === 'Skulder') { await confirm('Reserverat namn', { label: 'OK', style: 'primary', description: "'Skulder' är reserverat och kan inte användas." }); return }
  store.saveEditCategory(idx, name)
  editingCategory.value = null
}

async function deleteCategorySwipe(idx) {
  const ok = await confirm('Ta bort kategorin?', { description: 'Utgifter i den här kategorin blir utan kategori.' })
  if (ok) {
    store.deleteCategory(idx)
    if (editingCategory.value === idx) editingCategory.value = null
  }
}

async function deleteCategoryFromEdit(idx) {
  const ok = await confirm('Ta bort kategorin?', { description: 'Utgifter i den här kategorin blir utan kategori.' })
  if (ok) {
    store.deleteCategory(idx)
    editingCategory.value = null
  }
}

// Expense editing state
const editingExpense = ref(null)
const editForm = reactive({ name: '', amount: null, category: '', date: null })

function expensesByCategory(cat) {
  return store.expenses
    .map((e, i) => ({ ...e, globalIndex: i }))
    .filter((e) => e.category === cat)
    .sort((a, b) => b.amount - a.amount)
}

const uncategorizedExpenses = computed(() =>
  store.expenses
    .map((e, i) => ({ ...e, globalIndex: i }))
    .filter((e) => !e.category || !store.categories.includes(e.category))
    .sort((a, b) => b.amount - a.amount)
)

function toggleEditExpense(globalIndex) {
  if (editingExpense.value === globalIndex) {
    editingExpense.value = null
    return
  }
  editingExpense.value = globalIndex
  const e = store.expenses[globalIndex]
  editForm.name = e.name
  editForm.amount = e.amount
  editForm.category = e.category
  editForm.date = e.date || null
}

async function saveExpenseEdit(globalIndex) {
  if (!editForm.name || !editForm.amount || editForm.amount <= 0) {
    await confirm('Ogiltigt värde', { label: 'OK', style: 'primary', description: 'Vänligen fyll i giltigt namn och belopp.' })
    return
  }
  store.saveEditExpense(globalIndex, editForm.name, editForm.amount, editForm.category, editForm.date)
  editingExpense.value = null
}

async function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  if (name === 'Skulder') { await confirm('Reserverat namn', { label: 'OK', style: 'primary', description: "'Skulder' är reserverat och kan inte läggas till." }); return }
  store.addCategory(name)
  newCategoryName.value = ''
  showAddFeedback('category')
}


function addExpense() {
  const name = newExpenseName.value.trim()
  const amount = newExpenseAmount.value
  if (!name || !amount || amount <= 0) return
  store.addExpense(name, amount, newExpenseCategory.value || null, newExpenseDate.value)
  newExpenseName.value = ''
  newExpenseAmount.value = null
  newExpenseDate.value = null
  showAddFeedback('expense')
}

async function deleteExpense(idx) {
  const ok = await confirm('Ta bort utgiften?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) store.deleteExpense(idx)
}

async function deleteExpenseFromEdit(globalIndex) {
  const ok = await confirm('Ta bort utgiften?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) {
    store.deleteExpense(globalIndex)
    editingExpense.value = null
  }
}

function addIncome() {
  const name = newIncomeName.value.trim()
  const amount = newIncomeAmount.value
  if (!name || !amount || amount <= 0) return
  store.addIncome(name, amount)
  newIncomeName.value = ''
  newIncomeAmount.value = null
  showAddFeedback('income')
}

async function deleteIncome(idx) {
  const ok = await confirm('Ta bort inkomsten?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) store.deleteIncome(idx)
}

function addDebt() {
  const name = newDebtName.value.trim()
  const amount = newDebtAmount.value
  if (!name || !amount || amount <= 0) return
  store.addDebt(name, amount)
  newDebtName.value = ''
  newDebtAmount.value = null
  showAddFeedback('debt')
}

async function deleteDebt(idx) {
  const ok = await confirm('Ta bort skulden?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) store.deleteDebt(idx)
}

async function deleteDebtFromEdit(idx) {
  const ok = await confirm('Ta bort skulden?', { description: 'Åtgärden kan inte ångras.' })
  if (ok) {
    store.deleteDebt(idx)
    editingDebt.value = null
  }
}

const editingDebt = ref(null)
const editDebtAmount = ref(null)

function toggleEditDebt(idx) {
  if (editingDebt.value === idx) { editingDebt.value = null; return }
  editingDebt.value = idx
  editDebtAmount.value = store.debts[idx].amount
}

function saveDebtEdit(idx) {
  if (!editDebtAmount.value || editDebtAmount.value <= 0) return
  store.saveEditDebt(idx, editDebtAmount.value)
  editingDebt.value = null
}

async function exportData() {
  const ok = await confirm(
    'Exportera data?',
    { label: 'Exportera', style: 'primary', description: 'Filen sparas på din enhet som en JSON-fil. Importera den igen med Importera-knappen om du byter enhet eller vill återställa din data.' }
  )
  if (!ok) return
  store.exportData()
  statusMsg.value = 'Data exporterad!'
  setTimeout(() => { statusMsg.value = '' }, 3000)
}

async function triggerImport() {
  const ok = await confirm(
    'Importera data?',
    { label: 'Välj fil', style: 'primary', description: 'Välj en tidigare exporterad MurvBudget-fil (.json). All nuvarande data på den här enheten ersätts med innehållet i filen.' }
  )
  if (ok) importFileRef.value?.click()
}

function importFile(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const required = ['income', 'expenses', 'categories']
      const missing = required.filter(k => !Array.isArray(data[k]))
      if (missing.length) {
        await confirm('Ogiltig fil', { label: 'OK', style: 'primary', description: `Filen saknar obligatoriska fält: ${missing.join(', ')}. Kontrollera att det är en giltig MurvBudget-fil.` })
        event.target.value = ''
        return
      }
      const incomeInvalid = data.income.some(i => typeof i.name !== 'string' || typeof i.amount !== 'number')
      const expensesInvalid = data.expenses.some(ex => typeof ex.name !== 'string' || typeof ex.amount !== 'number' || typeof ex.category !== 'string')
      const categoriesInvalid = data.categories.some(c => typeof c !== 'string')
      if (incomeInvalid || expensesInvalid || categoriesInvalid) {
        await confirm('Ogiltig fil', { label: 'OK', style: 'primary', description: 'Filen innehåller ogiltiga poster. Kontrollera att det är en giltig MurvBudget-fil.' })
        event.target.value = ''
        return
      }
      const ok = await confirm('Ersätt all data?', { description: 'All nuvarande data på den här enheten ersätts med innehållet i filen.' })
      if (ok) {
        store.importData(data)
        statusMsg.value = 'Data importerad!'
        setTimeout(() => { statusMsg.value = '' }, 3000)
      }
    } catch {
      await confirm('Fel vid import', { label: 'OK', style: 'primary', description: 'Kunde inte läsa filen. Kontrollera att det är korrekt JSON.' })
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

async function loadTestData() {
  const ok = await confirm('Ladda testdata?', { description: 'All nuvarande data ersätts med exempeldata.' })
  if (!ok) return
  const result = await store.loadTestData()
  if (result) {
    statusMsg.value = 'Testdata laddad!'
    setTimeout(() => { statusMsg.value = '' }, 3000)
  } else {
    await confirm('Kunde inte ladda testdata.', { label: 'OK', style: 'primary' })
  }
}


function fmt(n) {
  return (n || 0).toLocaleString('sv-SE')
}
</script>

<style scoped>
/* Pull the settings view up to cancel the body's nav-bar padding (no AppHeader here) */
.settings-view-root {
  margin-top: -60px;
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--separator);
}

/* Override the global .settings-section h3 border since section-toggle now owns it */
.section-toggle h3 {
  border-bottom: none;
  flex: 1;
}

.chevron {
  width: 18px;
  height: 18px;
  margin-right: 20px;
  color: var(--system-blue);
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

/* Overview toggle rows */
.overview-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--separator);
}

.overview-toggle-row.no-separator {
  border-bottom: none;
}

.chart-type-section--last {
  border-bottom: 0.5px solid var(--separator);
}

.overview-toggle-label {
  font-size: 16px;
  color: var(--text-primary);
}

/* Widget order rows */
.widget-order-row {
  border-bottom: 0.5px solid var(--separator);
  transition: background 0.15s;
}

.widget-order-row.widget-dragging {
  background: rgba(120, 120, 128, 0.1);
  border-radius: 10px;
  border-bottom-color: transparent;
}

.widget-order-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
}

/* Drag handle */
.widget-drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--text-tertiary);
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  opacity: 1;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.widget-drag-handle.handle-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.6);
}

.widget-drag-handle:active {
  cursor: grabbing;
}

.widget-drag-handle svg {
  width: 10px;
  height: 16px;
}

/* Expandable label area */
.widget-order-expandable {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.widget-order-expandable.has-settings {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.widget-order-label {
  font-size: 16px;
  color: var(--text-primary);
}

/* Per-widget expand chevron */
.widget-chevron {
  width: 16px;
  height: 16px;
  color: var(--system-blue);
  flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.widget-chevron.expanded {
  transform: rotate(180deg);
}

/* Sub-settings panel */
.widget-sub-settings {
  border-top: 0.5px solid var(--separator);
}

/* iOS 26 toggle — wider, flatter, near-transparent off-state with border */
.ios-toggle {
  position: relative;
  width: 65px;
  height: 27px;
  flex-shrink: 0;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(120, 120, 128, 0.1);
  border: 1px solid rgba(120, 120, 128, 0.3);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              border-color 0.25s;
  outline: none;
}

.ios-toggle:checked {
  background: var(--system-green);
  border-color: transparent;
}

.ios-toggle::after {
  content: '';
  position: absolute;
  width: 36px;
  height: 23px;
  background: #ffffff;
  border-radius: 999px;
  top: 1px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22), 0 0.5px 2px rgba(0, 0, 0, 0.12);
}

.ios-toggle:checked::after {
  transform: translateX(24px);
}

@media (prefers-color-scheme: dark) {
  .ios-toggle {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
  }
}

/* Preset buttons (color theme + chart type share segment-btn, preset-btn adds column layout) */
.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  min-height: unset;
  white-space: nowrap;
}

.preset-dots {
  display: flex;
  gap: 4px;
}

.preset-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: block;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Chart type pill chips */
.chart-type-section {
  padding: 14px 16px 16px;
}

.chart-type-label {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.chart-type-segment {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}

.segment-btn {
  flex: 1;
  padding: 10px 8px;
  border: 1.5px solid var(--separator);
  background: transparent;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.segment-btn.active {
  background: var(--system-blue);
  border-color: var(--system-blue);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.4);
}

@media (prefers-color-scheme: dark) {
  .segment-btn {
    border-color: rgba(255, 255, 255, 0.14);
    color: var(--text-secondary);
  }

  .segment-btn.active {
    box-shadow: 0 2px 10px rgba(0, 122, 255, 0.55);
  }
}

/* Labeled field layout for add-expense form */
.input-group--labeled {
  align-items: flex-end;
  flex-wrap: nowrap;
}

.field-with-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.field-with-label--narrow {
  flex: 0 0 84px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding-left: 7px;
}

.no-categories-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 16px;
  padding: 12px 14px;
  background: rgba(255, 149, 0, 0.1);
  border-radius: 10px;
  color: var(--system-orange);
  font-size: 14px;
  line-height: 1.4;
}

.no-categories-notice svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.add-expense-bottom-btn {
  align-self: flex-end;
}

.btn-added {
  background: var(--system-green) !important;
  pointer-events: none;
}

/* Support button */
.support-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 32px);
  margin: 8px 22px 32px;
  padding: 12px 22px;
  background: rgba(255, 45, 85, 0.1);
  border: none;
  border-radius: 999px;
  color: #FF2D55;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.support-btn:active {
  opacity: 0.6;
}

.support-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .support-btn {
    background: rgba(255, 45, 85, 0.15);
  }
}

/* Konto section */
.konto-login-block {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.konto-login-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
}

.konto-login-sub {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
}

.konto-primary-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: var(--system-blue);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.konto-primary-btn:active { opacity: 0.7; }

.konto-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.konto-email {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.konto-signout-btn {
  flex-shrink: 0;
  padding: 6px 13px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.1);
  color: var(--system-red);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.konto-signout-btn:active { opacity: 0.6; }

.konto-sync-row {
  padding: 10px 16px 12px;
  border-top: 0.5px solid var(--separator);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.konto-sync-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.konto-sync-check {
  color: var(--system-green);
  flex-shrink: 0;
}

.konto-sync-main {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.konto-sync-sub {
  font-size: 12px;
  color: var(--text-tertiary);
  padding-left: 19px;
}

/* Data chip buttons */
.konto-data-row {
  display: flex;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 0.5px solid var(--separator);
  flex-wrap: wrap;
}

.data-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border: 1px solid var(--separator);
  border-radius: 999px;
  background: transparent;
  color: var(--system-blue);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.data-chip:active { opacity: 0.55; }

.data-chip--muted {
  color: var(--text-secondary);
}

.konto-status-msg {
  font-size: 13px;
  color: var(--system-green);
  padding: 0 16px 12px;
  margin: 0;
}

/* Radera sub-section */
.radera-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-top: 0.5px solid var(--separator);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.radera-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--system-red);
}

.chevron-sm {
  width: 15px;
  height: 15px;
  color: var(--system-red);
  opacity: 0.7;
  transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: rotate(-90deg);
}

.chevron-sm--open {
  transform: rotate(0deg);
}

.radera-content {
  border-top: 0.5px solid var(--separator);
}

.radera-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  gap: 12px;
}

.radera-row--sep {
  border-top: 0.5px solid var(--separator);
}

.radera-row-text {
  flex: 1;
  min-width: 0;
}

.radera-row-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.radera-row-sub {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.radera-btn {
  flex-shrink: 0;
  padding: 6px 13px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.1);
  color: var(--system-red);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s;
}

.radera-btn:active { opacity: 0.6; }
.radera-btn:disabled { opacity: 0.3; pointer-events: none; }

/* ── Lönedag section ──────────────────────────────────────── */
.salary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  gap: 16px;
}

.salary-row--sep {
  border-top: 0.5px solid var(--separator);
}

.salary-row-text {
  flex: 1;
  min-width: 0;
}

.salary-row-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.salary-row-sub {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.4;
}

.salary-day-input {
  flex-shrink: 0;
  width: 52px;
  padding: 7px 10px;
  border: none;
  border-radius: 10px;
  background: var(--system-gray5, rgba(120,120,128,0.18));
  color: var(--text-primary);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.salary-day-input::-webkit-inner-spin-button,
.salary-day-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

/* Category drag-to-reorder rows */
.cat-order-row {
  transition: background 0.15s;
}
.cat-order-row.widget-dragging {
  border-radius: 10px;
}
.cat-order-row.widget-dragging :deep(.swipe-row) {
  background: rgba(120, 120, 128, 0.1);
  border-bottom-color: transparent;
}
.cat-order-row :deep(.swipe-row) {
  padding: 10px 16px;
}
.cat-row-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
