import { Request, Response, NextFunction, json } from 'express';
import User, { IUser } from '../models/User';

import { validParams } from '../controllers/UserController';
import buildParams from '../plugins/buildParams';


function findUserDuplicate(req: Request, res: Response, next: NextFunction) {
    // Build Params
    const params: IUser = buildParams(validParams, req.body);

    // Find diplicate users
    User.find({ $or: [
        { email: params.email },
        { nick: params.nick }
    ] })
    .then(user => {
        if(user && (user as any).length >= 1) {
            return res.status(404).json({
                message: 'El usuario que intenta registrar ya existe'
            });
        }

        next();
    })
    .catch(error => {
        return res.status(404).json({
            message: 'Hubo un error en la creacion del recurso',
            error
        });
    })
}

export default findUserDuplicate;