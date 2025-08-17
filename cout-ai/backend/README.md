# 🏋️ CoutAI Backend

FastAPI backend for the CoutAI.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key
- Supabase project credentials

### 1. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your actual credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### 3. Database Setup

Create the required table in your Supabase database:

```sql
-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### 4. Run the Server

```bash
# Using the run script
python run.py

# Or directly with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔗 API Endpoints

### Chat Endpoints

- `POST /api/chat/` - Send a message to the AI fitness coach
- `GET /api/chat/history?limit=10` - Get chat history for authenticated user
- `GET /api/chat/health` - Chat service health check

### General Endpoints

- `GET /` - API information
- `GET /health` - Overall health check
- `GET /api/status` - API status and available endpoints

## 🔐 Authentication

The API uses Supabase JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_supabase_jwt_token>
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and CORS setup
│   │   ├── __init__.py
│   │   └── chat.py          # Pydantic models for API
│   ├── routers/
│   │   ├── __init__.py
│   │   └── chat.py          # Chat API endpoints
│   └── services/
│       ├── __init__.py
│       ├── openai_service.py    # OpenAI API integration
│       └── supabase_service.py  # Supabase database operations
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
├── run.py                  # Server startup script
└── README.md              # This file
```

## 🧪 Testing

Test the API using the interactive docs or with curl:

```bash
# Health check
curl http://localhost:8000/health

# Chat message (requires authentication)
curl -X POST "http://localhost:8000/api/chat/" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "I want to start working out. Any advice?"}'
```

## 🚀 Deployment

The backend is ready for deployment to platforms like:

- Railway
- Render
- Heroku
- AWS Lambda (with Mangum)
- Google Cloud Run

Make sure to set the environment variables in your deployment platform.

## 🛠️ Development

### Adding New Features

1. **Models**: Add new Pydantic models in `app/models/`
2. **Services**: Add business logic in `app/services/`
3. **Routers**: Add new API endpoints in `app/routers/`
4. **Configuration**: Update `app/config.py` for new settings

### Logging

The application uses Python's built-in logging. Logs include:
- Request/response information
- Error tracking
- Authentication events
- OpenAI API calls

## 🔧 Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Check your API key and quota
2. **Supabase Connection**: Verify URL and keys
3. **CORS Issues**: Make sure frontend URL is in CORS origins
4. **Database Errors**: Ensure chat_messages table exists

### Environment Variables

Make sure all required environment variables are set:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The app will validate these on startup and show clear error messages if any are missing.

---

For more information, check the [main project documentation](../docs/README.md). 