import jwt from 'jsonwebtoken';

const generateToken = (id, role, proveedorId) => {
    const payload = { id, role };
    // Si el usuario es un proveedor, incluimos su ID de proveedor en el token
    // para facilitar las consultas en el backend.
    if (proveedorId) {
        payload.proveedorId = proveedorId;
    }

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '12h'
    });
};

export default generateToken;