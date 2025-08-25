import mongoose from 'mongoose';

const insumoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    unidadDeMedida: { type: String, required: true, trim: true }, // Ej: 'Litros', 'Kg'
    precio: { type: Number, required: true } // Precio por unidad de medida
}, { timestamps: true });

const Insumo = mongoose.model('Insumo', insumoSchema);
export default Insumo;