import mongoose from 'mongoose';

const campoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    hectareas: { type: Number, required: true },
    // Referencia a qué Razón Social pertenece este campo
    razonSocialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RazonSocial',
        required: true
    }
}, { timestamps: true });

const Campo = mongoose.model('Campo', campoSchema);
export default Campo;