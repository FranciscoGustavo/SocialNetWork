// Modules
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import fs, { exists } from 'fs';
import path from 'path';

// Model
import User, { IUser } from '../models/User';
import Follow from '../models/Follow';
import Publication from '../models/Publication';

// Plugins
import buildParams from '../plugins/buildParams';

// Define Params
const validParams = [
        'name',
        'surname',
        'nick',
        'email',
        'password',
        'role',
        'image'
    ];


// Define UserController
class UserController {
    private validParams: string[];

    constructor() {
        this.validParams = validParams;

        this.find = this.find.bind(this);
        this.index = this.index.bind(this);
        this.create = this.create.bind(this);
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.updateImage = this.updateImage.bind(this);

    }

    find(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        const myId = (req as any).payload.sub;

        Promise.all([
            Follow.findOne({ user: myId, followed: userId }),
            Follow.findOne({ user: userId, followed: myId }),
            User.findById(userId)
        ])
        .then(docs => {
            const following = docs[0];
            const follower = docs[1];
            const user = docs[2];

            if(!user) {
                return res.status(403).json({message: 'Usuario no encontrado'}) 
            }

            (req as any).user = user;
            (req as any).follow = following;
            (req as any).follower = follower;
            next();
        })
        .catch(err => {            
            return res.status(500).json({message: 'Server Error', error: err});
        });
    }
    
    index(req: Request, res: Response) {
        const userId = (req as any).payload.sub;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 1;
        const sort = {_id: -1};
        
        Promise.all([
            Follow.find({ user: userId }).select({ _id: 0, _v: 0, 'user': 0}),
            Follow.find({ followed: userId }).select({ _id: 0, _v: 0, 'followed': 0}),
            (User as any).paginate({},{ page, limit, sort })
        ])
        .then((docs: any) => {
            const following = docs[0].map((follow: any)=> { return follow.followed } );
            const followers = docs[1].map((follow: any)=> { return follow.user } );
            const users = docs[2].docs;
            const pagination = docs[2];
            pagination.docs = undefined;

            res.status(200).json({
                users, following, followers, ...pagination
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! hubo un error en el servidor',
                error
            });
        });
    }

    create(req: Request, res: Response) {
        // Build and validate params
        const params: IUser = buildParams(this.validParams, req.body);

        // Validate that exist necesary params
        if(
            !params.name || 
            !params.surname || 
            !params.nick || 
            !params.email || 
            !params.password
        ) {
            return res.status(403).json({ message: 'You need send all params' });
        }
        
        // Complete necesary fields
        params.password = bcrypt.hashSync(params.password, 10);
        params.role = 'ROLE_USER';
        params.image = "";

        // Creating a new User
        User.create(params)
        .then(doc => {
            if(!doc) return res.status(404).json({message: 'Error uasuario no creado'});

            return res.status(200).json({
                message: 'Usuario creado satisfactoriamente',
                user: doc
            });
        })
        .catch(error => {
            return res.status(404).json({
                message: 'Hubo un error en la creacion del recurso',
                error
            });
        });
    }

    show(req: Request, res: Response) {
        return res.status(200).json({ 
            user: (req as any).user,
            follow: (req as any).follow,
            follower: (req as any).follower
        });
    }


    update(req: Request, res: Response, next: NextFunction) {
        // Get user by request
        let user = (req as any).user;

        // Delete property password
        delete user.password;

        // Build params
        const params = buildParams(this.validParams, req.body);
        params.nick = params.nick.toLocaleLowerCase();
        //params.email = params.email.toLocaleLowerCase();

        // Update Object whit new params
        user = Object.assign(user, params);
        
        // Save object updated
        user.save()
        .then((doc: any) => {
            return res.status(200).json({
                message: 'El usuario a sido actualizado satisfactoriamente',
                user: doc
            })
        })
        .catch((error: any) => {
            return res.status(500).json({
                message: 'A ocurrido un error inesperado',
                error
            })
        });
        
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
            User.findByIdAndUpdate((req as any).user._id, { image: file_name }, { new: true })
            .then(user => {
                return res.status(200).json({
                    message: 'Usuario actualizado correctamente',
                    user
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
        const path_file = './uploads/users/' + image_file;

        fs.exists(path_file, (exists) => {
            if(!exists) return res.status(404).json({
                message: 'Recurso no disponible'
            });

            return res.status(200).sendFile(path.resolve(path_file));
        });
    }

    counter(req: Request, res: Response) {
        const userId = req.params.id || (req as any).payload.sub;
        
        Promise.all([
            Follow.countDocuments({ user: userId }),
            Follow.countDocuments({ followed: userId }),
            Publication.countDocuments({ user: userId})
        ])
        .then(docs => {
            const following = docs[0];
            const followers = docs[1];
            const publications = docs[2];

            res.status(200).json({
                following, followers, publications
            });
        })
        .catch(error => {
            console.log(error)
            return res.status(500).json({
                message: 'Upss!! hubo un error en el servidor',
                error
            });
        });
    }

}

export { validParams }
export default new UserController();
