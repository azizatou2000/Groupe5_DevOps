<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = computed(() => {
  const items = [
    { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Livres', path: '/books', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ]
  if (auth.canViewUsers) {
    items.push({ name: 'Utilisateurs', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
  }
  items.push({ name: 'Emprunts', path: '/borrowings', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' })
  return items
})

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-20 h-20 bg-navy-500 rounded-lg flex items-center justify-center">
          <img src="../assets/images/logo.png" alt="logo">
        </div>
        <div>
          <h1 class="font-display font-bold text-sm text-navy-800">Bibliothèque</h1>
          <p class="text-[10px] text-gold-500 font-medium tracking-widest uppercase">DIT Dakar</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150',
          isActive(item.path)
            ? 'bg-navy-500 text-white'
            : 'text-navy-400 hover:text-navy-700 hover:bg-gray-100'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
        </svg>
        {{ item.name }}
      </router-link>
    </nav>

    <!-- User -->
    <div class="p-4 border-t border-gray-200">
      <router-link to="/profile" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="w-9 h-9 rounded-full bg-navy-50 border border-navy-200 flex items-center justify-center">
          <span class="text-navy-500 font-semibold text-sm">
            {{ auth.user?.first_name?.[0] || '?' }}{{ auth.user?.last_name?.[0] || '' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-navy-800 truncate">{{ auth.fullName || 'Utilisateur' }}</p>
          <p class="text-xs text-gray-400">{{ auth.userType }}</p>
        </div>
      </router-link>
      <button @click="logout" class="mt-2 w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Deconnexion
      </button>
    </div>
  </aside>
</template>
