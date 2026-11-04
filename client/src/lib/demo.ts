const DEMO_SESSION_KEY = "afribet.demoSession.v1";

export function getDemoSessionId(): string {
  const existing = localStorage.getItem(DEMO_SESSION_KEY);
  if (existing) return existing;
  const sessionId = crypto.randomUUID();
  localStorage.setItem(DEMO_SESSION_KEY, sessionId);
  return sessionId;
}

export function demoHeaders(): Record<string, string> {
  return { "X-Demo-Session-Id": getDemoSessionId() };
}
