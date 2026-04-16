<template>
  <div class="wizard-view">
    <!-- "installationsguide" subtitle sits right below the App's page-large-title "Budget" -->
    <p class="wizard-subtitle">Installationsguide</p>

    <!-- Step viewport -->
    <div class="step-viewport">
      <Transition :name="slideDirection">

        <!-- ── Step 1: Inkomst ─────────────────────────────────────────── -->
        <div v-if="step === 1" key="step1" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Vad tjänar du per månad?</h2>
                <p class="step-sub">Lägg till dina inkomstkällor. Du kan alltid ändra detta senare i inställningar.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="incomeNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Lön)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--amount">
                  <input v-model="incomeAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Belopp (kr)" min="0" @keyup.enter="addIncomeItem" />
                  <button class="add-btn" @click="addIncomeItem" :disabled="!incomeAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="addedIncomes.length" class="added-list">
                <div v-for="(item, i) in addedIncomes" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--green">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                  </div>
                  <span class="added-row-name">{{ item.name }}</span>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn delete-btn--trash" @click="removeIncomeItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ── Step 2: Kategorier ──────────────────────────────────────── -->
        <div v-else-if="step === 2" key="step2" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Välj utgiftskategorier</h2>
                <p class="step-sub">Välj de kategorier som passar din ekonomi. Du kan alltid ändra dessa senare i inställningar. Det går även bra att inte ha några kategorier. </p>
              </div>

              <div class="chip-grid">
                <button
                  v-for="cat in presetCategories"
                  :key="cat.name"
                  class="chip"
                  :class="{ 'chip--selected': selectedCategories.includes(cat.name) }"
                  @click="toggleCategory(cat.name)"
                >
                  <span class="chip-emoji">{{ cat.emoji }}</span>
                  {{ cat.name }}
                  <svg v-if="selectedCategories.includes(cat.name)" class="chip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="13" height="13">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>

              <div class="input-card">
                <div class="input-row input-row--amount">
                  <input v-model="customCatInput" class="text-input" type="text" placeholder="Lägg till egen kategori…" maxlength="40" @keyup.enter="addCustomCategory" />
                  <button class="add-btn" @click="addCustomCategory" :disabled="!customCatInput.trim()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="customCategories.length" class="added-list">
                <div v-for="(cat, i) in customCategories" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--purple">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                    </svg>
                  </div>
                  <span class="added-row-name">{{ cat }}</span>
                  <button class="delete-btn delete-btn--trash" @click="removeCustomCategory(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ── Step 3: Fasta utgifter ──────────────────────────────────── -->
        <div v-else-if="step === 3" key="step3" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Fasta utgifter</h2>
                <p class="step-sub">Hyra, el, prenumerationer… Lägg till det som återkommer varje månad. Du kan alltid ändra detta senare i inställningar.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="expenseNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Hyra)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="expenseAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Belopp (kr)" min="0" />
                </div>
                <div v-if="allCategoriesForStep.length" class="input-divider"></div>
                <div v-if="allCategoriesForStep.length" class="input-row">
                  <select v-model="expenseCategoryInput" class="text-input select-input">
                    <option value="">Välj kategori (valfritt)</option>
                    <option v-for="cat in allCategoriesForStep" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--labeled">
                  <span class="input-label">Betaldag (valfritt)</span>
                  <input v-model="expenseDateInput" class="text-input text-input--right" type="number" inputmode="numeric" placeholder="1–31" min="1" max="31" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--centered">
                  <button class="add-btn add-btn--wide" @click="addExpenseItem" :disabled="!expenseNameInput || !expenseAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till
                  </button>
                </div>
              </div>

              <div v-if="addedExpenses.length" class="added-list">
                <div v-for="(item, i) in addedExpenses" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--orange">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div class="added-row-body">
                    <span class="added-row-name">{{ item.name }}</span>
                    <span v-if="item.category" class="added-row-cat">{{ item.category }}</span>
                  </div>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn delete-btn--trash" @click="removeExpenseItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 4: Flex-utgifter ──────────────────────────────────── -->
        <div v-else-if="step === 4" key="step4" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Flex-utgifter</h2>
                <p class="step-sub">Rörliga kostnader som mat och nöje. Lägg till vad du tror att du brukar spendera. Du kan alltid ändra detta senare i inställningar.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="flexNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Mat)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--amount">
                  <input v-model="flexAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Belopp (kr)" min="0" @keyup.enter="addFlexItem" />
                  <button class="add-btn" @click="addFlexItem" :disabled="!flexAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="addedFlexItems.length" class="added-list">
                <div v-for="(item, i) in addedFlexItems" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--teal">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                    </svg>
                  </div>
                  <span class="added-row-name">{{ item.name }}</span>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn delete-btn--trash" @click="removeFlexItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 5: Sparande ──────────────────────────────────────── -->
        <div v-else-if="step === 5" key="step5" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Sparande</h2>
                <p class="step-sub">Lägg till dina sparmål. Ange namn, målbelopp och eventuellt ett måldatum. Du kan alltid ändra detta senare.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="savingsNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Semester)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="savingsTargetInput" class="text-input" type="number" inputmode="numeric" placeholder="Sparmål (kr)" min="0" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="savingsMonthlyInput" class="text-input" type="number" inputmode="numeric" placeholder="Månadsinsättning (valfritt)" min="0" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--labeled">
                  <span class="input-label">Dag för insättning (valfritt)</span>
                  <input v-model="savingsDayInput" class="text-input text-input--right" type="number" inputmode="numeric" placeholder="1–31" min="1" max="31" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--centered">
                  <button class="add-btn add-btn--wide" @click="addSavingsItem" :disabled="!savingsNameInput || !savingsTargetInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till
                  </button>
                </div>
              </div>

              <div v-if="addedSavings.length" class="added-list">
                <div v-for="(item, i) in addedSavings" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--indigo">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                    </svg>
                  </div>
                  <div class="added-row-body">
                    <span class="added-row-name">{{ item.name }}</span>
                    <span v-if="item.monthly" class="added-row-cat">{{ item.monthly.toLocaleString('sv-SE') }} kr/mån</span>
                  </div>
                  <span class="added-row-amount">{{ item.target.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn delete-btn--trash" @click="removeSavingsItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 6: Skulder ───────────────────────────────────────── -->
        <div v-else-if="step === 6" key="step6" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Skulder & Lån</h2>
                <p class="step-sub">Lägg till dina lån och skulder. Ange namn, totalt belopp och eventuellt en månadsbetalning. Du kan alltid ändra detta senare.</p>
              </div>

              <div class="input-card">
                <div class="input-row">
                  <input v-model="debtNameInput" class="text-input" type="text" placeholder="Namn (t.ex. Billån)" maxlength="40" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="debtAmountInput" class="text-input" type="number" inputmode="numeric" placeholder="Totalt belopp (kr)" min="0" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row">
                  <input v-model="debtMonthlyInput" class="text-input" type="number" inputmode="numeric" placeholder="Månadsbetalning (valfritt)" min="0" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--labeled">
                  <span class="input-label">Dag för betalning (valfritt)</span>
                  <input v-model="debtDayInput" class="text-input text-input--right" type="number" inputmode="numeric" placeholder="1–31" min="1" max="31" />
                </div>
                <div class="input-divider"></div>
                <div class="input-row input-row--centered">
                  <button class="add-btn add-btn--wide" @click="addDebtItem" :disabled="!debtNameInput || !debtAmountInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lägg till
                  </button>
                </div>
              </div>

              <div v-if="addedDebts.length" class="added-list">
                <div v-for="(item, i) in addedDebts" :key="i" class="added-row">
                  <div class="added-row-icon added-row-icon--red">
                    <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div class="added-row-body">
                    <span class="added-row-name">{{ item.name }}</span>
                    <span v-if="item.monthlyPayment" class="added-row-cat">{{ item.monthlyPayment.toLocaleString('sv-SE') }} kr/mån</span>
                  </div>
                  <span class="added-row-amount">{{ item.amount.toLocaleString('sv-SE') }} kr</span>
                  <button class="delete-btn delete-btn--trash" @click="removeDebtItem(i)" aria-label="Ta bort">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 7: Utseende ───────────────────────────────────────── -->
        <div v-else-if="step === 7" key="step7" class="step-panel">
          <div class="step-scroll">
            <div class="step-content">
              <div class="step-header">
                <h2 class="step-title">Utseende</h2>
                <p class="step-sub">Välj hur menyn ska se ut.</p>
              </div>

              <div class="appearance-options">
                <div
                  class="appearance-card"
                  :class="{ 'appearance-card--selected': appearancePref === 'auto' }"
                  @click="appearancePref = 'auto'"
                >
                  <div class="appearance-card-body">
                    <p class="appearance-card-title">Automatisk</p>
                    <p class="appearance-card-desc">Menyn väljer stil baserat på var du öppnar appen.</p>
                  </div>
                  <div class="appearance-card-check">
                    <svg v-if="appearancePref === 'auto'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <div
                  class="appearance-card"
                  :class="{ 'appearance-card--selected': appearancePref === 'force-pwa' }"
                  @click="appearancePref = 'force-pwa'"
                >
                  <div class="appearance-card-body">
                    <p class="appearance-card-title">iOS-meny</p>
                    <p class="appearance-card-desc">Liquid glass-meny. Passar bäst som hemskärmsapp.</p>
                  </div>
                  <div class="appearance-card-check">
                    <svg v-if="appearancePref === 'force-pwa'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <div
                  class="appearance-card"
                  :class="{ 'appearance-card--selected': appearancePref === 'force-browser' }"
                  @click="appearancePref = 'force-browser'"
                >
                  <div class="appearance-card-body">
                    <p class="appearance-card-title">Webb</p>
                    <p class="appearance-card-desc">Rakare meny, passar bättre i en webbläsare, på mobilen och datorn.</p>
                  </div>
                  <div class="appearance-card-check">
                    <svg v-if="appearancePref === 'force-browser'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Nav preview -->
              <div class="nav-preview-wrap">
                <!-- iOS / PWA style -->
                <div v-if="appearancePref !== 'force-browser'" class="nav-preview nav-preview--ios">
                  <div class="nav-preview-ios-pill">
                    <div class="nav-preview-ios-tab nav-preview-ios-tab--active">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                      <span>Översikt</span>
                    </div>
                    <div class="nav-preview-ios-tab">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/></svg>
                      <span>Ekonomi</span>
                    </div>
                    <div class="nav-preview-ios-tab">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>
                      <span>Checklista</span>
                    </div>
                  </div>
                  <div class="nav-preview-ios-gear">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>

                <!-- Web style -->
                <div v-else class="nav-preview nav-preview--web">
                  <div class="nav-preview-web-tab nav-preview-web-tab--active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                    <span>Översikt</span>
                  </div>
                  <div class="nav-preview-web-tab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/></svg>
                    <span>Ekonomi</span>
                  </div>
                  <div class="nav-preview-web-tab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>
                    <span>Checklista</span>
                  </div>
                  <div class="nav-preview-web-tab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Inställningar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 8: Klart! ──────────────────────────────────────────── -->
        <div v-else-if="step === 8" key="step8" class="step-panel">
          <div class="step-scroll">
            <div class="step-content step-content--center">
              <div class="celebration-icon">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="url(#grad-green)"/>
                  <polyline points="18 33 27 42 46 23" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="grad-green" x1="0" y1="0" x2="64" y2="64">
                      <stop offset="0%" stop-color="#34C759"/>
                      <stop offset="100%" stop-color="#30b550"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 class="step-title step-title--large">Allt är klart!</h2>
              <p class="step-sub step-sub--center">Din budget är redo. Du kan alltid ändra allt under Inställningar.</p>

              <div class="summary-pills">
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedIncomes.length }}</span>
                  <span class="summary-pill-label">{{ addedIncomes.length === 1 ? 'inkomst' : 'inkomster' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ allSelectedCategoryCount }}</span>
                  <span class="summary-pill-label">{{ allSelectedCategoryCount === 1 ? 'kategori' : 'kategorier' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedExpenses.length }}</span>
                  <span class="summary-pill-label">{{ addedExpenses.length === 1 ? 'fast utgift' : 'fasta utgifter' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedFlexItems.length }}</span>
                  <span class="summary-pill-label">{{ addedFlexItems.length === 1 ? 'flex' : 'flex' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedSavings.length }}</span>
                  <span class="summary-pill-label">{{ addedSavings.length === 1 ? 'sparmål' : 'sparmål' }}</span>
                </div>
                <div class="summary-pill">
                  <span class="summary-pill-num">{{ addedDebts.length }}</span>
                  <span class="summary-pill-label">{{ addedDebts.length === 1 ? 'skuld' : 'skulder' }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </Transition>
    </div>

    <!-- ── Fixed bottom bar ────────────────────────────────────────────── -->
    <div class="wizard-bottom-bar">
      <!-- Action row: Nästa centered, Hoppa över absolute right -->
      <div class="bottom-action-row">
        <button v-if="step < 8" class="primary-btn primary-btn--sm" @click="handleNext">Nästa →</button>
        <button v-else class="primary-btn primary-btn--sm primary-btn--green" @click="finish">Kom igång!</button>
        <button v-if="step < 8" class="btn-skip btn-skip--abs" @click="skipStep">Hoppa över</button>
      </div>

      <!-- Row: back | progress | (placeholder) -->
      <div class="bottom-row">
        <button class="btn-back" :class="{ 'btn-back--disabled': step === 1 }" :disabled="step === 1" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Tillbaka
        </button>

        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
          <span class="progress-label">{{ step < 8 ? (8 - step) + ' steg kvar' : 'Klar!' }}</span>
        </div>

      </div>

      <!-- Row 2: close link -->
      <div class="bottom-close-row">
        <button class="btn-close-text" @click="closeWizard">Stäng installationsguiden</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useBudgetStore } from '../stores/budget'

