from supabase import create_client, Client
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from app.config import settings

class SupabaseService:
    """Service for handling Supabase database operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        if not settings.SUPABASE_URL:
            raise ValueError("Supabase URL is required")
        
        # Use service role key for backend operations to bypass RLS
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            print("Using Supabase service role key for backend operations")
            self.client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        elif settings.SUPABASE_ANON_KEY:
            print("⚠️  Using anon key - RLS policies may cause issues")
            self.client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
        else:
            raise ValueError("Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required")
    
    async def create_chat_session(
        self, 
        user_id: str, 
        title: str = "New Chat"
    ) -> Dict[str, Any]:
        """
        Create a new chat session for a user
        
        Args:
            user_id: The user's ID from Supabase auth
            title: Title for the new chat session
            
        Returns:
            Dictionary containing the created session data
        """
        try:
            session_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "title": title,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z",
                "message_count": 0
            }
            
            result = self.client.table("chat_sessions").insert(session_data).execute()
            
            if result.data:
                print(f"Created new chat session: {result.data[0]}")
                return result.data[0]
            else:
                raise Exception("Failed to create chat session")
                
        except Exception as e:
            print(f"Error creating chat session: {str(e)}")
            # If table doesn't exist, provide helpful error message
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                print("📋 Check the database-migration.sql file for migration instructions.")
            raise e
    
    async def get_user_sessions(
        self, 
        user_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get all chat sessions for a user
        
        Args:
            user_id: The user's ID from Supabase auth
            limit: Maximum number of sessions to retrieve
            
        Returns:
            List of chat sessions ordered by last update
        """
        try:
            print(f"Getting sessions for user_id: {user_id}, limit: {limit}")
            
            result = self.client.table("chat_sessions")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("updated_at", desc=True)\
                .limit(limit)\
                .execute()
            
            print(f"Found {len(result.data) if result.data else 0} sessions")
            return result.data if result.data else []
                
        except Exception as e:
            print(f"Error retrieving user sessions: {str(e)}")
            # If table doesn't exist, return empty list
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                return []
            return []
    
    async def get_session_by_id(
        self, 
        session_id: str, 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific chat session by ID (with user verification)
        
        Args:
            session_id: The session ID
            user_id: The user's ID (for security verification)
            
        Returns:
            Session data if found and belongs to user, None otherwise
        """
        try:
            result = self.client.table("chat_sessions")\
                .select("*")\
                .eq("id", session_id)\
                .eq("user_id", user_id)\
                .single()\
                .execute()
            
            return result.data if result.data else None
                
        except Exception as e:
            print(f"Error retrieving session {session_id}: {str(e)}")
            # If table doesn't exist, return None
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                return None
            return None
    
    async def log_chat_message(
        self, 
        user_id: str, 
        user_message: str, 
        ai_response: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Log a chat message to the database
        
        Args:
            user_id: The user's ID from Supabase auth
            user_message: The user's original message
            ai_response: The AI's response
            session_id: The chat session ID (optional)
            
        Returns:
            Dictionary containing the logged message data
        """
        try:
            # If no session_id provided, try to create a new session
            if not session_id:
                try:
                    # Generate a title from the user message (first 50 chars)
                    title = user_message[:50] + "..." if len(user_message) > 50 else user_message
                    session = await self.create_chat_session(user_id, title)
                    session_id = session["id"]
                except Exception as session_error:
                    print(f"Warning: Could not create session: {session_error}")
                    # Continue without session_id for backward compatibility
                    session_id = None
            
            # Create message record
            message_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "user_message": user_message,
                "ai_response": ai_response,
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            
            # Only add session_id if we have one
            if session_id:
                message_data["session_id"] = session_id
            
            # Insert into chat_messages table
            result = self.client.table("chat_messages").insert(message_data).execute()
            
            if result.data:
                print(f"Logged message to session {session_id if session_id else 'no session'}")
                return result.data[0]
            else:
                raise Exception("Failed to insert chat message")
                
        except Exception as e:
            # Log error but don't fail the entire request
            print(f"Error logging chat message: {str(e)}")
            return message_data  # Return the data even if logging failed
    
    async def get_chat_history(
        self, 
        user_id: str, 
        session_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Retrieve chat history for a user
        
        Args:
            user_id: The user's ID from Supabase auth
            session_id: Specific session ID (optional - if None, gets all messages)
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of chat messages ordered by creation time
        """
        try:
            print(f"Querying chat history for user_id: {user_id}, session_id: {session_id}, limit: {limit}")
            
            query = self.client.table("chat_messages")\
                .select("*")\
                .eq("user_id", user_id)
            
            # Add session filter if provided
            if session_id:
                query = query.eq("session_id", session_id)
            
            result = query\
                .order("created_at", desc=False)\
                .limit(limit)\
                .execute()
            
            print(f"Supabase query result: found {len(result.data) if result.data else 0} messages")
            
            return result.data if result.data else []
                
        except Exception as e:
            print(f"Error retrieving chat history: {str(e)}")
            print(f"Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    async def get_recent_context(
        self, 
        user_id: str, 
        session_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, str]]:
        """
        Get recent conversation context for AI
        
        Args:
            user_id: The user's ID from Supabase auth
            session_id: Specific session ID (optional)
            limit: Number of recent messages to include
            
        Returns:
            List of message dictionaries for AI context
        """
        try:
            query = self.client.table("chat_messages")\
                .select("user_message, ai_response")\
                .eq("user_id", user_id)
            
            if session_id:
                query = query.eq("session_id", session_id)
            
            result = query\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            if result.data:
                # Reverse to get chronological order
                return list(reversed(result.data))
            else:
                return []
                
        except Exception as e:
            print(f"Error retrieving conversation context: {str(e)}")
            return []
    
    async def delete_session(
        self, 
        session_id: str, 
        user_id: str
    ) -> bool:
        """
        Delete a chat session and all its messages
        
        Args:
            session_id: The session ID to delete
            user_id: The user's ID (for security verification)
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Verify session belongs to user
            session = await self.get_session_by_id(session_id, user_id)
            if not session:
                print(f"Session {session_id} not found or doesn't belong to user {user_id}")
                return False
            
            # Delete the session (messages will be cascade deleted)
            result = self.client.table("chat_sessions")\
                .delete()\
                .eq("id", session_id)\
                .eq("user_id", user_id)\
                .execute()
            
            print(f"Deleted session {session_id}")
            return True
                
        except Exception as e:
            print(f"Error deleting session {session_id}: {str(e)}")
            # If table doesn't exist, return False
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                return False
            return False
    
    async def delete_all_user_sessions(self, user_id: str) -> int:
        """
        Delete all chat sessions and messages for a user
        
        Args:
            user_id: The user's ID from Supabase auth
            
        Returns:
            Number of sessions deleted
        """
        try:
            # First get count of sessions to be deleted
            count_result = self.client.table("chat_sessions")\
                .select("id", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            
            session_count = count_result.count if count_result.count is not None else 0
            
            if session_count == 0:
                print(f"No sessions found for user {user_id}")
                return 0
            
            # Delete all sessions for the user (messages will be cascade deleted)
            result = self.client.table("chat_sessions")\
                .delete()\
                .eq("user_id", user_id)\
                .execute()
            
            print(f"Deleted {session_count} sessions for user {user_id}")
            return session_count
                
        except Exception as e:
            print(f"Error deleting all sessions for user {user_id}: {str(e)}")
            # If table doesn't exist, return 0
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                return 0
            raise e
    
    async def update_session_title(
        self, 
        session_id: str, 
        user_id: str, 
        new_title: str
    ) -> bool:
        """
        Update the title of a chat session
        
        Args:
            session_id: The session ID to update
            user_id: The user's ID (for security verification)
            new_title: The new title for the session
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Verify session belongs to user
            session = await self.get_session_by_id(session_id, user_id)
            if not session:
                return False
            
            result = self.client.table("chat_sessions")\
                .update({"title": new_title, "updated_at": datetime.utcnow().isoformat() + "Z"})\
                .eq("id", session_id)\
                .eq("user_id", user_id)\
                .execute()
            
            print(f"Updated session {session_id} title to: {new_title}")
            return True
                
        except Exception as e:
            print(f"Error updating session title: {str(e)}")
            # If table doesn't exist, return False
            if "does not exist" in str(e) or "relation" in str(e):
                print("⚠️  chat_sessions table doesn't exist. Please run the database migration.")
                return False
            return False
    
    def validate_user_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Validate Supabase JWT token and extract user info
        
        Args:
            token: JWT token from frontend
            
        Returns:
            User info dictionary if valid, None otherwise
        """
        try:
            # Use Supabase's built-in JWT validation
            user_response = self.client.auth.get_user(token)
            
            if user_response and user_response.user:
                return {
                    "id": user_response.user.id,
                    "email": user_response.user.email,
                    "created_at": user_response.user.created_at
                }
            else:
                return None
                
        except Exception as e:
            print(f"Error validating user token: {str(e)}")
            return None

# Create global service instance
supabase_service = SupabaseService() 