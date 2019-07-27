import { Router } from 'express';

// Controller
import SessionController from '../controllers/SessionController';

// Middlewares

const router = Router(); 

router.route('/')
    .post(
        SessionController.authenticateUser,
        SessionController.generateToken,
        SessionController.sendToken
    )


export default router;