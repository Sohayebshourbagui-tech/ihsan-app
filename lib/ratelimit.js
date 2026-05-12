const windows = new Map();

export function rateLimit(key, limit, windowMs) {
  const now   = Date.now();
  const entry = windows.get(key);

  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: new Date(entry.resetAt) };
}

// Evict expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of windows.entries()) {
    if (entry.resetAt <= now) windows.delete(key);
  }
}, 10 * 60 * 1000);
