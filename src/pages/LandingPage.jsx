import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2D2D2D' }}>
      {/* Navbar */}
      <nav className="shadow-md fixed w-full top-0 z-50" style={{ backgroundColor: '#2D2D2D', borderBottom: '1px solid #27705D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: '#75FDA8' }}
                onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.target.style.color = '#75FDA8'}
              >
                🦙 Llamanage
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'about', 'features', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm font-medium transition-colors duration-300 capitalize"
                  style={{ color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
                  onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                >
                  {section}
                </button>
              ))}
              <button
                onClick={() => navigate('/signin')}
                className="px-5 py-2 rounded-lg font-semibold transition-all duration-300"
                style={{ color: '#FFFFFF', border: '2px solid #27705D' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#27705D'
                  e.target.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#FFFFFF'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2 rounded-lg font-semibold transition-all duration-300"
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
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-16" style={{ background: 'linear-gradient(135deg, #27705D 0%, #2D2D2D 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white animate-fade-in">
              Welcome to <span style={{ color: '#75FDA8' }}>Llamanage</span>
            </h1>
            <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto" style={{ color: '#E5E7EB' }}>
              Empower your business with AI-powered customer support. 
              Transform your documents into intelligent conversations.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="px-10 py-5 rounded-lg text-xl font-semibold transition-all duration-300"
              style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FFFFFF'
                e.target.style.transform = 'translateY(-8px) scale(1.05)'
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#75FDA8'
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Get Started →
            </button>
          </div>
          
          {/* Feature Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'AI-Powered', desc: 'Advanced AI understands your business' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Instant responses to customer queries' },
              { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security for your data' }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl transition-all duration-300"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateY(-8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#FFFFFF' }}>
            About <span style={{ color: '#75FDA8' }}>Llamanage</span>
          </h2>
          <div className="max-w-3xl mx-auto text-lg space-y-4" style={{ color: '#E5E7EB' }}>
            <p>
              Llamanage is a cutting-edge B2B SaaS platform that revolutionizes how businesses 
              handle customer support. Our AI-powered solution learns from your business documents, 
              FAQs, and knowledge base to provide intelligent, context-aware responses.
            </p>
            <p>
              Say goodbye to repetitive customer queries and hello to automated, accurate, 
              and personalized support that scales with your business.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ backgroundColor: '#27705D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#FFFFFF' }}>
            Powerful <span style={{ color: '#75FDA8' }}>Features</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📄', title: 'Document Intelligence', desc: 'Upload PDFs, docs, and text files. Our AI learns from your content.' },
              { icon: '💬', title: 'Smart Chat', desc: 'Natural language conversations with context-aware responses.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track queries, response times, and customer satisfaction.' },
              { icon: '🔗', title: 'Easy Integrations', desc: 'Connect with your existing tools like Calendar, CRM, and more.' },
              { icon: '🎯', title: 'Custom Training', desc: 'Train the AI on your specific business needs and terminology.' },
              { icon: '📱', title: 'Multi-Channel', desc: 'Deploy on web, mobile, Slack, or embed in your app.' }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl shadow-md transition-all duration-300"
                style={{ backgroundColor: '#2D2D2D' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1F1F1F'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                  e.currentTarget.style.transform = 'translateY(-8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2D2D2D'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>{feature.title}</h3>
                <p style={{ color: '#E5E7EB' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 text-white" style={{ backgroundColor: '#27705D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Get In <span style={{ color: '#75FDA8' }}>Touch</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📧</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <p className="text-gray-200">support@llamanage.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📞</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Phone</h3>
                  <p className="text-gray-200">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-3xl">🏢</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Office</h3>
                  <p className="text-gray-200">123 AI Street, Tech Valley, CA 94000</p>
                </div>
              </div>
            </div>
            
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#2D2D2D', border: '1px solid #27705D', color: 'white' }}
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#2D2D2D', border: '1px solid #27705D', color: 'white' }}
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#2D2D2D', border: '1px solid #27705D', color: 'white' }}
              />
              <button
                type="button"
                onClick={() => alert('Message sent! (This is a placeholder - backend integration needed)')}
                className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFFFFF'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#75FDA8'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#75FDA8' }}>🦙 Llamanage</h3>
              <p className="text-gray-400">AI-powered customer support for modern businesses.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['home', 'about', 'features'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollToSection(link)}
                      className="text-gray-400 transition-colors duration-200 capitalize"
                      onMouseEnter={(e) => e.target.style.color = '#75FDA8'}
                      onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer transition-colors duration-200 hover:text-[#75FDA8]">Documentation</li>
                <li className="cursor-pointer transition-colors duration-200 hover:text-[#75FDA8]">API Reference</li>
                <li className="cursor-pointer transition-colors duration-200 hover:text-[#75FDA8]">Blog</li>
                <li className="cursor-pointer transition-colors duration-200 hover:text-[#75FDA8]">Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {[{ name: 'Twitter', icon: '🐦' }, { name: 'LinkedIn', icon: '💼' }, { name: 'GitHub', icon: '🐙' }].map((social) => (
                  <button
                    key={social.name}
                    className="text-2xl transition-transform duration-200"
                    title={social.name}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-gray-400" style={{ borderColor: '#4B5563' }}>
            <p>&copy; {new Date().getFullYear()} Llamanage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
