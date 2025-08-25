import mongoose from 'mongoose';

const razonSocialSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, trim: true, lowercase: true },
    // Relacionamos la Razón Social con los campos que le pertenecen
    campos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campo'
    }]
}, { timestamps: true });

const RazonSocial = mongoose.model('RazonSocial', razonSocialSchema);
export default RazonSocial;