import { Router, type Router as ExpressRouter } from 'express';
import { BudgetsController } from '../controllers/budgets.controller';
import { BudgetsService } from '../services/budgets.service';

export function createBudgetRouter(service: BudgetsService): ExpressRouter {
  const router = Router();
  const controller = new BudgetsController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

