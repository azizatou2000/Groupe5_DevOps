<script setup>
import { onMounted, ref } from 'vue'
import { usersApi } from '../services/api'

const users = ref([])
const loading = ref(true)
const search = ref('')
const filterType = ref('')
const typeLabels = { STUDENT: 'Etudiant', PROFESSOR: 'Professeur', ADMIN: 'Administratif' }
const typeColors = { STUDENT: 'badge-info', PROFESSOR: 'badge-warning', ADMIN: 'badge-success' }

async function fetchUsers() {
  loading.value = true
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (filterType.value) params.user_type = filterType.value
    const res = await usersApi.get('/api/users/', { params })
    users.value = res.data.results || res.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

onMounted(fetchUsers)
function doSearch() { fetchUsers() }
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-navy-800">Utilisateurs</h1>
      <p class="text-gray-500 mt-1">Gestion des membres de la bibliothèque</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input v-model="search" @input="doSearch" placeholder="Rechercher un utilisateur..." class="input-field pl-12" />
      </div>
      <select v-model="filterType" @change="doSearch" class="input-field w-auto sm:w-48">
        <option value="">Tous les types</option>
        <option value="STUDENT">Etudiants</option>
        <option value="PROFESSOR">Professeurs</option>
        <option value="ADMIN">Administratif</option>
      </select>
    </div>
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin w-8 h-8 text-navy-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>
    <div v-else-if="users.length" class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">N. Etudiant</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-navy-50 border border-navy-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-navy-500 text-sm font-semibold">{{ user.first_name?.[0] }}{{ user.last_name?.[0] }}</span>
                  </div>
                  <span class="text-sm font-medium text-navy-800">{{ user.first_name }} {{ user.last_name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4"><span :class="typeColors[user.user_type]">{{ typeLabels[user.user_type] }}</span></td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ user.student_id || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(user.date_joined).toLocaleDateString('fr-FR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-20"><p class="text-gray-400">Aucun utilisateur trouve</p></div>
  </div>
</template>
