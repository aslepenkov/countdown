import { CountdownUIController } from '../src/main';
import * as countdownUtils from '../src/countdownUtils';
import * as animationUtils from '../src/animationUtils';

// Mock countdownUtils
jest.mock('../src/countdownUtils', () => ({
  getTargetDate: jest.fn(),
  getCountdownParts: jest.fn(),
  setTargetDate: jest.fn(),
  updateCountdownUI: jest.fn(),
  createCountdownInterval: jest.fn()
}));

// Mock animationUtils
jest.mock('../src/animationUtils', () => ({
  showConfetti: jest.fn(),
  showCongratsEmojis: jest.fn(),
  hideCongratsEmojis: jest.fn()
}));

describe('CountdownUIController', () => {
  let mockElements: {[key: string]: HTMLElement};
  let cleanupInterval: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock DOM elements
    mockElements = {
      days: document.createElement('div'),
      hours: document.createElement('div'),
      minutes: document.createElement('div'),
      seconds: document.createElement('div'),
      popup: document.createElement('div'),
      'set-date-button': document.createElement('button'),
      'save-date-button': document.createElement('button'),
      'new-date': document.createElement('input'),
      'event-message': document.createElement('div')
    };

    // Setup document.getElementById mock
    document.getElementById = jest.fn((id) => mockElements[id] || null);
    document.querySelector = jest.fn((selector) => 
      selector === '.time' ? document.createElement('div') : null
    );

    // Mock createCountdownInterval
    cleanupInterval = jest.fn();
    (countdownUtils.createCountdownInterval as jest.Mock).mockReturnValue(cleanupInterval);

    // Setup default countdown values
    (countdownUtils.getTargetDate as jest.Mock).mockReturnValue(Date.now() + 86400000); // 1 day ahead
    (countdownUtils.getCountdownParts as jest.Mock).mockReturnValue({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      distance: 86400000
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes with correct elements and starts countdown', () => {
    const controller = new CountdownUIController();
    
    // Should have called getTargetDate and started interval
    expect(countdownUtils.getTargetDate).toHaveBeenCalled();
    expect(countdownUtils.createCountdownInterval).toHaveBeenCalled();
    expect(countdownUtils.updateCountdownUI).toHaveBeenCalled();
  });

  test('handles set date button click', () => {
    const controller = new CountdownUIController();
    
    // Simulate clicking the set date button
    mockElements['set-date-button'].click();
    
    expect(mockElements.popup.style.display).toBe('block');
  });

  test('handles save date button click with valid date', () => {
    const controller = new CountdownUIController();
    const newDate = '2025-12-25';
    const newTimestamp = new Date(newDate).getTime();
    
    // Setup input value
    (mockElements['new-date'] as HTMLInputElement).value = newDate;
    
    // Simulate clicking the save date button
    mockElements['save-date-button'].click();
    
    expect(countdownUtils.setTargetDate).toHaveBeenCalledWith(newTimestamp);
    expect(mockElements.popup.style.display).toBe('none');
    expect(animationUtils.hideCongratsEmojis).toHaveBeenCalled();
    expect(cleanupInterval).toHaveBeenCalled();
    expect(countdownUtils.createCountdownInterval).toHaveBeenCalledTimes(2);
  });

  test('handles countdown completion and prevents multiple confetti triggers', () => {
    // Mock countdown as completed
    (countdownUtils.getCountdownParts as jest.Mock).mockReturnValue({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      distance: -1
    });

    const controller = new CountdownUIController();
    
    // The updateCountdownUI call should trigger the completion callback
    const updateUICalls = (countdownUtils.updateCountdownUI as jest.Mock).mock.calls;
    const lastCall = updateUICalls[updateUICalls.length - 1];
    const completionCallback = lastCall[2];
    
    // Simulate countdown completion
    completionCallback();
    
    // First time should show confetti
    expect(animationUtils.showConfetti).toHaveBeenCalledTimes(1);
    expect(animationUtils.showCongratsEmojis).toHaveBeenCalledTimes(1);
    expect(cleanupInterval).toHaveBeenCalled();

    // Reset mocks
    jest.clearAllMocks();

    // Simulate another update
    completionCallback();

    // Second time should not show confetti
    expect(animationUtils.showConfetti).not.toHaveBeenCalled();
    expect(animationUtils.showCongratsEmojis).not.toHaveBeenCalled();
  });

  test('ignores save date button click with invalid date', () => {
    const controller = new CountdownUIController();
    
    // Setup invalid input value
    (mockElements['new-date'] as HTMLInputElement).value = 'invalid-date';
    
    // Simulate clicking the save date button
    mockElements['save-date-button'].click();
    
    expect(countdownUtils.setTargetDate).not.toHaveBeenCalled();
    expect(cleanupInterval).not.toHaveBeenCalled();
  });

  test('handles empty date input', () => {
    const controller = new CountdownUIController();
    
    // Setup empty input value
    (mockElements['new-date'] as HTMLInputElement).value = '';
    
    // Simulate clicking the save date button
    mockElements['save-date-button'].click();
    
    expect(countdownUtils.setTargetDate).not.toHaveBeenCalled();
    expect(cleanupInterval).not.toHaveBeenCalled();
  });
});
