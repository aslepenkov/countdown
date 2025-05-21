// animationUtils.ts
// Senior-level: modular, DRY, robust, and clear

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

const CONFETTI_CANVAS_ID = 'confetti-canvas';
const CONFETTI_DURATION = 15000;
const CONFETTI_COUNT = 120;

function createConfettiCanvas(): HTMLCanvasElement {
  let canvas = document.getElementById(CONFETTI_CANVAS_ID) as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = CONFETTI_CANVAS_ID;
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '1000',
    });
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

export function showConfetti(): void {
  const canvas = createConfettiCanvas();
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const confetti: ConfettiParticle[] = Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * CONFETTI_COUNT,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
  }));
  let angle = 0;
  let confettiTimeout: number;
  function drawConfetti() {
    if (!ctx) return; // Ensure ctx is not null
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    for (const c of confetti) {
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
      if (confetti[i].y > canvas.height) confetti.splice(i, 1);
    }
    if (confetti.length > 0) {
      confettiTimeout = window.setTimeout(() => requestAnimationFrame(drawConfetti), 1000 / 60);
    } else {
      setTimeout(() => canvas.parentNode?.removeChild(canvas), 1000);
    }
  }
  drawConfetti();
  setTimeout(() => {
    confetti.length = 0;
    if (confettiTimeout) clearTimeout(confettiTimeout);
  }, CONFETTI_DURATION);
}

function removeElementById(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function hideCongratsEmojis(): void {
  removeElementById('congrats-emoji-left');
  removeElementById('congrats-emoji-right');
}

const BASE_EMOJI_STYLES = {
  position: 'fixed',
  bottom: '10vh',
  height: '10vh',
  fontSize: '10vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '1001',
  opacity: '0',
} as const;

function createEmoji(id: string, isRight: boolean): HTMLElement {
  const existingEmoji = document.getElementById(id);
  if (existingEmoji) return existingEmoji;

  const emoji = document.createElement('div');
  emoji.id = id;
  emoji.textContent = '🎉';

  // Set the flip direction using CSS custom property
  emoji.style.setProperty('--flip', isRight ? '-1' : '1');

  // Apply styles
  Object.assign(emoji.style, BASE_EMOJI_STYLES, {
    [isRight ? 'right' : 'left']: '10vh',
    //transform: 'scale(0)',
  });

  document.body.appendChild(emoji);

  // Force browser reflow to ensure animation plays
  emoji.getBoundingClientRect();

  // Animate in
  requestAnimationFrame(() => {
    emoji.style.opacity = '1';
    emoji.style.animation = 'shakeAndGrow 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
  });

  return emoji;
}

export function showCongratsEmojis(): void {
  createEmoji('congrats-emoji-left', false);
  createEmoji('congrats-emoji-right', true);
}
