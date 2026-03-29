import { defineStore } from 'pinia'
import { ref } from 'vue'
import { borrowingsApi } from '../services/api'

export const useBorrowingsStore = defineStore('borrowings', () => {
  const borrowings = ref([])
  const myHistory = ref([])
  const lateBorrowings = ref([])
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await borrowingsApi.get('/api/borrowings/', { params })
      borrowings.value = res.data.results || res.data
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMyHistory() {
    loading.value = true
    try {
      const res = await borrowingsApi.get('/api/borrowings/my-history/')
      myHistory.value = res.data
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchLate() {
    loading.value = true
    try {
      const res = await borrowingsApi.get('/api/borrowings/late/')
      lateBorrowings.value = res.data
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  }

  async function borrowBook(bookId, dueDate = null, notes = '') {
    try {
      const data = { book_id: bookId, notes }
      if (dueDate) data.due_date = dueDate
      const res = await borrowingsApi.post('/api/borrowings/borrow/', data)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Erreur lors de l\'emprunt.' }
    }
  }

  async function returnBook(id, notes = '') {
    try {
      const res = await borrowingsApi.post(`/api/borrowings/${id}/return/`, { notes })
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Erreur lors du retour.' }
    }
  }

  return { borrowings, myHistory, lateBorrowings, loading, fetchAll, fetchMyHistory, fetchLate, borrowBook, returnBook }
})
