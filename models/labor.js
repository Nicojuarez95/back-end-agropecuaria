import mongoose from 'mongoose';

const laborSchema = new mongoose.Schema({
    descripcion: { type: String, required: true, trim: true },
    unidadDeMedida: { type: String, required: true, trim: true }, // Ej: 'Ha' (Hectárea), 'Hs' (Hora)
    precioLabor: { type: Number, required: true } // Precio por unidad de medida
}, { timestamps: true });

const Labor = mongoose.model('Labor', laborSchema);
export default Labor;