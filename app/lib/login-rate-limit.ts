const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type LoginAttemptWindow = {
  count: number;
  startedAt: number;
};

const attemptsByKey = new Map<string, LoginAttemptWindow>();

function getCurrentWindow(now: number, current?: LoginAttemptWindow) {
  if (!current || now - current.startedAt > WINDOW_MS) {
    return { count: 0, startedAt: now };
  }

  return current;
}

export function createLoginRateLimitKey(email: string, ipAddress?: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedIp = ipAddress?.trim() || "unknown";
  return `${normalizedEmail}:${normalizedIp}`;
}

export function isLoginRateLimited(key: string, now = Date.now()) {
  const currentWindow = getCurrentWindow(now, attemptsByKey.get(key));
  attemptsByKey.set(key, currentWindow);
  return currentWindow.count >= MAX_ATTEMPTS;
}

export function registerLoginFailure(key: string, now = Date.now()) {
  const currentWindow = getCurrentWindow(now, attemptsByKey.get(key));
  currentWindow.count += 1;
  attemptsByKey.set(key, currentWindow);
}

export function clearLoginFailures(key: string) {
  attemptsByKey.delete(key);
}
