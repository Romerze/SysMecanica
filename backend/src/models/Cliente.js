const { db } = require('../database/db');

class Cliente {
    /**
     * Buscar cliente por ID
     */
    static findById(id) {
        const stmt = db.prepare(`
            SELECT id, nombre, apellido, identificacion, email, telefono, celular,
                   direccion, ciudad, notas, fecha_registro, fecha_actualizacion
            FROM clientes
            WHERE id = ? AND eliminado = 0
        `);
        return stmt.get(id);
    }

    /**
     * Buscar cliente por identificación
     */
    static findByIdentificacion(identificacion) {
        const stmt = db.prepare(`
            SELECT id, nombre, apellido, identificacion, email, telefono, celular,
                   direccion, ciudad, notas, fecha_registro
            FROM clientes
            WHERE identificacion = ? AND eliminado = 0
        `);
        return stmt.get(identificacion);
    }

    /**
     * Obtener todos los clientes con filtros
     */
    static findAll(filters = {}) {
        let query = `
            SELECT c.id, c.nombre, c.apellido, c.identificacion, c.email,
                   c.telefono, c.celular, c.ciudad, c.fecha_registro,
                   COUNT(DISTINCT v.id) as total_vehiculos,
                   COUNT(DISTINCT o.id) as total_ordenes
            FROM clientes c
            LEFT JOIN vehiculos v ON c.id = v.cliente_id AND v.eliminado = 0
            LEFT JOIN ordenes_trabajo o ON c.id = o.cliente_id AND o.eliminado = 0
            WHERE c.eliminado = 0
        `;

        const params = [];

        // Búsqueda por nombre, apellido, identificación o email
        if (filters.search) {
            query += ` AND (
                c.nombre LIKE ? OR
                c.apellido LIKE ? OR
                c.identificacion LIKE ? OR
                c.email LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Filtro por ciudad
        if (filters.ciudad) {
            query += ' AND c.ciudad = ?';
            params.push(filters.ciudad);
        }

        query += ' GROUP BY c.id';

        // Ordenar
        const orderBy = filters.orderBy || 'fecha_registro';
        const orderDir = filters.orderDir || 'DESC';
        query += ` ORDER BY c.${orderBy} ${orderDir}`;

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
     * Contar clientes
     */
    static count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM clientes WHERE eliminado = 0';
        const params = [];

        if (filters.search) {
            query += ` AND (
                nombre LIKE ? OR
                apellido LIKE ? OR
                identificacion LIKE ? OR
                email LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.ciudad) {
            query += ' AND ciudad = ?';
            params.push(filters.ciudad);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return result.total;
    }

    /**
     * Crear nuevo cliente
     */
    static create(clienteData) {
        const {
            nombre, apellido, identificacion, email, telefono,
            celular, direccion, ciudad, notas
        } = clienteData;

        const stmt = db.prepare(`
            INSERT INTO clientes (
                nombre, apellido, identificacion, email, telefono,
                celular, direccion, ciudad, notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            nombre, apellido, identificacion || null, email || null,
            telefono || null, celular || null, direccion || null,
            ciudad || null, notas || null
        );

        return this.findById(result.lastInsertRowid);
    }

    /**
     * Actualizar cliente
     */
    static update(id, clienteData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'nombre', 'apellido', 'identificacion', 'email', 'telefono',
            'celular', 'direccion', 'ciudad', 'notas'
        ];

        allowedFields.forEach(field => {
            if (clienteData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(clienteData[field] || null);
            }
        });

        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        values.push(id);

        const query = `
            UPDATE clientes
            SET ${fields.join(', ')}
            WHERE id = ? AND eliminado = 0
        `;

        const stmt = db.prepare(query);
        stmt.run(...values);

        return this.findById(id);
    }

    /**
     * Eliminar cliente (soft delete)
     */
    static delete(id) {
        const stmt = db.prepare(`
            UPDATE clientes
            SET eliminado = 1
            WHERE id = ?
        `);

        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Obtener vehículos del cliente
     */
    static getVehiculos(clienteId) {
        const stmt = db.prepare(`
            SELECT v.id, v.marca, v.modelo, v.anio, v.placa, v.vin,
                   v.color, v.kilometraje, v.tipo, v.fecha_registro,
                   COUNT(o.id) as total_ordenes
            FROM vehiculos v
            LEFT JOIN ordenes_trabajo o ON v.id = o.vehiculo_id AND o.eliminado = 0
            WHERE v.cliente_id = ? AND v.eliminado = 0
            GROUP BY v.id
            ORDER BY v.fecha_registro DESC
        `);

        return stmt.all(clienteId);
    }

    /**
     * Obtener historial de servicios del cliente
     */
    static getHistorialServicios(clienteId, limit = 10) {
        const stmt = db.prepare(`
            SELECT o.id, o.numero_orden, o.fecha_ingreso, o.fecha_finalizacion,
                   o.estado, o.total, o.diagnostico,
                   v.marca, v.modelo, v.placa
            FROM ordenes_trabajo o
            INNER JOIN vehiculos v ON o.vehiculo_id = v.id
            WHERE o.cliente_id = ? AND o.eliminado = 0
            ORDER BY o.fecha_ingreso DESC
            LIMIT ?
        `);

        return stmt.all(clienteId, limit);
    }

    /**
     * Verificar si existe identificación (excluyendo un ID específico)
     */
    static identificacionExists(identificacion, excludeId = null) {
        if (!identificacion) return false;

        let query = 'SELECT id FROM clientes WHERE identificacion = ? AND eliminado = 0';
        const params = [identificacion];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return !!result;
    }

    /**
     * Verificar si existe email (excluyendo un ID específico)
     */
    static emailExists(email, excludeId = null) {
        if (!email) return false;

        let query = 'SELECT id FROM clientes WHERE email = ? AND eliminado = 0';
        const params = [email];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return !!result;
    }

    /**
     * Buscar clientes para autocomplete
     */
    static search(term, limit = 10) {
        const stmt = db.prepare(`
            SELECT id, nombre, apellido, identificacion, telefono, celular
            FROM clientes
            WHERE eliminado = 0
            AND (nombre LIKE ? OR apellido LIKE ? OR identificacion LIKE ?)
            ORDER BY nombre ASC
            LIMIT ?
        `);

        const searchTerm = `%${term}%`;
        return stmt.all(searchTerm, searchTerm, searchTerm, limit);
    }
}

module.exports = Cliente;
