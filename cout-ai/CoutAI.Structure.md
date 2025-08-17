# 🏗️ Cout.AI Project Structure
---

## 📁 Root Directory Structure

```
cout-ai/
├── 📁 src/                     # Frontend source code
├── 📁 backend/                 # Backend API server
├── 📁 docs/                    # Project documentation
├── 📁 public/                  # Static assets (empty - clean)
├── 📄 package.json             # Frontend dependencies
├── 📄 package-lock.json        # Dependency lock file
├── 📄 next.config.ts           # Next.js configuration
├── 📄 tailwind.config.ts       # Tailwind CSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 postcss.config.mjs       # PostCSS configuration
├── 📄 eslint.config.mjs        # ESLint configuration
├── 📄 .gitignore               # Git ignore rules
├── 📄 database-migration.sql   # Database setup script
└── 📄 README.md                # Main project documentation
```

---

## 🎨 Frontend Structure (`src/`)

```
src/
├── 📁 app/                     # Next.js App Router
│   ├── 📄 layout.tsx          # Root layout component
│   ├── 📄 page.tsx            # Homepage (/)
│   ├── 📄 globals.css         # Global styles & theme system
│   ├── 📄 favicon.ico         # Site favicon
│   ├── 📁 chat/               # Chat interface route
│   │   └── 📄 page.tsx        # Chat page (/chat)
│   ├── 📁 profile/            # User profile route
│   │   └── 📄 page.tsx        # Profile page (/profile)
│   ├── 📁 login/              # Authentication routes
│   │   └── 📄 page.tsx        # Login page (/login)
│   ├── 📁 register/           # Registration route
│   │   └── 📄 page.tsx        # Register page (/register)
│   ├── 📁 forgot-password/    # Password reset routes
│   │   └── 📄 page.tsx        # Forgot password (/forgot-password)
│   └── 📁 reset-password/     # Password reset confirmation
│       └── 📄 page.tsx        # Reset password (/reset-password)
├── 📁 components/             # Reusable React components
│   ├── 📄 HomePage.tsx        # Landing page component
│   ├── 📄 ProfilePage.tsx     # User profile component
│   ├── 📁 Chat/               # Chat-specific components
│   │   ├── 📄 ChatInterface.tsx    # Main chat interface
│   │   └── 📄 ChatSidebar.tsx      # Session management sidebar
│   └── 📁 ui/                 # UI utility components
│       ├── 📄 Header.tsx           # Navigation header
│       ├── 📄 ColorPicker.tsx      # Theme color selector
│       ├── 📄 LoadingSpinner.tsx   # Loading states
│       └── 📄 MarkdownRenderer.tsx # Markdown content renderer
├── 📁 context/                # React Context providers
│   ├── 📄 AuthContext.tsx     # Authentication state management
│   ├── 📄 ColorContext.tsx    # Theme color management
│   └── 📄 ThemeContext.tsx    # Dark/light mode management
└── 📁 lib/                    # Utility libraries
    ├── 📄 api.ts              # Backend API client
    └── 📄 supabase.ts         # Supabase client configuration
```

---

## 🔧 Backend Structure (`backend/`)

```
backend/
├── 📁 app/                    # FastAPI application
│   ├── 📄 main.py            # FastAPI app entry point
│   ├── 📁 routers/           # API route handlers
│   │   └── 📄 chat.py        # Chat endpoints
│   ├── 📁 services/          # Business logic services
│   │   ├── 📄 openai_service.py    # OpenAI API integration
│   │   └── 📄 supabase_service.py  # Database operations
│   └── 📁 models/            # Data models
│       └── 📄 chat.py        # Pydantic models
├── 📄 requirements.txt       # Python dependencies
├── 📄 run.py                # Development server runner
├── 📄 env.example           # Environment variables template
└── 📄 README.md             # Backend documentation
```

---

---

## 🎯 Key Features by Directory

### 🏠 Homepage & Navigation (`src/app/`, `src/components/HomePage.tsx`)
- Landing page with feature highlights
- Navigation header with theme controls
- User profile access and authentication

### 💬 Chat System (`src/components/Chat/`, `backend/app/routers/chat.py`)
- Multi-session chat management
- Real-time messaging with OpenAI GPT-4
- Session persistence and history
- Markdown rendering with syntax highlighting
- Search functionality for chat sessions

### 👤 User Management (`src/app/profile/`, `src/context/AuthContext.tsx`)
- User profile page with account information
- Supabase authentication with JWT tokens
- Protected routes and session management
- Password reset system

### 🎨 Theming System (`src/context/ColorContext.tsx`, `src/app/globals.css`)
- 14 dynamic color themes
- Dark/light mode support
- Glassmorphism design effects
- Persistent theme preferences

### 🔐 Security (`backend/app/services/supabase_service.py`)
- Row-level security (RLS)
- JWT token authentication
- Environment variable protection
- CORS configuration

---

## 📊 Project Statistics

- **Frontend Components**: 8 main components + 4 UI components
- **Backend Endpoints**: 7 chat API endpoints
- **Documentation Files**: 5 comprehensive guides
- **Theme Options**: 14 color themes + dark/light modes
- **Dependencies**: Minimal, secure, up-to-date packages
- **Security Vulnerabilities**: 0 (verified with npm audit)

---

## 🚀 Development Workflow

### Frontend Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
```

### Backend Development
```bash
cd backend
python -m venv cout_venv     # Create virtual environment
cout_venv\Scripts\activate   # Activate environment (Windows)
pip install -r requirements.txt  # Install dependencies
python run.py               # Start development server
```
