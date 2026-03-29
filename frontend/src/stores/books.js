import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksApi } from '../services/api'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const currentBook = ref(null)
  const loading = ref(false)
  const totalCount = ref(0)

  async function fetchBooks(params = {}) {
    loading.value = true
    try {
      const res = await booksApi.get('/api/books/', { params })
      books.value = res.data.results || res.data
      totalCount.value = res.data.count || books.value.length
    } catch (err) {
      console.error('Erreur chargement livres:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBook(id) {
    loading.value = true
    try {
      const res = await booksApi.get(`/api/books/${id}/`)
      currentBook.value = res.data
      return res.data
    } catch (err) {
      console.error('Erreur:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createBook(data) {
    try {
      const res = await booksApi.post('/api/books/', data)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, errors: err.response?.data || {} }
    }
  }

  async function updateBook(id, data) {
    try {
      const res = await booksApi.patch(`/api/books/${id}/`, data)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, errors: err.response?.data || {} }
    }
  }

  async function deleteBook(id) {
    try {
      await booksApi.delete(`/api/books/${id}/`)
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  }

  return { books, currentBook, loading, totalCount, fetchBooks, fetchBook, createBook, updateBook, deleteBook }
})
