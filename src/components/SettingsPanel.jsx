function SettingsPanel() {
  return (
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
  )
}

export default SettingsPanel
