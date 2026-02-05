const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { db, isDatabaseInitialized, getDatabaseInfo } = require('./db');

async function initializeDatabase() {
    console.log('🔧 Inicializando base de datos SysMecanica...\n');

    try {
        // Verificar si ya está inicializada
        if (isDatabaseInitialized()) {
            console.log('⚠️  La base de datos ya está inicializada.');
            console.log('ℹ️  Si deseas reiniciarla, elimina el archivo .db y ejecuta este script nuevamente.\n');

            const info = getDatabaseInfo();
            console.log('📊 Información de la base de datos:');
            console.log(`   Ruta: ${info.path}`);
            console.log(`   Tamaño: ${(info.size / 1024).toFixed(2)} KB`);
            console.log(`   Tablas: ${info.tables.length}`);
            console.log(`   ${info.tables.join(', ')}\n`);

            return;
        }

        // Leer el schema SQL
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Ejecutar el schema
        console.log('📝 Creando tablas...');
        db.exec(schema);
        console.log('✅ Tablas creadas exitosamente\n');

        // Insertar datos iniciales
        await insertInitialData();

        // Mostrar información final
        const info = getDatabaseInfo();
        console.log('\n✅ Base de datos inicializada correctamente!\n');
        console.log('📊 Información de la base de datos:');
        console.log(`   Ruta: ${info.path}`);
        console.log(`   Tablas creadas: ${info.tables.length}`);
        console.log(`   ${info.tables.join(', ')}\n`);

        console.log('👤 Usuario administrador creado:');
        console.log('   Email: admin@sysmecanica.com');
        console.log('   Contraseña: admin123');
        console.log('   ⚠️  IMPORTANTE: Cambiar esta contraseña en producción\n');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
}

async function insertInitialData() {
    console.log('📦 Insertando datos iniciales...\n');

    // Hash de la contraseña del admin
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insertar usuario administrador
    const insertUser = db.prepare(`
        INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('Administrador', 'admin@sysmecanica.com', passwordHash, 'admin', 'activo');
    console.log('✅ Usuario administrador creado');

    // Insertar configuraciones iniciales
    const insertConfig = db.prepare(`
        INSERT INTO configuraciones (clave, valor, descripcion, tipo)
        VALUES (?, ?, ?, ?)
    `);

    const configs = [
        ['nombre_taller', 'Taller Mecánico SysMecanica', 'Nombre del taller', 'string'],
        ['direccion', '', 'Dirección del taller', 'string'],
        ['telefono', '', 'Teléfono de contacto', 'string'],
        ['email', 'contacto@sysmecanica.com', 'Email de contacto', 'string'],
        ['impuesto_iva', '19', 'Porcentaje de IVA', 'number'],
        ['moneda', 'COP', 'Moneda del sistema', 'string'],
        ['formato_orden', 'ORD-{YYYY}-{NNNN}', 'Formato de número de orden', 'string'],
        ['formato_factura', 'FAC-{YYYY}-{NNNN}', 'Formato de número de factura', 'string']
    ];

    configs.forEach(config => {
        insertConfig.run(...config);
    });
    console.log('✅ Configuraciones iniciales creadas');

    // Insertar algunos servicios de ejemplo
    const insertServicio = db.prepare(`
        INSERT INTO servicios (codigo, nombre, descripcion, categoria, precio, tiempo_estimado)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const servicios = [
        ['SRV-001', 'Cambio de Aceite', 'Cambio de aceite de motor y filtro', 'mantenimiento', 80000, 30],
        ['SRV-002', 'Alineación', 'Alineación de dirección', 'mantenimiento', 50000, 45],
        ['SRV-003', 'Balanceo', 'Balanceo de llantas', 'mantenimiento', 40000, 30],
        ['SRV-004', 'Revisión General', 'Revisión general del vehículo', 'diagnostico', 60000, 60],
        ['SRV-005', 'Cambio de Pastillas de Freno', 'Reemplazo de pastillas de freno delanteras', 'reparacion', 120000, 90]
    ];

    servicios.forEach(servicio => {
        insertServicio.run(...servicio);
    });
    console.log('✅ Servicios de ejemplo creados');

    // Insertar algunos repuestos de ejemplo
    const insertRepuesto = db.prepare(`
        INSERT INTO repuestos (codigo, nombre, descripcion, marca, categoria, stock_actual, stock_minimo, precio_costo, precio_venta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const repuestos = [
        ['REP-001', 'Filtro de Aceite', 'Filtro de aceite estándar', 'FRAM', 'Filtros', 10, 5, 15000, 25000],
        ['REP-002', 'Aceite Motor 5W30', 'Aceite sintético 5W30 - 4L', 'Castrol', 'Lubricantes', 15, 8, 45000, 75000],
        ['REP-003', 'Pastillas de Freno Delanteras', 'Juego de pastillas delanteras', 'Brembo', 'Frenos', 8, 4, 80000, 130000],
        ['REP-004', 'Batería 12V', 'Batería 12V 60Ah', 'Bosch', 'Eléctrico', 5, 2, 250000, 380000],
        ['REP-005', 'Llanta 185/65 R15', 'Llanta radial 185/65 R15', 'Michelin', 'Llantas', 12, 6, 280000, 420000]
    ];

    repuestos.forEach(repuesto => {
        insertRepuesto.run(...repuesto);
    });
    console.log('✅ Repuestos de ejemplo creados');

    // Insertar un mecánico de ejemplo
    const insertMecanico = db.prepare(`
        INSERT INTO mecanicos (nombre, apellido, identificacion, telefono, especialidad, fecha_ingreso, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertMecanico.run('Juan', 'Pérez', '1234567890', '3001234567', 'Mecánica General', '2024-01-15', 'activo');
    console.log('✅ Mecánico de ejemplo creado');

    console.log('\n✅ Datos iniciales insertados correctamente');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('🎉 Proceso completado exitosamente!\n');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
