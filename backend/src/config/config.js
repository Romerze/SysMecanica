require('dotenv').config();

module.exports = {
    // Server
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',

    // Database
    database: {
        path: process.env.DB_PATH || './src/database/sysmecanica.db'
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    // Upload
    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
        path: process.env.UPLOAD_PATH || './uploads',
        allowedMimes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
        credentials: true
    },

    // Rate Limiting
    rateLimit: {
        windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutos
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Pagination
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },

    // Backup
    backup: {
        path: './backups',
        autoBackup: true,
        interval: '0 2 * * *' // Diariamente a las 2 AM
    }
};
