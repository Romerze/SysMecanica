const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const config = require('./config/config');
const { isDatabaseInitialized } = require('./database/db');

// Crear aplicación Express
const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors(config.cors));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de salud (health check)
app.get('/health', (req, res) => {
    const dbInitialized = isDatabaseInitialized();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.env,
        database: dbInitialized ? 'connected' : 'not initialized'
    });
});

// Rutas de API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vehiculos', require('./routes/vehiculos'));

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'SysMecanica API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            clientes: '/api/clientes',
            vehiculos: '/api/vehiculos'
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.message
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }

    // Error de base de datos SQLite
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({
            error: 'Violación de restricción de base de datos',
            details: err.message
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(config.env === 'development' && { stack: err.stack })
    });
});

// Iniciar servidor
const PORT = config.port;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('\n🚀 SysMecanica API Server');
        console.log(`📡 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${config.env}`);
        console.log(`📊 Database: ${isDatabaseInitialized() ? '✅ Connected' : '❌ Not initialized'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
    });
}

module.exports = app;
