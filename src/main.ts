import {
  getTargetDate,
  getCountdownParts,
  setTargetDate,
  updateCountdownUI,
  createCountdownInterval,
  type CountdownElements
} from './countdownUtils';
import { showConfetti, showCongratsEmojis, hideCongratsEmojis } from './animationUtils';
import './style.css';
import './dial.css';

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

/**
 * Dial (kitchen timer) logic
 * Allows user to rotate the dial by dragging, updates label and emits events
 */
class Dial {
  private dial: HTMLElement;
  private indicator: HTMLElement;
  private label: HTMLElement;
  private angle: number = 0;
  private isDragging: boolean = false;
  private startAngle: number = 0;
  private onChange: (minutes: number) => void;

  constructor(dialId: string, indicatorId: string, labelId: string, onChange: (minutes: number) => void) {
    this.dial = document.getElementById(dialId)!;
    this.indicator = document.getElementById(indicatorId)!;
    this.label = document.getElementById(labelId)!;
    this.onChange = onChange;
    this.attachEvents();
    this.updateUI();
  }

  private attachEvents() {
    this.dial.addEventListener('mousedown', this.startDrag);
    this.dial.addEventListener('touchstart', this.startDrag, { passive: false });
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('touchmove', this.onDrag, { passive: false });
    document.addEventListener('mouseup', this.endDrag);
    document.addEventListener('touchend', this.endDrag);
  }

  private getCenter() {
    const rect = this.dial.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  private getAngleFromEvent = (e: MouseEvent | TouchEvent) => {
    const center = this.getCenter();
    let clientX: number, clientY: number;
    if (e instanceof TouchEvent) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  private startDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.startAngle = this.getAngleFromEvent(e) - this.angle;
  };

  private onDrag = (e: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    const angle = this.getAngleFromEvent(e) - this.startAngle;
    // Clamp angle to [0, 360)
    this.angle = ((angle % 360) + 360) % 360;
    this.updateUI();
    this.emitChange();
  };

  private endDrag = () => {
    this.isDragging = false;
  };

  private updateUI() {
    // Rotate the dial itself, so the notch moves with it
    this.dial.style.transform = `rotate(${this.angle}deg)`;
    // The indicator is always at the top of the dial in dial-local coordinates
    const minutes = Math.round(this.angle / 6); // 360deg = 60min
    this.label.textContent = `${minutes} min`;
  }

  private emitChange() {
    const minutes = Math.round(this.angle / 6);
    this.onChange(minutes);
  }

  // For testing: set angle directly
  public setAngle(deg: number) {
    this.angle = ((deg % 360) + 360) % 360;
    this.updateUI();
    this.emitChange();
  }

  public getMinutes() {
    return Math.round(this.angle / 6);
  }
}

// Initialize the countdown
new CountdownUIController();

// Example usage: log minutes to console
const dial = new Dial('dial', 'dial-indicator', 'dial-label', (minutes) => {
  // You can hook this to your timer logic
  // console.log('Dial set to', minutes, 'minutes');
});
