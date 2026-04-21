import { Router, type Router as ExpressRouter } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { TransactionsService } from '../services/transactions.service';

export function createTransactionRouter(service: TransactionsService): ExpressRouter {
  const router = Router();
  const controller = new TransactionsController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

