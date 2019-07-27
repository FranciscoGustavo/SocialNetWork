import { Router } from 'express';

// Controller
import FollowController from '../controllers/FollowController';

// Middlewares
import decodeJWT from '../middlewares/decodeJWT';

const router = Router(); 

router.use( (decodeJWT() as any).unless({ method: ['OPTIONS'] }) );

router.post('/', FollowController.create);
router.get('/:followers?', FollowController.find, FollowController.show);

router.get('/following/', FollowController.preIndex, FollowController.index); 

router.route('/following/:id')
    .get(FollowController.preIndex, FollowController.index)
    .delete(FollowController.destroy);

router.get('/followers/', FollowController.preIndex, FollowController.index);
router.get('/followers/:id', FollowController.preIndex, FollowController.index);


export default router;