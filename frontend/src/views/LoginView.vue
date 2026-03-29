<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  const result = await auth.login(email.value, password.value)
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-navy-500 items-center justify-center">
      <div class="px-16 text-center">
        <div class="w-20 h-20 bg-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <img src="../assets/images/logo.png" alt="logo">
        </div>
        <h1 class="font-display text-4xl font-bold text-white mb-4">Bibliothèque<br/>Numerique</h1>
        <p class="text-navy-100 text-lg leading-relaxed max-w-sm mx-auto">
          Dakar Institute of Technology
        </p>
        <p class="text-navy-200 mt-2">
          Gestion moderne de la bibliothèque academique
        </p>
        <div class="mt-12 flex items-center justify-center gap-8 text-navy-200">
          <div class="text-center">
            <div class="text-2xl font-display font-bold text-gold-400">500+</div>
            <div class="text-xs mt-1">Livres</div>
          </div>
          <div class="w-px h-10 bg-navy-400"></div>
          <div class="text-center">
            <div class="text-2xl font-display font-bold text-gold-400">200+</div>
            <div class="text-xs mt-1">Etudiants</div>
          </div>
          <div class="w-px h-10 bg-navy-400"></div>
          <div class="text-center">
            <div class="text-2xl font-display font-bold text-gold-400">24/7</div>
            <div class="text-xs mt-1">Acces</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center px-8">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-10 text-center">
          <div class="w-14 h-14 bg-navy-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-gold-400 font-display font-bold text-xl">B</span>
          </div>
          <h1 class="font-display text-2xl font-bold text-navy-800">Bibliothèque DIT</h1>
        </div>

        <h2 class="font-display text-2xl font-bold text-navy-800 mb-2">Connexion</h2>
        <p class="text-gray-500 mb-8">Accedez a votre espace bibliothèque</p>

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-2">Email</label>
            <input v-model="email" type="email" required placeholder="votre@email.sn" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-navy-700 mb-2">Mot de passe</label>
            <input v-model="password" type="password" required placeholder="Votre mot de passe" class="input-field" />
          </div>
          <button type="submit" :disabled="auth.loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg v-if="auth.loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ auth.loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-gray-500">
          Pas encore de compte ?
          <router-link to="/register" class="text-navy-500 hover:text-navy-700 font-medium">
            S'inscrire
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
