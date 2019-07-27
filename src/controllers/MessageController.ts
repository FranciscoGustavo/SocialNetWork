// Modules
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Model
import User, { IUser } from '../models/User';
import Message, { IMessage } from '../models/Message';
import Follow, { IFollow } from '../models/Follow';

// Plugins
import buildParams from '../plugins/buildParams';

// Define params
const validParams = ['text','receiver'];

class MessageController {
    private validParams: string[];
    
    constructor() {
        this.validParams = validParams;
        
        /*this.find = this.find.bind(this);*/
        this.index = this.index.bind(this);
        this.preIndex = this.preIndex.bind(this);
        this.create = this.create.bind(this);
        this.getUnviewedMessages = this.getUnviewedMessages.bind(this);
        this.setUnviewedMessages = this.setUnviewedMessages.bind(this);
        /*this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);*/
    }
/*
    find(req: Request, res: Response, next: NextFunction) {
        
    }
*/
    preIndex(req: Request, res: Response, next: NextFunction) {
        const url = req.url.split('/');
        const resource = url[1];
        const userId = (req as any).payload.sub;

        if(resource == 'sent') {
            (req as any).query = { emitter: userId };
            (req as any).populate = { path: 'receiver', select: ['name', 'surname', 'nick', 'image'] }
            return next();
        } else {
            (req as any).query = { receiver: userId };
            (req as any).populate = { path: 'emitter', select: ['name', 'surname', 'nick', 'image'] }
            return next();
        }
    }

    index(req: Request, res: Response) {
        const query = (req as any).query;
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const sort = { createdAt: -1 };
        const populate = (req as any).populate;

        (Message as any).paginate(
            query,
            { page, limit, sort, populate, }
        )
        .then((messages: any) => {
            return res.status(200).json({
                messages
            });
        })
        .catch((error: any) => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error en el servidor (Message)',
                error
            });
        });
    }

    create(req: Request, res: Response) {
        // Build params
        let params: IMessage = buildParams(this.validParams, req.body);

        // Check neceary fields
        if(!params.receiver || !params.text) {
            return res.status(400).json({
                message: 'Necesitas enviar todos los parametros necesarios'
            });
        }

        // Add emiter
        params.emitter = (req as any).payload.sub;

        // Create new Message
        Message.create(params)
        .then(message => {
            return res.status(200).json({
                messages: 'Se ha creado exitosamente',
                message
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error en el servidor (Message)',
                error
            });
        });

    }
/*
    show(req: Request, res: Response) {
    
    }
    update(req: Request, res: Response) {

    }
    destroy(req: Request, res: Response) {

    }
    authenticateAuthor(req: Request, res: Response, next: NextFunction) {

    }
*/
    getUnviewedMessages(req: Request, res: Response) {
        const userId = (req as any).payload.sub;

        Message.countDocuments({ receiver: userId, viewed: false })
        .then(count => {
            return res.status(200).json({
                unviwed: count
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error en el servidor (Message)',
                error
            });
        });
    }

    setUnviewedMessages(req: Request, res: Response) {
        const userId = (req as any).payload.sub;

        Message.updateMany(
            { receiver: userId, viewed: false },
            { viewed: true },
            { multi: true}
        )
        .then(messages => {
            return res.status(200).json({
                messages
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error en el servidor (Message)',
                error
            });
        });
    }

}

export { validParams };
export default new MessageController();