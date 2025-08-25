import express from 'express';
import managementController from '../controllers/managementController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Todas las rutas de este archivo requieren autenticación y rol de ADMIN
router.use(authenticate, authorize('ADMIN'));

// Rutas para Proveedores
router.route('/proveedores')
    .post(managementController.createProveedor)
    .get(managementController.getAllProveedores);

// Rutas para Razones Sociales
router.route('/razones-sociales')
    .post(managementController.createRazonSocial)
    .get(managementController.getAllRazonesSociales);

// Rutas para Campos
router.route('/campos')
    .post(managementController.createCampo)
    .get(managementController.getAllCampos);

// Rutas para Labores
router.route('/labores')
    .post(managementController.createLabor)
    .get(managementController.getAllLabores);

// Rutas para Insumos
router.route('/insumos')
    .post(managementController.createInsumo)
    .get(managementController.getAllInsumos);

// ¡Esta es la línea clave que probablemente te falta!
export default router;