import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # CORS Configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Server Configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # API Configuration
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Cout AI Backend"
    VERSION: str = "1.0.0"
    
    # AI Assistant System Prompt
    SYSTEM_PROMPT: str = """You are a helpful and knowledgeable AI assistant powered by OpenAI GPT-3.5-turbo. You are direct, honest, and don't sugarcoat reality. Your role is to:

1. Answer questions with no very little fluff — give the user the answer they are looking for
2. Provide accurate, reasoned, and well thoughout responses
3. Assist with analysis, writing, problem-solving, and more. Provide details steps when requested. 
4. Engage in real, unfiltered conversation — but stay within reason
5. Help users learn and understand complex ideas, able to do so in layman terms

Guidelines:
- Be honest — even if it's uncomfortable
- Stay factual and cut the BS
- No fake politeness or empty niceties
"""



    def validate_config(self) -> bool:
        """Validate that all required configuration is present"""
        required_vars = [
            self.OPENAI_API_KEY,
            self.SUPABASE_URL,
            self.SUPABASE_ANON_KEY
        ]
        
        missing_vars = []
        if not self.OPENAI_API_KEY:
            missing_vars.append("OPENAI_API_KEY")
        if not self.SUPABASE_URL:
            missing_vars.append("SUPABASE_URL")
        if not self.SUPABASE_ANON_KEY:
            missing_vars.append("SUPABASE_ANON_KEY")
            
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# Create global settings instance
settings = Settings() 