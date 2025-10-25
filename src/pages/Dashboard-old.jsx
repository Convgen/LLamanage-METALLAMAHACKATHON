import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowBuilder from '../components/FlowBuilder'

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [businessInfo, setBusinessInfo] = useState({
    companyName: localStorage.getItem('companyName') || '',
    services: '',
    faqs: '',
    description: ''
  })
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Integration state
  const [integrations, setIntegrations] = useState({
    googleCalendar: {
      connected: false,
      email: null,
      accessToken: null
    },
    slack: {
      connected: false,
      workspace: null
    },
    discord: {
      connected: false,
      serverId: null
    }
  })

  // Check authentication
  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) {
      navigate('/signin')
    }
  }, [navigate])

  // Handle OAuth callback from Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const savedState = sessionStorage.getItem('oauth_state')
    
    if (code && state && state === savedState) {
      // Clear the state
      sessionStorage.removeItem('oauth_state')
      
      // Exchange authorization code for tokens on backend
      const exchangeCodeForTokens = async () => {
        try {
          // TODO: Replace this mock with actual backend call
          // TEMPORARY MOCK - Remove when backend is ready
          // Set to false when backend is running on http://localhost:5000
          const MOCK_MODE = true // Set to false when backend is implemented
          
          if (MOCK_MODE) {
            // Simulate backend delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Mock successful response
            const mockData = {
              email: localStorage.getItem('userEmail') || 'user@example.com',
              success: true
            }
            
            // Update state to show connected
            setIntegrations(prev => ({
              ...prev,
              googleCalendar: {
                connected: true,
                email: mockData.email,
                accessToken: null // Never store in frontend
              }
            }))
            
            alert('Google Calendar connected successfully! 🎉\n(Using mock - implement backend to make it real)')
          } else {
            // Real backend call - Backend should be running on http://localhost:5000
            const response = await fetch('http://localhost:5000/api/oauth/google/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({
                code: code,
                userId: localStorage.getItem('userEmail')
              })
            })
            
            if (response.ok) {
              const data = await response.json()
              
              // Update state to show connected
              setIntegrations(prev => ({
                ...prev,
                googleCalendar: {
                  connected: true,
                  email: data.email,
                  accessToken: null // Never store in frontend
                }
              }))
              
              alert('Google Calendar connected successfully! 🎉')
            } else {
              throw new Error('Failed to exchange code for tokens')
            }
          }
        } catch (error) {
          console.error('OAuth error:', error)
          alert('Failed to connect Google Calendar. Please try again.')
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      exchangeCodeForTokens()
    }
  }, [setIntegrations])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('companyName')
    navigate('/')
  }

  // File upload handlers
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      uploadedAt: new Date().toLocaleString()
    }))
    setUploadedFiles([...uploadedFiles, ...newFiles])
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      uploadedAt: new Date().toLocaleString()
    }))
    setUploadedFiles([...uploadedFiles, ...newFiles])
  }
  
  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }
  
  const handleInputChange = (e) => {
    setBusinessInfo({
      ...businessInfo,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = () => {
    if (uploadedFiles.length === 0 && !businessInfo.companyName) {
      alert('Please upload files or enter business information')
      return
    }
    
    console.log('Submitting data:', { uploadedFiles, businessInfo })
    alert('Data submitted successfully! Your AI is now learning from your business data.')
  }
  
  // Chat handlers
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage = { role: 'user', content: inputMessage }
    setMessages([...messages, userMessage])
    setInputMessage('')
    setIsTyping(true)
    
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Based on your business information, I can assist with customer inquiries.",
        "That's a great question! Let me check our knowledge base for the most accurate answer.",
        "I understand your concern. Here's what I found in our system...",
        "Thank you for reaching out! I can help you with scheduling, FAQs, and general inquiries.",
        "Based on the documents you've uploaded, here's what I can tell you..."
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }])
      setIsTyping(false)
      
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }, 1500)
  }

  // Google Calendar OAuth handlers
  const handleGoogleCalendarAuth = () => {
    // Google OAuth configuration - Client ID from environment variable (safer for production)
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '107996813971-aepcl9j7ffne9vjiofii5tfe7msd30vc.apps.googleusercontent.com'
    const REDIRECT_URI = window.location.origin + '/dashboard'
    const SCOPE = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
    
    // IMPORTANT: Using 'response_type=code' (Authorization Code Flow)
    // This is more secure and allows refresh tokens with 'access_type=offline'
    // The code will be exchanged for tokens on the backend
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` + // Changed from 'token' to 'code'
      `scope=${encodeURIComponent(SCOPE)}&` +
      `access_type=offline&` + // Now this will work! Returns refresh token
      `prompt=consent` // Forces consent screen to ensure refresh token is returned
    
    // Save state to verify callback
    const state = Math.random().toString(36).substring(7)
    sessionStorage.setItem('oauth_state', state)
    
    // Redirect to Google OAuth (full page redirect for Authorization Code Flow)
    window.location.href = authUrl + `&state=${state}`
  }

  const handleDisconnectGoogleCalendar = () => {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      setIntegrations(prev => ({
        ...prev,
        googleCalendar: {
          connected: false,
          email: null,
          accessToken: null
        }
      }))
      
      // Remove from backend
      removeIntegrationFromBackend('googleCalendar')
      
      alert('Google Calendar disconnected')
    }
  }

  const handleIntegrationConnect = (integrationName) => {
    // Handle other integrations
    alert(`${integrationName} integration - Setup in progress!`)
  }

  const removeIntegrationFromBackend = async (integrationType) => {
    try {
      await fetch(`/api/integrations/${integrationType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      console.log('Integration removed from backend')
    } catch (error) {
      console.error('Error removing integration:', error)
      // Remove from localStorage
      localStorage.removeItem(`integration_${integrationType}`)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
      {/* Top Navigation */}
      <nav className="shadow-sm" style={{ backgroundColor: '#2D2D2D', borderBottom: '1px solid #27705D' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold" style={{ color: '#75FDA8' }}>
                🦙 Llamanage
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#FFFFFF' }}>
                {localStorage.getItem('userEmail')}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                style={{ border: '1px solid #27705D', color: '#27705D' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#27705D'
                  e.target.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#27705D'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen shadow-md" style={{ backgroundColor: '#2D2D2D', borderRight: '1px solid #27705D' }}>
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'flowbuilder', icon: '🔄', label: 'Flow Builder' },
              { id: 'files', icon: '📁', label: 'Files' },
              { id: 'chat', icon: '💬', label: 'AI Chat' },
              { id: 'integrations', icon: '🔗', label: 'Integrations' },
              { id: 'settings', icon: '⚙️', label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeTab === item.id ? '#75FDA8' : 'transparent',
                  color: activeTab === item.id ? '#2D2D2D' : '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = '#27705D'
                    e.currentTarget.style.color = '#FFFFFF'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#E5E7EB'
                  }
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Welcome to Your <span style={{ color: '#75FDA8' }}>Dashboard</span>
              </h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Files Uploaded', value: uploadedFiles.length, icon: '📄' },
                  { label: 'Chat Conversations', value: Math.floor(messages.length / 2), icon: '💬' },
                  { label: 'Active Integrations', value: '0', icon: '🔗' }
                ].map((stat, idx) => (
                  <div 
                    key={idx}
                    className="p-6 rounded-xl shadow-md transition-all duration-300"
                    style={{ backgroundColor: '#2D2D2D' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: '#E5E7EB' }}>{stat.label}</p>
                        <p className="text-3xl font-bold mt-1" style={{ color: '#75FDA8' }}>
                          {stat.value}
                        </p>
                      </div>
                      <div className="text-4xl">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl shadow-md p-6" style={{ backgroundColor: '#2D2D2D' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Upload Files', icon: '📤', tab: 'files' },
                    { label: 'Test AI Chat', icon: '🤖', tab: 'chat' },
                    { label: 'Connect Apps', icon: '🔌', tab: 'integrations' }
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(action.tab)}
                      className="flex items-center space-x-3 px-6 py-4 rounded-lg transition-all duration-300"
                      style={{ border: '2px solid #75FDA8', color: '#2D2D2D' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#75FDA8'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Flow Builder Tab */}
          {activeTab === 'flowbuilder' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
                  AI Agent <span style={{ color: '#75FDA8' }}>Flow Builder</span>
                </h2>
                <p className="mt-2" style={{ color: '#E5E7EB' }}>
                  Design your custom AI conversation flow by dragging and connecting nodes.
                  Your flow will be sent to the backend when saved.
                </p>
              </div>
              
              <FlowBuilder />
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Manage Your <span style={{ color: '#75FDA8' }}>Files</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload */}
                <div className="p-6 rounded-xl shadow-md" style={{ backgroundColor: '#2D2D2D' }}>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Upload Documents
                  </h3>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300"
                    style={{
                      borderColor: isDragging ? '#75FDA8' : '#D1D5DB',
                      backgroundColor: isDragging ? 'rgba(117, 253, 168, 0.1)' : 'transparent'
                    }}
                  >
                    <div className="text-5xl mb-4">📁</div>
                    <p className="text-lg mb-4" style={{ color: '#E5E7EB' }}>
                      Drag & drop files here or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 rounded-lg cursor-pointer transition-all duration-300"
                      style={{ backgroundColor: '#27705D', color: '#FFFFFF' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#75FDA8'
                        e.target.style.color = '#2D2D2D'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#27705D'
                        e.target.style.color = '#FFFFFF'
                      }}
                    >
                      Browse Files
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports PDF, TXT, DOC, DOCX
                    </p>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                        Uploaded Files ({uploadedFiles.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uploadedFiles.map((file, idx) => (
                          <div 
                            key={idx}
                            className="p-3 rounded-lg flex items-center justify-between transition-colors duration-200"
                            style={{ backgroundColor: '#1F1F1F' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27705D'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-2xl">📄</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ color: '#FFFFFF' }}>
                                  {file.name}
                                </p>
                                <p className="text-sm text-gray-500">{file.size} • {file.uploadedAt}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Business Info Form */}
                <div className="p-6 rounded-xl shadow-md" style={{ backgroundColor: '#2D2D2D' }}>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Business Information
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={businessInfo.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg transition-all duration-200"
                        style={{ 
                          outline: 'none',
                          backgroundColor: '#1F1F1F',
                          border: '1px solid #27705D',
                          color: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                        onBlur={(e) => e.target.style.borderColor = '#27705D'}
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                        Services Offered
                      </label>
                      <textarea
                        name="services"
                        value={businessInfo.services}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg transition-all duration-200"
                        style={{ 
                          outline: 'none',
                          backgroundColor: '#1F1F1F',
                          border: '1px solid #27705D',
                          color: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                        onBlur={(e) => e.target.style.borderColor = '#27705D'}
                        placeholder="Describe your services..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                        Common FAQs
                      </label>
                      <textarea
                        name="faqs"
                        value={businessInfo.faqs}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg transition-all duration-200"
                        style={{ 
                          outline: 'none',
                          backgroundColor: '#1F1F1F',
                          border: '1px solid #27705D',
                          color: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                        onBlur={(e) => e.target.style.borderColor = '#27705D'}
                        placeholder="List frequently asked questions..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                        Business Description
                      </label>
                      <textarea
                        name="description"
                        value={businessInfo.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg transition-all duration-200"
                        style={{ 
                          outline: 'none',
                          backgroundColor: '#1F1F1F',
                          border: '1px solid #27705D',
                          color: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                        onBlur={(e) => e.target.style.borderColor = '#27705D'}
                        placeholder="Tell us about your business..."
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                      style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#27705D'
                        e.target.style.color = '#FFFFFF'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#75FDA8'
                        e.target.style.color = '#2D2D2D'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      Save & Train AI
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Test Your <span style={{ color: '#75FDA8' }}>AI Assistant</span>
              </h2>
              
              <div className="max-w-4xl mx-auto">
                <div className="rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: '#2D2D2D' }}>
                  {/* Chat Header */}
                  <div className="px-6 py-4" style={{ backgroundColor: '#27705D' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: '#75FDA8' }}>
                        🦙
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Llamanage AI Assistant</h3>
                        <p className="text-sm text-gray-200">Online • Ready to help</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: '#1F1F1F' }}>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md"
                          style={{
                            backgroundColor: msg.role === 'user' ? '#27705D' : '#FFFFFF',
                            color: msg.role === 'user' ? '#FFFFFF' : '#2D2D2D',
                            border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none'
                          }}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-lg shadow-md" style={{ backgroundColor: '#FFFFFF', color: '#2D2D2D', border: '1px solid #E5E7EB' }}>
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#9CA3AF' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#9CA3AF', animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#9CA3AF', animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4" style={{ borderTop: '1px solid #27705D', backgroundColor: '#2D2D2D' }}>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question here..."
                        className="flex-1 px-4 py-3 rounded-lg transition-all duration-200"
                        style={{ 
                          outline: 'none',
                          backgroundColor: '#1F1F1F',
                          border: '1px solid #27705D',
                          color: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                        onBlur={(e) => e.target.style.borderColor = '#27705D'}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isTyping}
                        className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                        style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                        onMouseEnter={(e) => {
                          if (!isTyping) {
                            e.target.style.backgroundColor = '#27705D'
                            e.target.style.color = '#FFFFFF'
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isTyping) {
                            e.target.style.backgroundColor = '#75FDA8'
                            e.target.style.color = '#2D2D2D'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                          }
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Questions */}
                <div className="mt-6">
                  <p className="text-center text-gray-600 mb-3">Try these sample questions:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'What services do you offer?',
                      'How can I contact support?',
                      'Tell me about your pricing',
                      'Do you offer integrations?'
                    ].map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(question)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border transition-all duration-200"
                        style={{ borderColor: '#D1D5DB' }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#75FDA8'
                          e.target.style.backgroundColor = '#75FDA8'
                          e.target.style.color = '#2D2D2D'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#D1D5DB'
                          e.target.style.backgroundColor = '#FFFFFF'
                          e.target.style.color = '#374151'
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Connect Your <span style={{ color: '#75FDA8' }}>Tools</span>
              </h2>
              
              {/* Google Calendar Section - Featured */}
              <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#2D2D2D', border: '2px solid #75FDA8' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-6xl">📅</div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                        Google Calendar
                      </h3>
                      <p className="text-sm mt-1" style={{ color: '#E5E7EB' }}>
                        Allow AI to schedule meetings and check availability
                      </p>
                    </div>
                  </div>
                  {integrations.googleCalendar.connected ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">✓</span>
                          <span className="font-semibold" style={{ color: '#75FDA8' }}>Connected</span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: '#E5E7EB' }}>
                          {integrations.googleCalendar.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDisconnectGoogleCalendar()}
                        className="px-6 py-2 rounded-lg font-medium transition-all duration-300"
                        style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#CC0000'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#FF6B6B'
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGoogleCalendarAuth()}
                      className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                      style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#27705D'
                        e.target.style.color = '#FFFFFF'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#75FDA8'
                        e.target.style.color = '#2D2D2D'
                      }}
                    >
                      <span>🔐</span>
                      <span>Connect with Google</span>
                    </button>
                  )}
                </div>
                
                {integrations.googleCalendar.connected && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#75FDA8' }}>
                      Permissions Granted:
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: '#E5E7EB' }}>
                      <li>✓ View calendar events</li>
                      <li>✓ Create new events</li>
                      <li>✓ Check availability</li>
                      <li>✓ Send meeting invitations</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Other Integrations */}
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                Other Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Twilio SMS', icon: '📱', status: 'coming-soon', description: 'Send SMS notifications' },
                  { name: 'Slack', icon: '💬', status: 'available', description: 'Connect to Slack workspace' },
                  { name: 'Discord', icon: '🎮', status: 'available', description: 'Integrate with Discord server' },
                  { name: 'Zapier', icon: '⚡', status: 'available', description: 'Connect 5000+ apps' },
                  { name: 'Salesforce', icon: '☁️', status: 'coming-soon', description: 'CRM integration' },
                  { name: 'Custom Webhook', icon: '🔧', status: 'available', description: 'Custom API endpoints' }
                ].map((integration, idx) => (
                  <div 
                    key={idx}
                    className="p-6 rounded-xl shadow-md transition-all duration-300"
                    style={{ backgroundColor: '#2D2D2D' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div className="text-5xl mb-4 text-center">{integration.icon}</div>
                    <h3 className="text-xl font-semibold text-center mb-2" style={{ color: '#FFFFFF' }}>
                      {integration.name}
                    </h3>
                    <p className="text-sm text-center mb-4" style={{ color: '#E5E7EB' }}>
                      {integration.description}
                    </p>
                    <button
                      onClick={() => handleIntegrationConnect(integration.name)}
                      className="w-full py-2 rounded-lg font-medium transition-all duration-300"
                      style={{
                        backgroundColor: integration.status === 'available' ? '#75FDA8' : '#E5E7EB',
                        color: integration.status === 'available' ? '#2D2D2D' : '#6B7280',
                        cursor: integration.status === 'available' ? 'pointer' : 'not-allowed'
                      }}
                      disabled={integration.status !== 'available'}
                      onMouseEnter={(e) => {
                        if (integration.status === 'available') {
                          e.target.style.backgroundColor = '#27705D'
                          e.target.style.color = '#FFFFFF'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (integration.status === 'available') {
                          e.target.style.backgroundColor = '#75FDA8'
                          e.target.style.color = '#2D2D2D'
                        }
                      }}
                    >
                      {integration.status === 'available' ? 'Connect' : 'Coming Soon'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Account <span style={{ color: '#75FDA8' }}>Settings</span>
              </h2>
              
              <div className="max-w-2xl rounded-xl shadow-md p-6" style={{ backgroundColor: '#2D2D2D' }}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                      Profile Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={localStorage.getItem('userEmail') || ''}
                          disabled
                          className="w-full px-4 py-2 rounded-lg"
                          style={{ 
                            border: '1px solid #27705D',
                            backgroundColor: '#1F1F1F',
                            color: '#9CA3AF'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={localStorage.getItem('companyName') || ''}
                          className="w-full px-4 py-2 rounded-lg transition-all duration-200"
                          style={{ 
                            outline: 'none',
                            backgroundColor: '#1F1F1F',
                            border: '1px solid #27705D',
                            color: '#FFFFFF'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
                          onBlur={(e) => e.target.style.borderColor = '#27705D'}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6" style={{ borderTop: '1px solid #27705D' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                      Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span style={{ color: '#E5E7EB' }}>Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span style={{ color: '#E5E7EB' }}>AI training enabled</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span style={{ color: '#E5E7EB' }}>Analytics tracking</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      className="px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                      style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#27705D'
                        e.target.style.color = '#FFFFFF'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#75FDA8'
                        e.target.style.color = '#2D2D2D'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                      style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#F3F4F6'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
