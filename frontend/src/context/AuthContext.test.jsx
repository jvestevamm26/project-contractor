import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { loginUser } from '../api/auth'
import { fakeToken } from '../test/utils'

vi.mock('../api/auth', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

let auth
function Probe() {
  auth = useAuth()
  return <div data-testid="user">{auth.user ? `${auth.user.id}:${auth.user.role}` : 'anon'}</div>
}

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  )

describe('AuthContext', () => {
  test('starts anonymous with no stored token', () => {
    renderWithProvider()
    expect(screen.getByTestId('user')).toHaveTextContent('anon')
  })

  test('restores the user from a token already in localStorage', () => {
    localStorage.setItem('token', fakeToken({ id: 4, role: 'contractor' }))
    renderWithProvider()
    expect(screen.getByTestId('user')).toHaveTextContent('4:contractor')
  })

  test('treats a malformed stored token as logged out', () => {
    localStorage.setItem('token', 'not-a-jwt')
    renderWithProvider()
    expect(screen.getByTestId('user')).toHaveTextContent('anon')
  })

  test('login stores the token and decodes the user', async () => {
    const token = fakeToken({ id: 1, role: 'client' })
    loginUser.mockResolvedValue({ token })
    renderWithProvider()

    await act(() => auth.login({ email: 'a@b.c', password: 'pw' }))

    expect(loginUser).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
    expect(localStorage.getItem('token')).toBe(token)
    expect(screen.getByTestId('user')).toHaveTextContent('1:client')
  })

  test('logout clears the token and user', async () => {
    localStorage.setItem('token', fakeToken({ id: 1, role: 'client' }))
    renderWithProvider()

    act(() => auth.logout())

    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByTestId('user')).toHaveTextContent('anon')
  })
})
