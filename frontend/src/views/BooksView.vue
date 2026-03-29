<script setup>
import { onMounted, ref } from 'vue'
import { useBooksStore } from '../stores/books'
import { useBorrowingsStore } from '../stores/borrowings'
import { useAuthStore } from '../stores/auth'

const books = useBooksStore()
const borrowings = useBorrowingsStore()
const auth = useAuthStore()

const search = ref('')
const showBorrowModal = ref(false)
const showDeleteModal = ref(false)
const selectedBook = ref(null)
const borrowDueDate = ref('')
const borrowNotes = ref('')
const borrowError = ref('')
const borrowSuccess = ref('')

onMounted(() => books.fetchBooks())

function doSearch() { books.fetchBooks({ search: search.value }) }

function openBorrow(book) {
  selectedBook.value = book
  borrowError.value = ''
  borrowSuccess.value = ''
  borrowNotes.value = ''
  const due = new Date()
  due.setDate(due.getDate() + 14)
  borrowDueDate.value = due.toISOString().slice(0, 16)
  showBorrowModal.value = true
}

async function confirmBorrow() {
  borrowError.value = ''
  const result = await borrowings.borrowBook(selectedBook.value.id, borrowDueDate.value ? new Date(borrowDueDate.value).toISOString() : null, borrowNotes.value)
  if (result.success) {
    borrowSuccess.value = `"${selectedBook.value.title}" emprunte avec succes !`
    books.fetchBooks({ search: search.value })
    setTimeout(() => { showBorrowModal.value = false; borrowSuccess.value = '' }, 2000)
  } else { borrowError.value = result.error }
}

function openDelete(book) { selectedBook.value = book; showDeleteModal.value = true }

async function confirmDelete() {
  const result = await books.deleteBook(selectedBook.value.id)
  if (result.success) { showDeleteModal.value = false; books.fetchBooks({ search: search.value }) }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-3xl font-bold text-navy-800">Livres</h1>
        <p class="text-gray-500 mt-1">{{ books.totalCount }} livres dans le catalogue</p>
      </div>
      <router-link v-if="auth.canManageBooks" to="/books/new" class="btn-gold inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Ajouter un livre
      </router-link>
    </div>

    <div class="relative mb-6">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input v-model="search" @input="doSearch" type="text" placeholder="Rechercher par titre, auteur ou ISBN..." class="input-field pl-12" />
    </div>

    <div v-if="books.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-navy-500" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <div v-else-if="books.books.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="book in books.books" :key="book.id" class="card">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span :class="book.is_available ? 'badge-success' : 'badge-danger'">
            {{ book.is_available ? `${book.available_copies} dispo` : 'Indisponible' }}
          </span>
        </div>
        <h3 class="font-display font-bold text-navy-800 text-lg leading-snug mb-1">{{ book.title }}</h3>
        <p class="text-gray-500 text-sm mb-1">{{ book.author }}</p>
        <div class="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span v-if="book.genre">{{ book.genre }}</span>
          <span v-if="book.publication_year">{{ book.publication_year }}</span>
          <span>ISBN: {{ book.isbn }}</span>
        </div>
        <p v-if="book.description" class="text-gray-500 text-sm line-clamp-2 mb-4">{{ book.description }}</p>
        <div class="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button v-if="book.is_available" @click="openBorrow(book)" class="flex-1 bg-navy-50 text-navy-500 text-sm font-medium py-2 rounded-lg hover:bg-navy-100 transition-colors">Emprunter</button>
          <router-link v-if="auth.canManageBooks" :to="`/books/${book.id}/edit`" class="px-3 py-2 text-gray-400 hover:text-navy-500 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
          </router-link>
          <button v-if="auth.canManageBooks" @click="openDelete(book)" class="px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-20"><p class="text-gray-400">Aucun livre trouve</p></div>

    <!-- Borrow Modal -->
    <Teleport to="body">
      <div v-if="showBorrowModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showBorrowModal = false"></div>
        <div class="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-lg">
          <h3 class="font-display font-bold text-xl text-navy-800 mb-1">Emprunter un livre</h3>
          <p class="text-gray-500 text-sm mb-5">{{ selectedBook?.title }}</p>
          <div v-if="borrowSuccess" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm mb-4">{{ borrowSuccess }}</div>
          <div v-if="borrowError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">{{ borrowError }}</div>
          <div v-if="!borrowSuccess" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-navy-700 mb-1.5">Date de retour prevue</label>
              <input v-model="borrowDueDate" type="datetime-local" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-navy-700 mb-1.5">Notes (optionnel)</label>
              <textarea v-model="borrowNotes" rows="2" placeholder="Ex: Pour le cours de..." class="input-field"></textarea>
            </div>
            <div class="flex gap-3">
              <button @click="showBorrowModal = false" class="btn-secondary flex-1">Annuler</button>
              <button @click="confirmBorrow" class="btn-primary flex-1">Confirmer</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showDeleteModal = false"></div>
        <div class="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-lg">
          <h3 class="font-display font-bold text-xl text-navy-800 mb-2">Supprimer ce livre ?</h3>
          <p class="text-gray-500 text-sm mb-6">{{ selectedBook?.title }} - {{ selectedBook?.author }}</p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1">Annuler</button>
            <button @click="confirmDelete" class="btn-danger flex-1">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
