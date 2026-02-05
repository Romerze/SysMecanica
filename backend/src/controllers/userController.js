const User = require('../models/User');
const config = require('../config/config');

/**
 * Obtener lista de usuarios
 */
exports.getUsers = async (req, res) => {
    try {
        const { rol, estado, search, page = 1, limit = config.pagination.defaultLimit } = req.query;

        // Validar limit
        const parsedLimit = Math.min(parseInt(limit), config.pagination.maxLimit);
        const parsedPage = parseInt(page);
        const offset = (parsedPage - 1) * parsedLimit;

        // Construir filtros
        const filters = {
            ...(rol && { rol }),
            ...(estado && { estado }),
            ...(search && { search }),
            limit: parsedLimit,
            offset
        };

        // Obtener usuarios y total
        const usuarios = User.findAll(filters);
        const total = User.count({ rol, estado, search });

        res.json({
            usuarios,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            error: 'Error al obtener usuarios'
        });
    }
};

/**
 * Obtener un usuario por ID
 */
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({ usuario: user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            error: 'Error al obtener usuario'
        });
    }
};

/**
 * Crear nuevo usuario
 */
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, password, rol, estado } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                error: 'Nombre, email, contraseña y rol son requeridos'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar rol
        const rolesValidos = ['admin', 'gerente', 'recepcionista', 'mecanico'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                error: 'Rol inválido',
                rolesValidos
            });
        }

        // Verificar si el email ya existe
        if (User.emailExists(email)) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const newUser = await User.create({
            nombre,
            email,
            password,
            rol,
            estado: estado || 'activo'
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: newUser
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        res.status(500).json({
            error: 'Error al crear usuario'
        });
    }
};

/**
 * Actualizar usuario
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password, rol, estado } = req.body;

        // Verificar que el usuario existe
        const existingUser = User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Validar email si se está actualizando
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Formato de email inválido'
                });
            }

            // Verificar si el email ya existe (excluyendo el usuario actual)
            if (User.emailExists(email, id)) {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }
        }

        // Validar contraseña si se está actualizando
        if (password && password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar rol si se está actualizando
        if (rol) {
            const rolesValidos = ['admin', 'gerente', 'recepcionista', 'mecanico'];
            if (!rolesValidos.includes(rol)) {
                return res.status(400).json({
                    error: 'Rol inválido',
                    rolesValidos
                });
            }
        }

        // Actualizar usuario
        const updatedUser = await User.update(id, {
            ...(nombre && { nombre }),
            ...(email && { email }),
            ...(password && { password }),
            ...(rol && { rol }),
            ...(estado && { estado })
        });

        res.json({
            message: 'Usuario actualizado exitosamente',
            usuario: updatedUser
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar usuario'
        });
    }
};

/**
 * Eliminar usuario (soft delete)
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el usuario existe
        const existingUser = User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // No permitir eliminar el propio usuario
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                error: 'No puedes eliminar tu propio usuario'
            });
        }

        // Eliminar usuario
        const deleted = User.delete(id);

        if (!deleted) {
            return res.status(500).json({
                error: 'Error al eliminar usuario'
            });
        }

        res.json({
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            error: 'Error al eliminar usuario'
        });
    }
};
