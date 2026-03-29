<script setup>
import { onMounted, computed } from 'vue'
import { useBooksStore } from '../stores/books'
import { useBorrowingsStore } from '../stores/borrowings'
import { useAuthStore } from '../stores/auth'

const books = useBooksStore()
const borrowings = useBorrowingsStore()
const auth = useAuthStore()

onMounted(async () => {
  await Promise.all([
    books.fetchBooks(),
    borrowings.fetchMyHistory(),
    borrowings.fetchLate(),
  ])
})

const totalBooks = computed(() => books.totalCount)
const activeBorrowings = computed(() => borrowings.myHistory.filter(b => b.status === 'ACTIVE').length)
const lateCount = computed(() => borrowings.lateBorrowings.length)
const availableBooks = computed(() => books.books.filter(b => b.is_available).length)

const stats = computed(() => [
  { label: 'Total Livres', value: totalBooks.value, color: 'text-navy-500', bg: 'bg-navy-50', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Disponibles', value: availableBooks.value, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Mes Emprunts', value: activeBorrowings.value, color: 'text-gold-500', bg: 'bg-gold-50', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { label: 'En Retard', value: lateCount.value, color: lateCount.value > 0 ? 'text-red-600' : 'text-gray-400', bg: lateCount.value > 0 ? 'bg-red-50' : 'bg-gray-50', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
])

const recentBorrowings = computed(() => borrowings.myHistory.slice(0, 5))
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-navy-800">
        Bonjour, {{ auth.user?.first_name || 'Utilisateur' }}
      </h1>
      <p class="text-gray-500 mt-1">Bienvenue dans votre espace bibliothèque</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card flex items-center gap-4">
        <div :class="[stat.bg, 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0']">
          <svg :class="[stat.color, 'w-6 h-6']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" :d="stat.icon" />
          </svg>
        </div>
        <div>
          <p :class="[stat.color, 'text-2xl font-display font-bold']">{{ stat.value }}</p>
          <p class="text-gray-500 text-sm">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent borrowings -->
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display font-bold text-lg text-navy-800">Mes emprunts recents</h2>
          <router-link to="/borrowings" class="text-navy-500 text-sm hover:text-navy-700">Voir tout</router-link>
        </div>
        <div v-if="recentBorrowings.length === 0" class="text-gray-400 text-sm py-8 text-center">
          Aucun emprunt pour le moment
        </div>
        <div v-else class="space-y-3">
          <div v-for="b in recentBorrowings" :key="b.id" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p class="text-sm font-medium text-navy-800">{{ b.book_title }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Emprunte le {{ new Date(b.borrowed_at).toLocaleDateString('fr-FR') }}</p>
            </div>
            <span :class="[
              b.status === 'RETURNED' ? 'badge-success' : b.is_late ? 'badge-danger' : 'badge-info'
            ]">
              {{ b.status === 'RETURNED' ? 'Retourne' : b.is_late ? 'En retard' : 'En cours' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card">
        <h2 class="font-display font-bold text-lg text-navy-800 mb-5">Actions rapides</h2>
        <div class="space-y-3">
          <router-link to="/books" class="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-navy-200 hover:bg-navy-50 transition-colors group">
            <div class="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-navy-800 group-hover:text-navy-500 transition-colors">Rechercher un livre</p>
              <p class="text-xs text-gray-400">Par titre, auteur ou ISBN</p>
            </div>
          </router-link>
          <router-link v-if="auth.canManageBooks" to="/books/new" class="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gold-300 hover:bg-gold-50 transition-colors group">
            <div class="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-navy-800 group-hover:text-gold-600 transition-colors">Ajouter un livre</p>
              <p class="text-xs text-gray-400">Enrichir le catalogue</p>
            </div>
          </router-link>
          <router-link to="/borrowings" class="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-navy-200 hover:bg-navy-50 transition-colors group">
            <div class="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-navy-800 group-hover:text-navy-500 transition-colors">Gérer mes emprunts</p>
              <p class="text-xs text-gray-400">Historique et retours</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
