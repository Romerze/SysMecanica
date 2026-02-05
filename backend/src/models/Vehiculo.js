const { db } = require('../database/db');

class Vehiculo {
    /**
     * Buscar vehículo por ID
     */
    static findById(id) {
        const stmt = db.prepare(`
            SELECT v.*,
                   c.nombre as cliente_nombre,
                   c.apellido as cliente_apellido,
                   c.telefono as cliente_telefono
            FROM vehiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ? AND v.eliminado = 0
        `);
        return stmt.get(id);
    }

    /**
     * Buscar vehículo por placa
     */
    static findByPlaca(placa) {
        const stmt = db.prepare(`
            SELECT v.*,
                   c.nombre as cliente_nombre,
                   c.apellido as cliente_apellido
            FROM vehiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.placa = ? AND v.eliminado = 0
        `);
        return stmt.get(placa);
    }

    /**
     * Obtener todos los vehículos con filtros
     */
    static findAll(filters = {}) {
        let query = `
            SELECT v.id, v.cliente_id, v.marca, v.modelo, v.anio, v.placa,
                   v.color, v.tipo, v.kilometraje, v.fecha_registro,
                   c.nombre as cliente_nombre,
                   c.apellido as cliente_apellido,
                   c.telefono as cliente_telefono,
                   COUNT(DISTINCT o.id) as total_ordenes
            FROM vehiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN ordenes_trabajo o ON v.id = o.vehiculo_id AND o.eliminado = 0
            WHERE v.eliminado = 0
        `;

        const params = [];

        // Búsqueda por placa, marca, modelo o VIN
        if (filters.search) {
            query += ` AND (
                v.placa LIKE ? OR
                v.marca LIKE ? OR
                v.modelo LIKE ? OR
                v.vin LIKE ? OR
                c.nombre LIKE ? OR
                c.apellido LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Filtro por cliente
        if (filters.cliente_id) {
            query += ' AND v.cliente_id = ?';
            params.push(filters.cliente_id);
        }

        // Filtro por marca
        if (filters.marca) {
            query += ' AND v.marca = ?';
            params.push(filters.marca);
        }

        // Filtro por tipo
        if (filters.tipo) {
            query += ' AND v.tipo = ?';
            params.push(filters.tipo);
        }

        query += ' GROUP BY v.id';

        // Ordenar
        const orderBy = filters.orderBy || 'v.fecha_registro';
        const orderDir = filters.orderDir || 'DESC';
        query += ` ORDER BY ${orderBy} ${orderDir}`;

        // Paginación
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    /**
     * Contar vehículos
     */
    static count(filters = {}) {
        let query = `
            SELECT COUNT(*) as total
            FROM vehiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.eliminado = 0
        `;
        const params = [];

        if (filters.search) {
            query += ` AND (
                v.placa LIKE ? OR
                v.marca LIKE ? OR
                v.modelo LIKE ? OR
                v.vin LIKE ? OR
                c.nombre LIKE ? OR
                c.apellido LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.cliente_id) {
            query += ' AND v.cliente_id = ?';
            params.push(filters.cliente_id);
        }

        if (filters.marca) {
            query += ' AND v.marca = ?';
            params.push(filters.marca);
        }

        if (filters.tipo) {
            query += ' AND v.tipo = ?';
            params.push(filters.tipo);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return result.total;
    }

    /**
     * Crear nuevo vehículo
     */
    static create(vehiculoData) {
        const {
            cliente_id, marca, modelo, anio, placa, vin,
            color, kilometraje, tipo, motor, transmision, notas
        } = vehiculoData;

        const stmt = db.prepare(`
            INSERT INTO vehiculos (
                cliente_id, marca, modelo, anio, placa, vin,
                color, kilometraje, tipo, motor, transmision, notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            cliente_id, marca, modelo, anio || null, placa,
            vin || null, color || null, kilometraje || null,
            tipo || null, motor || null, transmision || null, notas || null
        );

        return this.findById(result.lastInsertRowid);
    }

    /**
     * Actualizar vehículo
     */
    static update(id, vehiculoData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'cliente_id', 'marca', 'modelo', 'anio', 'placa', 'vin',
            'color', 'kilometraje', 'tipo', 'motor', 'transmision', 'notas'
        ];

        allowedFields.forEach(field => {
            if (vehiculoData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(vehiculoData[field] || null);
            }
        });

        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        values.push(id);

        const query = `
            UPDATE vehiculos
            SET ${fields.join(', ')}
            WHERE id = ? AND eliminado = 0
        `;

        const stmt = db.prepare(query);
        stmt.run(...values);

        return this.findById(id);
    }

    /**
     * Eliminar vehículo (soft delete)
     */
    static delete(id) {
        const stmt = db.prepare(`
            UPDATE vehiculos
            SET eliminado = 1
            WHERE id = ?
        `);

        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Obtener historial de servicios del vehículo
     */
    static getHistorialServicios(vehiculoId, limit = 20) {
        const stmt = db.prepare(`
            SELECT o.id, o.numero_orden, o.fecha_ingreso, o.fecha_finalizacion,
                   o.estado, o.kilometraje, o.total, o.diagnostico,
                   m.nombre as mecanico_nombre,
                   m.apellido as mecanico_apellido
            FROM ordenes_trabajo o
            LEFT JOIN mecanicos m ON o.mecanico_id = m.id
            WHERE o.vehiculo_id = ? AND o.eliminado = 0
            ORDER BY o.fecha_ingreso DESC
            LIMIT ?
        `);

        return stmt.all(vehiculoId, limit);
    }

    /**
     * Verificar si existe placa (excluyendo un ID específico)
     */
    static placaExists(placa, excludeId = null) {
        let query = 'SELECT id FROM vehiculos WHERE placa = ? AND eliminado = 0';
        const params = [placa];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return !!result;
    }

    /**
     * Verificar si existe VIN (excluyendo un ID específico)
     */
    static vinExists(vin, excludeId = null) {
        if (!vin) return false;

        let query = 'SELECT id FROM vehiculos WHERE vin = ? AND eliminado = 0';
        const params = [vin];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return !!result;
    }

    /**
     * Buscar vehículos para autocomplete
     */
    static search(term, limit = 10) {
        const stmt = db.prepare(`
            SELECT v.id, v.placa, v.marca, v.modelo, v.anio,
                   c.nombre as cliente_nombre,
                   c.apellido as cliente_apellido
            FROM vehiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.eliminado = 0
            AND (v.placa LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ?)
            ORDER BY v.placa ASC
            LIMIT ?
        `);

        const searchTerm = `%${term}%`;
        return stmt.all(searchTerm, searchTerm, searchTerm, limit);
    }

    /**
     * Obtener marcas únicas
     */
    static getMarcas() {
        const stmt = db.prepare(`
            SELECT DISTINCT marca
            FROM vehiculos
            WHERE eliminado = 0 AND marca IS NOT NULL
            ORDER BY marca ASC
        `);

        return stmt.all().map(row => row.marca);
    }
}

module.exports = Vehiculo;
