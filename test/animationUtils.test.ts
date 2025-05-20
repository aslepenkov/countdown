import { showConfetti, showCongratsEmojis, hideCongratsEmojis } from '../src/animationUtils';

describe('animationUtils', () => {
  beforeEach(() => {
    // Mock canvas and context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      clearRect: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      restore: jest.fn(),
      save: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn()
    };

    const mockCanvas = {
      getContext: jest.fn(() => mockContext),
      width: 800,
      height: 600,
      style: {},
      parentElement: {
        removeChild: jest.fn()
      }
    };

    // Mock document methods
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === 'div') {
        return {
          id: '',
          style: {},
          textContent: '',
          getBoundingClientRect: jest.fn()
        } as unknown as HTMLDivElement;
      }
      return {} as any;
    });

    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.getElementById = jest.fn().mockReturnValue(null);

    // Clear any existing elements
    document.querySelectorAll = jest.fn().mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emoji animations', () => {
    it('creates left and right emojis with correct styles', () => {
      showCongratsEmojis();

      const createElementCalls = (document.createElement as jest.Mock).mock.calls;
      const appendChildCalls = (document.body.appendChild as jest.Mock).mock.calls;

      // Should create two divs
      expect(createElementCalls.filter(call => call[0] === 'div')).toHaveLength(2);
      expect(appendChildCalls).toHaveLength(2);

      // Get the created emojis
      const [leftEmoji, rightEmoji] = appendChildCalls.map(call => call[0]);

      // Verify base styles are applied to both
      [leftEmoji, rightEmoji].forEach(emoji => {
        expect(emoji.style).toMatchObject({
          position: 'fixed',
          bottom: '5vh',
          height: '5vh',
          fontSize: '5vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '1001',
          opacity: '0',
          transition: expect.stringContaining('cubic-bezier')
        });
      });

      // Verify left emoji specific styles
      expect(leftEmoji.style.left).toBe('10vh');
      expect(leftEmoji.style.transform).toBe('scale(0.5, 0.5)');
      expect(leftEmoji.id).toBe('congrats-emoji-left');

      // Verify right emoji specific styles
      expect(rightEmoji.style.right).toBe('10vh');
      expect(rightEmoji.style.transform).toBe('scale(0.5, -0.5)');
      expect(rightEmoji.id).toBe('congrats-emoji-right');
    });

    it('animates emojis properly using requestAnimationFrame', () => {
      // Mock requestAnimationFrame
      const mockRAF = jest.fn();
      window.requestAnimationFrame = mockRAF;

      showCongratsEmojis();

      // Should call requestAnimationFrame twice (once for each emoji)
      expect(mockRAF).toHaveBeenCalledTimes(2);

      // Get the animation callbacks
      const [leftCallback, rightCallback] = mockRAF.mock.calls.map(call => call[0]);

      // Get the created emojis
      const appendChildCalls = (document.body.appendChild as jest.Mock).mock.calls;
      const [leftEmoji, rightEmoji] = appendChildCalls.map(call => call[0]);

      // Execute animation callbacks
      leftCallback();
      rightCallback();

      // Verify final styles
      expect(leftEmoji.style.opacity).toBe('1');
      expect(leftEmoji.style.transform).toBe('scale(1, 1)');
      expect(rightEmoji.style.opacity).toBe('1');
      expect(rightEmoji.style.transform).toBe('scale(1, -1)');
    });

    it('removes emojis when hiding', () => {
      const mockLeftEmoji = { remove: jest.fn() };
      const mockRightEmoji = { remove: jest.fn() };
      
      // Setup getElementById mock for specific IDs
      const getElementByIdMock = jest.fn().mockImplementation((id: string) => {
        if (id === 'congrats-emoji-left') return mockLeftEmoji;
        if (id === 'congrats-emoji-right') return mockRightEmoji;
        return null;
      });
      document.getElementById = getElementByIdMock;

      hideCongratsEmojis();
      
      expect(mockLeftEmoji.remove).toHaveBeenCalled();
      expect(mockRightEmoji.remove).toHaveBeenCalled();
    });
  });

  describe('confetti animation', () => {
    it('creates and sets up confetti canvas', () => {
      showConfetti();
      
      expect(document.createElement).toHaveBeenCalledWith('canvas');
      const appendChildCalls = (document.body.appendChild as jest.Mock).mock.calls;
      const canvas = appendChildCalls[0][0];
      
      expect(canvas.style).toMatchObject({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '1000'
      });
    });
  });
});
