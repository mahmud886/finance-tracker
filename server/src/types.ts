import type { AppConfig } from './config';
import type { FinanceStore } from './store';

export interface AuthUser {
  userId: string;
  email: string;
  jti: string;
}

export interface AppContext {
  config: AppConfig;
  store: FinanceStore;
}

