import { Request, Response, NextFunction } from 'express';

function authenticateAuthor(req: Request, res: Response, next: NextFunction) {
    // Get user by request
    let user = (req as any).user;

    // Validate user session
    if(user._id != (req as any).payload.sub) {
        return res.status(500).json({
            message: 'No tienes permisos para realizar esta accion'
        });
    }

    next();
}

export default authenticateAuthor;