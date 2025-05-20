import {
  getTargetDate,
  getCountdownParts,
  setTargetDate,
  updateCountdownUI,
  createCountdownInterval,
  type CountdownElements
} from './countdownUtils';
import { showConfetti, showCongratsEmojis, hideCongratsEmojis } from './animationUtils';

export class CountdownUIController {
  private readonly elements: CountdownElements;
  private readonly popup: HTMLElement | null;
  private readonly setDateButton: HTMLButtonElement | null;
  private readonly saveDateButton: HTMLButtonElement | null;
  private readonly newDateInput: HTMLInputElement | null;
  private cleanupInterval?: () => void;

  constructor() {
    this.elements = {
      daysEl: document.getElementById('days'),
      hoursEl: document.getElementById('hours'),
      minutesEl: document.getElementById('minutes'),
      secondsEl: document.getElementById('seconds'),
      timeContainer: document.querySelector('.time'),
      eventMessage: document.getElementById('event-message')
    };

    this.popup = document.getElementById('popup') as HTMLElement | null;
    this.setDateButton = document.getElementById('set-date-button') as HTMLButtonElement | null;
    this.saveDateButton = document.getElementById('save-date-button') as HTMLButtonElement | null;
    this.newDateInput = document.getElementById('new-date') as HTMLInputElement | null;

    this.initializeEventListeners();
    this.startCountdown();
  }

  private initializeEventListeners(): void {
    this.setDateButton?.addEventListener('click', () => {
      if (this.popup) {
        this.popup.style.display = 'block';
      }
    });

    this.saveDateButton?.addEventListener('click', () => {
      if (!this.newDateInput?.value) return;

      const newDate = new Date(this.newDateInput.value).getTime();
      if (!isNaN(newDate)) {
        setTargetDate(newDate);
        if (this.popup) {
          this.popup.style.display = 'none';
        }
        hideCongratsEmojis();
        this.restartCountdown();
      }
    });
  }

  private hasReachedTarget = false;

  private updateCountdown = (): void => {
    const targetDate = getTargetDate();
    const countdownParts = getCountdownParts(targetDate);

    updateCountdownUI(this.elements, countdownParts, () => {
      if (!this.hasReachedTarget) {
        showConfetti();
        showCongratsEmojis();
        this.hasReachedTarget = true;
        this.cleanupInterval?.();
      }
    });
  };

  private startCountdown(): void {
    this.updateCountdown();
    this.cleanupInterval = createCountdownInterval(this.updateCountdown);
  }

  private restartCountdown(): void {
    this.cleanupInterval?.();
    this.hasReachedTarget = false;
    this.startCountdown();
  }
}

// Initialize the countdown
new CountdownUIController();
