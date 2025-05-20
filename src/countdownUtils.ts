export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  distance: number;
}

export interface CountdownElements {
  daysEl: HTMLElement | null;
  hoursEl: HTMLElement | null;
  minutesEl: HTMLElement | null;
  secondsEl: HTMLElement | null;
  timeContainer: HTMLElement | null;
  eventMessage: HTMLElement | null;
}

// Utility to get the target date from localStorage or default to today + 3 days at 23:59:59
export function getTargetDate(): number {
  const stored = localStorage.getItem('targetDate');
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  defaultDate.setHours(23, 59, 59, 999);
  return defaultDate.getTime();
}

// Returns countdown parts (days, hours, minutes, seconds, distance)
export function getCountdownParts(targetDate: number): CountdownParts {
  const now = Date.now();
  const distance = targetDate - now;
  const clamp = (val: number) => Math.max(0, val);
  
  return {
    days: clamp(Math.floor(distance / (1000 * 60 * 60 * 24))),
    hours: clamp(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
    minutes: clamp(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
    seconds: clamp(Math.floor((distance % (1000 * 60)) / 1000)),
    distance,
  };
}

// Sets the target date in localStorage
export function setTargetDate(date: number): void {
  if (isNaN(date)) {
    throw new Error('Invalid date provided');
  }
  localStorage.setItem('targetDate', String(date));
}

// Updates the countdown UI elements
export function updateCountdownUI(
  elements: CountdownElements,
  countdownParts: CountdownParts,
  onCountdownComplete?: () => void
): void {
  const { days, hours, minutes, seconds, distance } = countdownParts;
  const { daysEl, hoursEl, minutesEl, secondsEl, timeContainer, eventMessage } = elements;

  if (daysEl) daysEl.textContent = String(days);
  if (hoursEl) hoursEl.textContent = String(hours);
  if (minutesEl) minutesEl.textContent = String(minutes);
  if (secondsEl) secondsEl.textContent = String(seconds);

  if (distance < 0) {
    if (timeContainer) timeContainer.style.display = 'none';
    if (eventMessage) eventMessage.style.display = 'block';
    onCountdownComplete?.();
  } else {
    if (timeContainer) timeContainer.style.display = 'flex';
    if (eventMessage) eventMessage.style.display = 'none';
  }
}

// Creates an interval for updating the countdown
export function createCountdownInterval(
  callback: () => void,
  intervalMs: number = 1000
): () => void {
  const intervalId = window.setInterval(callback, intervalMs);
  return () => window.clearInterval(intervalId);
}
