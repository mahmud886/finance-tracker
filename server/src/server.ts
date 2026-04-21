import 'dotenv/config';
import { createApp } from './app';

async function bootstrap() {
  const { app, context, lifecycle } = await createApp();

  const server = app.listen(context.config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Finance Tracker API listening on port ${context.config.PORT}`);
  });

  const close = () => {
    lifecycle.markShuttingDown();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

