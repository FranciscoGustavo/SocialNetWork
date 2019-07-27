// Modules
import { Request, Response, NextFunction, json } from 'express';
import moment from 'moment';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jwt-simple';

import { validParams } from '../controllers/UserController';
import buildParams from '../plugins/buildParams';
import config from '../config/config';

// Models
import User, { IUser } from '../models/User';

class SessionController {
    private payload: any;
    private token: any;
    
    constructor() {
        this.payload = null;
        this.token = null;

        // Binding
        this.authenticateUser = this.authenticateUser.bind(this);
        this.generateToken = this.generateToken.bind(this);
        this.sendToken = this.sendToken.bind(this);
    }

    // Search user an authenticate password for before create token
    authenticateUser(req: Request, res: Response, next: NextFunction) {        
        // Build params
        const params: IUser = buildParams(validParams, req.body);

        // Validate that params exist
        if (!params.email || !params.password)
            return res.status(400).json({ message: 'Necesitas enviar todos los parametros'});

        // Find User
        User.findOne({email: params.email.toLowerCase()})
        .then((user: IUser | any) => {
            
            // Verify that user exist 
            // If not exist return status 400
            if(!user) return res.status(400).json({ message: 'El usuario no existe'});
            
            // Verify his password
            const passwordIsValid = bcrypt.compareSync(params.password, user.password);

            
            if(passwordIsValid) {
                //return res.status(200).json(user);
                const { name, surname, nick, email, image, _id, role } = user;

                this.payload = { name, surname, nick, email, image, role };
                this.payload.sub = _id;
                this.payload.iat = moment().unix();
                this.payload.exp = moment().add(30, 'days').unix();

                next();
            } else {
                return res.status(404).json({ message: 'El usuario no se ah podido identificar'});
            }

        })
        .catch(error => {
            console.log('ERROR', error);
            return res.status(500).json({ 
                message: 'El usuario no se ah podido identificar',
                error
            });
        });
    }

    // Generate a new token
    generateToken(req: Request, res: Response, next: NextFunction) {
        // Verufy that payload is not clean
        if(!this.payload) return new Error('Invalid payload');

        this.token = jsonwebtoken.encode(this.payload, config.secret);
        next();
    }

    // Send Token
    sendToken(req: Request, res: Response) {
        if(this.token) {
            this.payload.exp = undefined;
            this.payload.iat = undefined;
            res.status(200).json({
                message: 'Session created successfull',
                token: this.token,
                user: this.payload
            });
            this.payload = null;
            this.token = null
        } else {
            res.status(422).json({ message: 'Could not create session'});
        }
    }

}

export default new SessionController();