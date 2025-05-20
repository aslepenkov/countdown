const debugElement = document.getElementById('debug');
// Reference to elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const popup = document.getElementById('popup');
const setDateButton = document.getElementById('set-date-button');
const saveDateButton = document.getElementById('save-date-button');
const newDateInput = document.getElementById('new-date');

// Countdown update function
function updateCountdown() {
  let targetDate = localStorage.getItem('targetDate')
    ? parseInt(localStorage.getItem('targetDate'))
    : new Date('May 23, 2025 23:59:59').getTime();

  const now = new Date().getTime();
  const distance = targetDate - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = days >= 0 ? days : 0;
  hoursEl.textContent = hours >= 0 ? hours : 0;
  minutesEl.textContent = minutes >= 0 ? minutes : 0;
  secondsEl.textContent = seconds >= 0 ? seconds : 0;

  if (distance < 0) {
    // Countdown is over
    document.querySelector('.time').style.display = 'none'; // Hide the timer
    document.getElementById('event-message').style.display = 'block'; // Show the event message
    clearInterval(interval); // Stop the timer
  } else {
    // Update the timer numbers
    document.getElementById('days').textContent = days >= 0 ? days : 0;
    document.getElementById('hours').textContent = hours >= 0 ? hours : 0;
    document.getElementById('minutes').textContent = minutes >= 0 ? minutes : 0;
    document.getElementById('seconds').textContent = seconds >= 0 ? seconds : 0;

    // Make sure the timer is visible and event message is hidden
    document.querySelector('.time').style.display = 'flex';
    document.getElementById('event-message').style.display = 'none';
  }
}
function updateDebugDisplay() {
  const storedDate = localStorage.getItem('targetDate');
  let debugInfo = {};

  // Check if targetDate exists in localStorage
  if (storedDate) {
    const humanReadableDate = new Date(parseInt(storedDate)).toLocaleString(); // Convert to readable date-time
    debugInfo.targetDate = `${storedDate} (${humanReadableDate})`; // Show both timestamp and human-readable date
  } else {
    debugInfo.targetDate = 'Not Set';
  }

  debugElement.textContent = `LocalStorage: ${JSON.stringify(debugInfo, null, 2)}`;
}

// Show popup
setDateButton.addEventListener('click', () => {
  popup.style.display = 'block';
});

// Update debug display whenever targetDate is set or loaded
saveDateButton.addEventListener('click', () => {
  const newDate = newDateInput.value;
  if (newDate) {
    const targetDate = new Date(newDate).getTime(); // Fix: declare targetDate as local
    localStorage.setItem('targetDate', targetDate); // Save in localStorage
    // updateDebugDisplay(); // Refresh debug info
    popup.style.display = 'none'; // Hide popup
    updateCountdown();
  }
});

// Update countdown every second
const interval = setInterval(updateCountdown, 1000);
updateCountdown();