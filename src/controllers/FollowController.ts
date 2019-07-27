// Modules
import { Request, Response, NextFunction } from 'express';

// Model
import Follow, { IFollow } from '../models/Follow';

// Plugins
import buildParams from '../plugins/buildParams';

// Define params
const validParams = ['followed'];

class FollowController {
    private validParams: string[];
    
    constructor() {
        this.validParams = validParams;
        
        this.find = this.find.bind(this);
        this.index = this.index.bind(this);
        this.create = this.create.bind(this);
        this.show = this.show.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    find(req: Request, res: Response, next: NextFunction) {
        const userId = (req as any).payload.sub;
        let query;

        (req.params.followers) ? query = { followed: userId } : query = { user: userId };

        Follow.find(query)
        .then(docs => {
            (req as any).follow = docs;
            next();
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ha ocurrido un error en el servidor',
                error
            });
        });
    }

    preIndex(req: Request, res: Response, next: NextFunction) {
        const url = req.url.split('/');
        const resource = url[1];
        const userId = req.params.id || (req as any).payload.sub;

        if(resource === 'following') {
            (req as any).query = { user: userId };
            (req as any).populate = 'followed';
            return next();
        }

        if(resource === 'followers') {
            (req as any).query = { followed: userId };
            (req as any).populate = 'user';
            return next();
        }
    }

    index(req: Request, res: Response) {
        const query = (req as any).query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 2;
        const sort = {_id: -1};
        const populate = (req as any).populate;

        (Follow as any)
        .paginate(
            query,
            { sort, populate, page, limit }
        )
        .then((follows: any) => {
            return res.status(200).json({
                follows
            })
        })
        .catch((error: any) => {
            return res.status(500).json({
                message: 'Upss!! ha ocurrido un error',
                error
            })
        });
    }

    create(req: Request, res: Response) {
        // Build params
        let params: IFollow = buildParams(this.validParams, req.body);

        // Add id of user
        params.user = (req as any).payload.sub;

        // Creating follow
        Follow.create(params)
        .then(follow => {
            return res.status(200).json({
                message: 'Bien ahora estas siguiendo a este usuario',
                follow
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error',
                error
            });
        });
    }

    show(req: Request, res: Response) {
        res.status(200).json({
            follows: (req as any).follow
        })
    }

    destroy(req: Request, res: Response) {
        const user = (req as any).payload.sub;
        const followed = req.params.id;

        Follow.deleteOne({ user, followed })
        .then(done => {
            return res.status(200).json({
                message: 'El follow ha sido eliminado correctamente'
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Upss!! ah ocurrido un error',
                error
            });
        });
    }
}

export { validParams };
export default new FollowController();