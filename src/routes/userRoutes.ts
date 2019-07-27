import { Router } from 'express';

// Controller
import UserController from '../controllers/UserController';

// Middlewares
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/users'});

import findUserDuplicate from '../middlewares/findUserDuplicated';
import decodeJWT from '../middlewares/decodeJWT';
import authenticateAuthor from '../middlewares/authenticateAuthor';

const router = Router(); 

router.use( (decodeJWT() as any).unless({ method: ['POST', 'OPTIONS'] }) )

router.route('/')
    .get(UserController.index)
    .post(
        findUserDuplicate,
        UserController.create
    )
router.get('/counter', UserController.counter);
router.get('/counter/:id/', UserController.counter);

router.route('/:id')
    .get(UserController.find, UserController.show)
    .put(
        UserController.find,
        authenticateAuthor, 
        UserController.update
    )



router.route('/:id/upload/image')
    .put(
        UserController.find,
        authenticateAuthor,
        md_upload,
        UserController.updateImage
    )

router.route('/get/image/:imageFile')
    .get(UserController.getImageFile);

export default router;