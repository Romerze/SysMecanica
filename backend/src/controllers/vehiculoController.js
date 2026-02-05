const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');
const config = require('../config/config');

/**
 * Obtener lista de vehículos
 */
exports.getVehiculos = async (req, res) => {
    try {
        const {
            search, cliente_id, marca, tipo, page = 1,
            limit = config.pagination.defaultLimit, orderBy, orderDir
        } = req.query;

        const parsedLimit = Math.min(parseInt(limit), config.pagination.maxLimit);
        const parsedPage = parseInt(page);
        const offset = (parsedPage - 1) * parsedLimit;

        const filters = {
            ...(search && { search }),
            ...(cliente_id && { cliente_id }),
            ...(marca && { marca }),
            ...(tipo && { tipo }),
            ...(orderBy && { orderBy }),
            ...(orderDir && { orderDir }),
            limit: parsedLimit,
            offset
        };

        const vehiculos = Vehiculo.findAll(filters);
        const total = Vehiculo.count({ search, cliente_id, marca, tipo });

        res.json({
            vehiculos,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({
            error: 'Error al obtener vehículos'
        });
    }
};

/**
 * Obtener un vehículo por ID
 */
exports.getVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = Vehiculo.findById(id);

        if (!vehiculo) {
            return res.status(404).json({
                error: 'Vehículo no encontrado'
            });
        }

        res.json({ vehiculo });
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({
            error: 'Error al obtener vehículo'
        });
    }
};

/**
 * Crear nuevo vehículo
 */
exports.createVehiculo = async (req, res) => {
    try {
        const {
            cliente_id, marca, modelo, anio, placa, vin,
            color, kilometraje, tipo, motor, transmision, notas
        } = req.body;

        // Validar campos requeridos
        if (!cliente_id || !marca || !modelo || !placa) {
            return res.status(400).json({
                error: 'Cliente, marca, modelo y placa son requeridos'
            });
        }

        // Verificar que el cliente existe
        const cliente = Cliente.findById(cliente_id);
        if (!cliente) {
            return res.status(400).json({
                error: 'El cliente especificado no existe'
            });
        }

        // Verificar si la placa ya existe
        if (Vehiculo.placaExists(placa)) {
            return res.status(400).json({
                error: 'La placa ya está registrada'
            });
        }

        // Verificar si el VIN ya existe
        if (vin && Vehiculo.vinExists(vin)) {
            return res.status(400).json({
                error: 'El VIN ya está registrado'
            });
        }

        // Validar año si se proporciona
        if (anio) {
            const currentYear = new Date().getFullYear();
            if (anio < 1900 || anio > currentYear + 1) {
                return res.status(400).json({
                    error: `El año debe estar entre 1900 y ${currentYear + 1}`
                });
            }
        }

        // Crear vehículo
        const newVehiculo = Vehiculo.create({
            cliente_id, marca, modelo, anio, placa, vin,
            color, kilometraje, tipo, motor, transmision, notas
        });

        res.status(201).json({
            message: 'Vehículo creado exitosamente',
            vehiculo: newVehiculo
        });
    } catch (error) {
        console.error('Error al crear vehículo:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'Ya existe un vehículo con esa placa o VIN'
            });
        }

        res.status(500).json({
            error: 'Error al crear vehículo'
        });
    }
};

/**
 * Actualizar vehículo
 */
exports.updateVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cliente_id, marca, modelo, anio, placa, vin,
            color, kilometraje, tipo, motor, transmision, notas
        } = req.body;

        // Verificar que el vehículo existe
        const existingVehiculo = Vehiculo.findById(id);
        if (!existingVehiculo) {
            return res.status(404).json({
                error: 'Vehículo no encontrado'
            });
        }

        // Verificar cliente si se está actualizando
        if (cliente_id) {
            const cliente = Cliente.findById(cliente_id);
            if (!cliente) {
                return res.status(400).json({
                    error: 'El cliente especificado no existe'
                });
            }
        }

        // Verificar placa si se está actualizando
        if (placa && Vehiculo.placaExists(placa, id)) {
            return res.status(400).json({
                error: 'La placa ya está registrada'
            });
        }

        // Verificar VIN si se está actualizando
        if (vin && Vehiculo.vinExists(vin, id)) {
            return res.status(400).json({
                error: 'El VIN ya está registrado'
            });
        }

        // Validar año si se proporciona
        if (anio) {
            const currentYear = new Date().getFullYear();
            if (anio < 1900 || anio > currentYear + 1) {
                return res.status(400).json({
                    error: `El año debe estar entre 1900 y ${currentYear + 1}`
                });
            }
        }

        // Actualizar vehículo
        const updatedVehiculo = Vehiculo.update(id, {
            ...(cliente_id && { cliente_id }),
            ...(marca && { marca }),
            ...(modelo && { modelo }),
            ...(anio !== undefined && { anio }),
            ...(placa && { placa }),
            ...(vin !== undefined && { vin }),
            ...(color !== undefined && { color }),
            ...(kilometraje !== undefined && { kilometraje }),
            ...(tipo !== undefined && { tipo }),
            ...(motor !== undefined && { motor }),
            ...(transmision !== undefined && { transmision }),
            ...(notas !== undefined && { notas })
        });

        res.json({
            message: 'Vehículo actualizado exitosamente',
            vehiculo: updatedVehiculo
        });
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                error: 'Ya existe un vehículo con esa placa o VIN'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar vehículo'
        });
    }
};

/**
 * Eliminar vehículo (soft delete)
 */
exports.deleteVehiculo = async (req, res) => {
    try {
        const { id } = req.params;

        const existingVehiculo = Vehiculo.findById(id);
        if (!existingVehiculo) {
            return res.status(404).json({
                error: 'Vehículo no encontrado'
            });
        }

        const deleted = Vehiculo.delete(id);

        if (!deleted) {
            return res.status(500).json({
                error: 'Error al eliminar vehículo'
            });
        }

        res.json({
            message: 'Vehículo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        res.status(500).json({
            error: 'Error al eliminar vehículo'
        });
    }
};

/**
 * Obtener historial de servicios del vehículo
 */
exports.getVehiculoHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20 } = req.query;

        const vehiculo = Vehiculo.findById(id);
        if (!vehiculo) {
            return res.status(404).json({
                error: 'Vehículo no encontrado'
            });
        }

        const historial = Vehiculo.getHistorialServicios(id, parseInt(limit));

        res.json({ historial });
    } catch (error) {
        console.error('Error al obtener historial del vehículo:', error);
        res.status(500).json({
            error: 'Error al obtener historial del vehículo'
        });
    }
};

/**
 * Buscar vehículos (autocomplete)
 */
exports.searchVehiculos = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ vehiculos: [] });
        }

        const vehiculos = Vehiculo.search(q, parseInt(limit));

        res.json({ vehiculos });
    } catch (error) {
        console.error('Error al buscar vehículos:', error);
        res.status(500).json({
            error: 'Error al buscar vehículos'
        });
    }
};

/**
 * Obtener marcas disponibles
 */
exports.getMarcas = async (req, res) => {
    try {
        const marcas = Vehiculo.getMarcas();
        res.json({ marcas });
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({
            error: 'Error al obtener marcas'
        });
    }
};
