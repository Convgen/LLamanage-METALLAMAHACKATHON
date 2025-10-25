import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHelpers } from '../utils/supabaseClient'

function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await authHelpers.signIn(formData.email, formData.password)
      
      if (error) {
        alert(`Sign in failed: ${error.message}`)
        setLoading(false)
        return
      }
      
      if (data.user) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('An error occurred during sign in')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #27705D 0%, #2D2D2D 100%)' }}>
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-4xl font-bold transition-colors duration-300 inline-block"
            style={{ color: '#75FDA8' }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🦙 Llamanage
          </button>
          <p className="text-gray-200 mt-2">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2D2D' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2D2D' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: '#27705D' }}
                onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
                onMouseLeave={(e) => e.target.style.color = '#27705D'}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              style={{ backgroundColor: '#75FDA8', color: '#2D2D2D', opacity: loading ? 0.7 : 1 }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#27705D'
                  e.target.style.color = '#FFFFFF'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#75FDA8'
                  e.target.style.color = '#2D2D2D'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-semibold transition-colors duration-200"
                style={{ color: '#27705D' }}
                onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
                onMouseLeave={(e) => e.target.style.color = '#27705D'}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white transition-colors duration-200"
            style={{ color: '#FFFFFF' }}
            onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignIn
