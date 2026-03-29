<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '../stores/books'

const route = useRoute()
const router = useRouter()
const books = useBooksStore()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const errors = ref({})
const form = ref({ title: '', author: '', isbn: '', publisher: '', publication_year: null, genre: '', description: '', total_copies: 1, available_copies: 1 })

onMounted(async () => {
  if (isEdit.value) {
    const book = await books.fetchBook(route.params.id)
    if (book) form.value = { ...book }
  }
})

async function handleSubmit() {
  loading.value = true
  errors.value = {}
  const result = isEdit.value ? await books.updateBook(route.params.id, form.value) : await books.createBook(form.value)
  loading.value = false
  if (result.success) router.push('/books')
  else errors.value = result.errors
}
</script>

<template>
  <div>
    <div class="mb-8">
      <button @click="router.push('/books')" class="text-gray-500 hover:text-navy-700 text-sm flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Retour aux livres
      </button>
      <h1 class="font-display text-3xl font-bold text-navy-800">{{ isEdit ? 'Modifier le livre' : 'Ajouter un livre' }}</h1>
    </div>
    <form @submit.prevent="handleSubmit" class="card max-w-2xl space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-navy-700 mb-1.5">Titre</label>
          <input v-model="form.title" required placeholder="Introduction au Deep Learning" class="input-field" />
          <p v-if="errors.title" class="text-red-600 text-xs mt-1">{{ errors.title[0] }}</p>
        </div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Auteur</label><input v-model="form.author" required placeholder="Ian Goodfellow" class="input-field" /></div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">ISBN</label><input v-model="form.isbn" required placeholder="9780262035613" class="input-field" /><p v-if="errors.isbn" class="text-red-600 text-xs mt-1">{{ errors.isbn[0] }}</p></div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Editeur</label><input v-model="form.publisher" placeholder="MIT Press" class="input-field" /></div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Annee</label><input v-model.number="form.publication_year" type="number" placeholder="2024" class="input-field" /></div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Genre</label><input v-model="form.genre" placeholder="Intelligence Artificielle" class="input-field" /></div>
        <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Exemplaires total</label><input v-model.number="form.total_copies" type="number" min="1" class="input-field" /></div>
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-navy-700 mb-1.5">Exemplaires disponibles</label><input v-model.number="form.available_copies" type="number" min="0" class="input-field" /></div>
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-navy-700 mb-1.5">Description</label><textarea v-model="form.description" rows="3" placeholder="Description du livre..." class="input-field"></textarea></div>
      </div>
      <div v-if="errors.non_field_errors" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{{ errors.non_field_errors[0] }}</div>
      <div class="flex gap-3 pt-2">
        <button type="button" @click="router.push('/books')" class="btn-secondary">Annuler</button>
        <button type="submit" :disabled="loading" class="btn-primary">{{ loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter' }}</button>
      </div>
    </form>
  </div>
</template>
