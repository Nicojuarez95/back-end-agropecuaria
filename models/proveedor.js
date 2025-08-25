import mongoose from 'mongoose';

const proveedorSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, trim: true, lowercase: true }
}, { timestamps: true });

const Proveedor = mongoose.model('Proveedor', proveedorSchema);
export default Proveedor;
