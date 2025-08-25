// ARCHIVO: /controllers/ordenDeTrabajoController.js
import OrdenDeTrabajo from '../models/ordenDeTrabajo.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import PDFDocument from 'pdfkit';
import axios from 'axios'; // <-- ESTA ES LA LÍNEA QUE FALTABA

const ordenDeTrabajoController = {
    createOT: async (req, res, next) => {
        try {
            const adminId = req.user.id;
            
            let imageUrl = '';
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({ folder: "ordenes_trabajo" }, (error, result) => { if (error) reject(error); else resolve(result); });
                    uploadStream.end(req.file.buffer);
                });
                imageUrl = result.secure_url;
            }

            const nuevaOT = await OrdenDeTrabajo.create({
                ...req.body,
                imagen: imageUrl,
                creadoPor: adminId
            });

            res.status(201).json({ success: true, message: "Orden de Trabajo creada exitosamente.", ot: nuevaOT });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                const errorMessage = `Faltan datos requeridos: ${messages.join('. ')}`;
                return res.status(400).json({ success: false, message: errorMessage, errors: error.errors });
            }
            next(error);
        }
    },
    
    // El resto de las funciones no han cambiado, pero se incluyen para que el archivo esté completo.
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

            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=OT-${ot._id}.pdf`);

            doc.pipe(res);

            // --- Encabezado ---
            doc.fontSize(20).font('Helvetica-Bold').text('Orden de Trabajo', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text(`OT N°: ${ot._id}`, { align: 'center' });
            doc.moveDown(2);

            // --- Función para dibujar secciones ---
            const drawSection = (title, data) => {
                doc.fontSize(14).font('Helvetica-Bold').text(title);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
                data.forEach(([label, value]) => {
                    doc.fontSize(10).font('Helvetica-Bold').text(label, { continued: true });
                    doc.font('Helvetica').text(`: ${value || 'N/A'}`);
                });
                doc.moveDown();
            };

            // --- Secciones de Información ---
            drawSection('Detalles Generales', [
                ['Fecha de Emisión', new Date(ot.fecha).toLocaleDateString()],
                ['Campaña', ot.campana],
                ['Estado', ot.estado],
            ]);

            drawSection('Información del Cliente', [
                ['Razón Social', ot.razonSocialId.nombre],
                ['Campo', `${ot.campoId.nombre} (${ot.campoId.hectareas} ha)`],
            ]);

            drawSection('Información del Proveedor', [
                ['Proveedor Asignado', ot.proveedorId.nombre],
                ['Correo', ot.proveedorId.correo],
            ]);
            
            drawSection('Detalles de la Labor', [
                ['Labor a Realizar', ot.laborId.descripcion],
                ['Insumo Principal', ot.insumoId.nombre],
                ['Hectáreas a Aplicar', ot.hectareas],
                ['Dosis', ot.dosis],
                ['Cantidad de Insumos', ot.cantidadInsumos],
                ['Orden de Carga', ot.ordenDeCarga],
            ]);

            if (ot.observaciones) {
                drawSection('Observaciones', [
                    ['', ot.observaciones],
                ]);
            }

            // --- Incrustar la Imagen ---
            if (ot.imagen) {
                try {
                    // Descargamos la imagen como un buffer
                    const imageResponse = await axios.get(ot.imagen, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

                    doc.addPage();
                    doc.fontSize(16).font('Helvetica-Bold').text('Imagen Adjunta', { align: 'center' });
                    doc.moveDown();
                    // Incrustamos la imagen en el PDF, ajustándola a la página
                    doc.image(imageBuffer, {
                        fit: [500, 600], // Ancho y alto máximos
                        align: 'center',
                        valign: 'center'
                    });
                } catch (imgError) {
                    console.error("No se pudo cargar la imagen en el PDF:", imgError);
                    // Si falla, simplemente no la añade pero el PDF se genera igual
                }
            }

            // Finalizamos el PDF
            doc.end();

        } catch (error) {
            next(error);
        }
    },
    getCostAnalysisByRazonSocial: async (req, res, next) => {
        try {
            const { razonSocialId } = req.params;
            const ordenes = await OrdenDeTrabajo.find({
                razonSocialId: razonSocialId,
                estado: 'FINALIZADA'
            }).populate('laborId').populate('insumoId');

            if (!ordenes || ordenes.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No se encontraron órdenes finalizadas para esta Razón Social.",
                    analysis: { totalLaborCost: 0, totalInsumoCost: 0, totalCost: 0, count: 0 }
                });
            }

            let totalLaborCost = 0;
            let totalInsumoCost = 0;

            ordenes.forEach(ot => {
                if (ot.laborId && ot.laborId.precioLabor) {
                    totalLaborCost += ot.hectareas * ot.laborId.precioLabor;
                }
                if (ot.insumoId && ot.insumoId.precio && ot.cantidadInsumos) {
                    totalInsumoCost += ot.cantidadInsumos * ot.insumoId.precio;
                }
            });

            const analysis = {
                totalLaborCost,
                totalInsumoCost,
                totalCost: totalLaborCost + totalInsumoCost,
                count: ordenes.length
            };

            res.status(200).json({ success: true, analysis });

        } catch (error) {
            next(error);
        }
    }
};

export default ordenDeTrabajoController;
