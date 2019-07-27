import { Router } from 'express';

// Controller
import MessageController from '../controllers/MessageController';

// Middlewares
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/publications'});

import decodeJWT from '../middlewares/decodeJWT';

const router = Router(); 

router.use( (decodeJWT() as any).unless({ method: ['OPTIONS'] }) );

router.route('/')
    .get(MessageController.preIndex, MessageController.index)
    .post(MessageController.create)


router.get('/sent', MessageController.preIndex, MessageController.index);
router.get('/unviewed', MessageController.getUnviewedMessages);
router.get('/set/unviewed', MessageController.setUnviewedMessages);
/*
router.route('/:id')
    .get(
        MessageController.find,
        MessageController.show
    )
    .put(
        MessageController.find,
        MessageController.authenticateAuthor,
        MessageController.update
    )
    .delete(
        MessageController.find,
        MessageController.authenticateAuthor,
        MessageController.destroy
    )
*/
export default router;