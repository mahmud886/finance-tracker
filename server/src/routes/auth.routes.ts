import { Router, type RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import type { AuthService } from '../services/auth.service';

export function createAuthRouter(service: AuthService, authMiddleware: RequestHandler) {
  const router = Router();
  const controller = new AuthController(service, service.config);

  router.use('/logout', authMiddleware);
  router.use('/me', authMiddleware);

  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
  router.post('/forgot-password', controller.forgotPassword);
  router.post('/reset-password', controller.resetPassword);
  router.get('/me', controller.me);

  return router;
}


