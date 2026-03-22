import axios from 'axios';
import { getApiBaseUrl } from './apiBase';

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const path = error?.config?.url ?? '';
        if (error?.response?.status === 401 && !path.includes('/auth/me') && window.location.pathname !== '/signin') {
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    },
);

export default api;
