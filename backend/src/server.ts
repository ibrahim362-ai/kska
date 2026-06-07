import app from './app';
import { createServer } from 'http';
import { execSync } from 'child_process';
import { config } from './config';
import { initializeSocket } from './socket/socket';
import { logger } from './utils/logger';

function killPortWindows(port: number) {
  try {
    const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== String(process.pid)) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        logger.info(`Killed process ${pid} on port ${port}`);
      }
    }
  } catch { /* no process found */ }
}

function startServer() {
  const httpServer = createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`Health: http://localhost:${config.port}/api/health`);
    logger.info(`API Docs: http://localhost:${config.port}/api/docs`);
  });

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${config.port} is in use. Killing and retrying...`);
      if (process.platform === 'win32') {
        killPortWindows(config.port);
      } else {
        try { execSync(`lsof -ti:${config.port} | xargs kill -9`, { stdio: 'ignore' }); } catch {}
      }
      setTimeout(startServer, 1500);
    } else {
      logger.error('Server error', { message: err.message });
      process.exit(1);
    }
  });
}

startServer();

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`);
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
  process.exit(1);
});