const STORAGE_KEY = 'murvbudget-onboarding'
const DEFAULT_CATEGORIES = ['Boende', 'Mat & Livsmedel', 'Transport', 'Övrigt']

const emit = defineEmits(['navigate'])

const store = useBudgetStore()
const confirm = inject('confirm')
const completeWizard = inject('completeWizard', () => {})

// ── Navigation ───────────────────────────────────────────────────────────────
const step = ref(1)
const direction = ref('forward')

const slideDirection = computed(() =>
  direction.value === 'forward' ? 'slide-left' : 'slide-right'
)

const progressPct = computed(() => ((step.value - 1) / 7) * 100)

function goForward() {
  direction.value = 'forward'
  step.value++
}

async function handleNext() {
  if (step.value === 1 && incomeAmountInput.value) {
    const name = incomeNameInput.value.trim() || 'Lön'
    const amount = parseInt(incomeAmountInput.value)
    const add = await confirm(
      `Lägg till ${name} – ${amount.toLocaleString('sv-SE')} kr?`,
      {
        description: 'Du har ett belopp som inte lagts till ännu.',
        label: 'Lägg till',
        style: 'primary',
      }
    )
    if (add) addIncomeItem()
  }
  goForward()
}

function goBack() {
  direction.value = 'backward'
  step.value--
}

