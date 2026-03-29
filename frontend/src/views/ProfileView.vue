<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usersApi } from '../services/api'

const auth = useAuthStore()
const editing = ref(false)
const loading = ref(false)
const success = ref('')
const form = ref({ first_name: '', last_name: '', phone: '', student_id: '' })
const typeLabels = { STUDENT: 'Etudiant', PROFESSOR: 'Professeur', ADMIN: 'Personnel administratif' }

function startEdit() {
  form.value = {
    first_name: auth.user?.first_name || '',
    last_name: auth.user?.last_name || '',
    phone: auth.user?.phone || '',
    student_id: auth.user?.student_id || '',
  }
  editing.value = true
}

async function saveProfile() {
  loading.value = true
  try {
    await usersApi.patch('/api/users/me/', form.value)
    await auth.fetchProfile()
    success.value = 'Profil mis a jour !'
    editing.value = false
    setTimeout(() => success.value = '', 3000)
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-navy-800">Mon profil</h1>
      <p class="text-gray-500 mt-1">Consulter et modifier vos informations</p>
    </div>

    <div v-if="success" class="max-w-2xl mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{{ success }}</div>

    <div class="card max-w-2xl">
      <div class="flex items-center gap-5 mb-8 pb-6 border-b border-gray-200">
        <div class="w-16 h-16 rounded-2xl bg-navy-50 border border-navy-200 flex items-center justify-center">
          <span class="text-navy-500 font-display font-bold text-2xl">
            {{ auth.user?.first_name?.[0] || '?' }}{{ auth.user?.last_name?.[0] || '' }}
          </span>
        </div>
        <div>
          <h2 class="font-display text-xl font-bold text-navy-800">{{ auth.fullName }}</h2>
          <p class="text-gray-500">{{ typeLabels[auth.user?.user_type] || '' }}</p>
          <p class="text-gray-400 text-sm">{{ auth.user?.email }}</p>
        </div>
      </div>

      <div v-if="!editing" class="space-y-4">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Prenom</p>
            <p class="text-navy-800">{{ auth.user?.first_name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Nom</p>
            <p class="text-navy-800">{{ auth.user?.last_name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Telephone</p>
            <p class="text-navy-800">{{ auth.user?.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">N. Etudiant</p>
            <p class="text-navy-800">{{ auth.user?.student_id || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Inscrit le</p>
            <p class="text-navy-800">{{ auth.user?.date_joined ? new Date(auth.user.date_joined).toLocaleDateString('fr-FR') : '-' }}</p>
          </div>
        </div>
        <button @click="startEdit" class="btn-secondary mt-6">Modifier mon profil</button>
      </div>

      <form v-else @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Prenom</label><input v-model="form.first_name" required class="input-field" /></div>
          <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Nom</label><input v-model="form.last_name" required class="input-field" /></div>
          <div><label class="block text-sm font-medium text-navy-700 mb-1.5">Telephone</label><input v-model="form.phone" class="input-field" /></div>
          <div><label class="block text-sm font-medium text-navy-700 mb-1.5">N. Etudiant</label><input v-model="form.student_id" class="input-field" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" @click="editing = false" class="btn-secondary">Annuler</button>
          <button type="submit" :disabled="loading" class="btn-primary">{{ loading ? 'Enregistrement...' : 'Sauvegarder' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
