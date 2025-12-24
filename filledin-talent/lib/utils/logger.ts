type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isServer = typeof window === 'undefined';

function safeSerialize(value: unknown) {
  try {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    return value;
  } catch {
    return '[unserializable]';
  }
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isServer) {
    // Server-side: emit structured logs
    // eslint-disable-next-line no-console
    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(payload));
        break;
      case 'info':
        console.info(JSON.stringify(payload));
        break;
      case 'warn':
        console.warn(JSON.stringify(payload));
        break;
      case 'error':
        console.error(JSON.stringify(payload));
        break;
    }
  } else {
    // Client-side: emit readable logs
    // eslint-disable-next-line no-console
    switch (level) {
      case 'debug':
        console.debug(`[debug] ${message}`, payload);
        break;
      case 'info':
        console.info(`[info] ${message}`, payload);
        break;
      case 'warn':
        console.warn(`[warn] ${message}`, payload);
        break;
      case 'error':
        console.error(`[error] ${message}`, payload);
        break;
    }
  }
}

export const logger = {
  correlationId(): string {
    const rnd = Math.random().toString(36).slice(2);
    const ts = Date.now().toString(36);
    return `${ts}-${rnd}`;
  },
  debug(message: string, meta?: Record<string, unknown>) {
    emit('debug', message, meta ? safeSerialize(meta) as Record<string, unknown> : undefined);
  },
  info(message: string, meta?: Record<string, unknown>) {
    emit('info', message, meta ? safeSerialize(meta) as Record<string, unknown> : undefined);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    emit('warn', message, meta ? safeSerialize(meta) as Record<string, unknown> : undefined);
  },
  error(message: string, meta?: Record<string, unknown>) {
    emit('error', message, meta ? safeSerialize(meta) as Record<string, unknown> : undefined);
  },
};