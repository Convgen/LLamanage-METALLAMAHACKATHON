import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHelpers, dbHelpers, storageHelpers } from '../utils/supabaseClient'
import FlowBuilder from '../components/FlowBuilder'
import DashboardOverview from '../components/DashboardOverview'
import FilesManager from '../components/FilesManager'
import ChatInterface from '../components/ChatInterface'
import IntegrationsManager from '../components/IntegrationsManager'
import SettingsPanel from '../components/SettingsPanel'

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
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
        if (session?.provider_token) {
          setIntegrations(prev => ({
            ...prev, googleCalendar: { connected: true, email: session.user.email }
          }))
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
        const { data: uploadData, error: uploadError } = await storageHelpers.uploadFile(user.id, file)
        if (uploadError) throw uploadError
        const { data: fileRecord, error: dbError } = await dbHelpers.createFileRecord(user.id, {
          fileName: uploadData.fileName, originalName: uploadData.originalName,
          fileSize: uploadData.fileSize, fileType: uploadData.fileType, storagePath: uploadData.path
        })
        if (dbError) throw dbError
        setUploadedFiles(prev => [...prev, {
          id: fileRecord.id, name: fileRecord.original_name,
          size: (fileRecord.file_size / 1024).toFixed(2) + ' KB',
          type: fileRecord.file_type,
          uploadedAt: new Date(fileRecord.created_at).toLocaleString(),
          storagePath: fileRecord.storage_path
        }])
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
        const { data: uploadData, error: uploadError } = await storageHelpers.uploadFile(user.id, file)
        if (uploadError) throw uploadError
        const { data: fileRecord, error: dbError } = await dbHelpers.createFileRecord(user.id, {
          fileName: uploadData.fileName, originalName: uploadData.originalName,
          fileSize: uploadData.fileSize, fileType: uploadData.fileType, storagePath: uploadData.path
        })
        if (dbError) throw dbError
        setUploadedFiles(prev => [...prev, {
          id: fileRecord.id, name: fileRecord.original_name,
          size: (fileRecord.file_size / 1024).toFixed(2) + ' KB',
          type: fileRecord.file_type,
          uploadedAt: new Date(fileRecord.created_at).toLocaleString(),
          storagePath: fileRecord.storage_path
        }])
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
    try { await dbHelpers.createChatMessage(user.id, inputMessage, 'user') }
    catch (error) { console.error('Failed to save user message:', error) }
    setTimeout(async () => {
      const responses = [
        'I would be happy to help you with that! Based on your business information, I can assist with customer inquiries.',
        'That is a great question! Let me check our knowledge base for the most accurate answer.',
        'I understand your concern. Here is what I found in our system...',
        'Thank you for reaching out! I can help you with scheduling, FAQs, and general inquiries.',
        'Based on the documents you have uploaded, here is what I can tell you...'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }])
      setIsTyping(false)
      try { await dbHelpers.createChatMessage(user.id, randomResponse, 'assistant') }
      catch (error) { console.error('Failed to save assistant message:', error) }
    }, 1500)
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
          <div className='text-4xl mb-4'>🦙</div>
          <div className='text-xl' style={{ color: '#75FDA8' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#1F1F1F' }}>
      <nav className='shadow-sm' style={{ backgroundColor: '#2D2D2D', borderBottom: '1px solid #27705D' }}>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-8'>
              <h1 className='text-2xl font-bold' style={{ color: '#75FDA8' }}>🦙 Llamanage</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm' style={{ color: '#FFFFFF' }}>{user?.email}</span>
              <button onClick={handleLogout} className='px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300'
                style={{ border: '1px solid #27705D', color: '#27705D' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#27705D'; e.target.style.color = '#FFFFFF' }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#27705D' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className='flex'>
        <aside className='w-64 min-h-screen shadow-md' style={{ backgroundColor: '#2D2D2D', borderRight: '1px solid #27705D' }}>
          <nav className='p-4 space-y-2'>
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'flowbuilder', icon: '🔄', label: 'Flow Builder' },
              { id: 'files', icon: '📁', label: 'Files' },
              { id: 'chat', icon: '💬', label: 'AI Chat' },
              { id: 'integrations', icon: '🔗', label: 'Integrations' },
              { id: 'settings', icon: '⚙️', label: 'Settings' }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className='w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200'
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
                }}>
                <span className='text-xl'>{item.icon}</span>
                <span className='font-medium'>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className='flex-1 p-8'>
          {activeTab === 'dashboard' && (
            <DashboardOverview uploadedFiles={uploadedFiles} messages={messages} integrations={integrations} />
          )}
          {activeTab === 'flowbuilder' && <FlowBuilder userId={user?.id} />}
          {activeTab === 'files' && (
            <FilesManager uploadedFiles={uploadedFiles} isDragging={isDragging} businessInfo={businessInfo}
              onFileUpload={handleFileUpload} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onDrop={handleDrop} onRemoveFile={handleRemoveFile} onInputChange={handleInputChange} onSubmit={handleSubmit} />
          )}
          {activeTab === 'chat' && (
            <ChatInterface messages={messages} inputMessage={inputMessage} isTyping={isTyping}
              onInputChange={setInputMessage} onSendMessage={handleSendMessage} onSetInputMessage={setInputMessage} />
          )}
          {activeTab === 'integrations' && (
            <IntegrationsManager integrations={integrations} onGoogleCalendarAuth={handleGoogleCalendarAuth}
              onDisconnectGoogleCalendar={handleDisconnectGoogleCalendar} onIntegrationConnect={handleIntegrationConnect} />
          )}
          {activeTab === 'settings' && <SettingsPanel user={user} />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
