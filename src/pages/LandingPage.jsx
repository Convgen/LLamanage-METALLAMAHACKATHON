import { useNavigate } from 'react-router-dom'
import {
  FaRobot,
  FaUserMd,
  FaCalendarCheck,
  FaGlobeAmericas,
  FaShieldAlt,
  FaChartLine,
  FaCheckCircle,
  FaStar,
  FaTooth,
  FaSyringe,
  FaBaby,
  FaBone,
} from 'react-icons/fa'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: FaRobot,
      title: '24/7 AI Patient Support',
      description: 'Instant responses to patient inquiries about treatments, procedures, and accommodations in multiple languages.',
      color: '#75FDA8',
    },
    {
      icon: FaCalendarCheck,
      title: 'Smart Appointment Scheduling',
      description: 'Automated booking system integrated with your clinic calendar for seamless patient coordination.',
      color: '#1890FF',
    },
    {
      icon: FaGlobeAmericas,
      title: 'Multi-Language Support',
      description: 'Communicate with patients in 50+ languages, breaking down barriers in international healthcare.',
      color: '#FA8C16',
    },
    {
      icon: FaShieldAlt,
      title: 'HIPAA Compliant & Secure',
      description: 'Enterprise-grade security ensuring patient data protection and regulatory compliance.',
      color: '#27705D',
    },
    {
      icon: FaChartLine,
      title: 'Analytics & Insights',
      description: 'Track patient inquiries, conversion rates, and optimize your health tourism operations.',
      color: '#75FDA8',
    },
    {
      icon: FaUserMd,
      title: 'Treatment Information Library',
      description: 'Comprehensive AI-powered knowledge base about procedures, recovery times, and costs.',
      color: '#1890FF',
    },
  ]

  const useCases = [
    {
      icon: FaTooth,
      title: 'Dental Tourism',
      description: 'Handle inquiries about implants, veneers, and full mouth rehabilitation with AI precision.',
      stats: '40% of medical tourists',
    },
    {
      icon: FaSyringe,
      title: 'Cosmetic Surgery',
      description: 'Provide detailed consultation information for rhinoplasty, liposuction, and facial procedures.',
      stats: '30% of medical tourists',
    },
    {
      icon: FaBaby,
      title: 'Fertility Treatments',
      description: 'Sensitive, accurate information about IVF, egg donation, and surrogacy services.',
      stats: '15% of medical tourists',
    },
    {
      icon: FaBone,
      title: 'Orthopedic Surgery',
      description: 'Assist patients with joint replacements, spinal surgeries, and rehabilitation planning.',
      stats: '15% of medical tourists',
    },
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Director, Istanbul Dental Clinic',
      avatar: 'SM',
      text: 'Llamanage AI transformed our patient intake process. We now handle 300+ inquiries per day with instant, accurate responses in multiple languages.',
      rating: 5,
    },
    {
      name: 'Carlos Rodriguez',
      role: 'Operations Manager, Medellin Medical Center',
      avatar: 'CR',
      text: 'The appointment scheduling integration saved our staff 20 hours per week. ROI was positive within the first month.',
      rating: 5,
    },
    {
      name: 'Dr. Ayşe Yılmaz',
      role: 'Founder, Antalya Cosmetic Surgery',
      avatar: 'AY',
      text: 'Our conversion rate increased by 45% since implementing Llamanage. Patients love the instant support and detailed information.',
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small clinics starting with health tourism',
      features: [
        'Up to 500 AI conversations/month',
        '2 team member accounts',
        'Basic appointment scheduling',
        '10 languages supported',
        'Email support',
        'Knowledge base (up to 50 documents)',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'For growing health tourism businesses',
      features: [
        'Unlimited AI conversations',
        '10 team member accounts',
        'Advanced scheduling + Google Calendar sync',
        '50+ languages supported',
        'Priority support + phone',
        'Unlimited knowledge base',
        'Custom branding',
        'Analytics dashboard',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For multi-location healthcare organizations',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Multi-location support',
        'Dedicated account manager',
        '99.9% SLA uptime guarantee',
        'Custom AI training',
        'API access',
        'White-label solution',
      ],
      popular: false,
    },
  ]

  return (
    <div style={{ backgroundColor: '#1F1F1F', minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Navigation */}
      <nav className="border-b-2 sticky top-0 z-50" style={{ borderColor: '#27705D', backgroundColor: '#2D2D2D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/light_png.png" 
                alt="Llamanage Logo" 
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-xl sm:text-2xl font-bold">Llamanage</span>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/signin')}
                className="px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all hover:scale-105"
                style={{ color: '#75FDA8', backgroundColor: 'transparent', border: '2px solid #27705D' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#27705D'
                  e.target.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#75FDA8'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all hover:scale-105"
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
                <span className="hidden sm:inline">Start Free Trial</span>
                <span className="sm:hidden">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Fullscreen */}
      <section className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full mb-8 animate-pulse" style={{ backgroundColor: '#27705D' }}>
              <span className="text-sm md:text-base font-medium" style={{ color: '#75FDA8' }}>
                🏥 Built for Health Tourism Professionals
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: '#FFFFFF' }}>
              Transform Your Health Tourism Business with AI
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: '#B8B8B8' }}>
              Automate patient support, scheduling, and consultations with intelligent AI agents. 
              Handle inquiries 24/7 in 50+ languages while you focus on delivering world-class healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
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
                Start Free 14-Day Trial
              </button>
              <button
                className="w-full sm:w-auto px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
                style={{ backgroundColor: 'transparent', color: '#75FDA8', border: '2px solid #27705D' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#27705D'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 pt-16 border-t-2" style={{ borderColor: '#27705D' }}>
              <div className="transform transition-all hover:scale-110">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#75FDA8' }}>10K+</div>
                <div className="text-xs md:text-sm mt-2" style={{ color: '#B8B8B8' }}>Patient Inquiries Handled</div>
              </div>
              <div className="transform transition-all hover:scale-110">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#75FDA8' }}>&lt;2s</div>
                <div className="text-xs md:text-sm mt-2" style={{ color: '#B8B8B8' }}>Average Response Time</div>
              </div>
              <div className="transform transition-all hover:scale-110">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#75FDA8' }}>98%</div>
                <div className="text-xs md:text-sm mt-2" style={{ color: '#B8B8B8' }}>Patient Satisfaction</div>
              </div>
              <div className="transform transition-all hover:scale-110">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#75FDA8' }}>50+</div>
                <div className="text-xs md:text-sm mt-2" style={{ color: '#B8B8B8' }}>Languages Supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Powerful Features for Health Tourism</h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: '#B8B8B8' }}>
              Everything you need to scale your medical tourism practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: '#2D2D2D', borderColor: '#27705D' }}
              >
                <feature.icon className="text-4xl sm:text-5xl mb-4" style={{ color: feature.color }} />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base" style={{ color: '#B8B8B8' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Built for Every Medical Specialty</h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: '#B8B8B8' }}>
              Specialized AI support for the most popular health tourism treatments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border-2 text-center transition-all hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: '#1F1F1F', borderColor: '#27705D' }}
              >
                <useCase.icon className="text-4xl sm:text-5xl mb-4 mx-auto" style={{ color: '#75FDA8' }} />
                <h3 className="text-lg sm:text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-sm mb-4" style={{ color: '#B8B8B8' }}>{useCase.description}</p>
                <div className="text-xs sm:text-sm font-semibold" style={{ color: '#75FDA8' }}>{useCase.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: '#B8B8B8' }}>
              See what clinic owners and directors say about Llamanage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: '#2D2D2D', borderColor: '#27705D' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#FA8C16' }} />
                  ))}
                </div>
                <p className="mb-6 text-base sm:text-lg" style={{ color: '#E8E8E8' }}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm" style={{ color: '#B8B8B8' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: '#B8B8B8' }}>
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 rounded-xl border-2 flex flex-col transition-all hover:shadow-2xl"
                style={{
                  backgroundColor: plan.popular ? '#27705D' : '#1F1F1F',
                  borderColor: plan.popular ? '#75FDA8' : '#27705D',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {plan.popular && (
                  <div
                    className="text-center py-2 px-4 rounded-lg mb-4 font-semibold text-sm"
                    style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                  <span className="text-lg sm:text-xl" style={{ color: '#B8B8B8' }}>{plan.period}</span>
                </div>
                <p className="mb-6 text-sm sm:text-base" style={{ color: '#B8B8B8' }}>{plan.description}</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 rounded-lg font-semibold mb-6 transition-all hover:scale-105 text-sm sm:text-base"
                  style={{
                    backgroundColor: plan.popular ? '#75FDA8' : 'transparent',
                    color: plan.popular ? '#2D2D2D' : '#75FDA8',
                    border: `2px solid ${plan.popular ? '#75FDA8' : '#27705D'}`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = plan.popular ? '#27705D' : '#27705D'
                    e.target.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = plan.popular ? '#75FDA8' : 'transparent'
                    e.target.style.color = plan.popular ? '#2D2D2D' : '#75FDA8'
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <FaCheckCircle className="mt-1 shrink-0" style={{ color: '#75FDA8' }} />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#27705D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Health Tourism Business?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Join hundreds of healthcare providers who are already using AI to deliver better patient experiences and grow their international practice.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-bold transition-all hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FFFFFF'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#75FDA8'}
          >
            Start Your Free 14-Day Trial →
          </button>
          <p className="mt-4 text-xs sm:text-sm" style={{ color: '#E8E8E8' }}>
            No credit card required • Full access to all features • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#27705D' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/light_png.png" 
                  alt="Llamanage Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">Llamanage</span>
              </div>
              <p className="text-sm sm:text-base" style={{ color: '#B8B8B8' }}>
                AI-powered patient support for health tourism businesses.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#B8B8B8' }}>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#B8B8B8' }}>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#B8B8B8' }}>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t-2 text-xs sm:text-sm" style={{ borderColor: '#27705D', color: '#B8B8B8' }}>
            <p>&copy; 2025 Llamanage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
