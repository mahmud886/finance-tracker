import { Router } from 'express';
import { PlansController } from '../controllers/plans.controller';
import { PlansService } from '../services/plans.service';

export function createPlansRouter(service: PlansService) {
  const router = Router();
  const controller = new PlansController(service);

  router.get('/templates', controller.listTemplates);
  router.post('/templates', controller.createTemplate);
  router.get('/templates/:id', controller.getTemplate);
  router.patch('/templates/:id', controller.updateTemplate);
  router.delete('/templates/:id', controller.deleteTemplate);

  router.get('/items', controller.listItems);
  router.post('/items', controller.createItem);
  router.get('/items/:id', controller.getItem);
  router.patch('/items/:id', controller.updateItem);
  router.delete('/items/:id', controller.deleteItem);
  router.post('/items/:id/toggle-purchased', controller.togglePurchased);

  return router;
}

