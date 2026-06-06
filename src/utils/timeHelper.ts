export const getMinuteDiff = (timeStr1: string, timeStr2: string): number => {
  const [h1, m1, s1] = timeStr1.split(':').map(Number);
  const [h2, m2, s2] = timeStr2.split(':').map(Number);
  const totalSeconds1 = h1 * 3600 + m1 * 60 + (s1 || 0);
  const totalSeconds2 = h2 * 3600 + m2 * 60 + (s2 || 0);
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

  // KRL biasanya mulai beroperasi jam 04:00 pagi.
  // Jika jam di HP masih kurang dari jam 4, kita set otomatis ke jam 04:00.
  if (h < 4) {
    h = 4;
    m = 0;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const timeFrom = `${pad(h)}:${pad(m)}`;

  // Range 1 jam ke depan untuk pencarian jadwal
  let nextH = h + 1;
  if (nextH >= 24) nextH = 0;

  const timeTo = `${pad(nextH)}:${pad(m)}`;

  return { timeFrom, timeTo };
};
