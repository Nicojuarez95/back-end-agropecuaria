import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    role: {
        type: String,
        enum: ['ADMIN', 'PROVEEDOR'],
        default: 'PROVEEDOR'
    },
    // Si un usuario es de tipo 'PROVEEDOR', podemos asociarlo directamente
    // a un registro de Proveedor para facilitar las consultas.
    proveedorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    }
}, { timestamps: true });

// Middleware para hashear la contraseña antes de guardarla
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
