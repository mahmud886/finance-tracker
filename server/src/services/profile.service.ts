import { createError } from '../http';
import type { ProfileUpdateInput } from '../domain';
import type { AppContext } from '../types';

export class ProfileService {
  constructor(private readonly context: AppContext) {}

  async get(userId: string) {
    const user = await this.context.store.findUserById(userId);
    if (!user) {
      throw createError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      currency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(userId: string, patch: ProfileUpdateInput) {
    return this.context.store.updateUser(userId, patch);
  }
}

