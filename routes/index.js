import express from 'express'
// import userRouter from './users.js'; // Puedes descomentar esto cuando crees las rutas de usuario

const router = express.Router();

// Cuando una petición llegue a /api/rutinas, será manejada por rutinaRouter


// Cuando una petición llegue a /api/users, será manejada por userRouter
// router.use('/users', userRouter);


export default router;
