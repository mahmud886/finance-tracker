import { createError } from '../http';
import type { AppLifecycle } from '../lifecycle';

export class HealthService {
  constructor(private readonly lifecycle: AppLifecycle) {}

  getHealth() {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor((Date.now() - this.lifecycle.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      shuttingDown: this.lifecycle.isShuttingDown,
    };
  }

  getReadiness() {
    if (this.lifecycle.isShuttingDown) {
      throw createError(503, 'NOT_READY', 'Server is shutting down');
    }

    return { status: 'ready' };
  }
}

