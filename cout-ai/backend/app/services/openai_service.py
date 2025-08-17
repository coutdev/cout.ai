import openai
from typing import List, Dict, Any
from app.config import settings

class OpenAIService:
    """Service for handling OpenAI API interactions"""
    
    def __init__(self):
        """Initialize OpenAI service with API key"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key is required")
        
        openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def get_chat_response(self, user_message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Generate AI fitness coaching response (new interface)
        
        Args:
            user_message: The user's message/question
            conversation_history: Optional previous conversation for context
            
        Returns:
            AI generated response string
        """
        return await self.generate_fitness_response(user_message, conversation_history)
    
    async def generate_fitness_response(self, user_message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Generate AI fitness coaching response
        
        Args:
            user_message: The user's message/question
            conversation_history: Optional previous conversation for context
            
        Returns:
            AI generated response string
        """
        try:
            # Build conversation messages
            messages = [
                {"role": "system", "content": settings.SYSTEM_PROMPT}
            ]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                    messages.append({"role": "user", "content": msg.get("user_message", "")})
                    messages.append({"role": "assistant", "content": msg.get("ai_response", "")})
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Generate response using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using GPT-4 for better fitness coaching
                messages=messages,
                max_tokens=1000,
                temperature=0.1,  # Balanced creativity and consistency
                top_p=0.9,
                frequency_penalty=0.1,
                presence_penalty=0.1
            )
            
            # Extract and return the response content
            ai_response = response.choices[0].message.content
            
            if not ai_response:
                raise ValueError("Empty response from OpenAI")
                
            return ai_response.strip()
            
        except openai.RateLimitError:
            raise Exception("OpenAI API rate limit exceeded. Please try again later.")
        except openai.AuthenticationError:
            raise Exception("OpenAI API authentication failed. Please check your API key.")
        except openai.APIError as e:
            raise Exception(f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate AI response: {str(e)}")
    
    def validate_message(self, message: str) -> bool:
        """
        Validate user message for safety and appropriateness
        
        Args:
            message: User's input message
            
        Returns:
            True if message is valid, False otherwise
        """
        if not message or not message.strip():
            return False
            
        # Basic length check
        if len(message) > 2000:
            return False
            
        # Add more validation rules as needed
        # e.g., check for inappropriate content, spam, etc.
        
        return True

# Create global service instance
openai_service = OpenAIService() 