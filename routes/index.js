import express from 'express';
import userRouter from './userRouter.js';
import ordenDeTrabajoRouter from './ordenDeTrabajoRouter.js';
import managementRouter from './managementRouter.js'; // <-- AÑADIDO

const router = express.Router();

// Cuando una petición llegue a /api/users, será manejada por userRouter
router.use('/users', userRouter);

// Cuando una petición llegue a /api/ots, será manejada por ordenDeTrabajoRouter
router.use('/ots', ordenDeTrabajoRouter);

// Cuando una petición llegue a /api/management, será manejada por managementRouter
router.use('/management', managementRouter); // <-- AÑADIDO

export default router;