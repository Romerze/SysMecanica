-- SysMecanica Database Schema
-- SQLite 3

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK(rol IN ('admin', 'gerente', 'recepcionista', 'mecanico')),
    estado VARCHAR(20) DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    identificacion VARCHAR(50) UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    notas TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INTEGER,
    placa VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(50) UNIQUE,
    color VARCHAR(30),
    kilometraje INTEGER,
    tipo VARCHAR(30),
    motor VARCHAR(50),
    transmision VARCHAR(30),
    notas TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabla de Mecánicos
CREATE TABLE IF NOT EXISTS mecanicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    identificacion VARCHAR(50) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    especialidad VARCHAR(100),
    fecha_ingreso DATE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0
);

-- Tabla de Servicios (Catálogo)
CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) CHECK(categoria IN ('mantenimiento', 'reparacion', 'diagnostico', 'otro')),
    precio DECIMAL(10, 2) NOT NULL,
    tiempo_estimado INTEGER,
    estado VARCHAR(20) DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0
);

-- Tabla de Repuestos (Inventario)
CREATE TABLE IF NOT EXISTS repuestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(50),
    categoria VARCHAR(50),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    precio_costo DECIMAL(10, 2),
    precio_venta DECIMAL(10, 2) NOT NULL,
    ubicacion VARCHAR(100),
    proveedor VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0
);

-- Tabla de Órdenes de Trabajo
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_orden VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    vehiculo_id INTEGER NOT NULL,
    mecanico_id INTEGER,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_promesa DATETIME,
    fecha_finalizacion DATETIME,
    fecha_entrega DATETIME,
    kilometraje INTEGER,
    estado VARCHAR(30) DEFAULT 'recibida' CHECK(estado IN ('recibida', 'diagnostico', 'cotizada', 'aprobada', 'reparacion', 'completada', 'entregada', 'cancelada')),
    diagnostico TEXT,
    observaciones TEXT,
    notas_internas TEXT,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuestos DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    usuario_creacion_id INTEGER,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id),
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id)
);

-- Tabla de Detalle de Servicios en Órdenes
CREATE TABLE IF NOT EXISTS detalle_orden_servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    mecanico_id INTEGER,
    tiempo_trabajado INTEGER,
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id)
);

-- Tabla de Detalle de Repuestos en Órdenes
CREATE TABLE IF NOT EXISTS detalle_orden_repuestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    repuesto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    FOREIGN KEY (repuesto_id) REFERENCES repuestos(id)
);

-- Tabla de Imágenes de Órdenes
CREATE TABLE IF NOT EXISTS orden_imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    orden_id INTEGER,
    cliente_id INTEGER NOT NULL,
    fecha_factura DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuestos DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'pagada', 'parcial', 'anulada')),
    forma_pago VARCHAR(30),
    notas TEXT,
    motivo_anulacion TEXT,
    usuario_creacion_id INTEGER,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminado INTEGER DEFAULT 0,
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id)
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id INTEGER NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    forma_pago VARCHAR(30) NOT NULL CHECK(forma_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque', 'otro')),
    referencia VARCHAR(100),
    notas TEXT,
    usuario_registro_id INTEGER,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id)
);

-- Tabla de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repuesto_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    motivo VARCHAR(100),
    referencia VARCHAR(100),
    orden_id INTEGER,
    usuario_id INTEGER,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    FOREIGN KEY (repuesto_id) REFERENCES repuestos(id),
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Configuraciones
CREATE TABLE IF NOT EXISTS configuraciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'string',
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabla VARCHAR(50) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK(accion IN ('crear', 'actualizar', 'eliminar')),
    usuario_id INTEGER,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip VARCHAR(50),
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_identificacion ON clientes(identificacion);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero ON ordenes_trabajo(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_vehiculo ON ordenes_trabajo(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes_trabajo(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_codigo ON repuestos(codigo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER IF NOT EXISTS update_clientes_timestamp
AFTER UPDATE ON clientes
BEGIN
    UPDATE clientes SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_vehiculos_timestamp
AFTER UPDATE ON vehiculos
BEGIN
    UPDATE vehiculos SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ordenes_timestamp
AFTER UPDATE ON ordenes_trabajo
BEGIN
    UPDATE ordenes_trabajo SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_usuarios_timestamp
AFTER UPDATE ON usuarios
BEGIN
    UPDATE usuarios SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
