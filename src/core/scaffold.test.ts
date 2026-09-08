import { describe, expect, it } from 'vitest'

import { scaffoldIsWired } from '@/core/scaffold'

describe('scaffold', () => {
  it('runs a test through Vitest and resolves the @/ alias', () => {
    expect(scaffoldIsWired()).toBe(true)
  })
})
