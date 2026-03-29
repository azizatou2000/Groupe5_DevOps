<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  email: '', first_name: '', last_name: '', password: '',
  password_confirm: '', user_type: 'STUDENT', student_id: '', phone: ''
})
const errors = ref({})
const success = ref(false)

async function handleRegister() {
  errors.value = {}
  const result = await auth.register(form.value)
  if (result.success) {
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } else {
    errors.value = result.errors
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-navy-500 rounded-xl flex items-center justify-center mx-auto ">
          <img src="../assets/images/logo.png" alt="logo">
        </div>
        <h2 class="font-display text-2xl font-bold text-navy-800">Creer un compte</h2>
        <p class="text-gray-500 mt-2">Rejoignez la bibliothèque numerique DIT</p>
      </div>

      <div v-if="success" class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm text-center mb-6">
        Compte cree avec succes ! Redirection vers la connexion...
      </div>

      <form v-if="!success" @submit.prevent="handleRegister" class="card space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">Prenom</label>
            <input v-model="form.first_name" required placeholder="Amadou" class="input-field" />
            <p v-if="errors.first_name" class="text-red-600 text-xs mt-1">{{ errors.first_name[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">Nom</label>
            <input v-model="form.last_name" required placeholder="Diallo" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
          <input v-model="form.email" type="email" required placeholder="amadou@dit.sn" class="input-field" />
          <p v-if="errors.email" class="text-red-600 text-xs mt-1">{{ errors.email[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-navy-700 mb-1.5">Type d'utilisateur</label>
          <select v-model="form.user_type" class="input-field">
            <option value="STUDENT">Etudiant</option>
            <option value="PROFESSOR">Professeur</option>
            <option value="ADMIN">Personnel administratif</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">N. Etudiant</label>
            <input v-model="form.student_id" placeholder="DIT-2026-042" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">Telephone</label>
            <input v-model="form.phone" placeholder="+221771234567" class="input-field" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">Mot de passe</label>
            <input v-model="form.password" type="password" required placeholder="Min. 8 caracteres" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-1.5">Confirmer</label>
            <input v-model="form.password_confirm" type="password" required placeholder="Confirmer" class="input-field" />
            <p v-if="errors.password_confirm" class="text-red-600 text-xs mt-1">{{ errors.password_confirm[0] }}</p>
          </div>
        </div>

        <button type="submit" :disabled="auth.loading" class="btn-primary w-full mt-2">
          {{ auth.loading ? 'Creation...' : 'Creer mon compte' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Deja un compte ?
        <router-link to="/login" class="text-navy-500 hover:text-navy-700 font-medium">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>
