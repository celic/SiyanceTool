/**
 * Setup for the `ui` test project (see vite.config.ts).
 *
 * Registers jest-dom's matchers and unmounts anything a test rendered, so one
 * test's DOM never leaks into the next. Cleanup is explicit rather than
 * automatic because `globals` is off — tests import what they use.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
