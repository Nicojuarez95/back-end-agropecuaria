// ARCHIVO: /controllers/ordenDeTrabajoController.js
import OrdenDeTrabajo from '../models/ordenDeTrabajo.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import PDFDocument from 'pdfkit'; // <-- IMPORTAMOS PDFKIT

const ordenDeTrabajoController = {
    // --- createOT, getAllOTs, y las demás funciones se mantienen igual ---
    createOT: async (req, res, next) => {
        try {
            const adminId = req.user.id;
            const { campaña, proveedorId, hectareas } = req.body;
            if (!campaña || !proveedorId || !hectareas) {
                return res.status(400).json({ success: false, message: "Faltan campos obligatorios." });
            }
            let imageUrl = '';
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({ folder: "ordenes_trabajo" }, (error, result) => { if (error) reject(error); else resolve(result); });
                    uploadStream.end(req.file.buffer);
                });
                imageUrl = result.secure_url;
            }
            const nuevaOT = await OrdenDeTrabajo.create({ ...req.body, imagen: imageUrl, creadoPor: adminId });
            res.status(201).json({ success: true, message: "Orden de Trabajo creada exitosamente.", ot: nuevaOT });
        } catch (error) {
            if (error.name === 'ValidationError') { return res.status(400).json({ success: false, message: "Error de validación", errors: error.errors }); }
            next(error);
        }
    },
    getAllOTs: async (req, res, next) => {
        try {
            const filters = {};
            const { proveedorId, razonSocialId, estado, fechaInicio, fechaFin } = req.query;
            if (proveedorId) { filters.proveedorId = proveedorId; }
            if (razonSocialId) { filters.razonSocialId = razonSocialId; }
            if (estado) { filters.estado = estado.toUpperCase(); }
            if (fechaInicio && fechaFin) { filters.fecha = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) }; }
            else if (fechaInicio) { filters.fecha = { $gte: new Date(fechaInicio) }; }
            else if (fechaFin) { filters.fecha = { $lte: new Date(fechaFin) }; }
            const ots = await OrdenDeTrabajo.find(filters).populate('proveedorId', 'nombre').populate('razonSocialId', 'nombre').sort({ fecha: -1 });
            res.status(200).json({ success: true, count: ots.length, ots });
        } catch (error) {
            next(error);
        }
    },
    getOTsByProveedor: async (req, res, next) => {
        try {
            const proveedorIdAsociado = req.user.proveedorId;
            if (!proveedorIdAsociado) { return res.status(403).json({ success: false, message: "Usuario no asociado a un proveedor." }); }
            const ots = await OrdenDeTrabajo.find({ proveedorId: proveedorIdAsociado }).populate('razonSocialId', 'nombre').populate('campoId', 'nombre').populate('laborId', 'descripcion').sort({ fecha: -1 });
            res.status(200).json({ success: true, ots });
        } catch (error) {
            next(error);
        }
    },
    finalizarOT: async (req, res, next) => {
        try {
            const { id } = req.params;
            const proveedorIdAsociado = req.user.proveedorId;
            const ot = await OrdenDeTrabajo.findById(id);
            if (!ot) { return res.status(404).json({ success: false, message: "Orden de Trabajo no encontrada." }); }
            if (ot.proveedorId.toString() !== proveedorIdAsociado.toString()) { return res.status(403).json({ success: false, message: "No autorizado para modificar esta OT." }); }
            ot.estado = 'FINALIZADA';
            ot.fechaCambioEstado = Date.now();
            await ot.save();
            res.status(200).json({ success: true, message: "OT marcada como finalizada.", ot });
        } catch (error) {
            next(error);
        }
    },
    getOTById: async (req, res, next) => {
        try {
            const ot = await OrdenDeTrabajo.findById(req.params.id).populate('proveedorId', 'nombre correo').populate('razonSocialId', 'nombre').populate('campoId', 'nombre').populate('laborId', 'descripcion').populate('insumoId', 'nombre');
            if (!ot) { return res.status(404).json({ success: false, message: "Orden de Trabajo no encontrada." }); }
            res.status(200).json({ success: true, ot });
        } catch (error) {
            next(error);
        }
    },
    updateOT: async (req, res, next) => {
        try {
            let ot = await OrdenDeTrabajo.findById(req.params.id);
            if (!ot) { return res.status(404).json({ success: false, message: "Orden de Trabajo no encontrada." }); }
            ot = await OrdenDeTrabajo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            res.status(200).json({ success: true, message: "OT actualizada exitosamente.", ot });
        } catch (error) {
            next(error);
        }
    },
    deleteOT: async (req, res, next) => {
        try {
            const ot = await OrdenDeTrabajo.findById(req.params.id);
            if (!ot) { return res.status(404).json({ success: false, message: "Orden de Trabajo no encontrada." }); }
            await ot.deleteOne();
            res.status(200).json({ success: true, message: "Orden de Trabajo eliminada." });
        } catch (error) {
            next(error);
        }
    },

    // --- NUEVA FUNCIÓN PARA EXPORTAR A PDF ---
    exportOT: async (req, res, next) => {
        try {
            const ot = await OrdenDeTrabajo.findById(req.params.id)
                .populate('proveedorId')
                .populate('razonSocialId')
                .populate('campoId')
                .populate('laborId')
                .populate('insumoId');

            if (!ot) {
                return res.status(404).json({ success: false, message: "Orden de Trabajo no encontrada." });
            }

            const doc = new PDFDocument({ margin: 50 });

            // Configuramos la respuesta para que el navegador sepa que es un PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=OT-${ot._id}.pdf`);

            // "Pipe" el contenido del PDF directamente a la respuesta
            doc.pipe(res);

            // --- Contenido del PDF ---
            doc.fontSize(20).text(`Orden de Trabajo: #${ot._id}`, { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Fecha: ${new Date(ot.fecha).toLocaleDateString()}`);
            doc.text(`Campaña: ${ot.campaña}`);
            doc.text(`Estado: ${ot.estado}`);
            doc.moveDown();

            doc.fontSize(14).text('Detalles Generales', { underline: true });
            doc.fontSize(12).text(`Razón Social: ${ot.razonSocialId.nombre}`);
            doc.text(`Campo: ${ot.campoId.nombre} (${ot.campoId.hectareas} ha)`);
            doc.text(`Proveedor: ${ot.proveedorId.nombre}`);
            doc.moveDown();

            doc.fontSize(14).text('Labor e Insumos', { underline: true });
            doc.fontSize(12).text(`Labor: ${ot.laborId.descripcion}`);
            doc.text(`Insumo: ${ot.insumoId.nombre}`);
            doc.text(`Hectáreas a aplicar: ${ot.hectareas}`);
            if (ot.dosis) doc.text(`Dosis: ${ot.dosis}`);
            if (ot.cantidadInsumos) doc.text(`Cantidad de Insumos: ${ot.cantidadInsumos}`);
            doc.moveDown();
            
            if (ot.observaciones) {
                doc.fontSize(14).text('Observaciones', { underline: true });
                doc.fontSize(12).text(ot.observaciones);
            }

            // Finalizamos el PDF
            doc.end();

        } catch (error) {
            next(error);
        }
    }
};

export default ordenDeTrabajoController;
