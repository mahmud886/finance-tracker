import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller';
import { CatalogService } from '../services/catalog.service';

export function createCatalogRouter(service: CatalogService) {
  const router = Router();
  const controller = new CatalogController(service);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

