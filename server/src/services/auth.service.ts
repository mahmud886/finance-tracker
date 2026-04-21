import { randomBytes, randomUUID } from 'node:crypto';
import { hashPassword, signAccessToken, verifyPassword } from '../auth';
import { createError, unauthorized } from '../http';
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  SupabaseExchangeInput,
} from '../domain';
import type { AppContext } from '../types';

interface SupabaseUserPayload {
  id: string;
  email?: string | null;
}

export class AuthService {
  constructor(private readonly context: AppContext) {}

  private getJwtSecret() {
    const secret = this.context.config.JWT_SECRET;
    if (!secret) {
      throw createError(500, 'AUTH_NOT_CONFIGURED', 'Local JWT auth is not configured for this server');
    }

    return secret;
  }

  get config() {
    return this.context.config;
  }

  async signup(input: SignupInput) {
    const passwordHash = await hashPassword(input.password);
    const user = await this.context.store.createUser(input, passwordHash);
    const token = signAccessToken(
      { userId: user.id, email: user.email },
      {
        jwtSecret: this.getJwtSecret(),
        jwtExpiresIn: this.context.config.JWT_EXPIRES_IN,
        cookieName: this.context.config.COOKIE_NAME,
      },
    );

    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await this.context.store.findUserByEmail(input.email);
    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      throw unauthorized('Invalid email or password');
    }

    const token = signAccessToken(
      { userId: user.id, email: user.email },
      {
        jwtSecret: this.getJwtSecret(),
        jwtExpiresIn: this.context.config.JWT_EXPIRES_IN,
        cookieName: this.context.config.COOKIE_NAME,
      },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async exchangeSupabaseToken(input: SupabaseExchangeInput) {
    if (this.context.config.AUTH_PROVIDER !== 'supabase') {
      throw createError(400, 'AUTH_PROVIDER_MISMATCH', 'Supabase token exchange is disabled');
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = this.context.config;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw createError(500, 'AUTH_NOT_CONFIGURED', 'Supabase auth settings are missing');
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      throw unauthorized('Invalid Supabase access token');
    }

    const user = (await response.json()) as SupabaseUserPayload;
    if (!user?.id) {
      throw unauthorized('Invalid Supabase user payload');
    }

    const token = signAccessToken(
      { userId: user.id, email: user.email ?? '' },
      {
        jwtSecret: this.getJwtSecret(),
        jwtExpiresIn: this.context.config.JWT_EXPIRES_IN,
        cookieName: this.context.config.COOKIE_NAME,
      },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email ?? '',
      },
      expiresIn: this.context.config.JWT_EXPIRES_IN,
    };
  }

  async logout(jti?: string) {
    if (jti) {
      await this.context.store.revokeToken(jti);
    }

    return { loggedOut: true };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.context.store.findUserByEmail(input.email);

    let resetToken: string | null = null;
    if (user) {
      resetToken = `${randomUUID()}-${randomBytes(8).toString('hex')}`;
      const expiresAt = new Date(Date.now() + this.context.config.RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
      await this.context.store.setResetToken(user.id, resetToken, expiresAt);
    }

    return {
      accepted: true,
      ...(this.context.config.NODE_ENV === 'production' ? {} : { resetToken }),
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const nextHash = await hashPassword(input.password);
    await this.context.store.resetPassword({
      token: input.token,
      password: nextHash,
      confirmPassword: nextHash,
    });

    return { updated: true };
  }

  async me(userId: string) {
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
}

