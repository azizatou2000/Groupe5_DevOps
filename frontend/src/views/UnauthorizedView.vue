<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 class="font-display text-3xl font-bold text-navy-800 mb-3">Acces refuse</h1>
      <p class="text-gray-500 mb-8">
        Vous n'avez pas les permissions necessaires pour acceder a cette page.
        Contactez un administrateur si vous pensez que c'est une erreur.
      </p>
      <div class="flex gap-3 justify-center">
        <button @click="router.push('/')" class="btn-primary">Retour au dashboard</button>
        <button @click="router.back()" class="btn-secondary">Page precedente</button>
      </div>
    </div>
  </div>
</template>
