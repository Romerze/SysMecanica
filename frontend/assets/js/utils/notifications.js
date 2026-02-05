/**
 * Sistema de Notificaciones Toast
 */

const notifications = {
    container: null,

    /**
     * Inicializar el contenedor de notificaciones
     */
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Mostrar notificación
     */
    show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            danger: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
        `;

        this.container.appendChild(toast);

        // Auto-remover después del duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    },

    /**
     * Notificación de éxito
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    /**
     * Notificación de error
     */
    error(message, duration) {
        return this.show(message, 'danger', duration);
    },

    /**
     * Notificación de advertencia
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Notificación de información
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    },

    /**
     * Limpiar todas las notificaciones
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};
