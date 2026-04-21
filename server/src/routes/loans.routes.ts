import { Router } from 'express';
import { LoansController } from '../controllers/loans.controller';
import { LoansService } from '../services/loans.service';

export function createLoansRouter(service: LoansService) {
  const router = Router();
  const controller = new LoansController(service);

  router.get('/payments/list', controller.listPayments);
  router.post('/payments', controller.createPayment);
  router.get('/payments/:id', controller.getPayment);
  router.patch('/payments/:id', controller.updatePayment);
  router.delete('/payments/:id', controller.removePayment);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

