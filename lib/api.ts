import axios from "axios"
/**
 *  Create a custom axios instance
 * - baseURL: optional (if you use env for backend)
 * - withCredentials: VERY IMPORTANT for cookies (accessToken / refreshToken)
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
})
/**
 * Flag: to avoid multiple refresh calls at same time
 * - When 10 requests fail with 401 together,
 *   we refresh only ONCE
 */
let isRefreshing = false

/**
 * Queue: store all pending requests while refresh is running
 * - These requests will wait
 * - After refresh success -> retry them
 */
let queue: { resolve: () => void; reject: (err: any) => void }[] = []


/**
 * Helper function
 * - If refresh success -> resolve all waiting requests
 * - If refresh fails -> reject all waiting requests
 */

const processQueue = (error: any) => {
  queue.forEach((p) => {
    if (error) p.reject(error) // refresh failed -> fail all waiting requests
    else p.resolve()// refresh success -> allow waiting requests to continue
  })
  queue = [] // clear queue after processing
}

const PROTECTED_PREFIXES = ["/admin", "/dashboard"]

function isProtectedPage() {
  return PROTECTED_PREFIXES.some((prefix) =>
    window.location.pathname.startsWith(prefix)
  )
}

api.interceptors.response.use(
  (res) => res,  //  if response success, just return it
  async (err) => {
    const original = err.config    // original request config (GET/POST/PUT that failed)

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/api/auth/")
    ) {
      original._retry = true

      // If already refreshing, add this request to the queue and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: () => resolve(api(original)),
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        // Call refresh endpoint
        await axios.post("/api/auth/refresh", {}, { withCredentials: true })
        processQueue(null)
        return api(original) // retry original request
      } catch (refreshError) {
        processQueue(refreshError)
        //  Refresh failed — session is dead, send to login
        if (isProtectedPage()) {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api