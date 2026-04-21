import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { HealthService } from '../services/health.service';

export function createHealthRouter(service: HealthService) {
  const router = Router();
  const controller = new HealthController(service);

  router.get('/health', controller.health);
  router.get('/ready', controller.ready);

  return router;
}

