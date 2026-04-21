import { Router, type Router as ExpressRouter } from 'express';
import { CategoriesController } from '../controllers/categories.controller';
import { CategoriesService } from '../services/categories.service';

export function createCategoryRouter(service: CategoriesService): ExpressRouter {
  const router = Router();
  const controller = new CategoriesController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

