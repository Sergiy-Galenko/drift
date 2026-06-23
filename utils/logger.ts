type LogPayload = string | number | boolean | Error | Record<string, unknown> | null | undefined;

function write(method: 'info' | 'warn' | 'error', payload: LogPayload, meta?: Record<string, unknown>) {
  if (!__DEV__) {
    return;
  }

  if (meta) {
    console[method](payload, meta);
    return;
  }

  console[method](payload);
}

export const logger = {
  log: (payload: LogPayload, meta?: Record<string, unknown>) => write('info', payload, meta),
  warn: (payload: LogPayload, meta?: Record<string, unknown>) => write('warn', payload, meta),
  error: (payload: LogPayload, meta?: Record<string, unknown>) => write('error', payload, meta),
};
