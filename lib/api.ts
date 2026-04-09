import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});

//  Global lock + queue
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    //  Ignore refresh endpoint itself
    if (original.url?.includes("/api/auth/refresh")) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      //  If already refreshing → queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh");

        processQueue(null); // resolve all queued
        isRefreshing = false;

        return api(original); // retry once
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        //  HARD STOP (prevents loop)
        if (typeof window !== "undefined") {
          const path = window.location.pathname;

          const isProtected =
            path.startsWith("/dashboard") ||
            path.startsWith("/admin");

          if (isProtected) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;