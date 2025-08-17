from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message to the AI")
    session_id: Optional[str] = Field(None, description="Chat session ID (optional for new sessions)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "I want to start working out but I'm a complete beginner. Can you help me create a simple routine?",
                "session_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    message: str = Field(..., description="AI's response to the user")
    timestamp: str = Field(..., description="Response timestamp in ISO format")
    session_id: Optional[str] = Field(None, description="Chat session ID (may be None if session creation failed)")
    session_title: Optional[str] = Field(None, description="Session title (included if session title was updated)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "I'd be happy to help you start your fitness journey! For beginners, I recommend...",
                "timestamp": "2024-01-01T12:00:00Z",
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "session_title": "How to start working out as a beginner"
            }
        }

class ChatHistory(BaseModel):
    """Model for chat message history"""
    id: str = Field(..., description="Unique message ID")
    user_id: str = Field(..., description="User ID from Supabase auth")
    session_id: str = Field(..., description="Chat session ID")
    user_message: str = Field(..., description="User's original message")
    ai_response: str = Field(..., description="AI's response")
    created_at: datetime = Field(..., description="Message creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "user-123",
                "session_id": "session-456",
                "user_message": "What's a good workout for building muscle?",
                "ai_response": "For building muscle, I recommend focusing on compound exercises...",
                "created_at": "2024-01-01T12:00:00Z"
            }
        }

class ChatSession(BaseModel):
    """Model for chat sessions"""
    id: str = Field(..., description="Unique session ID")
    user_id: str = Field(..., description="User ID from Supabase auth")
    title: str = Field(..., description="Session title")
    created_at: datetime = Field(..., description="Session creation timestamp")
    updated_at: datetime = Field(..., description="Session last update timestamp")
    message_count: int = Field(0, description="Number of messages in this session")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "user-123",
                "title": "Beginner Workout Plan",
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T13:30:00Z",
                "message_count": 5
            }
        }

class CreateSessionRequest(BaseModel):
    """Request model for creating a new chat session"""
    title: Optional[str] = Field("New Chat", description="Title for the new chat session")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Beginner Workout Plan"
            }
        }

class CreateSessionResponse(BaseModel):
    """Response model for creating a new chat session"""
    session: ChatSession = Field(..., description="The newly created chat session")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "user_id": "user-123",
                    "title": "Beginner Workout Plan",
                    "created_at": "2024-01-01T12:00:00Z",
                    "updated_at": "2024-01-01T12:00:00Z",
                    "message_count": 0
                }
            }
        }

class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "Session not found",
                "detail": "The specified chat session does not exist or does not belong to the current user"
            }
        } 