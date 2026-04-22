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

        // Return the full error object rather than stripping it to a simple Error(message)
        // so that we can type it as AxiosError<ApiError> and access specific fields like `errors`
        return Promise.reject(error)
    }
)

export default api;