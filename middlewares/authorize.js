export const authorize = (...roles) => {
    // Retorna una función de middleware
    return (req, res, next) => {
        // 'req.user' fue añadido por el middleware 'authenticate'
        if (!req.user || !roles.includes(req.user.role)) {
            // Si el usuario no existe o su rol no está en la lista permitida...
            return res.status(403).json({ 
                success: false, 
                message: `Acceso denegado. Se requiere el rol: ${roles.join(' o ')}` 
            });
        }
        // Si el rol es correcto, permite que la petición continúe
        next();
    };
};
