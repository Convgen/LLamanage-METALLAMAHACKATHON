import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaChartLine, FaSitemap, FaFileAlt, FaComments, FaPlug, FaCog, FaSignOutAlt, FaBrain } from 'react-icons/fa'
import { authHelpers, dbHelpers, storageHelpers } from '../utils/supabaseClient'
import { sendChatMessage, processDocumentBackend } from '../utils/backendAI'
import FlowBuilder from '../components/FlowBuilder'
import DashboardOverview from '../components/DashboardOverview'
import FilesManager from '../components/FilesManager'
import ChatInterface from '../components/ChatInterface'
import IntegrationsManager from '../components/IntegrationsManager'
import SettingsPanel from '../components/SettingsPanel'
import AIConfiguration from '../components/AIConfiguration'

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [businessInfo, setBusinessInfo] = useState({
    companyName: '',
    services: '',
    faqs: '',
    description: ''
  })
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const [integrations, setIntegrations] = useState({
    googleCalendar: { connected: false, email: null },
    slack: { connected: false, workspace: null },
    discord: { connected: false, serverId: null }
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await authHelpers.getUser()
        if (error || !user) { navigate('/signin'); return }
        setUser(user)
        
        // Check for existing Google Calendar token
        const { session } = await authHelpers.getSession()
        const savedToken = localStorage.getItem('googleCalendarToken')
        const currentToken = session?.provider_token || savedToken
        
        console.log('Checking for Google Calendar token on mount...')
        console.log('Session provider_token:', session?.provider_token)
        console.log('LocalStorage token:', savedToken)
        
        if (currentToken) {
          console.log('Found Google Calendar token, setting as connected')
          setIntegrations(prev => ({
            ...prev,
            googleCalendar: {
              connected: true,
              email: user.email,
              accessToken: currentToken
            }
          }))
        }
        
        const { data: files } = await dbHelpers.getFiles(user.id)
        if (files) {
          setUploadedFiles(files.map(f => ({
            id: f.id, name: f.original_name,
            size: (f.file_size / 1024).toFixed(2) + ' KB',
            type: f.file_type,
            uploadedAt: new Date(f.created_at).toLocaleString(),
            storagePath: f.storage_path
          })))
        }
        
        const { data: bizInfo } = await dbHelpers.getBusinessInfo(user.id)
        if (bizInfo) {
          setBusinessInfo({
            companyName: bizInfo.company_name || '',
            services: bizInfo.services || '',
            faqs: bizInfo.faqs ? JSON.stringify(bizInfo.faqs) : '',
            description: bizInfo.description || ''
          })
        }
        
        const { data: chatMsgs } = await dbHelpers.getChatMessages(user.id)
        if (chatMsgs && chatMsgs.length > 0) {
          setMessages(chatMsgs.map(m => ({ role: m.role, content: m.message })))
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        navigate('/signin')
      }
    }
    checkAuth()
  }, [navigate])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code') || urlParams.has('access_token')) {
      authHelpers.getSession().then(({ session }) => {
        console.log('OAuth callback - Full session:', session)
        console.log('Provider token:', session?.provider_token)
        
        if (session?.provider_token) {
          // Save provider token to state
          setIntegrations(prev => ({
            ...prev, 
            googleCalendar: { 
              connected: true, 
              email: session.user.email,
              accessToken: session.provider_token // Store token for API calls
            }
          }))
          
          // Also save to localStorage for persistence
          localStorage.setItem('googleCalendarToken', session.provider_token)
          
          // Show success message
          alert('✅ Google Calendar connected successfully! You can now schedule meetings with AI.')
        } else {
          console.error('No provider_token in session after OAuth callback')
          alert('⚠️ Connected to Google but token not found. Please try again.')
        }
      })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleLogout = async () => { await authHelpers.signOut(); navigate('/') }

  const handleFileUpload = async (e) => {
    if (!user) return
    const files = Array.from(e.target.files)
    for (const file of files) {
      try {
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await storageHelpers.uploadFile(user.id, file)
        if (uploadError) throw uploadError
        
        // Create file record in database
        const { data: fileRecord, error: dbError } = await dbHelpers.createFileRecord(user.id, {
          fileName: uploadData.fileName, originalName: uploadData.originalName,
          fileSize: uploadData.fileSize, fileType: uploadData.fileType, storagePath: uploadData.path
        })
        if (dbError) throw dbError
        
        // Add to UI
        setUploadedFiles(prev => [...prev, {
          id: fileRecord.id, name: fileRecord.original_name,
          size: (fileRecord.file_size / 1024).toFixed(2) + ' KB',
          type: fileRecord.file_type,
          uploadedAt: new Date(fileRecord.created_at).toLocaleString(),
          storagePath: fileRecord.storage_path
        }])
        
        // Process document with backend AI (generate embeddings)
        try {
          console.log('Processing document with AI backend...')
          const result = await processDocumentBackend(fileRecord.id, fileRecord.original_name, fileRecord.storage_path)
          console.log('Document processed:', result)
          alert(`✅ ${file.name} processed successfully!`)
        } catch (aiError) {
          console.error('AI processing error:', aiError)
          alert(`⚠️ ${file.name} uploaded but AI processing failed. You can retry later.`)
        }
      } catch (error) {
        console.error('File upload error:', error)
        alert('Failed to upload ' + file.name)
      }
    }
  }
  
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  
  const handleDrop = async (e) => {
    e.preventDefault(); setIsDragging(false)
    if (!user) return
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      try {
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await storageHelpers.uploadFile(user.id, file)
        if (uploadError) throw uploadError
        
        // Create file record in database
        const { data: fileRecord, error: dbError } = await dbHelpers.createFileRecord(user.id, {
          fileName: uploadData.fileName, originalName: uploadData.originalName,
          fileSize: uploadData.fileSize, fileType: uploadData.fileType, storagePath: uploadData.path
        })
        if (dbError) throw dbError
        
        // Add to UI
        setUploadedFiles(prev => [...prev, {
          id: fileRecord.id, name: fileRecord.original_name,
          size: (fileRecord.file_size / 1024).toFixed(2) + ' KB',
          type: fileRecord.file_type,
          uploadedAt: new Date(fileRecord.created_at).toLocaleString(),
          storagePath: fileRecord.storage_path
        }])
        
        // Process document with backend AI (generate embeddings)
        try {
          console.log('Processing document with AI backend...')
          const result = await processDocumentBackend(fileRecord.id, fileRecord.original_name, fileRecord.storage_path)
          console.log('Document processed:', result)
          alert(`✅ ${file.name} processed successfully! ${result.chunksProcessed} chunks indexed for AI search.`)
        } catch (aiError) {
          console.error('AI processing error:', aiError)
          alert(`⚠️ ${file.name} uploaded but AI processing failed. You can retry later.`)
        }
      } catch (error) {
        console.error('File upload error:', error)
        alert('Failed to upload ' + file.name)
      }
    }
  }
  
  const handleRemoveFile = async (index) => {
    const file = uploadedFiles[index]
    if (!file.id) return
    try {
      await storageHelpers.deleteFile(file.storagePath)
      await dbHelpers.deleteFile(file.id)
      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
    } catch (error) {
      console.error('File delete error:', error)
      alert('Failed to delete file')
    }
  }
  
  const handleInputChange = (e) => {
    setBusinessInfo({ ...businessInfo, [e.target.name]: e.target.value })
  }
  
  const handleSubmit = async () => {
    if (!user) return
    if (uploadedFiles.length === 0 && !businessInfo.companyName) {
      alert('Please upload files or enter business information')
      return
    }
    try {
      await dbHelpers.upsertBusinessInfo(user.id, {
        company_name: businessInfo.companyName,
        services: businessInfo.services,
        description: businessInfo.description,
        faqs: businessInfo.faqs ? JSON.parse(businessInfo.faqs) : []
      })
      alert('Data submitted successfully! Your AI is now learning from your business data.')
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to save business information')
    }
  }
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return
    
    const userMessage = { role: 'user', content: inputMessage }
    setMessages([...messages, userMessage])
    setInputMessage('')
    setIsTyping(true)
    
    // Save user message to database
    try { 
      await dbHelpers.createChatMessage(user.id, inputMessage, 'user') 
    } catch (error) { 
      console.error('Failed to save user message:', error) 
    }
    
    try {
      const googleToken = integrations.googleCalendar?.accessToken
      console.log('Sending chat message with Google token:', googleToken ? 'Token present (length: ' + googleToken.length + ')' : 'NO TOKEN')
      
      // Call backend AI with RAG disabled temporarily (embeddings issue)
      const response = await sendChatMessage(inputMessage, { 
        useRAG: false, // Temporarily disabled until we fix HuggingFace embeddings
        conversationHistory: messages.slice(-5), // Send last 5 messages for context
        googleAccessToken: googleToken // Pass Google OAuth token for calendar tools
      })
      
      const assistantMessage = { role: 'assistant', content: response.message }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
      
      // Save assistant message to database
      try { 
        await dbHelpers.createChatMessage(user.id, response.message, 'assistant') 
      } catch (error) { 
        console.error('Failed to save assistant message:', error) 
      }
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const handleGoogleCalendarAuth = async () => {
    const { error } = await authHelpers.signInWithGoogle()
    if (error) {
      console.error('Google OAuth error:', error)
      alert('Failed to connect Google Calendar')
    }
  }

  const handleDisconnectGoogleCalendar = () => {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      setIntegrations(prev => ({
        ...prev, googleCalendar: { connected: false, email: null }
      }))
      alert('Google Calendar disconnected')
    }
  }

  const handleIntegrationConnect = (integrationName) => {
    alert(integrationName + ' integration - Setup in progress!')
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ backgroundColor: '#1F1F1F' }}>
        <div className='text-center'>
          <img 
            src="/light_png.png" 
            alt="Llamanage Logo" 
            className="h-24 w-auto mb-4 mx-auto animate-pulse"
          />
          <div className='text-xl font-semibold' style={{ color: '#75FDA8' }}>Loading Dashboard...</div>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'dashboard', icon: FaChartLine, label: 'Dashboard' },
    { id: 'flowbuilder', icon: FaSitemap, label: 'Flow Builder' },
    { id: 'files', icon: FaFileAlt, label: 'Files' },
    { id: 'chat', icon: FaComments, label: 'AI Chat' },
    { id: 'ai-config', icon: FaBrain, label: 'AI Configuration' },
    { id: 'integrations', icon: FaPlug, label: 'Integrations' },
    { id: 'settings', icon: FaCog, label: 'Settings' }
  ]

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#1F1F1F' }}>
      {/* Top Navigation Bar */}
      <nav className='sticky top-0 z-50 shadow-lg' style={{ backgroundColor: '#2D2D2D', borderBottom: '2px solid #27705D' }}>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Left: Logo + Mobile Menu Button */}
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className='lg:hidden p-2 rounded-lg transition-all'
                style={{ color: '#75FDA8' }}
              >
                {sidebarOpen ? <FaTimes className='text-2xl' /> : <FaBars className='text-2xl' />}
              </button>
              <div className='flex items-center gap-3'>
                <img 
                  src="/light_png.png" 
                  alt="Llamanage Logo" 
                  className="h-8 sm:h-10 w-auto"
                />
                <h1 className='text-xl sm:text-2xl font-bold' style={{ color: '#75FDA8' }}>Llamanage</h1>
              </div>
            </div>
            
            {/* Right: User Info + Logout */}
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='hidden sm:flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold' 
                  style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}>
                  {user?.email?.[0].toUpperCase()}
                </div>
                <span className='text-sm font-medium hidden md:block' style={{ color: '#FFFFFF' }}>
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className='flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105'
                style={{ border: '2px solid #27705D', color: '#75FDA8', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#27705D'
                  e.target.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#75FDA8'
                }}
              >
                <FaSignOutAlt className='text-base' />
                <span className='hidden sm:inline'>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className='flex'>
        {/* Sidebar - Desktop & Mobile Overlay */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40
            w-64 shadow-2xl transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ backgroundColor: '#2D2D2D', borderRight: '2px solid #27705D' }}
        >
          <nav className='p-4 space-y-2 overflow-y-auto h-full'>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false) // Close mobile menu after selection
                  }}
                  className='w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105'
                  style={{
                    backgroundColor: activeTab === item.id ? '#75FDA8' : 'transparent',
                    color: activeTab === item.id ? '#2D2D2D' : '#E5E7EB',
                    border: activeTab === item.id ? 'none' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = '#27705D'
                      e.currentTarget.style.color = '#FFFFFF'
                      e.currentTarget.style.borderColor = '#75FDA8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#E5E7EB'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  <Icon className='text-xl' />
                  <span className='font-medium'>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className='flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden'>
          <div className='max-w-7xl mx-auto'>
            {activeTab === 'dashboard' && (
              <DashboardOverview uploadedFiles={uploadedFiles} messages={messages} integrations={integrations} />
            )}
            {activeTab === 'flowbuilder' && <FlowBuilder userId={user?.id} />}
            {activeTab === 'files' && (
              <FilesManager
                uploadedFiles={uploadedFiles}
                isDragging={isDragging}
                businessInfo={businessInfo}
                onFileUpload={handleFileUpload}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveFile={handleRemoveFile}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            )}
            {activeTab === 'chat' && (
              <ChatInterface
                messages={messages}
                inputMessage={inputMessage}
                isTyping={isTyping}
                onInputChange={setInputMessage}
                onSendMessage={handleSendMessage}
                onSetInputMessage={setInputMessage}
              />
            )}
            {activeTab === 'ai-config' && (
              <AIConfiguration userId={user?.id} />
            )}
            {activeTab === 'integrations' && (
              <IntegrationsManager
                integrations={integrations}
                onGoogleCalendarAuth={handleGoogleCalendarAuth}
                onDisconnectGoogleCalendar={handleDisconnectGoogleCalendar}
                onIntegrationConnect={handleIntegrationConnect}
              />
            )}
      
      
      {activeTab === 'settings' && (
        <SettingsPanel user={user} />
      )}
          </div>
        </main>
      </div>
    </div>
  )
}


  


export default Dashboard
