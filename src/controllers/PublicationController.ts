// Modules
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Model
import Publication, { IPublication } from '../models/Publication';
import Follow, { IFollow } from '../models/Follow';

// Plugins
import buildParams from '../plugins/buildParams';

// Define params
const validParams = ['text', 'file'];

class PublicationController {
    private validParams: string[];
    
    constructor() {
        this.validParams = validParams;
        
        this.find = this.find.bind(this);
        this.index = this.index.bind(this);
        this.create = this.create.bind(this);
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.authenticateAuthor = this.authenticateAuthor.bind(this);
        this.updateImage = this.updateImage.bind(this);
    }

    find(req: Request, res: Response, next: NextFunction) {
        const publicationId = req.params.id;

        Publication.findById(publicationId)
        .then(publication => {
            (req as any).publication = publication;
            next();
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Error en el servidor (Recurso: publications)',
                error
            });
        })
    }

    index(req: Request, res: Response) {
        const userId = (req as any).payload.sub;
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const sort = {_id: -1};
        const populate = 'user';

        Follow.find({ user: userId }).populate('followed')
        .then(follows => {
            const following = follows.map(follow => { return (follow as any).followed });

            (Publication as any)
            .paginate(
                { user: { $in: following } },
                { sort, page, limit, populate }
            )
            .then((publications: any) => {
                return res.status(200).json({
                    publications
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    message: 'Error en el servidor (Recurso: publications -> index)',
                    error
                });
            });

        })
        .catch(error => {
            return res.status(500).json({
                message: 'Error en el servidor (Recurso: publications -> create)',
                error
            });
        });
    }

    create(req: Request, res: Response) {
        const userId = (req as any).payload.sub;
        let params: IPublication = buildParams(this.validParams, req.body);

        // Validate that exist necesary params
        if(!params.text) {
            return res.status(403).json({ message: 'You need send all params' });
        }
        
        params.user = userId;
        params.file = '';

        Publication.create(params)
        .then(publication => {
            return res.status(200).json({
               message: 'La publicacion fue creada con exito',
               publication
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Error en el servidor (Recurso: publications -> create)',
                error
            });
        });
    }

    show(req: Request, res: Response) {
        res.status(200).json((req as any).publication);
    }

    update(req: Request, res: Response) {

    }

    destroy(req: Request, res: Response) {
        (req as any).publication.remove()
        .then(() => {
            res.status(200).json({
                message: 'Publicacion eliminada con exito'
            })
        })
        .catch((error: any) => {
            return res.status(500).json({
                message: 'Error en el servidor (Recurso: publications -> delete)',
                error
            });
        });
    }

    authenticateAuthor(req: Request, res: Response, next: NextFunction) {
        const publicationUserId = (req as any).publication.user;
        const userId = (req as any).payload.sub;

        if(publicationUserId == userId) {
            return next();
        } else {
            return res.status(404).json({
                message: 'Tu no tienes acceso a este recurso',
            });
        }
    }

    updateImage(req: Request, res: Response) {
        /*if(!(req as any).files){
            return res.status(404).json({
                message: 'No se ha subido ninguna imagen'
            })
        }*/

        
        const file_path = (req as any).files.image.path;
        const file_split = file_path.split('\\');
        const file_name = file_split[2];
        const ext_split = file_name.split('\.');
        const file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            Publication.findByIdAndUpdate(
                (req as any).publication._id, 
                { file: file_name }, 
                { new: true })
            .then(publication => {
                return res.status(200).json({
                    message: 'Publicacion actualizada correctamente'
                });
            })
            .catch(error => {
                return res.status(500).json({
                    message: 'Upss hubo un error en el servidor'
                });
            })
        } else {
            fs.unlink(file_path,(err => {
                return res.status(404).json({
                    message: 'Extencion del archivo no valida'
                });
            }));
        }
    }

    getImageFile(req: Request, res: Response) {
        const image_file = req.params.imageFile;
        const path_file = './uploads/publications/' + image_file;

        fs.exists(path_file, (exists) => {
            if(!exists) return res.status(404).json({
                message: 'Recurso no disponible'
            });

            return res.status(200).sendFile(path.resolve(path_file));
        });
    }
}

export { validParams };
export default new PublicationController();