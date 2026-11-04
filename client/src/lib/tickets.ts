const STORAGE_KEY = "afribet.ticketIds";
const MAX_LOCAL_TICKETS = 100;

export function getTicketIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string =>
      typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)
    ).slice(0, MAX_LOCAL_TICKETS);
  } catch {
    return [];
  }
}

export function saveTicketId(id: string): void {
  const ticketIds = [id, ...getTicketIds().filter((ticketId) => ticketId !== id)]
    .slice(0, MAX_LOCAL_TICKETS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ticketIds));
}
