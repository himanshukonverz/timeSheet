import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { toast } from 'sonner'

function Navbar() {
  const { user, setUser, setLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
      setLoading(false)
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
      // Still clear user state even if API call fails
      setUser(null)
      setLoading(false)
      navigate('/login')
    }
  }

  // Define navigation links based on role
  const getNavLinks = () => {
    if (!user) return []

    switch (user.role) {
      case 'employee':
        return [
          { path: '/', label: 'Analytics' },
          { path: '/fill-timesheet', label: 'Fill Timesheet' },
          { path: '/view-timesheet', label: 'View Timesheet' },
          { path: '/projects', label: 'Projects' },
          { path: '/profile', label: 'My Profile' },
        ]
      
      case 'manager':
        return [
          { path: '/', label: 'Analytics' },
          { path: '/reportees-timesheet', label: "View Timesheet" },
          { path: '/fill-timesheet', label: 'Fill Timesheet' },
          { path: '/add-employee', label: 'Add Employee' },
          { path: '/projects', label: 'Projects' },
          { path: '/profile', label: 'My Profile' },
        ]
        
        case 'admin':
          return [
            { path: '/', label: 'Analytics' },
            { path: '/employee-timesheet', label: 'Employee Timesheet' },
            { path: '/add-employee', label: 'Add Employee' },
            { path: '/projects', label: 'Projects' },
            { path: '/profile', label: 'My Profile' },
        ]
      
      default:
        return []
    }
  }

  const navLinks = getNavLinks()

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-22">
          {/* Logo on the left */}
          <div className="shrink-0">
            <NavLink to="/" className="flex items-center">
              <img className="w-60" src='https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767516808/Kognisight_dzt5kv.png' alt="Kognisight Logo" />
            </NavLink>
          </div>

          {/* Navigation items on the right */}
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 font-semibold bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar