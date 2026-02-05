/**
 * Middleware de Control de Acceso Basado en Roles (RBAC)
 */

/**
 * Verificar si el usuario tiene uno de los roles permitidos
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado'
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'No tiene permisos para realizar esta acción',
                requiredRoles: allowedRoles,
                userRole: req.user.rol
            });
        }

        next();
    };
};

/**
 * Verificar si el usuario es administrador
 */
const requireAdmin = requireRole('admin');

/**
 * Verificar si el usuario es administrador o gerente
 */
const requireManager = requireRole('admin', 'gerente');

/**
 * Verificar si el usuario puede gestionar órdenes de trabajo
 */
const canManageOrders = requireRole('admin', 'gerente', 'recepcionista');

/**
 * Verificar si el usuario puede ver reportes
 */
const canViewReports = requireRole('admin', 'gerente');

/**
 * Verificar si el usuario es el propietario del recurso o tiene permisos de admin
 */
const requireOwnerOrAdmin = (getUserIdFromRequest) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado'
            });
        }

        const resourceUserId = getUserIdFromRequest(req);
        const isOwner = req.user.id === resourceUserId;
        const isAdmin = req.user.rol === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'No tiene permisos para acceder a este recurso'
            });
        }

        next();
    };
};

/**
 * Definición de permisos por rol
 */
const PERMISSIONS = {
    admin: {
        users: ['create', 'read', 'update', 'delete'],
        clientes: ['create', 'read', 'update', 'delete'],
        vehiculos: ['create', 'read', 'update', 'delete'],
        ordenes: ['create', 'read', 'update', 'delete', 'assign'],
        servicios: ['create', 'read', 'update', 'delete'],
        repuestos: ['create', 'read', 'update', 'delete'],
        facturas: ['create', 'read', 'update', 'delete', 'cancel'],
        reportes: ['read', 'export'],
        configuraciones: ['read', 'update']
    },
    gerente: {
        users: ['read'],
        clientes: ['create', 'read', 'update'],
        vehiculos: ['create', 'read', 'update'],
        ordenes: ['create', 'read', 'update', 'assign'],
        servicios: ['read', 'update'],
        repuestos: ['create', 'read', 'update'],
        facturas: ['create', 'read', 'cancel'],
        reportes: ['read', 'export'],
        configuraciones: ['read']
    },
    recepcionista: {
        users: [],
        clientes: ['create', 'read', 'update'],
        vehiculos: ['create', 'read', 'update'],
        ordenes: ['create', 'read', 'update'],
        servicios: ['read'],
        repuestos: ['read'],
        facturas: ['create', 'read'],
        reportes: [],
        configuraciones: []
    },
    mecanico: {
        users: [],
        clientes: ['read'],
        vehiculos: ['read'],
        ordenes: ['read', 'update'],
        servicios: ['read'],
        repuestos: ['read'],
        facturas: [],
        reportes: [],
        configuraciones: []
    }
};

/**
 * Verificar si el usuario tiene un permiso específico
 */
const hasPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado'
            });
        }

        const userPermissions = PERMISSIONS[req.user.rol];

        if (!userPermissions || !userPermissions[resource]) {
            return res.status(403).json({
                error: 'No tiene permisos para acceder a este recurso'
            });
        }

        if (!userPermissions[resource].includes(action)) {
            return res.status(403).json({
                error: `No tiene permiso para ${action} en ${resource}`
            });
        }

        next();
    };
};

module.exports = {
    requireRole,
    requireAdmin,
    requireManager,
    canManageOrders,
    canViewReports,
    requireOwnerOrAdmin,
    hasPermission,
    PERMISSIONS
};
