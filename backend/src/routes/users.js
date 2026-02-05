const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Obtener lista de usuarios
 * @access  Private (Admin)
 */
router.get('/', requireAdmin, userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Private (Admin)
 */
router.get('/:id', requireAdmin, userController.getUser);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario
 * @access  Private (Admin)
 */
router.post('/', requireAdmin, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Admin)
 */
router.put('/:id', requireAdmin, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;
