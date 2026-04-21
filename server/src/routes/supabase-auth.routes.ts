import { Router } from 'express';
import { SupabaseAuthController } from '../controllers/supabase-auth.controller';
import type { AuthService } from '../services/auth.service';

export function createSupabaseAuthRouter(service: AuthService) {
  const router = Router();
  const controller = new SupabaseAuthController(service, service.config);

  router.post('/exchange', controller.exchange);

  return router;
}

