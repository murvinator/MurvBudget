import { defineStore } from 'pinia'
import supabase from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    lastSynced: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async init() {
      const { data: { session } } = await supabase.auth.getSession()
      this.user = session?.user ?? null

      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user ?? null
      })
    },

    async signUp(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) { this.error = error.message; return null }
        this.user = data.user
        return data.user
      } finally {
        this.loading = false
      }
    },

    async signIn(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { this.error = error.message; return null }
        this.user = data.user
        return data.user
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      await supabase.auth.signOut()
      this.user = null
      this.lastSynced = null
    },

    async deleteCloudData() {
      this.loading = true
      this.error = null
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false
        const { error } = await supabase.from('user_budgets').delete().eq('id', user.id)
        if (error) { this.error = error.message; return false }
        localStorage.removeItem('murvbudget-last-cloud-sync')
        this.lastSynced = null
        return true
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      this.loading = true
      this.error = null
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false
        // Delete budget data first
        await supabase.from('user_budgets').delete().eq('id', user.id)
        // Delete the auth user via RPC (requires delete_user() function in Supabase)
        const { error } = await supabase.rpc('delete_user')
        if (error) { this.error = error.message; return false }
        this.user = null
        this.lastSynced = null
        localStorage.removeItem('murvbudget-last-cloud-sync')
        return true
      } finally {
        this.loading = false
      }
    },

    setLastSynced() {
      this.lastSynced = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    },

    async resetPassword(email) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset.html`,
        })
        if (error) { this.error = error.message; return false }
        return true
      } finally {
        this.loading = false
      }
    },
  },
})
