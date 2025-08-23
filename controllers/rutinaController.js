import Rutina from '../models/Rutina.js';

const rutinaController = {
    /**
     * @desc    Crear una nueva rutina asociada a un usuario.
     * @route   POST /api/rutinas
     * @access  Private
     */
    crearRutina: async (req, res, next) => {
        try {
            const { nombreRutina, tipoSplit, dias } = req.body;
            const usuarioId = req.user.id; // Asumimos que el ID del usuario viene del middleware de auth

            // Validación básica
            if (!nombreRutina || !tipoSplit) {
                return res.status(400).json({ success: false, message: 'El nombre y el tipo de split de la rutina son requeridos.' });
            }

            const nuevaRutina = await Rutina.create({
                nombreRutina,
                tipoSplit,
                dias: dias || [], // Si no se envían días, se crea un array vacío
                usuario: usuarioId
            });

            return res.status(201).json({
                success: true,
                message: 'Rutina creada exitosamente',
                rutina: nuevaRutina
            });

        } catch (error) {
            next(error); // Pasa el error al siguiente middleware
        }
    },

    /**
     * @desc    Obtener todas las rutinas del usuario autenticado.
     * @route   GET /api/rutinas
     * @access  Private
     */
    obtenerRutinas: async (req, res, next) => {
        try {
            const rutinas = await Rutina.find({ usuario: req.user.id }).sort({ createdAt: -1 });
            
            return res.status(200).json({
                success: true,
                rutinas
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * @desc    Obtener una rutina específica por su ID.
     * @route   GET /api/rutinas/:id
     * @access  Private
     */
    obtenerRutinaPorId: async (req, res, next) => {
        try {
            const rutina = await Rutina.findById(req.params.id);

            if (!rutina) {
                return res.status(404).json({ success: false, message: 'Rutina no encontrada.' });
            }

            // Verificar que la rutina pertenece al usuario que la solicita
            if (rutina.usuario.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Acceso no autorizado a este recurso.' });
            }

            return res.status(200).json({
                success: true,
                rutina
            });

        } catch (error) {
            next(error);
        }
    },


    /**
     * @desc    Actualizar una rutina (ej: añadir/modificar ejercicios).
     * @route   PUT /api/rutinas/:id
     * @access  Private
     */
    actualizarRutina: async (req, res, next) => {
        try {
            const { nombreRutina, dias } = req.body;
            let rutina = await Rutina.findById(req.params.id);

            if (!rutina) {
                return res.status(404).json({ success: false, message: 'Rutina no encontrada.' });
            }

            // Verificar que la rutina pertenece al usuario que la solicita
            if (rutina.usuario.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Acceso no autorizado para modificar este recurso.' });
            }

            // Actualizar los campos proporcionados
            rutina.nombreRutina = nombreRutina || rutina.nombreRutina;
            rutina.dias = dias || rutina.dias;
            
            const rutinaActualizada = await rutina.save();

            return res.json({
                success: true,
                message: 'Rutina actualizada correctamente',
                rutina: rutinaActualizada
            });

        } catch (error) {
            next(error);
        }
    },


    /**
     * @desc    Eliminar una rutina.
     * @route   DELETE /api/rutinas/:id
     * @access  Private
     */
    eliminarRutina: async (req, res, next) => {
        try {
            const rutina = await Rutina.findById(req.params.id);

            if (!rutina) {
                return res.status(404).json({ success: false, message: 'Rutina no encontrada.' });
            }
            
            // Verificar que la rutina pertenece al usuario que la solicita
            if (rutina.usuario.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Acceso no autorizado para eliminar este recurso.' });
            }

            await rutina.deleteOne();

            return res.json({ success: true, message: 'Rutina eliminada correctamente.' });

        } catch (error) {
            next(error);
        }
    }
};

export default rutinaController;
