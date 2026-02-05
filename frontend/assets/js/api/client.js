/**
 * API Client - Wrapper para fetch con autenticación
 */

const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Obtener token del localStorage
     */
    getToken() {
        return localStorage.getItem('accessToken');
    }

    /**
     * Guardar token en localStorage
     */
    setToken(token) {
        localStorage.setItem('accessToken', token);
    }

    /**
     * Remover token del localStorage
     */
    removeToken() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    /**
     * Construir headers
     */
    buildHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Manejar respuesta
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            // Si es 401, el token expiró o es inválido
            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/frontend/pages/index.html';
            }

            throw {
                status: response.status,
                message: data.error || data.message || 'Error en la petición',
                data
            };
        }

        return data;
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url, {
            method: 'GET',
            headers: this.buildHeaders()
        });

        return this.handleResponse(response);
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.buildHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.buildHeaders()
        });

        return this.handleResponse(response);
    }

    /**
     * Upload file
     */
    async upload(endpoint, formData) {
        const token = this.getToken();
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        return this.handleResponse(response);
    }
}

// Instancia global del API client
const api = new APIClient();
