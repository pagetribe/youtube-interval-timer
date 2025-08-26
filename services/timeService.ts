export const formatSecondsToTime = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '0';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // If there are minutes, display in m:ss format for clarity and standard representation.
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Otherwise, if under a minute, just show the seconds.
  return `${seconds}`;
};

export const parseTimeToSeconds = (timeStr: string): number | null => {
    if (!timeStr.trim()) return null;

    // Handle plain seconds
    if (!timeStr.includes(':')) {
      const seconds = parseInt(timeStr, 10);
      return !isNaN(seconds) && seconds >= 0 ? seconds : null;
    }

    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
      return null;
    }

    return (minutes * 60) + seconds;
};
