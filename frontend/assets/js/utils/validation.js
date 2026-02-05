/**
 * Utilidades de Validación de Formularios
 */

const validation = {
    /**
     * Validar email
     */
    isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validar requerido
     */
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    /**
     * Validar longitud mínima
     */
    minLength(value, min) {
        return value.length >= min;
    },

    /**
     * Validar longitud máxima
     */
    maxLength(value, max) {
        return value.length <= max;
    },

    /**
     * Validar número
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     * Validar entero
     */
    isInteger(value) {
        return Number.isInteger(Number(value));
    },

    /**
     * Validar rango
     */
    inRange(value, min, max) {
        const num = Number(value);
        return num >= min && num <= max;
    },

    /**
     * Validar patrón
     */
    matches(value, pattern) {
        const regex = new RegExp(pattern);
        return regex.test(value);
    },

    /**
     * Marcar campo como inválido
     */
    markInvalid(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        // Buscar o crear mensaje de error
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        feedback.textContent = message;
    },

    /**
     * Marcar campo como válido
     */
    markValid(input) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');

        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    },

    /**
     * Limpiar validación
     */
    clearValidation(input) {
        input.classList.remove('is-valid', 'is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    },

    /**
     * Validar formulario completo
     */
    validateForm(form, rules) {
        let isValid = true;

        Object.keys(rules).forEach(fieldName => {
            const input = form.elements[fieldName];
            if (!input) return;

            const fieldRules = rules[fieldName];
            const value = input.value;

            // Requerido
            if (fieldRules.required && !this.required(value)) {
                this.markInvalid(input, fieldRules.messages?.required || 'Este campo es requerido');
                isValid = false;
                return;
            }

            // Si está vacío y no es requerido, no validar el resto
            if (!value) {
                this.clearValidation(input);
                return;
            }

            // Email
            if (fieldRules.email && !this.isEmail(value)) {
                this.markInvalid(input, fieldRules.messages?.email || 'Email inválido');
                isValid = false;
                return;
            }

            // Longitud mínima
            if (fieldRules.minLength && !this.minLength(value, fieldRules.minLength)) {
                this.markInvalid(input, fieldRules.messages?.minLength || `Mínimo ${fieldRules.minLength} caracteres`);
                isValid = false;
                return;
            }

            // Longitud máxima
            if (fieldRules.maxLength && !this.maxLength(value, fieldRules.maxLength)) {
                this.markInvalid(input, fieldRules.messages?.maxLength || `Máximo ${fieldRules.maxLength} caracteres`);
                isValid = false;
                return;
            }

            // Número
            if (fieldRules.number && !this.isNumber(value)) {
                this.markInvalid(input, fieldRules.messages?.number || 'Debe ser un número válido');
                isValid = false;
                return;
            }

            // Validación personalizada
            if (fieldRules.custom) {
                const customResult = fieldRules.custom(value);
                if (customResult !== true) {
                    this.markInvalid(input, customResult || 'Valor inválido');
                    isValid = false;
                    return;
                }
            }

            this.markValid(input);
        });

        return isValid;
    }
};
