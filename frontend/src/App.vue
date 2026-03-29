<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()
const auth = useAuthStore()

const showLayout = computed(() => !['Login', 'Register'].includes(route.name))

onMounted(() => {
  if (auth.isLoggedIn) {
    auth.fetchProfile()
  }
})
</script>

<template>
  <div v-if="showLayout" class="flex h-screen overflow-hidden bg-gray-50">
    <AppSidebar />
    <main class="flex-1 overflow-y-auto">
      <div class="p-8">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  <div v-else>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
