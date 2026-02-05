const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/rbac');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/vehiculos/search
 * @desc    Buscar vehículos (autocomplete)
 * @access  Private
 */
router.get('/search', vehiculoController.searchVehiculos);

/**
 * @route   GET /api/vehiculos/marcas
 * @desc    Obtener marcas disponibles
 * @access  Private
 */
router.get('/marcas', vehiculoController.getMarcas);

/**
 * @route   GET /api/vehiculos
 * @desc    Obtener lista de vehículos
 * @access  Private
 */
router.get('/', hasPermission('vehiculos', 'read'), vehiculoController.getVehiculos);

/**
 * @route   GET /api/vehiculos/:id
 * @desc    Obtener un vehículo por ID
 * @access  Private
 */
router.get('/:id', hasPermission('vehiculos', 'read'), vehiculoController.getVehiculo);

/**
 * @route   POST /api/vehiculos
 * @desc    Crear nuevo vehículo
 * @access  Private
 */
router.post('/', hasPermission('vehiculos', 'create'), vehiculoController.createVehiculo);

/**
 * @route   PUT /api/vehiculos/:id
 * @desc    Actualizar vehículo
 * @access  Private
 */
router.put('/:id', hasPermission('vehiculos', 'update'), vehiculoController.updateVehiculo);

/**
 * @route   DELETE /api/vehiculos/:id
 * @desc    Eliminar vehículo (soft delete)
 * @access  Private
 */
router.delete('/:id', hasPermission('vehiculos', 'delete'), vehiculoController.deleteVehiculo);

/**
 * @route   GET /api/vehiculos/:id/historial
 * @desc    Obtener historial de servicios del vehículo
 * @access  Private
 */
router.get('/:id/historial', hasPermission('vehiculos', 'read'), vehiculoController.getVehiculoHistorial);

module.exports = router;
