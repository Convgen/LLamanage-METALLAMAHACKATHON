# 🦙 Llamanage - AI-Powered Customer Support Platform

> Transform your customer support with intelligent AI agents that learn from your business data.

## 🌟 Overview

Llamanage is a B2B SaaS platform that enables businesses to create customized AI agents for customer support. With an intuitive visual flow builder, file management system, and seamless integrations, businesses can automate their customer service while maintaining quality and personalization.

## ✨ Features

### 🎨 **Landing Page**
- Modern, responsive design with dark theme (#2D2D2D, #75FDA8, #27705D)
- Full-screen hero section
- Feature showcase
- Contact form
- Smooth scrolling navigation

### 🔐 **Authentication**
- Sign in / Sign up pages
- Session management with localStorage
- Protected routes for dashboard access

### 📊 **Dashboard**
A comprehensive business dashboard with 6 main sections:

1. **📊 Dashboard Overview**
   - Real-time statistics
   - Quick action buttons
   - Activity summary

2. **🔄 Flow Builder** (Typebot-style)
   - Visual node-based editor for AI conversation flows
   - 7 node types:
     - 🚀 Start Node - Conversation entry point
     - 💬 Message Node - Send predefined messages
     - ❓ Question Node - Collect user input
     - 🔀 Condition Node - Branch logic (equals, contains, greater/less than)
     - ⚡ Action Node - Trigger actions (email, tickets, webhooks)
     - 🤖 AI Response Node - Dynamic AI responses with custom prompts
     - 🏁 End Node - Conversation termination
   - Drag & drop interface
   - Real-time node connections
   - Flow export to backend via POST `/api/flows`

3. **📁 Files Management**
   - Drag & drop file upload
   - File list with metadata
   - Business information forms
   - Document processing for AI training

4. **💬 AI Chat**
   - Interactive chat interface
   - Typing indicators
   - Message history
   - Real-time responses

5. **🔗 Integrations**
   - Connect external services
   - Slack, Discord, Webhook support
   - Easy API key management

6. **⚙️ Settings**
   - Company profile management
   - User preferences
   - AI configuration

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.12
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite
- **Routing**: React Router DOM
- **Flow Builder**: React Flow
- **Font**: Inter (Google Fonts)
- **State Management**: React Hooks (useState, useEffect, useRef)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Convgen/frontend.git
   cd llamanage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Color Palette

- **Primary Green**: `#75FDA8` - Accent color for buttons and highlights
- **Dark Gray**: `#2D2D2D` - Main background color
- **Deep Teal**: `#27705D` - Hover states and borders
- **Dark Input**: `#1F1F1F` - Form inputs and cards

## 📁 Project Structure

```
llamanage/
├── src/
│   ├── components/
│   │   └── FlowBuilder.jsx      # Visual flow builder component
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── SignIn.jsx           # Authentication - Sign in
│   │   ├── SignUp.jsx           # Authentication - Sign up
│   │   └── Dashboard.jsx        # Main dashboard with all tabs
│   ├── assets/                  # Images and static files
│   ├── App.jsx                  # Main app component with routing
│   ├── App.css                  # Custom animations
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles + Tailwind
├── public/                      # Public assets
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies
├── FLOW_BUILDER.md             # Flow builder documentation
└── README.md                   # This file
```

## 🔌 Backend Integration

The Flow Builder sends data to your backend when saving flows:

**Endpoint**: `POST /api/flows`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Payload**:
```json
{
  "flowName": "My AI Agent Flow",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2025-10-24T21:25:00.000Z"
}
```

See `FLOW_BUILDER.md` for complete API documentation.

## 🎯 Key Features in Detail

### Visual Flow Builder
- **Drag & Drop**: Intuitive node placement
- **Live Connections**: Real-time edge creation
- **Node Customization**: Edit content directly in nodes
- **Multiple Branches**: Condition nodes support true/false paths
- **MiniMap**: Navigate large flows easily
- **Export/Save**: Send complete flow data to backend

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Smooth transitions and hover effects
- Dark theme throughout

## 🤝 Contributing

This is a B2B SaaS platform in active development. For feature requests or bug reports, please contact the team.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Built by the Convgen team for modern businesses seeking AI-powered customer support solutions.

## 📞 Support

For questions or support, reach out through the contact form on the landing page.

---

**🦙 Llamanage** - Empowering businesses with AI-driven customer support

