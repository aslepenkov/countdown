import { getTargetDate, getCountdownParts, setTargetDate } from './countdownUtils';

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
// const debugElement = document.getElementById('debug') as HTMLElement | null;

type ConfettiParticle = {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncremental: number;
};

function showConfetti() {
  let confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  if (!confettiCanvas) {
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100vw';
    confettiCanvas.style.height = '100vh';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '1000';
    document.body.appendChild(confettiCanvas);
  }
  const canvas = confettiCanvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const confettiCount = 120;
  const confetti: ConfettiParticle[] = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05
    });
  }
  let angle = 0;
  function drawConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(c.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
      ctx.stroke();
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      if (confetti[i].y > canvas.height) {
        confetti.splice(i, 1);
      }
    }
    if (confetti.length > 0) {
      requestAnimationFrame(drawConfetti);
    } else {
      setTimeout(() => { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }, 1000);
    }
  }
  drawConfetti();
}

function showCongratsEmojis() {
  let leftEmoji = document.getElementById('congrats-emoji-left') as HTMLElement | null;
  if (!leftEmoji) {
    leftEmoji = document.createElement('div');
    leftEmoji.id = 'congrats-emoji-left';
    leftEmoji.textContent = '🎉';
    leftEmoji.style.position = 'fixed';
    leftEmoji.style.bottom = '30px';
    leftEmoji.style.left = '30px';
    leftEmoji.style.fontSize = '3rem';
    leftEmoji.style.zIndex = '1001';
    leftEmoji.style.opacity = '0';
    leftEmoji.style.transform = 'scale(0.5)';
    leftEmoji.style.transition = 'opacity 0.7s, transform 0.7s';
    document.body.appendChild(leftEmoji);
    setTimeout(() => {
      leftEmoji!.style.opacity = '1';
      leftEmoji!.style.transform = 'scale(1.2)';
    }, 100);
  }
  let rightEmoji = document.getElementById('congrats-emoji-right') as HTMLElement | null;
  if (!rightEmoji) {
    rightEmoji = document.createElement('div');
    rightEmoji.id = 'congrats-emoji-right';
    rightEmoji.textContent = '🎉';
    rightEmoji.style.position = 'fixed';
    rightEmoji.style.bottom = '30px';
    rightEmoji.style.right = '30px';
    rightEmoji.style.fontSize = '3rem';
    rightEmoji.style.zIndex = '1001';
    rightEmoji.style.opacity = '0';
    rightEmoji.style.transform = 'scale(0.5)';
    rightEmoji.style.transition = 'opacity 0.7s, transform 0.7s';
    document.body.appendChild(rightEmoji);
    setTimeout(() => {
      rightEmoji!.style.opacity = '1';
      rightEmoji!.style.transform = 'scale(1.2)';
    }, 100);
  }
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
      updateCountdown();
      // updateDebugDisplay();
    }
  });
}

setInterval(updateCountdown, 1000);
updateCountdown();
// updateDebugDisplay();
