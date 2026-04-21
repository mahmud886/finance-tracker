export class RepositoryError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class ValidationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends RepositoryError {
  constructor(resource: string, reason: string) {
    super('CONFLICT', `${resource} conflict: ${reason}`, 409);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends RepositoryError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

