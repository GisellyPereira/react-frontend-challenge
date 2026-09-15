import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { toast } from 'sonner'

import { server } from './mocks/server'

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  value: () => undefined,
})
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => undefined,
})
for (const method of [
  'setPointerCapture',
  'releasePointerCapture',
  'hasPointerCapture',
]) {
  Object.defineProperty(HTMLElement.prototype, method, {
    configurable: true,
    value: () => false,
  })
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
  toast.dismiss()
})

afterAll(() => {
  server.close()
})
