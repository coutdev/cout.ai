from fastapi import APIRouter, HTTPException, Header, Depends, Query
from typing import Optional, List
import logging

from app.models.chat import (
    ChatRequest, ChatResponse, ChatHistory, ChatSession,
    CreateSessionRequest, CreateSessionResponse, ErrorResponse
)
from app.services.openai_service import openai_service
from app.services.supabase_service import supabase_service

# Get logger (configured in main.py)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract user information from authorization header
    
    Args:
        authorization: Bearer token from request header
        
    Returns:
        User info dictionary
        
    Raises:
        HTTPException: If no valid authorization provided
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required"
        )
    
    try:
        # Extract token from "Bearer <token>" format
        token = authorization.replace("Bearer ", "")
        
        # Validate token and get user info
        user_info = supabase_service.validate_user_token(token)
        
        if not user_info:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
        
        return user_info
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

@router.post("/", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    Send a message to the AI fitness coach
    
    Args:
        request: Chat request containing message and optional session_id
        user: Current authenticated user (from dependency)
        
    Returns:
        AI response with session information
    """
    try:
        logger.info(f"Processing chat message for user {user['id']}")
        logger.info(f"Message: {request.message[:100]}...")
        logger.info(f"Session ID: {request.session_id}")
        
        # Validate session if provided
        if request.session_id:
            session = await supabase_service.get_session_by_id(
                request.session_id, 
                user["id"]
            )
            if not session:
                raise HTTPException(
                    status_code=404,
                    detail="Session not found or does not belong to current user"
                )
        
        # Get recent conversation context for this session
        context_messages = await supabase_service.get_recent_context(
            user_id=user["id"],
            session_id=request.session_id,
            limit=5
        )
        
        logger.info(f"Retrieved {len(context_messages)} context messages")
        
        # Get AI response
        ai_response = await openai_service.get_chat_response(
            user_message=request.message,
            conversation_history=context_messages
        )
        
        logger.info(f"Received AI response: {ai_response[:100]}...")
        
        # Store the conversation in database
        stored_message = await supabase_service.log_chat_message(
            user_id=user["id"],
            user_message=request.message,
            ai_response=ai_response,
            session_id=request.session_id
        )
        
        # Get the session_id from the stored message (in case a new session was created)
        final_session_id = stored_message.get("session_id", request.session_id)
        
        # Auto-update session title if it's still "New Chat" and this is the first message
        updated_title = None
        if final_session_id:
            current_session = await supabase_service.get_session_by_id(final_session_id, user["id"])
            if current_session and current_session.get("title") == "New Chat" and current_session.get("message_count") == 1:
                # Create a title from the user's message (first 50 characters)
                new_title = request.message[:50].strip()
                if len(request.message) > 50:
                    new_title += "..."
                
                # Update the session title
                await supabase_service.update_session_title(
                    session_id=final_session_id,
                    user_id=user["id"],
                    new_title=new_title
                )
                updated_title = new_title
                logger.info(f"Updated session {final_session_id} title to: {new_title}")
        
        logger.info(f"Stored message in session: {final_session_id}")
        
        return ChatResponse(
            message=ai_response,
            timestamp=stored_message["created_at"],
            session_id=final_session_id,
            session_title=updated_title
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat message"
        )

@router.post("/sessions", response_model=CreateSessionResponse)
async def create_chat_session(
    request: CreateSessionRequest,
    user: dict = Depends(get_current_user)
):
    """
    Create a new chat session
    
    Args:
        request: Session creation request with optional title
        user: Current authenticated user (from dependency)
        
    Returns:
        The newly created session
    """
    try:
        logger.info(f"Creating new chat session for user {user['id']} with title: {request.title}")
        
        session = await supabase_service.create_chat_session(
            user_id=user["id"],
            title=request.title or "New Chat"
        )
        
        logger.info(f"Created session: {session['id']}")
        
        return CreateSessionResponse(
            session=ChatSession(
                id=session["id"],
                user_id=session["user_id"],
                title=session["title"],
                created_at=session["created_at"],
                updated_at=session["updated_at"],
                message_count=session["message_count"]
            )
        )
        
    except Exception as e:
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create chat session"
        )

@router.get("/sessions", response_model=List[ChatSession])
async def get_user_sessions(
    user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of sessions to retrieve")
):
    """
    Get all chat sessions for the authenticated user
    
    Args:
        user: Current authenticated user (from dependency)
        limit: Maximum number of sessions to retrieve
        
    Returns:
        List of user's chat sessions
    """
    try:
        logger.info(f"Getting sessions for user {user['id']}, limit: {limit}")
        
        sessions = await supabase_service.get_user_sessions(
            user_id=user["id"],
            limit=limit
        )
        
        logger.info(f"Retrieved {len(sessions)} sessions")
        
        return [
            ChatSession(
                id=session["id"],
                user_id=session["user_id"],
                title=session["title"],
                created_at=session["created_at"],
                updated_at=session["updated_at"],
                message_count=session["message_count"]
            )
            for session in sessions
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving user sessions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve chat sessions"
        )

@router.get("/sessions/{session_id}/history", response_model=List[ChatHistory])
async def get_session_history(
    session_id: str,
    user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of messages to retrieve")
):
    """
    Get chat history for a specific session
    
    Args:
        session_id: The session ID to get history for
        user: Current authenticated user (from dependency)
        limit: Maximum number of messages to retrieve
        
    Returns:
        List of chat messages for the session
    """
    try:
        logger.info(f"Getting history for session {session_id}, limit: {limit}")
        
        # Verify session belongs to user
        session = await supabase_service.get_session_by_id(session_id, user["id"])
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found or does not belong to current user"
            )
        
        # Get chat history for this session
        history = await supabase_service.get_chat_history(
            user_id=user["id"],
            session_id=session_id,
            limit=limit
        )
        
        logger.info(f"Retrieved {len(history)} messages for session")
        
        return [
            ChatHistory(
                id=msg["id"],
                user_id=msg["user_id"],
                session_id=msg["session_id"],
                user_message=msg["user_message"],
                ai_response=msg["ai_response"],
                created_at=msg["created_at"]
            )
            for msg in history
        ]
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving session history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve session history"
        )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a chat session and all its messages
    
    Args:
        session_id: The session ID to delete
        user: Current authenticated user (from dependency)
        
    Returns:
        Success message
    """
    try:
        logger.info(f"Deleting session {session_id} for user {user['id']}")
        
        success = await supabase_service.delete_session(session_id, user["id"])
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Session not found or does not belong to current user"
            )
        
        logger.info(f"Successfully deleted session {session_id}")
        
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete session"
        )

