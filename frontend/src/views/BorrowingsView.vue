<script setup>
import { onMounted, ref, computed } from 'vue'
import { useBorrowingsStore } from '../stores/borrowings'
import { useAuthStore } from '../stores/auth'

const borrowings = useBorrowingsStore()
const auth = useAuthStore()

const activeTab = ref('my')
const showReturnModal = ref(false)
const selectedBorrowing = ref(null)
const returnNotes = ref('')
const returnSuccess = ref('')

onMounted(async () => {
  await Promise.all([
    borrowings.fetchMyHistory(),
    borrowings.fetchAll(),
    borrowings.fetchLate(),
  ])
})

const displayList = computed(() => {
  if (activeTab.value === 'my') return borrowings.myHistory
  if (activeTab.value === 'late') return borrowings.lateBorrowings
  return borrowings.borrowings
})

const tabs = computed(() => {
  const t = [{ key: 'my', label: 'Mes emprunts' }]
  if (auth.isAdmin) t.push({ key: 'all', label: 'Tous' })
  t.push({ key: 'late', label: 'En retard' })
  return t
})

function openReturn(b) {
  selectedBorrowing.value = b
  returnNotes.value = ''
  returnSuccess.value = ''
  showReturnModal.value = true
}

async function confirmReturn() {
  const result = await borrowings.returnBook(selectedBorrowing.value.id, returnNotes.value)
  if (result.success) {
    returnSuccess.value = 'Livre retourné avec succes !'
    borrowings.fetchMyHistory()
    borrowings.fetchAll()
    borrowings.fetchLate()
    setTimeout(() => { showReturnModal.value = false; returnSuccess.value = '' }, 2000)
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-navy-800">Emprunts</h1>
      <p class="text-gray-500 mt-1">Gestion des emprunts et retours</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === tab.key
            ? 'bg-navy-500 text-white'
            : 'text-gray-500 hover:text-navy-700'
        ]"
      >
        {{ tab.label }}
        <span v-if="tab.key === 'late' && borrowings.lateBorrowings.length" class="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {{ borrowings.lateBorrowings.length }}
        </span>
      </button>
    </div>

    <div v-if="borrowings.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-navy-500" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <div v-else-if="displayList.length" class="space-y-3">
      <div v-for="b in displayList" :key="b.id" class="card flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-display font-bold text-navy-800">{{ b.book_title || `Livre #${b.book_id}` }}</h3>
            <span :class="[
              b.status === 'RETURNED' ? 'badge-success' : b.is_late ? 'badge-danger' : 'badge-info'
            ]">
              {{ b.status === 'RETURNED' ? 'Retourne' : b.is_late ? `En retard (${b.days_late}j)` : 'En cours' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <span>Emprunteur : {{ b.user_email || `User #${b.user_id}` }}</span>
            <span>Emprunte le : {{ formatDate(b.borrowed_at) }}</span>
            <span>Retour prevu : {{ formatDate(b.due_date) }}</span>
            <span v-if="b.returned_at">Retourne le : {{ formatDate(b.returned_at) }}</span>
          </div>
          <p v-if="b.notes" class="text-sm text-gray-400 mt-1 italic">{{ b.notes }}</p>
        </div>
        <button
          v-if="b.status === 'ACTIVE'"
          @click="openReturn(b)"
          class="bg-emerald-50 text-emerald-700 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors flex-shrink-0"
        >
          Retourner
        </button>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      <p class="text-gray-400">Aucun emprunt</p>
    </div>

    <!-- Return Modal -->
    <Teleport to="body">
      <div v-if="showReturnModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showReturnModal = false"></div>
        <div class="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-lg">
          <h3 class="font-display font-bold text-xl text-navy-800 mb-1">Retourner le livre</h3>
          <p class="text-gray-500 text-sm mb-5">{{ selectedBorrowing?.book_title }}</p>
          <div v-if="returnSuccess" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm mb-4">{{ returnSuccess }}</div>
          <div v-if="!returnSuccess" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-navy-700 mb-1.5">Notes (optionnel)</label>
              <textarea v-model="returnNotes" rows="2" placeholder="Etat du livre, remarques..." class="input-field"></textarea>
            </div>
            <div class="flex gap-3">
              <button @click="showReturnModal = false" class="btn-secondary flex-1">Annuler</button>
              <button @click="confirmReturn" class="btn-primary flex-1">Confirmer le retour</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
