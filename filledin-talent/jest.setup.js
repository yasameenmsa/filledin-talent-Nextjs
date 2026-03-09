import '@testing-library/jest-dom'

// Minimal mocking for Request/Response/Headers in Node/jsdom
global.Headers = class Headers extends Map {
  constructor(init) {
    super();
    if (init) {
      if (Array.isArray(init)) {
        for (const [k, v] of init) this.set(k, v);
      } else if (typeof init === 'object') {
        for (const [k, v] of Object.entries(init)) this.set(k, v);
      }
    }
  }
  get(key) { return super.get(key.toLowerCase()) || null; }
  set(key, value) { super.set(key.toLowerCase(), value); }
}
global.Request = class Request {
  constructor(url, init = {}) {
    Object.defineProperty(this, 'url', { value: url.toString(), writable: true, configurable: true });
    Object.defineProperty(this, 'method', { value: init.method || 'GET', writable: true, configurable: true });
    Object.defineProperty(this, 'headers', { value: new global.Headers(init.headers), writable: true, configurable: true });
    Object.defineProperty(this, 'body', { value: init.body || null, writable: true, configurable: true });
  }
}
global.Response = class Response {
  constructor(body, init = {}) {
    Object.defineProperty(this, 'body', { value: body, writable: true, configurable: true });
    Object.defineProperty(this, 'status', { value: init.status || 200, writable: true, configurable: true });
    Object.defineProperty(this, 'headers', { value: init.headers || new global.Headers(), writable: true, configurable: true });

    this.json = () => {
      try {
        return Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body);
      } catch {
        return Promise.resolve(body);
      }
    };
  }
  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: new global.Headers([['content-type', 'application/json']])
    });
  }
}


// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key'
process.env.JWT_SECRET = 'test-jwt-secret'

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
