import express from 'express';
import 'dotenv/config.js';
import './config/database.js'; // Se ejecuta para conectar a la DB
import indexRouter from './routes/index.js'; // Importa el enrutador principal
import path from 'path';
import { __dirname } from './utils.js'; // Utilidad para obtener el directorio actual
import cors from "cors";

let app = express();

// Configuración del motor de vistas (si lo necesitas para renderizar HTML/EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.json()); // Para parsear bodies JSON
app.use(cors()); // Para permitir peticiones de otros orígenes

// Ruta principal de la API
app.use('/api', indexRouter);

export default app;
