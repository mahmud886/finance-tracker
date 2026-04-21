import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { ReportsService } from '../services/reports.service';

export function createReportsRouter(service: ReportsService) {
  const router = Router();
  const controller = new ReportsController(service);

  router.get('/dashboard', controller.dashboard);
  router.get('/summary', controller.summary);

  return router;
}

