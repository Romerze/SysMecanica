const { db } = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Buscar usuario por ID
     */
    static findById(id) {
        const stmt = db.prepare(`
            SELECT id, nombre, email, rol, estado, fecha_creacion, fecha_actualizacion
            FROM usuarios
            WHERE id = ? AND eliminado = 0
        `);
        return stmt.get(id);
    }

    /**
     * Buscar usuario por email
     */
    static findByEmail(email) {
        const stmt = db.prepare(`
            SELECT id, nombre, email, password_hash, rol, estado, fecha_creacion
            FROM usuarios
            WHERE email = ? AND eliminado = 0
        `);
        return stmt.get(email);
    }

    /**
     * Obtener todos los usuarios
     */
    static findAll(filters = {}) {
        let query = `
            SELECT id, nombre, email, rol, estado, fecha_creacion, fecha_actualizacion
            FROM usuarios
            WHERE eliminado = 0
        `;

        const params = [];

        // Filtro por rol
        if (filters.rol) {
            query += ' AND rol = ?';
            params.push(filters.rol);
        }

        // Filtro por estado
        if (filters.estado) {
            query += ' AND estado = ?';
            params.push(filters.estado);
        }

        // Búsqueda por nombre o email
        if (filters.search) {
            query += ' AND (nombre LIKE ? OR email LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        // Ordenar
        query += ' ORDER BY fecha_creacion DESC';

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
     * Contar usuarios
     */
    static count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM usuarios WHERE eliminado = 0';
        const params = [];

        if (filters.rol) {
            query += ' AND rol = ?';
            params.push(filters.rol);
        }

        if (filters.estado) {
            query += ' AND estado = ?';
            params.push(filters.estado);
        }

        if (filters.search) {
            query += ' AND (nombre LIKE ? OR email LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return result.total;
    }

    /**
     * Crear nuevo usuario
     */
    static async create(userData) {
        const { nombre, email, password, rol, estado = 'activo' } = userData;

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        const stmt = db.prepare(`
            INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = stmt.run(nombre, email, passwordHash, rol, estado);
        return this.findById(result.lastInsertRowid);
    }

    /**
     * Actualizar usuario
     */
    static async update(id, userData) {
        const fields = [];
        const values = [];

        // Campos permitidos para actualizar
        if (userData.nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(userData.nombre);
        }

        if (userData.email !== undefined) {
            fields.push('email = ?');
            values.push(userData.email);
        }

        if (userData.password !== undefined) {
            const passwordHash = await bcrypt.hash(userData.password, 10);
            fields.push('password_hash = ?');
            values.push(passwordHash);
        }

        if (userData.rol !== undefined) {
            fields.push('rol = ?');
            values.push(userData.rol);
        }

        if (userData.estado !== undefined) {
            fields.push('estado = ?');
            values.push(userData.estado);
        }

        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        values.push(id);

        const query = `
            UPDATE usuarios
            SET ${fields.join(', ')}
            WHERE id = ? AND eliminado = 0
        `;

        const stmt = db.prepare(query);
        stmt.run(...values);

        return this.findById(id);
    }

    /**
     * Eliminar usuario (soft delete)
     */
    static delete(id) {
        const stmt = db.prepare(`
            UPDATE usuarios
            SET eliminado = 1
            WHERE id = ?
        `);

        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Verificar contraseña
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Cambiar contraseña
     */
    static async changePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);

        const stmt = db.prepare(`
            UPDATE usuarios
            SET password_hash = ?
            WHERE id = ? AND eliminado = 0
        `);

        stmt.run(passwordHash, id);
        return true;
    }

    /**
     * Verificar si un email ya existe
     */
    static emailExists(email, excludeId = null) {
        let query = 'SELECT id FROM usuarios WHERE email = ? AND eliminado = 0';
        const params = [email];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        const result = stmt.get(...params);
        return !!result;
    }
}

module.exports = User;
