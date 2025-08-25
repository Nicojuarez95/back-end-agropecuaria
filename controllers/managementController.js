import Proveedor from '../models/proveedor.js';
import RazonSocial from '../models/razonSocial.js';
import Campo from '../models/campo.js';
import Labor from '../models/labor.js';
import Insumo from '../models/insumo.js';

// --- Función genérica para crear un documento ---
const createDocument = (model) => async (req, res, next) => {
    try {
        const doc = await model.create(req.body);
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

// --- Función genérica para obtener todos los documentos ---
const getAllDocuments = (model) => async (req, res, next) => {
    try {
        const docs = await model.find({});
        res.status(200).json({ success: true, count: docs.length, data: docs });
    } catch (error) {
        next(error);
    }
};

const managementController = {
    // Proveedores
    createProveedor: createDocument(Proveedor),
    getAllProveedores: getAllDocuments(Proveedor),
    // Razones Sociales
    createRazonSocial: createDocument(RazonSocial),
    getAllRazonesSociales: getAllDocuments(RazonSocial),
    // Campos
    createCampo: createDocument(Campo),
    getAllCampos: getAllDocuments(Campo),
    // Labores
    createLabor: createDocument(Labor),
    getAllLabores: getAllDocuments(Labor),
    // Insumos
    createInsumo: createDocument(Insumo),
    getAllInsumos: getAllDocuments(Insumo),
};

export default managementController;