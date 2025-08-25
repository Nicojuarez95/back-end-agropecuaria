// ARCHIVO: /routes/ordenDeTrabajoRouter.js
import express from 'express';
import ordenDeTrabajoController from '../controllers/ordenDeTrabajoController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// --- Rutas Generales ---
router.route('/').post(authenticate, authorize('ADMIN'), upload, ordenDeTrabajoController.createOT);
router.route('/all').get(authenticate, authorize('ADMIN'), ordenDeTrabajoController.getAllOTs);
router.route('/mis-ots').get(authenticate, authorize('PROVEEDOR'), ordenDeTrabajoController.getOTsByProveedor);
router.route('/analysis/:razonSocialId').get(authenticate, authorize('ADMIN'), ordenDeTrabajoController.getCostAnalysisByRazonSocial);

// --- Rutas de OT específica ---
// CAMBIO CLAVE: Ahora tanto ADMIN como PROVEEDOR pueden exportar
router.route('/:id/export').get(authenticate, authorize('ADMIN', 'PROVEEDOR'), ordenDeTrabajoController.exportOT);

router.route('/:id/finalizar').patch(authenticate, authorize('PROVEEDOR'), ordenDeTrabajoController.finalizarOT);
router.route('/:id')
    .get(authenticate, authorize('ADMIN'), ordenDeTrabajoController.getOTById)
    .put(authenticate, authorize('ADMIN'), upload, ordenDeTrabajoController.updateOT)
    .delete(authenticate, authorize('ADMIN'), ordenDeTrabajoController.deleteOT);

export default router;