@router.delete("/sessions:deleteAll")
async def delete_all_chat_sessions(
    user: dict = Depends(get_current_user)
):
    """
    Delete all chat sessions and messages for the authenticated user
    
    Args:
        user: Current authenticated user (from dependency)
        
    Returns:
        Success message with count of deleted sessions
    """
    try:
        logger.info(f"Deleting all sessions for user {user['id']}")
        
        deleted_count = await supabase_service.delete_all_user_sessions(user["id"])
        
        logger.info(f"Successfully deleted {deleted_count} sessions for user {user['id']}")
        
        return {
            "message": f"Successfully deleted {deleted_count} chat sessions",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error deleting all sessions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete all sessions"
        )

@router.get("/history", response_model=List[ChatHistory])
async def get_chat_history(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of messages to retrieve"),
    session_id: Optional[str] = Query(None, description="Specific session ID (optional)"),
    user: dict = Depends(get_current_user)
):
    """
    Retrieve chat history for the authenticated user
    
    Args:
        limit: Maximum number of messages to retrieve (default: 10)
        session_id: Specific session ID (optional)
        user: Current authenticated user (from dependency)
        
    Returns:
        List of chat history messages
    """
    try:
        logger.info(f"Getting chat history for user {user['id']}, session: {session_id}, limit: {limit}")
        
        # Validate session if provided
        if session_id:
            session = await supabase_service.get_session_by_id(session_id, user["id"])
            if not session:
                raise HTTPException(
                    status_code=404,
                    detail="Session not found or does not belong to current user"
                )
        
        # Get chat history from database
        history = await supabase_service.get_chat_history(
            user_id=user["id"],
            session_id=session_id,
            limit=limit
        )
        
        logger.info(f"Retrieved {len(history)} messages from database")
        
        # Convert to ChatHistory models
        chat_history = [
            ChatHistory(
                id=msg["id"],
                user_id=msg["user_id"],
                session_id=msg["session_id"],
                user_message=msg["user_message"],
                ai_response=msg["ai_response"],
                created_at=msg["created_at"]
            )
            for msg in history
        ]
        
        logger.info(f"Returning {len(chat_history)} chat history messages")
        return chat_history
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve chat history"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for the chat service"""
    return {
        "status": "healthy",
        "service": "chat",
        "message": "Chat service is running"
    } 