import { describe, test, expect } from 'vitest'
import api from './client'

// Run the request interceptors without sending anything over the network.
async function applyInterceptors(config) {
  let result = { headers: {}, ...config }
  for (const { fulfilled } of api.interceptors.request.handlers) {
    if (fulfilled) result = await fulfilled(result)
  }
  return result
}

describe('api client', () => {
  test('attaches the bearer token from localStorage', async () => {
    localStorage.setItem('token', 'abc.def.ghi')
    const config = await applyInterceptors({})
    expect(config.headers.Authorization).toBe('Bearer abc.def.ghi')
  })

  test('sends no Authorization header when logged out', async () => {
    const config = await applyInterceptors({})
    expect(config.headers.Authorization).toBeUndefined()
  })
})
