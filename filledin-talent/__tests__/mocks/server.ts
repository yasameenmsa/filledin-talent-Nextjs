// MSW v2 setup for Node.js environment
import { setupServer } from 'msw/node'
import handlers from './handlers'

// Create MSW server for Node.js environment (API route testing)
export const server = setupServer(...handlers)

// Setup and teardown for tests
export const setupMSW = () => {
  server.listen()
}

export const teardownMSW = () => {
  server.close()
}

export const resetHandlers = () => {
  server.resetHandlers()
}

// Add custom handlers for specific test scenarios
export const addCustomHandlers = (...newHandlers: typeof handlers) => {
  server.use(...newHandlers)
}
