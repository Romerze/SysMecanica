const Cliente = require('../models/Cliente');
const config = require('../config/config');

/**
 * Obtener lista de clientes
 */
exports.getClientes = async (req, res) => {
    try {
        const {
            search, ciudad, page = 1, limit = config.pagination.defaultLimit,
            orderBy, orderDir
        } = req.query;

        const parsedLimit = Math.min(parseInt(limit), config.pagination.maxLimit);
        const parsedPage = parseInt(page);
        const offset = (parsedPage - 1) * parsedLimit;

        const filters = {
            ...(search && { search }),
            ...(ciudad && { ciudad }),
            ...(orderBy && { orderBy }),
            ...(orderDir && { orderDir }),
            limit: parsedLimit,
            offset
        };

        const clientes = Cliente.findAll(filters);
        const total = Cliente.count({ search, ciudad });

        res.json({
            clientes,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            error: 'Error al obtener clientes'
        });
    }
};

/**
 * Obtener un cliente por ID
 */
exports.getCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = Cliente.findById(id);

        if (!cliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        res.json({ cliente });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            error: 'Error al obtener cliente'
        });
    }
};

/**
 * Crear nuevo cliente
 */
exports.createCliente = async (req, res) => {
    try {
        const {
            nombre, apellido, identificacion, email, telefono,
            celular, direccion, ciudad, notas
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !apellido) {
            return res.status(400).json({
                error: 'Nombre y apellido son requeridos'
            });
        }

        // Validar email si se proporciona
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Formato de email inválido'
                });
            }

            // Verificar si el email ya existe
            if (Cliente.emailExists(email)) {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }
        }

        // Verificar si la identificación ya existe
        if (identificacion && Cliente.identificacionExists(identificacion)) {
            return res.status(400).json({
                error: 'La identificación ya está registrada'
            });
        }

        // Crear cliente
        const newCliente = Cliente.create({
            nombre, apellido, identificacion, email, telefono,
            celular, direccion, ciudad, notas
        });

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            cliente: newCliente
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'Ya existe un cliente con esa identificación o email'
            });
        }

        res.status(500).json({
            error: 'Error al crear cliente'
        });
    }
};

/**
 * Actualizar cliente
 */
exports.updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre, apellido, identificacion, email, telefono,
            celular, direccion, ciudad, notas
        } = req.body;

        // Verificar que el cliente existe
        const existingCliente = Cliente.findById(id);
        if (!existingCliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
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

            if (Cliente.emailExists(email, id)) {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }
        }

        // Verificar identificación si se está actualizando
        if (identificacion && Cliente.identificacionExists(identificacion, id)) {
            return res.status(400).json({
                error: 'La identificación ya está registrada'
            });
        }

        // Actualizar cliente
        const updatedCliente = Cliente.update(id, {
            ...(nombre && { nombre }),
            ...(apellido && { apellido }),
            ...(identificacion !== undefined && { identificacion }),
            ...(email !== undefined && { email }),
            ...(telefono !== undefined && { telefono }),
            ...(celular !== undefined && { celular }),
            ...(direccion !== undefined && { direccion }),
            ...(ciudad !== undefined && { ciudad }),
            ...(notas !== undefined && { notas })
        });

        res.json({
            message: 'Cliente actualizado exitosamente',
            cliente: updatedCliente
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'Ya existe un cliente con esa identificación o email'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar cliente'
        });
    }
};

/**
 * Eliminar cliente (soft delete)
 */
exports.deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const existingCliente = Cliente.findById(id);
        if (!existingCliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        const deleted = Cliente.delete(id);

        if (!deleted) {
            return res.status(500).json({
                error: 'Error al eliminar cliente'
            });
        }

        res.json({
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            error: 'Error al eliminar cliente'
        });
    }
};

/**
 * Obtener vehículos del cliente
 */
exports.getClienteVehiculos = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        const vehiculos = Cliente.getVehiculos(id);

        res.json({ vehiculos });
    } catch (error) {
        console.error('Error al obtener vehículos del cliente:', error);
        res.status(500).json({
            error: 'Error al obtener vehículos del cliente'
        });
    }
};

/**
 * Obtener historial de servicios del cliente
 */
exports.getClienteHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;

        const cliente = Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        const historial = Cliente.getHistorialServicios(id, parseInt(limit));

        res.json({ historial });
    } catch (error) {
        console.error('Error al obtener historial del cliente:', error);
        res.status(500).json({
            error: 'Error al obtener historial del cliente'
        });
    }
};

/**
 * Buscar clientes (autocomplete)
 */
exports.searchClientes = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ clientes: [] });
        }

        const clientes = Cliente.search(q, parseInt(limit));

        res.json({ clientes });
    } catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({
            error: 'Error al buscar clientes'
        });
    }
};
