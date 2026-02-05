const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Generar JWT token
 */
function generateToken(userId, expiresIn = config.jwt.expiresIn) {
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn });
}

/**
 * Login de usuario
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const user = User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar estado del usuario
        if (user.estado !== 'activo') {
            return res.status(401).json({
                error: 'Usuario inactivo'
            });
        }

        // Verificar contraseña
        const isValidPassword = await User.verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateToken(user.id, config.jwt.refreshExpiresIn);

        // Remover password_hash de la respuesta
        delete user.password_hash;

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            },
            accessToken,
            refreshToken,
            expiresIn: config.jwt.expiresIn
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión'
        });
    }
};

/**
 * Obtener usuario actual
 */
exports.me = async (req, res) => {
    try {
        const user = User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                estado: user.estado,
                fecha_creacion: user.fecha_creacion
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            error: 'Error al obtener información del usuario'
        });
    }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token es requerido'
            });
        }

        // Verificar refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.secret);
        const user = User.findById(decoded.userId);

        if (!user || user.estado !== 'activo') {
            return res.status(401).json({
                error: 'Refresh token inválido'
            });
        }

        // Generar nuevo access token
        const accessToken = generateToken(user.id);

        res.json({
            accessToken,
            expiresIn: config.jwt.expiresIn
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Refresh token expirado'
            });
        }

        console.error('Error en refresh token:', error);
        res.status(500).json({
            error: 'Error al refrescar token'
        });
    }
};

/**
 * Logout (opcional - en un sistema stateless JWT el logout es del lado del cliente)
 */
exports.logout = async (req, res) => {
    // En un sistema JWT stateless, el logout se maneja en el cliente eliminando el token
    // Aquí podríamos implementar una blacklist de tokens si fuera necesario
    res.json({
        message: 'Logout exitoso'
    });
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Contraseña actual y nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Buscar usuario con password
        const user = User.findByEmail(req.user.email);

        // Verificar contraseña actual
        const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Contraseña actual incorrecta'
            });
        }

        // Cambiar contraseña
        await User.changePassword(req.user.id, newPassword);

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            error: 'Error al cambiar contraseña'
        });
    }
};
