function IntegrationsManager({ integrations, onGoogleCalendarAuth, onDisconnectGoogleCalendar, onIntegrationConnect }) {
  return (
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
                onClick={onDisconnectGoogleCalendar}
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
              onClick={onGoogleCalendarAuth}
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
          { name: 'Twilio SMS', icon: '📱', status: 'available', description: 'Send SMS notifications' },
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
              onClick={() => onIntegrationConnect(integration.name)}
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
  )
}

export default IntegrationsManager
