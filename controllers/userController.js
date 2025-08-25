import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';

const userController = {
    // Registrar un nuevo usuario
    register: async (req, res, next) => {
        try {
            const { nombre, email, password, role, proveedorId } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: "El email ya está registrado." });
            }

            const user = await User.create({
                nombre,
                email,
                password,
                role,
                proveedorId // Se asocia el ID del proveedor si se proporciona
            });

            if (user) {
                res.status(201).json({
                    success: true,
                    message: "Usuario registrado exitosamente.",
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role, user.proveedorId)
                });
            } else {
                res.status(400).json({ success: false, message: "Datos de usuario inválidos." });
            }
        } catch (error) {
            next(error);
        }
    },

    // Iniciar sesión
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (user && (await user.matchPassword(password))) {
                res.json({
                    success: true,
                    message: "Inicio de sesión exitoso.",
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role, user.proveedorId)
                });
            } else {
                res.status(401).json({ success: false, message: "Email o contraseña incorrectos." });
            }
        } catch (error) {
            next(error);
        }
    }
};

export default userController;