import { getTargetDate } from './countdownUtils';

export function updateDebugDisplay(debugElement: HTMLElement | null): void {
  if (!debugElement) return;
  const storedDate = localStorage.getItem('targetDate');
  let debugInfo: { targetDate: string } = { targetDate: '' };
  if (storedDate) {
    const humanReadableDate = new Date(parseInt(storedDate)).toLocaleString();
    debugInfo.targetDate = `${storedDate} (${humanReadableDate})`;
  } else {
    debugInfo.targetDate = 'Not Set';
  }
  debugElement.textContent = `LocalStorage: ${JSON.stringify(debugInfo, null, 2)}`;
}
