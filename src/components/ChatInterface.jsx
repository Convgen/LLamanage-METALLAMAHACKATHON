import { useRef, useEffect } from 'react'

function ChatInterface({ messages, inputMessage, isTyping, onInputChange, onSendMessage, onSetInputMessage }) {
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
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
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
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
                onClick={onSendMessage}
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
                onClick={() => onSetInputMessage(question)}
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
  )
}

export default ChatInterface
