const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Middleware para verificar JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No se proporcionó token de autenticación'
            });
        }

        const token = authHeader.substring(7); // Remover 'Bearer '

        // Verificar token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Buscar usuario
        const user = User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: 'Usuario no encontrado'
            });
        }

        if (user.estado !== 'activo') {
            return res.status(401).json({
                error: 'Usuario inactivo'
            });
        }

        // Agregar usuario al request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }

        return res.status(500).json({
            error: 'Error al verificar autenticación'
        });
    }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = User.findById(decoded.userId);

            if (user && user.estado === 'activo') {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Ignorar errores en autenticación opcional
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
