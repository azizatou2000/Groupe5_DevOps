import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { auth: true }
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('../views/BooksView.vue'),
    meta: { auth: true }
  },
  {
    path: '/books/new',
    name: 'BookCreate',
    component: () => import('../views/BookFormView.vue'),
    meta: { auth: true, adminOnly: true }
  },
  {
    path: '/books/:id/edit',
    name: 'BookEdit',
    component: () => import('../views/BookFormView.vue'),
    meta: { auth: true, adminOnly: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UsersView.vue'),
    meta: { auth: true, staffOnly: true }
  },
  {
    path: '/borrowings',
    name: 'Borrowings',
    component: () => import('../views/BorrowingsView.vue'),
    meta: { auth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { auth: true }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/UnauthorizedView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const token = localStorage.getItem('access_token')

  // Redirection si non connecte
  if (to.meta.auth && !token) return { name: 'Login' }
  if (to.meta.guest && token) return { name: 'Dashboard' }

  // Verification des roles
  if (to.meta.adminOnly || to.meta.staffOnly) {
    const auth = useAuthStore()

    // Charger le profil si pas encore fait
    if (!auth.user && token) {
      await auth.fetchProfile()
    }

    // adminOnly : uniquement les ADMIN
    if (to.meta.adminOnly && !auth.isAdmin) {
      return { name: 'Unauthorized' }
    }

    // staffOnly : ADMIN et PROFESSOR
    if (to.meta.staffOnly && !auth.canViewUsers) {
      return { name: 'Unauthorized' }
    }
  }
})

export default router
