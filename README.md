# 🦙 Llamanage - AI-Powered Customer Support Platform

> Transform your customer support with intelligent AI agents that learn from your business data.

**Built with React 19, Vite 7, Tailwind CSS v4, and Supabase**

---

## 📖 Table of Contents
- [Project Description](#-project-description)
- [Purpose](#-purpose)
- [Technologies Used](#️-technologies-used)
- [Features](#-features)
- [Installation Instructions](#-installation-instructions)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Supabase Integration](#-supabase-integration)
- [Design System](#-design-system)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Team Members](#-team-members)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📝 Project Description

**Llamanage** is a cutting-edge B2B SaaS platform designed to revolutionize customer support through AI-powered automation. The platform provides businesses with tools to create, customize, and deploy intelligent AI agents that can handle customer inquiries, automate workflows, and provide personalized support experiences.

### Key Capabilities
- **Visual Flow Builder**: No-code interface to design conversation flows for AI agents
- **Document Intelligence**: Upload business documents and train AI on your specific data
- **Multi-Channel Integration**: Connect with Google Calendar, Slack, Discord, and more
- **Real-Time Chat**: AI-powered chat interface with conversation history
- **Enterprise-Grade Security**: Row Level Security (RLS) and JWT authentication
- **Scalable Architecture**: Built on Supabase with PostgreSQL and vector database support

---

## 🎯 Purpose

### Problem Statement
Modern businesses struggle with:
- High customer support costs
- Inconsistent service quality
- Difficulty scaling support operations
- Limited personalization at scale
- Integration complexity across multiple platforms

### Our Solution
Llamanage addresses these challenges by:
1. **Automating Repetitive Tasks**: AI agents handle common inquiries, freeing human agents for complex issues
2. **Maintaining Consistency**: Standardized responses based on your business knowledge base
3. **Enabling Scalability**: Handle unlimited concurrent conversations without additional staff
4. **Personalizing Interactions**: Context-aware AI that learns from your business data
5. **Simplifying Integrations**: Pre-built connectors for popular business tools

### Target Audience
- Small to medium businesses (SMBs) looking to automate customer support
- Enterprise companies seeking to augment their support teams
- SaaS companies needing 24/7 customer assistance
- E-commerce businesses handling high inquiry volumes

---

## 🛠️ Technologies Used

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library with latest features (Server Components ready) |
| **Vite** | 7.1.12 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | v4 | Utility-first CSS framework with new `@tailwindcss/vite` plugin |
| **React Router** | 7.9.4 | Client-side routing and navigation |
| **React Flow** | 11.11.4 | Visual node-based editor for flow builder |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase** | Complete backend-as-a-service platform |
| **PostgreSQL** | Primary database (15+) |
| **pgvector** | Vector database extension for AI embeddings (1536 dimensions) |
| **Supabase Auth** | JWT authentication with OAuth providers |
| **Supabase Storage** | S3-compatible object storage |
| **Supabase Realtime** | WebSocket subscriptions for live updates |

### Developer Tools
- **ESLint** - Code linting and quality enforcement
- **Git** - Version control
- **npm** - Package management
- **VS Code** - Recommended IDE

### External APIs & Integrations
- **Google Calendar API** - Meeting scheduling and availability
- **OAuth 2.0** - Third-party authentication
- **Slack API** - Team communication (ready for integration)
- **Discord API** - Community management (ready for integration)

---

## ✨ Features

### 🎨 **Landing Page**
- Modern, responsive design with dark theme (#2D2D2D, #75FDA8, #27705D)
- Full-screen hero section with gradient background
- Feature showcase with animations
- Pricing tiers (Free, Pro, Enterprise)
- Customer testimonials
- Contact form
- Smooth scrolling navigation

### 🔐 **Authentication (Supabase)**
- Email/password authentication
- Google OAuth integration (optional)
- Automatic JWT token management
- Protected routes with RLS (Row Level Security)
- Session persistence with httpOnly cookies

### 📊 **Dashboard**
A comprehensive modular dashboard with 6 main sections:

1. **📊 Dashboard Overview**
   - Real-time statistics (files, messages, integrations)
   - Quick action buttons
   - Activity summary

2. **🔄 Flow Builder** (React Flow)
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
   - Auto-save to Supabase

3. **📁 Files Management**
   - Drag & drop file upload to Supabase Storage
   - File list with metadata (name, size, type, date)
   - Business information forms
   - Document processing for AI training (ready for embeddings)

4. **💬 Chat Interface**
   - AI-powered chat window
   - Message history persisted to Supabase PostgreSQL
   - Typing indicators
   - Context-aware responses
   - Training data integration (ready for vector search)

5. **🔗 Integrations Manager**
   - OAuth integrations via Supabase Auth:
     - 📅 Google Calendar
     - 💬 Slack
     - 🎮 Discord
     - ✉️ Gmail
     - 📊 Notion
     - ⏰ Calendly
   - Provider-specific settings
   - Real-time connection status

6. **⚙️ Settings Panel**
   - User profile management
   - Company information
   - Preferences and customization
   - Profile stored in Supabase `profiles` table

### 🗄️ **Backend (Supabase)**
- **PostgreSQL Database** with 6 tables:
  - `profiles` - User profiles (extends auth.users)
  - `flows` - Flow builder data (nodes, edges)
  - `files` - File metadata with storage paths
  - `chat_messages` - Chat history
  - `business_info` - Business information and FAQs
  - `document_embeddings` - Vector embeddings for semantic search (pgvector)
- **Supabase Storage** - S3-compatible file storage with RLS policies
- **Supabase Auth** - Built-in JWT authentication with automatic refresh
- **Real-time subscriptions** - WebSocket support for live updates
- **Row Level Security (RLS)** - Database-level access control

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 19.1.1** - UI library with latest features
- ⚡ **Vite 7.1.12** - Lightning-fast build tool
- 🎨 **Tailwind CSS v4** - Utility-first CSS with new `@tailwindcss/vite` plugin
- 🧭 **React Router 7.9.4** - Client-side routing
- 🌊 **React Flow 11.11.4** - Visual node editor for flow builder

### Backend & Database
- 🗄️ **Supabase** - Complete backend solution
  - PostgreSQL 15+ with pgvector extension
  - Built-in authentication (JWT, OAuth)
  - S3-compatible object storage
  - Real-time WebSocket subscriptions
  - Row Level Security (RLS)
- 📦 **@supabase/supabase-js** - Official JavaScript client

### Developer Experience
- 🔍 **ESLint** - Code linting with Airbnb config
- 🎯 **TypeScript-ready** - Easy migration path
- 📝 **Environment Variables** - `.env` for configuration

---

## 🚀 Installation Instructions

Follow these steps to set up Llamanage on your local machine.

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 500MB free space

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/Convgen/frontend.git

# Or using SSH
git clone git@github.com:Convgen/frontend.git

# Navigate to project directory
cd llamanage
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This installs:
# - React 19.1.1 and related packages
# - Vite 7.1.12
# - Tailwind CSS v4
# - React Router 7.9.4
# - React Flow 11.11.4
# - Supabase client library
# - Development dependencies (ESLint, etc.)
```

### Step 3: Set Up Supabase Backend

**⚠️ CRITICAL**: This app requires Supabase to function. Follow the complete guide:

📘 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed setup instructions

**Quick Summary:**

1. **Create Supabase Project** (5 minutes)
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password (save it!)

2. **Run Database Schema** (5 minutes)
   - Open SQL Editor in Supabase Dashboard
   - Copy SQL from `SUPABASE_SETUP.md`
   - Execute to create 6 tables + RLS policies

3. **Create Storage Bucket** (3 minutes)
   - Go to Storage section
   - Create bucket named `user-files`
   - Set as private
   - Add RLS policies (INSERT, SELECT, DELETE)

4. **Configure Authentication** (2 minutes)
   - Go to Authentication → Providers
   - Enable Email provider
   - Optionally enable Google OAuth

5. **Get API Credentials** (1 minute)
   - Go to Project Settings → API
   - Copy Project URL
   - Copy anon/public key

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your text editor
# Add your Supabase credentials:
```

**.env file:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
- `VITE_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API → Project API keys → anon/public

### Step 5: Start Development Server

```bash
# Start the Vite development server
npm run dev

# You should see:
# VITE v7.1.12  ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Llamanage landing page! 🎉

### Verification Checklist

After installation, verify everything works:

- [ ] Landing page loads without errors
- [ ] Can navigate to Sign Up page
- [ ] Can create new account (check Supabase Auth)
- [ ] Can sign in with created account
- [ ] Dashboard loads with all 6 tabs
- [ ] Can upload files (check Supabase Storage)
- [ ] Can create a flow in Flow Builder
- [ ] Can send chat messages

### Troubleshooting Installation

**Error: "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Supabase client not initialized"**
- Check that `.env` file exists in root directory
- Verify environment variables are correct
- Restart dev server after adding `.env`

**Error: "Failed to fetch" or 401 Unauthorized**
- Verify SQL schema was run in Supabase
- Check RLS policies are enabled
- Confirm anon key is correct in `.env`

**Port 5173 already in use**
```bash
# Kill the process or use different port
npm run dev -- --port 3000
```

For more troubleshooting, see **[START_HERE.md](./START_HERE.md)**

---

## 📘 Usage Guide

### Getting Started with Llamanage

#### 1. Create Your Account

1. Navigate to [http://localhost:5173](http://localhost:5173)
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password (minimum 6 characters)
   - Company name
4. Click **"Sign Up"**
5. You'll be redirected to the dashboard

**Note**: Email verification is optional in development mode. For production, enable email confirmation in Supabase.

#### 2. Dashboard Overview

After signing in, you'll see the main dashboard with 6 tabs:

**📊 Dashboard Tab**
- View statistics (total files, chat messages, active integrations)
- Quick actions (Upload File, Create Flow, Start Chat)
- Activity summary

**🔄 Flow Builder Tab**
- Visual editor for creating AI conversation flows
- 7 node types available (see Flow Builder section)
- Drag and drop interface
- Auto-saves to database

**📁 Files Tab**
- Upload business documents (PDF, DOCX, TXT, CSV)
- Drag & drop interface
- File management (view, delete)
- Business information forms

**💬 Chat Tab**
- AI-powered chat interface
- Message history persists across sessions
- Typing indicators
- Context-aware responses

**🔗 Integrations Tab**
- Connect external services
- Google Calendar OAuth
- Slack, Discord, Gmail (UI ready)

**⚙️ Settings Tab**
- Update user profile
- Company information
- Preferences

#### 3. Building Your First AI Agent Flow

**Step-by-Step Flow Creation:**

1. **Navigate to Flow Builder**
   - Click "Flow Builder" tab in dashboard

2. **Start with a Start Node**
   - Already present on canvas
   - This is where conversations begin

3. **Add a Message Node**
   - Drag "Message Node" from sidebar (or it appears on canvas)
   - Click to edit
   - Enter welcome message: "Hello! How can I help you today?"

4. **Add a Question Node**
   - Drag "Question Node" onto canvas
   - Connect Start Node to Question Node (drag from handle)
   - Edit question: "What's your name?"
   - This collects user input

5. **Add an AI Response Node**
   - Drag "AI Response Node" onto canvas
   - Connect Question Node to AI Response
   - Set prompt: "Respond personally to {user_input}"

6. **Add an End Node**
   - Drag "End Node" onto canvas
   - Connect AI Response to End Node

7. **Save Your Flow**
   - Click "Save Flow" button
   - Enter flow name: "Welcome Flow"
   - Flow saves to Supabase automatically

**Node Types Explained:**

| Node Type | Purpose | Example Use |
|-----------|---------|-------------|
| 🚀 **Start Node** | Entry point for conversations | Always first node |
| 💬 **Message Node** | Send predefined text | "Welcome to our support!" |
| ❓ **Question Node** | Collect user input | "What's your order number?" |
| 🔀 **Condition Node** | Branch based on logic | If answer contains "refund" → Refund flow |
| ⚡ **Action Node** | Trigger external actions | Send email, create ticket |
| 🤖 **AI Response Node** | Dynamic AI-generated responses | Context-aware personalized replies |
| 🏁 **End Node** | Terminate conversation | "Thank you, goodbye!" |

#### 4. Uploading Business Documents

1. **Go to Files Tab**
2. **Upload Files** (two methods):
   - **Drag & Drop**: Drag files onto the upload area
   - **Click to Browse**: Click "Choose Files" button
3. **Supported Formats**: PDF, DOCX, TXT, CSV, MD
4. **Files Process Automatically**:
   - Upload to Supabase Storage
   - Metadata stored in database
   - Ready for AI training (embeddings coming soon)

#### 5. Using the Chat Interface

1. **Navigate to Chat Tab**
2. **Type your message** in the input field
3. **Press Enter** or click Send
4. **AI responds** based on:
   - Your uploaded documents
   - Business information
   - Conversation context
5. **Message history** persists automatically

#### 6. Setting Up Integrations

**Google Calendar Integration:**

1. Go to **Integrations Tab**
2. Click **"Connect"** on Google Calendar card
3. Authorize access in Google OAuth popup
4. Grant calendar permissions
5. Status changes to "Connected"
6. AI can now:
   - Check availability
   - Schedule meetings
   - Send calendar invites

**Other Integrations** (UI ready, implementation coming):
- Slack
- Discord  
- Gmail
- Notion
- Calendly

#### 7. Customizing Settings

1. **Navigate to Settings Tab**
2. **Update Profile**:
   - Name
   - Email
   - Company name
3. **Set Preferences**:
   - Notification settings
   - AI behavior
   - Theme options (coming soon)

### Advanced Usage

#### Real-Time Features

**Live Chat Updates:**
```javascript
// Automatically enabled via Supabase Realtime
// See new messages instantly without refresh
```

**Flow Collaboration:**
```javascript
// Multiple users can work on flows simultaneously
// (Ready for implementation)
```

#### API Integration

Access Supabase helpers in your components:

```javascript
import { authHelpers, dbHelpers, storageHelpers } from './utils/supabaseClient.js'

// Authentication
const { user, error } = await authHelpers.getUser()

// Database operations
const flows = await dbHelpers.getFlows(user.id)

// File uploads
await storageHelpers.uploadFile(user.id, file)
```

See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for complete API documentation.

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server (Vite on port 5173)
npm run build        # Build for production (creates dist/ folder)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
llamanage/
├── src/
│   ├── components/
│   │   └── FlowBuilder.jsx          # Visual flow editor with React Flow
│   ├── pages/
│   │   ├── LandingPage.jsx          # Public landing page
│   │   ├── SignIn.jsx               # Authentication - Sign in (Supabase)
│   │   ├── SignUp.jsx               # Authentication - Sign up (Supabase)
│   │   └── Dashboard.jsx            # Main dashboard with 6 tabs
│   ├── utils/
│   │   ├── supabaseClient.js        # Supabase helpers (auth, db, storage, real-time)
│   │   └── googleCalendar.js        # Google Calendar API integration
│   ├── assets/                      # Images and static files
│   ├── App.jsx                      # Main app component with routing
│   ├── App.css                      # Custom animations
│   ├── main.jsx                     # App entry point
│   └── index.css                    # Global styles + Tailwind v4
├── public/                          # Public assets
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Dependencies
├── .env.example                     # Environment template
├── SUPABASE_SETUP.md                # Complete Supabase setup guide (START HERE!)
├── PROJECT_SUMMARY.md               # Comprehensive project overview
├── FLOW_BUILDER.md                  # Flow builder documentation
└── README.md                        # This file
```

## 🔌 Supabase Integration

### Why Supabase?
- **90% Less Code**: Replaced 30+ backend files with 1 utility file
- **Built-in Auth**: JWT tokens, OAuth providers, email verification
- **Vector Database**: pgvector extension for AI embeddings (1536 dimensions)
- **Real-time**: WebSocket subscriptions for live updates
- **Better Security**: Row Level Security (RLS) at database level
- **Object Storage**: S3-compatible file storage with RLS policies

### Database Schema

**6 Core Tables:**
1. `profiles` - User profiles (extends auth.users)
2. `flows` - Flow builder data (nodes, edges, metadata)
3. `files` - File metadata with Supabase Storage paths
4. `chat_messages` - Chat history with user relationships
5. `business_info` - Business information and FAQs
6. `document_embeddings` - Vector embeddings for semantic search

### Authentication Flow
1. User signs up → `authHelpers.signUp(email, password, companyName)`
2. Supabase creates user in `auth.users` table
3. Database trigger auto-creates profile in `profiles` table
4. User receives email verification (optional in dev)
5. User signs in → `authHelpers.signIn(email, password)`
6. Supabase returns session with JWT token (stored in httpOnly cookie)
7. All subsequent requests automatically include JWT

### API Reference

```javascript
// Authentication
import { authHelpers } from './utils/supabaseClient.js'

await authHelpers.signUp(email, password, companyName)
await authHelpers.signIn(email, password)
await authHelpers.signOut()
const { user, error } = await authHelpers.getUser()

// Database
import { dbHelpers } from './utils/supabaseClient.js'

await dbHelpers.getFlows(userId)
await dbHelpers.createFlow(userId, { flowName, nodes, edges })
await dbHelpers.updateFlow(flowId, { flowName, nodes, edges })

// Storage
import { storageHelpers } from './utils/supabaseClient.js'

await storageHelpers.uploadFile(userId, file)
await storageHelpers.deleteFile(filePath)
const url = await storageHelpers.getFileUrl(filePath)
```

See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for complete API documentation.

## 🎨 Design System

### Color Palette
```css
Primary Green:  #75FDA8  /* Accent color for buttons and highlights */
Dark Gray:      #2D2D2D  /* Main background color */
Deep Teal:      #27705D  /* Hover states and borders */
Dark Input:     #1F1F1F  /* Form inputs and cards */
White:          #FFFFFF  /* Text and icons */
Light Gray:     #F0F0F0  /* Secondary text */
```

### Styling Approach
- **Inline styles** for brand colors (consistency across components)
- **Tailwind classes** for spacing, layout, typography
- Example:
  ```jsx
  <button
    className="px-6 py-3 rounded-lg transition-colors"
    style={{ backgroundColor: '#75FDA8' }}
    onMouseEnter={(e) => e.target.style.backgroundColor = '#27705D'}
    onMouseLeave={(e) => e.target.style.backgroundColor = '#75FDA8'}
  >
    Click Me
  </button>
  ```

## 🎯 Key Features in Detail

### Visual Flow Builder
- **7 Node Types**: Start, Message, Question, Condition, Action, AI Response, End
- **Drag & Drop**: Intuitive node placement with React Flow
- **Live Connections**: Real-time edge creation with arrow markers
- **Node Customization**: Edit content directly in nodes with onChange callbacks
- **Multiple Branches**: Condition nodes support true/false paths
- **MiniMap**: Navigate large flows easily
- **Auto-Save**: Flows saved to Supabase PostgreSQL

### Supabase Real-time
- **Live Chat**: See messages as they arrive with WebSocket subscriptions
- **Flow Sync**: Multiple users can collaborate on flows (ready for implementation)
- **File Updates**: Watch for new file uploads in real-time
- **Connection Status**: Track online/offline state

### Security Features
- **Row Level Security (RLS)**: Users only access their own data
- **JWT Authentication**: Automatic token refresh with httpOnly cookies
- **Storage Policies**: Private file access per user
- **Environment Variables**: Secrets never committed to Git
- **Email Verification**: Optional for production deployments

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Tablet and desktop optimized
- Smooth transitions and hover effects
- Dark theme throughout (#2D2D2D, #75FDA8, #27705D)

## 📖 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide ⭐ START HERE!
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Comprehensive project overview
- **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - Migration notes and benefits
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - API quick reference card
- **[FLOW_BUILDER.md](./FLOW_BUILDER.md)** - Flow builder technical documentation

## 📦 Deployment

### Recommended Platforms
- **Vercel** - Automatic deployment from GitHub (recommended)
- **Netlify** - Free tier with CDN
- **Cloudflare Pages** - Fast global edge network

### Environment Variables (Production)
Set these in your hosting platform dashboard:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Build Commands
```bash
npm run build    # Creates dist/ folder
npm run preview  # Test production build locally
```

### Deployment Steps
1. Connect your Git repository to hosting platform
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy!

## 🧪 Testing

```bash
npm run lint    # Run ESLint
# Unit tests coming soon with Vitest
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Use inline styles for brand colors
   - Use Tailwind classes for layout
   - Test your changes locally

4. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes

### Contribution Guidelines

- **Code Style**: Follow the existing patterns in the codebase
- **Components**: Keep components modular and reusable
- **Supabase**: Use helpers from `supabaseClient.js`
- **Documentation**: Update docs if you change functionality
- **Testing**: Test thoroughly before submitting PR

---

## 👥 Team Members

**Llamanage** is built by a dedicated team of developers and designers:

### Core Team

<!-- Add team member names below -->
- **Abdelrahman Elmorsi** - Frontend Developer
- **Nabil** - AI/Backend Developer
- **Yasir** - AI/Backend Developer
- **Abdullah Mazloum** - Designer

### Contributors

We'd like to thank all contributors who have helped shape Llamanage.

<!-- Contributors will be added automatically via GitHub -->

---

## � License

Proprietary - All rights reserved

## � Acknowledgments

- React team for React 19
- Vite team for blazing-fast builds
- Tailwind Labs for Tailwind CSS v4
- Supabase team for amazing backend platform
- React Flow for visual node editor

## 📞 Support

For questions or support, reach out through the contact form on the landing page.

- 📧 Email: support@llamanage.com
- 💬 Discord: [Join our community](https://discord.gg/llamanage)
- 📚 Docs: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

**🦙 Llamanage** - Empowering businesses with AI-driven customer support

Built with ❤️ by the Convgen team

