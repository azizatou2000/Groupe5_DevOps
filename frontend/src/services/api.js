import axios from 'axios'

// En dev, le proxy Vite redirige vers les bons ports
// En prod Docker, on passe par les variables d'environnement
const USERS_URL = import.meta.env.VITE_USERS_URL || ''
const BOOKS_URL = import.meta.env.VITE_BOOKS_URL || ''
const BORROWINGS_URL = import.meta.env.VITE_BORROWINGS_URL || ''

function createClient(baseURL) {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const refresh = localStorage.getItem('refresh_token')
        if (refresh && !error.config._retry) {
          error.config._retry = true
          try {
            const res = await axios.post(`${USERS_URL}/api/token/refresh/`, {
              refresh
            })
            localStorage.setItem('access_token', res.data.access)
            error.config.headers.Authorization = `Bearer ${res.data.access}`
            return client(error.config)
          } catch {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
          }
        }
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const usersApi = createClient(USERS_URL)
export const booksApi = createClient(BOOKS_URL)
export const borrowingsApi = createClient(BORROWINGS_URL)
