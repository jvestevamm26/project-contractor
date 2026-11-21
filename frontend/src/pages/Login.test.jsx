import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'
import { loginUser } from '../api/auth'
import { fakeToken } from '../test/utils'

vi.mock('../api/auth', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText(/email/i), 'ana@example.com')
  await user.type(screen.getByLabelText(/password/i), 'pw123456')
  await user.click(screen.getByRole('button', { name: /log in/i }))
}

describe('Login page', () => {
  test('logs in and navigates home', async () => {
    loginUser.mockResolvedValue({ token: fakeToken({ id: 1, role: 'client' }) })
    const user = userEvent.setup()
    renderLogin()

    await fillAndSubmit(user)

    expect(loginUser).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'pw123456' })
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  test('shows the server error message on failure', async () => {
    loginUser.mockRejectedValue({ response: { data: { message: 'Wrong password' } } })
    const user = userEvent.setup()
    renderLogin()

    await fillAndSubmit(user)

    expect(await screen.findByText('Wrong password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled()
  })

  test('falls back to a generic message when the server gives none', async () => {
    loginUser.mockRejectedValue(new Error('Network Error'))
    const user = userEvent.setup()
    renderLogin()

    await fillAndSubmit(user)

    expect(await screen.findByText('Login failed')).toBeInTheDocument()
  })
})
