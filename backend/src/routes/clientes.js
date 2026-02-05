const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/rbac');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/clientes/search
 * @desc    Buscar clientes (autocomplete)
 * @access  Private
 */
router.get('/search', clienteController.searchClientes);

/**
 * @route   GET /api/clientes
 * @desc    Obtener lista de clientes
 * @access  Private
 */
router.get('/', hasPermission('clientes', 'read'), clienteController.getClientes);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obtener un cliente por ID
 * @access  Private
 */
router.get('/:id', hasPermission('clientes', 'read'), clienteController.getCliente);

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Private
 */
router.post('/', hasPermission('clientes', 'create'), clienteController.createCliente);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Actualizar cliente
 * @access  Private
 */
router.put('/:id', hasPermission('clientes', 'update'), clienteController.updateCliente);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Eliminar cliente (soft delete)
 * @access  Private
 */
router.delete('/:id', hasPermission('clientes', 'delete'), clienteController.deleteCliente);

/**
 * @route   GET /api/clientes/:id/vehiculos
 * @desc    Obtener vehículos del cliente
 * @access  Private
 */
router.get('/:id/vehiculos', hasPermission('clientes', 'read'), clienteController.getClienteVehiculos);

/**
 * @route   GET /api/clientes/:id/historial
 * @desc    Obtener historial de servicios del cliente
 * @access  Private
 */
router.get('/:id/historial', hasPermission('clientes', 'read'), clienteController.getClienteHistorial);

module.exports = router;
