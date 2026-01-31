export function formatDate(dateStr: string, style: 'short' | 'long' = 'short'): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric'
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** @deprecated Use formatTime instead */
export const formatDuration = formatTime;
