// ARCHIVO: /models/ordenDeTrabajo.js
import mongoose from 'mongoose';

const ordenDeTrabajoSchema = new mongoose.Schema({
    // --- Datos Generales ---
    fecha: { type: Date, required: true, default: Date.now },
    campana: { type: String, required: [true, 'La campana es requerida.'], trim: true }, // CAMBIADO
    estado: {
        type: String,
        enum: ['PENDIENTE', 'FINALIZADA'],
        default: 'PENDIENTE'
    },
    fechaCambioEstado: { type: Date },

    // --- Referencias a otros modelos ---
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    razonSocialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RazonSocial', required: true },
    campoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campo', required: true },
    laborId: { type: mongoose.Schema.Types.ObjectId, ref: 'Labor', required: true },
    insumoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insumo', required: true },

    // --- Detalles específicos de la OT ---
    hectareas: { type: Number, required: true },
    dosis: { type: Number },
    cantidadInsumos: { type: Number },
    ordenDeCarga: { type: String, trim: true },
    observaciones: { type: String, trim: true },
    imagen: { type: String }, 
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const OrdenDeTrabajo = mongoose.model('OrdenDeTrabajo', ordenDeTrabajoSchema);
export default OrdenDeTrabajo;