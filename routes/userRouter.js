// ARCHIVO: /routes/userRouter.js
import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

// --- NUEVA RUTA PARA OBTENER TODOS LOS USUARIOS (SOLO ADMIN) ---
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);

export default router;
