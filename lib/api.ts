import axios from "axios"
/**
 *  Create a custom axios instance
 * - baseURL: optional (if you use env for backend)
 * - withCredentials: VERY IMPORTANT for cookies (accessToken / refreshToken)
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
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
let queue: any[] = []


/**
 * Helper function
 * - If refresh success -> resolve all waiting requests
 * - If refresh fails -> reject all waiting requests
 */

const processQueue = (error: any) => {
  queue.forEach((p) => {
    if (error) p.reject(error) // refresh failed -> fail all waiting requests
    else p.resolve(true)// refresh success -> allow waiting requests to continue
  })
  queue = [] // clear queue after processing
}
/**
 * Response Interceptor
 * - runs on every response
 * - if response is OK -> return it
 * - if response has error -> handle it
 */
api.interceptors.response.use(
  (res) => res,  //  if response success, just return it
  async (err) => {
    const original = err.config    // original request config (GET/POST/PUT that failed)

    /**
    * Never intercept refresh endpoint itself,
    * otherwise infinite loop can happen.
    */
    if (original?.url?.includes("/api/auth/refresh")) {
      return Promise.reject(err)
    }

    /**
     * - if error is 401 (Unauthorized)
     * - and original request was not retried before
     */
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      /**
     *  If refresh is already running
     * - Don't call refresh again
     * - Just push this request into queue
     * - Wait until refresh finishes
     */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original))
      }

      isRefreshing = true

      try {
        /**
         * 🔥 Call refresh endpoint
         * - This endpoint should:
         *   1) read refreshToken cookie
         *   2) generate new accessToken
         *   3) set new accessToken cookie
         */
        await api.post("/api/auth/refresh")

        /**
         * Refresh success:
         * - allow all queued requests to continue
         */
        processQueue(null)

        /**
         *  Retry the original failed request
         */
        return api(original)
      } catch (e) {
        /**
         *  Refresh failed:
         * - reject all queued requests
         * - user should be logged out now
         */
        processQueue(e)
        return Promise.reject(e)
      } finally {
        /**
         *  Refresh finished
         * - allow future refresh attempts
         */
        isRefreshing = false
      }
    }

    /**
     * If error is not 401,
     * just reject normally
     */
    return Promise.reject(err)
  }
)

export default api