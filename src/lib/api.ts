import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status

        if (status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            'Unexpected error'

        return Promise.reject(new Error(message))
    }
)

export default api;