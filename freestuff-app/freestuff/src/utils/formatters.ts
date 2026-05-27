export function formatCountdown(endTime: string | Date): string {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) return `Ends ${end.toLocaleDateString()}`;
  if (hours > 0) return `⏰ Ends in ${hours}h ${minutes}m`;
  return `⏰ Ends in ${minutes}m`;
}

export function isEndingSoon(endTime: string | Date): boolean {
  const diff = new Date(endTime).getTime() - new Date().getTime();
  return diff > 0 && diff < 60 * 60 * 1000;
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍕', DRINKS: '🥤', APPAREL: '👕', SUPPLIES: '📚', OTHER: '🎁',
};