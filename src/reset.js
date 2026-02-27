import supabase from './lib/supabase.js'

const loadingEl = document.getElementById('loading')
const formEl = document.getElementById('form')
const successEl = document.getElementById('success')
const invalidEl = document.getElementById('invalid')
const errorEl = document.getElementById('error')
const submitBtn = document.getElementById('submit-btn')

function showError(msg) {
  errorEl.textContent = msg
  errorEl.style.display = 'block'
}

function clearError() {
  errorEl.style.display = 'none'
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    loadingEl.style.display = 'none'
    formEl.style.display = 'flex'
  }
})

// Fallback: if no event fires within 3 s, the link is invalid
setTimeout(() => {
  if (formEl.style.display === 'none' && successEl.style.display === 'none') {
    loadingEl.style.display = 'none'
    invalidEl.style.display = 'block'
  }
}, 3000)

window.submitPassword = async function () {
  clearError()
  const password = document.getElementById('password').value
  const confirm = document.getElementById('password-confirm').value

  if (password.length < 6) { showError('Lösenordet måste vara minst 6 tecken.'); return }
  if (password !== confirm) { showError('Lösenorden matchar inte.'); return }

  submitBtn.disabled = true
  submitBtn.innerHTML = '<span class="spinner"></span>'

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    submitBtn.disabled = false
    submitBtn.textContent = 'Spara lösenord'
    showError(error.message)
    return
  }

  formEl.style.display = 'none'
  document.getElementById('header-text').textContent = 'Lösenord uppdaterat'
  successEl.style.display = 'flex'
}
