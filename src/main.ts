import { getTargetDate, getCountdownParts, setTargetDate } from './countdownUtils';
import { showConfetti, showCongratsEmojis } from './animationUtils';

// Reference to elements
const daysEl = document.getElementById('days') as HTMLElement | null;
const hoursEl = document.getElementById('hours') as HTMLElement | null;
const minutesEl = document.getElementById('minutes') as HTMLElement | null;
const secondsEl = document.getElementById('seconds') as HTMLElement | null;
const popup = document.getElementById('popup') as HTMLElement | null;
const setDateButton = document.getElementById('set-date-button') as HTMLButtonElement | null;
const saveDateButton = document.getElementById('save-date-button') as HTMLButtonElement | null;
const newDateInput = document.getElementById('new-date') as HTMLInputElement | null;
const eventMessage = document.getElementById('event-message') as HTMLElement | null;
const timeContainer = document.querySelector('.time') as HTMLElement | null;

let countdownInterval: number | undefined = undefined;

function startCountdownInterval() {
  if (countdownInterval !== undefined) {
    clearInterval(countdownInterval);
  }
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const targetDate = getTargetDate();
  const { days, hours, minutes, seconds, distance } = getCountdownParts(targetDate);

  if (daysEl) daysEl.textContent = days >= 0 ? String(days) : '0';
  if (hoursEl) hoursEl.textContent = hours >= 0 ? String(hours) : '0';
  if (minutesEl) minutesEl.textContent = minutes >= 0 ? String(minutes) : '0';
  if (secondsEl) secondsEl.textContent = seconds >= 0 ? String(seconds) : '0';

  if (distance < 0) {
    if (timeContainer) timeContainer.style.display = 'none';
    if (eventMessage) eventMessage.style.display = 'block';
    showConfetti();
    showCongratsEmojis();
    if (countdownInterval !== undefined) {
      clearInterval(countdownInterval);
      countdownInterval = undefined;
    }
  } else {
    if (timeContainer) timeContainer.style.display = 'flex';
    if (eventMessage) eventMessage.style.display = 'none';
  }
}

if (setDateButton && popup) {
  setDateButton.addEventListener('click', () => {
    popup.style.display = 'block';
  });
}

if (saveDateButton && newDateInput && popup) {
  saveDateButton.addEventListener('click', () => {
    const newDate = newDateInput.value;
    if (newDate) {
      const targetDate = new Date(newDate).getTime();
      setTargetDate(targetDate);
      popup.style.display = 'none';
      startCountdownInterval(); // restart interval if new date is set
      updateCountdown();
    }
  });
}

startCountdownInterval();
updateCountdown();
