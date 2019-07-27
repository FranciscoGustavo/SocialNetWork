import { Router } from 'express';

// Controller
import PublicationController from '../controllers/PublicationController';

// Middlewares
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/publications'});

import decodeJWT from '../middlewares/decodeJWT';

const router = Router(); 

router.use( (decodeJWT() as any).unless({ method: ['OPTIONS'] }) );

router.route('/')
    .get(PublicationController.index)
    .post(PublicationController.create)

router.route('/:id')
    .get(
        PublicationController.find,
        PublicationController.show
    )
    .put(
        PublicationController.find,
        PublicationController.authenticateAuthor,
        PublicationController.update
    )
    .delete(
        PublicationController.find,
        PublicationController.authenticateAuthor,
        PublicationController.destroy
    )

router.route('/:id/upload/image')
    .put(
        PublicationController.find,
        PublicationController.authenticateAuthor,
        md_upload,
        PublicationController.updateImage
    )

router.route('/get/image/:imageFile')
    .get(PublicationController.getImageFile);

export default router;