import multer from 'multer';
import path from 'path';

// Configuración de Multer para guardar el archivo temporalmente en memoria
const storage = multer.memoryStorage();

// Middleware de Multer
const upload = multer({
    storage: storage,
    // Filtro para aceptar solo ciertos tipos de archivos de imagen
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: El archivo debe ser una imagen válida (jpeg, jpg, png, gif)"));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
}).single('imagen'); // 'imagen' es el nombre del campo en el formulario

export default upload;
