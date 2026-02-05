/**
 * Utilidades para manejo de localStorage
 */

const storage = {
    /**
     * Guardar item en localStorage
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    /**
     * Obtener item de localStorage
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remover item de localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    /**
     * Limpiar todo el localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    /**
     * Verificar si existe un item
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    // Métodos específicos para autenticación
    auth: {
        setTokens(accessToken, refreshToken) {
            storage.set('accessToken', accessToken);
            if (refreshToken) {
                storage.set('refreshToken', refreshToken);
            }
        },

        getAccessToken() {
            return storage.get('accessToken');
        },

        getRefreshToken() {
            return storage.get('refreshToken');
        },

        setUser(user) {
            storage.set('user', user);
        },

        getUser() {
            return storage.get('user');
        },

        clear() {
            storage.remove('accessToken');
            storage.remove('refreshToken');
            storage.remove('user');
        },

        isAuthenticated() {
            return storage.has('accessToken') && storage.has('user');
        }
    }
};
