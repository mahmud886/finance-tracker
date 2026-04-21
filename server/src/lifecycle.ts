export class AppLifecycle {
  private shuttingDown = false;

  constructor(public readonly startedAt = Date.now()) {}

  get isShuttingDown() {
    return this.shuttingDown;
  }

  markShuttingDown() {
    this.shuttingDown = true;
  }
}

