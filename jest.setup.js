import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, layout, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, animate, initial, exit, layout, layoutId, ...props }) => <div {...props}>{children}</div>,
    header: ({ children, whileHover, animate, initial, exit, layout, layoutId, ...props }) => <header {...props}>{children}</header>,
    aside: ({ children, whileHover, animate, initial, exit, layout, layoutId, ...props }) => <aside {...props}>{children}</aside>,
    main: ({ children, whileHover, animate, initial, exit, layout, layoutId, ...props }) => <main {...props}>{children}</main>,
    button: ({ children, whileHover, animate, initial, exit, layout, layoutId, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
  useInView: () => [jest.fn(), false],
}))
