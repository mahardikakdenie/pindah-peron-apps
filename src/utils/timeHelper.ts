export const getMinuteDiff = (timeStr1: string, timeStr2: string): number => {
  if (!timeStr1 || !timeStr2 || timeStr1 === '-' || timeStr2 === '-') return 0;
  
  const [h1, m1, s1] = timeStr1.split(':').map(Number);
  const [h2, m2, s2] = timeStr2.split(':').map(Number);
  
  let totalSeconds1 = h1 * 3600 + m1 * 60 + (s1 || 0);
  let totalSeconds2 = h2 * 3600 + m2 * 60 + (s2 || 0);

  // Midnight crossing logic: 
  // If target time is much earlier than origin, assume it's next day (e.g. 23:50 to 00:10)
  if (totalSeconds2 < totalSeconds1 - 12 * 3600) {
    totalSeconds2 += 24 * 3600;
  } else if (totalSeconds1 < totalSeconds2 - 12 * 3600) {
    totalSeconds1 += 24 * 3600;
  }

  return Math.floor((totalSeconds2 - totalSeconds1) / 60);
};

export const getTimeRangeFromBase = (baseTimeStr: string, hourRange: number = 3) => {
  const [h, m] = baseTimeStr.split(':').map(Number);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const timeFrom = `${pad(h)}:${pad(m)}`;

  let nextH = h + hourRange;
  if (nextH >= 24) nextH = nextH % 24;

  const timeTo = `${pad(nextH)}:${pad(m)}`;

  return { timeFrom, timeTo };
};

export const getCurrentTimeParams = () => {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();

  if (h < 4) {
    h = 4;
    m = 0;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeFrom = `${pad(h)}:${pad(m)}`;

  let nextH = h + 1;
  if (nextH >= 24) nextH = 0;
  const timeTo = `${pad(nextH)}:${pad(m)}`;

  return { timeFrom, timeTo };
};

/**
 * Checks if the current time has passed the given time string (HH:mm:ss)
 * Handles midnight crossing for KRL operational hours.
 */
export const isTimePassed = (timeStr: string, now: Date): boolean => {
  if (!timeStr || timeStr === '-') return false;
  const parts = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(parts[0], parts[1], parts[2] || 0, 0);

  // Logic: if target is 23:00 and now is 01:00, target was in the "past" (yesterday)
  if (parts[0] >= 22 && now.getHours() <= 4) {
    target.setDate(target.getDate() - 1);
  } 
  // Logic: if target is 01:00 and now is 23:00, target is in the "future" (tomorrow)
  else if (parts[0] <= 4 && now.getHours() >= 22) {
    target.setDate(target.getDate() + 1);
  }

  return now >= target;
};

/**
 * Adds or subtracts minutes to a time string.
 */
export const addMinutesToTimeStr = (timeStr: string, addedMinutes: number): string => {
  if (!timeStr || timeStr === '-' || addedMinutes === 0) return timeStr;
  const [h, m, s] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m + addedMinutes, s || 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
