export function getTargetDate(): number {
  const stored = localStorage.getItem('targetDate');
  return stored ? parseInt(stored) : new Date('May 23, 2025 23:59:59').getTime();
}

export function getCountdownParts(targetDate: number) {
  const now = Date.now();
  const distance = targetDate - now;
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    distance,
  };
}

export function setTargetDate(date: number): void {
  localStorage.setItem('targetDate', String(date));
}
