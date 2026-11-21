import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'
import { fakeToken } from '../test/utils'

function renderAt(role) {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/dashboard" element={<p>dashboard page</p>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute role={role}>
                <p>secret page</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  test('redirects anonymous users to /login', () => {
    renderAt()
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret page')).not.toBeInTheDocument()
  })

  test('renders children for any logged-in user when no role is required', () => {
    localStorage.setItem('token', fakeToken({ id: 1, role: 'client' }))
    renderAt()
    expect(screen.getByText('secret page')).toBeInTheDocument()
  })

  test('redirects to /dashboard when the role does not match', () => {
    localStorage.setItem('token', fakeToken({ id: 1, role: 'client' }))
    renderAt('contractor')
    expect(screen.getByText('dashboard page')).toBeInTheDocument()
  })

  test('renders children when the role matches', () => {
    localStorage.setItem('token', fakeToken({ id: 2, role: 'contractor' }))
    renderAt('contractor')
    expect(screen.getByText('secret page')).toBeInTheDocument()
  })
})
