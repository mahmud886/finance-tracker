import { Router, type Router as ExpressRouter } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { ProfileService } from '../services/profile.service';

export function createProfileRouter(service: ProfileService): ExpressRouter {
  const router = Router();
  const controller = new ProfileController(service);

  router.get('/', controller.get);
  router.patch('/', controller.update);

  return router;
}