function skipStep() {
  if (step.value === 1) {
    addedIncomes.value = []
    incomeNameInput.value = 'Lön'
    incomeAmountInput.value = ''
  } else if (step.value === 2) {
    selectedCategories.value = []
    customCategories.value = []
    customCatInput.value = ''
  } else if (step.value === 3) {
    addedExpenses.value = []
    expenseNameInput.value = ''
    expenseAmountInput.value = ''
    expenseCategoryInput.value = ''
    expenseDateInput.value = ''
  } else if (step.value === 4) {
    addedFlexItems.value = []
    flexNameInput.value = ''
    flexAmountInput.value = ''
  } else if (step.value === 5) {
    addedSavings.value = []
    savingsNameInput.value = ''
    savingsTargetInput.value = ''
    savingsMonthlyInput.value = ''
    savingsDayInput.value = ''
  } else if (step.value === 6) {
    addedDebts.value = []
    debtNameInput.value = ''
    debtAmountInput.value = ''
    debtMonthlyInput.value = ''
    debtDayInput.value = ''
  } else if (step.value === 7) {
    appearancePref.value = 'auto'
  }
  direction.value = 'forward'
  step.value++
}

async function closeWizard() {
  const ok = await confirm('Stäng installationsguiden?', {
    label: 'Stäng guiden',
    style: 'destructive',
    description: 'Du kan alltid starta guiden igen från Inställningar.',
  })
  if (!ok) return
  completeWizard()
}

