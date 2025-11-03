import { GameType } from "@shared/schema";

export function getNextDrawDate(gameType: string): Date {
  const now = new Date();
  const nextDraw = new Date(now);

  switch (gameType.toLowerCase()) {
    case GameType.VIRTUAL:
      // Next Sunday at 6:00 PM
      if (now.getDay() === 0) {
        // It's Sunday
        if (now.getHours() < 18) {
          // Before 6PM - use today at 6PM
          nextDraw.setHours(18, 0, 0, 0);
        } else {
          // After 6PM - use next Sunday
          nextDraw.setDate(now.getDate() + 7);
          nextDraw.setHours(18, 0, 0, 0);
        }
      } else {
        // Not Sunday - calculate days until next Sunday
        const daysUntilSunday = 7 - now.getDay();
        nextDraw.setDate(now.getDate() + daysUntilSunday);
        nextDraw.setHours(18, 0, 0, 0);
      }
      break;

    case GameType.NOON:
      // Next day at 12:00 PM
      if (now.getHours() >= 12) {
        nextDraw.setDate(now.getDate() + 1);
      }
      nextDraw.setHours(12, 0, 0, 0);
      break;

    case GameType.NIGHT:
      // Next midnight (12:00 AM)
      nextDraw.setDate(now.getDate() + 1);
      nextDraw.setHours(0, 0, 0, 0);
      break;

    case GameType.MINOR:
    case GameType.MAJOR:
    case GameType.MEGA:
      // Main games - daily at 8:00 PM
      if (now.getHours() >= 20) {
        nextDraw.setDate(now.getDate() + 1);
      }
      nextDraw.setHours(20, 0, 0, 0);
      break;

    default:
      // Default to tomorrow at 8:00 PM
      nextDraw.setDate(now.getDate() + 1);
      nextDraw.setHours(20, 0, 0, 0);
  }

  return nextDraw;
}

export function formatDrawDate(date: Date): string {
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function getDrawSchedule(gameType: string): string {
  switch (gameType.toLowerCase()) {
    case GameType.VIRTUAL:
      return 'Every Sunday at 6:00 PM';
    case GameType.NOON:
      return 'Daily at 12:00 PM';
    case GameType.NIGHT:
      return 'Daily at 12:00 AM (Midnight)';
    case GameType.MINOR:
    case GameType.MAJOR:
    case GameType.MEGA:
      return 'Daily at 8:00 PM';
    default:
      return 'Check game schedule';
  }
}
