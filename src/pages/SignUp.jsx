import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHelpers } from '../utils/supabaseClient'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!formData.companyName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const { data, error} = await authHelpers.signUp(formData.email, formData.password, formData.companyName)
      
      if (error) {
        alert(`Sign up failed: ${error.message}`)
        setLoading(false)
        return
      }
      
      if (data.user) {
        alert('Account created successfully! Please check your email to verify your account.')
        navigate('/signin')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      alert('An error occurred during sign up')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'linear-gradient(135deg, #27705D 0%, #2D2D2D 100%)' }}>
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
          <p className="text-gray-200 mt-2">Create your business account</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2D2D' }}>
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                placeholder="Your Company Inc."
                required
              />
            </div>

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
                placeholder="you@company.com"
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

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2D2D' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" required />
              <span className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy
              </span>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="font-semibold transition-colors duration-200"
                style={{ color: '#27705D' }}
                onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
                onMouseLeave={(e) => e.target.style.color = '#27705D'}
              >
                Sign in
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

export default SignUp