// ── Step 1: Income ───────────────────────────────────────────────────────────
const incomeNameInput = ref('Lön')
const incomeAmountInput = ref('')
const addedIncomes = ref([])

function addIncomeItem() {
  const amount = parseInt(incomeAmountInput.value)
  if (!amount || amount <= 0) return
  const name = incomeNameInput.value.trim() || 'Lön'
  addedIncomes.value.push({ name, amount })
  incomeNameInput.value = ''
  incomeAmountInput.value = ''
}

function removeIncomeItem(i) {
  addedIncomes.value.splice(i, 1)
}

// ── Step 2: Categories ───────────────────────────────────────────────────────
const presetCategories = [
  { name: 'Boende', emoji: '🏠' },
  { name: 'Mat & Livsmedel', emoji: '🛒' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Nöje & Fritid', emoji: '🎮' },
  { name: 'Hälsa', emoji: '💊' },
  { name: 'Kläder & Shopping', emoji: '👗' },
  { name: 'Övrigt', emoji: '📦' },
]

const selectedCategories = ref([])
const customCatInput = ref('')
const customCategories = ref([])

function toggleCategory(name) {
  const idx = selectedCategories.value.indexOf(name)
  if (idx >= 0) selectedCategories.value.splice(idx, 1)
  else selectedCategories.value.push(name)
}

function addCustomCategory() {
  const name = customCatInput.value.trim()
  if (!name) return
  if (!customCategories.value.includes(name) && !selectedCategories.value.includes(name)) {
    customCategories.value.push(name)
  }
  customCatInput.value = ''
}

function removeCustomCategory(i) {
  customCategories.value.splice(i, 1)
}

const allSelectedCategoryCount = computed(
  () => selectedCategories.value.length + customCategories.value.length
)

// ── Step 3: Fixed expenses ───────────────────────────────────────────────────
const expenseNameInput = ref('')
const expenseAmountInput = ref('')
const expenseCategoryInput = ref('')
const expenseDateInput = ref('')
const addedExpenses = ref([])

const allCategoriesForStep = computed(() => [
  ...selectedCategories.value,
  ...customCategories.value,
])

function addExpenseItem() {
  const name = expenseNameInput.value.trim()
  const amount = parseInt(expenseAmountInput.value)
  if (!name || !amount || amount <= 0) return
  const date = expenseDateInput.value ? parseInt(expenseDateInput.value) : null
  addedExpenses.value.push({ name, amount, category: expenseCategoryInput.value || null, date })
  expenseNameInput.value = ''
  expenseAmountInput.value = ''
  expenseCategoryInput.value = ''
  expenseDateInput.value = ''
}

function removeExpenseItem(i) {
  addedExpenses.value.splice(i, 1)
}

// ── Step 4: Flex expenses ────────────────────────────────────────────────────
const flexNameInput = ref('')
const flexAmountInput = ref('')
const addedFlexItems = ref([])

function addFlexItem() {
  const amount = parseInt(flexAmountInput.value)
  if (!amount || amount <= 0) return
  const name = flexNameInput.value.trim() || 'Flex'
  addedFlexItems.value.push({ name, amount })
  flexNameInput.value = ''
  flexAmountInput.value = ''
}

function removeFlexItem(i) {
  addedFlexItems.value.splice(i, 1)
}

// ── Step 5: Savings ──────────────────────────────────────────────────────────
const savingsNameInput = ref('')
const savingsTargetInput = ref('')
const savingsMonthlyInput = ref('')
const savingsDayInput = ref('')
const addedSavings = ref([])

function addSavingsItem() {
  const name = savingsNameInput.value.trim()
  const target = parseInt(savingsTargetInput.value)
  if (!name || !target || target <= 0) return
  const monthly = savingsMonthlyInput.value ? parseInt(savingsMonthlyInput.value) : null
  const day = savingsDayInput.value ? parseInt(savingsDayInput.value) : null
  addedSavings.value.push({ name, target, monthly, day })
  savingsNameInput.value = ''
  savingsTargetInput.value = ''
  savingsMonthlyInput.value = ''
  savingsDayInput.value = ''
}

function removeSavingsItem(i) {
  addedSavings.value.splice(i, 1)
}

// ── Step 6: Debts ─────────────────────────────────────────────────────────────
const debtNameInput = ref('')
const debtAmountInput = ref('')
const debtMonthlyInput = ref('')
const debtDayInput = ref('')
const addedDebts = ref([])

function addDebtItem() {
  const name = debtNameInput.value.trim()
  const amount = parseInt(debtAmountInput.value)
  if (!name || !amount || amount <= 0) return
  const monthly = debtMonthlyInput.value ? parseInt(debtMonthlyInput.value) : null
  const day = debtDayInput.value ? parseInt(debtDayInput.value) : null
  addedDebts.value.push({ name, amount, monthlyPayment: monthly || null, day })
  debtNameInput.value = ''
  debtAmountInput.value = ''
  debtMonthlyInput.value = ''
  debtDayInput.value = ''
}

function removeDebtItem(i) {
  addedDebts.value.splice(i, 1)
}

// ── Step 7: Appearance ───────────────────────────────────────────────────────
const appearancePref = ref('auto')

// ── Step 8: Finish ───────────────────────────────────────────────────────────
function finish() {
  addedIncomes.value.forEach(i => store.addIncome(i.name, i.amount))
  selectedCategories.value.forEach(name => store.addCategory(name))
  customCategories.value.forEach(name => store.addCategory(name))
  addedExpenses.value.forEach(e => store.addExpense(e.name, e.amount, e.category, e.date))
  addedFlexItems.value.forEach(f => store.addFlex(f.name, f.amount))
  addedSavings.value.forEach(s => {
    store.setSavingsGoal(s.name, s.target, s.day)
    if (s.monthly) store.setSavingsMonthlyPayment(store.savings.length - 1, s.monthly)
  })
  addedDebts.value.forEach(d => {
    store.addDebt(d.name, d.amount, d.day)
    if (d.monthlyPayment) store.setDebtMonthlyPayment(store.debts.length - 1, d.monthlyPayment)
  })
  store.displayModePreference = appearancePref.value
  localStorage.setItem(STORAGE_KEY, 'never')
  completeWizard()
}
</script>

<style scoped>
.wizard-view {
  padding-bottom: 110px;
  padding-top: 32px;
}

:global(body.layout-mobile) .wizard-view,
:global(body.layout-mobile-web) .wizard-view {
  padding-bottom: 160px;
}

.wizard-subtitle {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: -50px 0 60px 0px;
  letter-spacing: -0.2px;
  position: sticky;
  top: calc(44px + env(safe-area-inset-top, 0px));
  z-index: 100;
  background: var(--bg-primary);
  padding: 4px 0 6px;
}

/* ── Step viewport ──────────────────────────────────────────────────────────── */
.step-viewport {
  position: relative;
  overflow: hidden;
}

.step-panel {
  width: 100%;
}

.step-scroll {
  width: 100%;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 600px;
}

.step-content--center {
  align-items: center;
  text-align: center;
  padding-top: 16px;
}

/* ── Step header ─────────────────────────────────────────────────────────────── */
.step-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-top: 20px;
  padding-bottom: 4px;
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0;
}
.step-title--large {
  font-size: 30px;
  letter-spacing: -0.7px;
  margin-top: 8px;
}

.step-sub {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}
.step-sub--center {
  text-align: center;
  max-width: 280px;
}

/* ── Input card ─────────────────────────────────────────────────────────────── */
.input-card {
  background: var(--card-bg);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 0 14px;
  min-height: 50px;
}
.input-row--amount { gap: 10px; }
.input-row--centered { justify-content: center; padding: 12px 14px; }
.input-row--labeled { justify-content: space-between; gap: 12px; }

.input-label {
  font-size: 15px;
  color: var(--text-primary);
  flex-shrink: 0;
}

.text-input--right {
  text-align: right;
  flex: 0 0 auto;
  width: 90px;
}



.input-divider {
  height: 1px;
  background: var(--separator);
  margin: 0 14px;
}

.text-input {
  flex: 1;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  min-width: 0;
  -webkit-user-select: text;
  user-select: text;
}
.text-input::placeholder { color: var(--text-tertiary); }
.select-input { appearance: none; -webkit-appearance: none; cursor: pointer; }

/* ── Add button ─────────────────────────────────────────────────────────────── */
.add-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--system-blue, #007AFF);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s, transform 0.12s;
}
.add-btn:disabled { opacity: 0.35; }
.add-btn:not(:disabled):active { transform: scale(0.92); }
.add-btn--wide {
  width: auto;
  height: 40px;
  padding: 0 20px;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  border-radius: 12px;
}

/* ── Added items list ─────────────────────────────────────────────────────── */
.added-list {
  background: var(--card-bg);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.added-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--separator);
}
.added-row:last-child { border-bottom: none; }

.added-row-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.added-row-icon--green  { background: var(--system-green, #34C759); }
.added-row-icon--purple { background: var(--system-purple, #AF52DE); }
.added-row-icon--orange { background: var(--system-orange, #FF9500); }
.added-row-icon--teal   { background: var(--system-teal, #5AC8FA); }
.added-row-icon--indigo { background: #5856D6; }
.added-row-icon--red    { background: var(--system-red, #FF3B30); }

.added-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.added-row-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.added-row-cat { font-size: 12px; color: var(--text-secondary); }

.added-row-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.delete-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--system-gray4, #E5E5EA);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s;
}
.delete-btn:active { opacity: 0.6; }

.delete-btn--trash {
  background: var(--system-red, #FF3B30);
  color: white;
  border-radius: 8px;
  width: auto;
  height: auto;
  padding: 7px 9px;
}
.delete-btn--trash svg { stroke: white; }

/* ── Category chips ──────────────────────────────────────────────────────── */
.chip-grid { display: flex; flex-wrap: wrap; gap: 9px; }

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 50px;
  border: 1.5px solid var(--separator);
  background: var(--card-bg);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.chip:active { transform: scale(0.96); }
.chip--selected {
  background: var(--system-blue, #007AFF);
  border-color: var(--system-blue, #007AFF);
  color: white;
  box-shadow: 0 3px 12px rgba(0,122,255,0.28);
}
.chip-emoji { font-size: 16px; }
.chip-check { stroke: white; flex-shrink: 0; }

/* ── Primary button ──────────────────────────────────────────────────────── */
.primary-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: var(--system-blue, #007AFF);
  color: white;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.12s, transform 0.12s;
  box-shadow: 0 4px 16px rgba(0,122,255,0.3);
  margin-top: 4px;
}
.primary-btn--green {
  background: var(--system-green, #34C759);
  box-shadow: 0 4px 16px rgba(52,199,89,0.32);
}
.primary-btn:active { opacity: 0.85; transform: scale(0.985); }

/* ── Celebration (step 4) ────────────────────────────────────────────────── */
.celebration-icon {
  margin-bottom: 4px;
  animation: pop-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
@keyframes pop-in {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.summary-pills {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 4px 0 8px;
}

.summary-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--card-bg);
  border-radius: 14px;
  padding: 14px 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  min-width: 88px;
}
.summary-pill-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1;
}
.summary-pill-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ── Fixed bottom bar ────────────────────────────────────────────────────── */
.wizard-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1300;
  background: var(--bg-primary);
  border-top: 0.5px solid var(--separator);
  padding: 10px 16px;
  /* Default: no tab bar below (desktop layout) */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
}

/* On mobile/mobile-web: lift above the floating tab bar (~72px) */
:global(body.layout-mobile) .wizard-bottom-bar,
:global(body.layout-mobile-web) .wizard-bottom-bar {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 72px);
  padding-bottom: 10px;
}

.bottom-action-row {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0 8px;
}

.btn-skip--abs {
  position: absolute;
  right: 28px;
  min-width: unset;
  text-align: right;
}

.primary-btn--sm {
  width: auto;
  height: 48px;
  padding: 0 36px;
  font-size: 16px;
  box-shadow: 0 3px 10px rgba(0,122,255,0.25);
  flex-shrink: 0;
  margin-top: 0;
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--system-blue, #007AFF);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  min-width: 80px;
}
.btn-back:active { opacity: 0.6; }
.btn-back--disabled { opacity: 0.3; cursor: default; }
.btn-back--disabled:active { opacity: 0.3; }

.btn-placeholder {
  min-width: 80px;
  flex-shrink: 0;
}

.progress-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.progress-track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--system-gray4, #E5E5EA);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--system-blue, #007AFF);
  transition: width 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 56px;
  text-align: right;
}

.btn-skip {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 500;
  padding: 6px 10px;
  color: var(--system-blue, #007AFF);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  min-width: 80px;
  text-align: right;
}
.btn-skip:active { opacity: 0.6; }

.bottom-close-row {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.btn-close-text {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary, rgba(60,60,67,0.4));
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  -webkit-tap-highlight-color: transparent;
}
.btn-close-text:active { opacity: 0.6; }

/* ── Appearance options ──────────────────────────────────────────────────── */
.appearance-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.appearance-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--card-bg);
  border-radius: 14px;
  border: 2px solid transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.appearance-card:active { transform: scale(0.984); }
.appearance-card--selected {
  border-color: var(--system-blue, #007AFF);
  box-shadow: 0 3px 14px rgba(0,122,255,0.18);
}

.appearance-card-body { flex: 1; min-width: 0; }
.appearance-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 3px;
  letter-spacing: -0.2px;
}
.appearance-card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.appearance-card-check {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--separator);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.appearance-card--selected .appearance-card-check {
  background: var(--system-blue, #007AFF);
  border-color: var(--system-blue, #007AFF);
  color: white;
}

/* ── Nav preview (appearance step) ──────────────────────────────────────── */
.nav-preview-wrap {
  pointer-events: none;
  user-select: none;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-secondary, #f2f2f7);
  padding: 16px 12px 12px;
}

@media (prefers-color-scheme: dark) {
  .nav-preview-wrap { background: #1c1c1e; }
}

/* iOS / liquid glass pill preview */
.nav-preview--ios {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.nav-preview-ios-pill {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(120,120,128,0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 999px;
  padding: 6px 14px;
  border: 0.5px solid rgba(255,255,255,0.25);
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

@media (prefers-color-scheme: dark) {
  .nav-preview-ios-pill {
    background: rgba(60,60,70,0.55);
    border-color: rgba(255,255,255,0.1);
  }
}

.nav-preview-ios-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
}

.nav-preview-ios-tab--active {
  background: rgba(0,122,255,0.14);
  color: var(--system-blue, #007AFF);
  font-weight: 600;
}

.nav-preview-ios-gear {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(120,120,128,0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

@media (prefers-color-scheme: dark) {
  .nav-preview-ios-gear {
    background: rgba(60,60,70,0.55);
    border-color: rgba(255,255,255,0.1);
  }
}

/* Web nav preview */
.nav-preview--web {
  display: flex;
  align-items: stretch;
  background: var(--bg-primary);
  border-top: 0.5px solid var(--separator);
  border-radius: 0 0 12px 12px;
  margin: 0 -12px -12px;
}

.nav-preview-web-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 4px 12px;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: 0.2px;
}

.nav-preview-web-tab--active {
  color: var(--system-blue, #007AFF);
}
.nav-preview-web-tab--active svg {
  stroke-width: 2.5;
}

/* ── Step transitions (fade-slide in normal flow) ────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}

/* Leaving element: slide and fade out, then hide so it doesn't take up space */
.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  top: 0; left: 0; right: 0;
}

.slide-left-enter-from  { transform: translateX(32px);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-24px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-32px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(24px);  opacity: 0; }
</style>
