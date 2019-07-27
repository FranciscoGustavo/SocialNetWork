// Modules
import { Request, Response, NextFunction } from "express";
import jwt from 'jwt-simple';
import unless from 'express-unless';
import moment from 'moment';

// Config
import config from '../config/config';

function decodeJWT(opcions: any = null) {

    let decode = <unless.RequestHandler>(function(req: Request, res: Response, next: NextFunction) {        
        // Valid that exists authorization into headers
        if(!req.headers.authorization) {
            return res.status(403).json({ 
                message: 'Tu necesitas iniciar sesión' 
            });
        }
        
        // Get token
        const token = req.headers.authorization.split(' ')[1];
            
        // Decode token and next middleware
        const payload = jwt.decode(token, config.secret);

        // Validate date exp
        if(payload.exp <= moment().unix() ) {
            return res.status(401).json({
                message: 'El token ha expirado'
            });
        }

        // Add payload to request and pass next
        (req as any).payload = payload;
        next();
    });

    // To the function add property unles with 'express-unless' and return middelware
    decode.unless = unless;
    return decode;

}
export default decodeJWT;