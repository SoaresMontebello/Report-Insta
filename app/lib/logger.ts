type LogLevel = "info" | "warn" | "error";

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function writeLog(level: LogLevel, event: string, payload: Record<string, unknown> = {}) {
  const message = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...payload,
  });

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.info(message);
}

export function logInfo(event: string, payload: Record<string, unknown> = {}) {
  writeLog("info", event, payload);
}

export function logWarn(event: string, payload: Record<string, unknown> = {}) {
  writeLog("warn", event, payload);
}

export function logError(event: string, error: unknown, payload: Record<string, unknown> = {}) {
  writeLog("error", event, {
    ...payload,
    error: toErrorMessage(error),
  });
}
