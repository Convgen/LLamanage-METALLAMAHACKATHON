function DashboardOverview({ uploadedFiles, messages }) {
  return (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Upload Files', icon: '📁', color: '#75FDA8' },
            { label: 'Build Flow', icon: '🔄', color: '#FFB800' },
            { label: 'Test Chat', icon: '💬', color: '#FF6B6B' },
            { label: 'Add Integration', icon: '🔗', color: '#75FDA8' }
          ].map((action, idx) => (
            <button
              key={idx}
              className="p-4 rounded-lg transition-all duration-300 text-left"
              style={{ backgroundColor: '#1F1F1F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27705D'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1F1F1F'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-medium" style={{ color: '#FFFFFF' }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
