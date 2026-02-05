const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Determinar la ruta de la base de datos
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'sysmecanica.db');

// Crear conexión a la base de datos
const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Configurar opciones de SQLite para mejor rendimiento
db.pragma('journal_mode = WAL'); // Write-Ahead Logging para mejor concurrencia
db.pragma('foreign_keys = ON'); // Habilitar llaves foráneas
db.pragma('synchronous = NORMAL'); // Balance entre seguridad y rendimiento

// Función para verificar si la base de datos está inicializada
function isDatabaseInitialized() {
    const result = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='usuarios'
    `).get();

    return !!result;
}

// Función para obtener información de la base de datos
function getDatabaseInfo() {
    const tables = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table'
        ORDER BY name
    `).all();

    return {
        path: DB_PATH,
        tables: tables.map(t => t.name),
        size: fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0
    };
}

// Función para cerrar la conexión
function closeDatabase() {
    db.close();
}

module.exports = {
    db,
    isDatabaseInitialized,
    getDatabaseInfo,
    closeDatabase
};
