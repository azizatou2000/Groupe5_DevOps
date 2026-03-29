import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!localStorage.getItem('access_token'))
  const fullName = computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : '')
  const userType = computed(() => {
    const types = { STUDENT: 'Etudiant', PROFESSOR: 'Professeur', ADMIN: 'Administratif' }
    return user.value ? types[user.value.user_type] || user.value.user_type : ''
  })
  const isAdmin = computed(() => user.value?.user_type === 'ADMIN')
  const isProfessor = computed(() => user.value?.user_type === 'PROFESSOR')
  const isStudent = computed(() => user.value?.user_type === 'STUDENT')
  const canManageBooks = computed(() => isAdmin.value)
  const canViewUsers = computed(() => isAdmin.value || isProfessor.value)

  async function login(email, password) {
    loading.value = true
    try {
      const res = await usersApi.post('/api/token/', { email, password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      await fetchProfile()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Email ou mot de passe incorrect.' }
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    try {
      await usersApi.post('/api/users/', data)
      return { success: true }
    } catch (err) {
      const errors = err.response?.data || {}
      return { success: false, errors }
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    try {
      const res = await usersApi.get('/api/users/me/')
      user.value = res.data
    } catch {
      user.value = null
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    user.value = null
  }

  return { user, loading, isLoggedIn, fullName, userType, isAdmin, isProfessor, isStudent, canManageBooks, canViewUsers, login, register, fetchProfile, logout }
})
