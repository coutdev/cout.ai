import { supabase } from './supabase';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api';

// Types for API requests and responses
interface ChatRequest {
  message: string;
  session_id?: string;
}

interface ChatResponse {
  message: string;
  timestamp: string;
  session_id: string;
  session_title?: string;
}

interface ChatHistory {
  id: string;
  user_id: string;
  session_id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface CreateSessionRequest {
  title?: string;
}

interface CreateSessionResponse {
  session: ChatSession;
}

/**
 * Get authentication token from Supabase
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`Making API request to: ${url}`);
  console.log('Request config:', { 
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body ? 'Present' : 'None'
  });

  try {
    const response = await fetch(url, config);
    
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      
      let errorMessage = `API request failed: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If not JSON, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Send a message to the AI fitness coach
 */
export async function sendChatMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  const requestBody: ChatRequest = { 
    message: message.trim(),
    ...(sessionId && { session_id: sessionId })
  };

  return await apiRequest<ChatResponse>('/chat/', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

/**
 * Create a new chat session
 */
export async function createChatSession(title?: string): Promise<ChatSession> {
  const requestBody: CreateSessionRequest = {};
  if (title) {
    requestBody.title = title;
  }

  const response = await apiRequest<CreateSessionResponse>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return response.session;
}

/**
 * Get all chat sessions for the current user
 */
export async function getChatSessions(limit: number = 50): Promise<ChatSession[]> {
  return await apiRequest<ChatSession[]>(`/chat/sessions?limit=${limit}`);
}

/**
 * Get chat history for a specific session
 */
export async function getSessionHistory(sessionId: string, limit: number = 50): Promise<ChatHistory[]> {
  return await apiRequest<ChatHistory[]>(`/chat/sessions/${sessionId}/history?limit=${limit}`);
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  await apiRequest<{ message: string }>(`/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

/**
 * Delete all chat sessions for the current user
 */
export async function deleteAllChatSessions(): Promise<void> {
  await apiRequest<{ message: string, deleted_count: number }>('/chat/sessions:deleteAll', {
    method: 'DELETE',
  });
}

/**
 * Get chat history for the current user (legacy function - backwards compatibility)
 */
export async function getChatHistory(limit: number = 10, sessionId?: string): Promise<ChatHistory[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (sessionId) {
    params.append('session_id', sessionId);
  }
  
  return await apiRequest<ChatHistory[]>(`/chat/history?${params.toString()}`);
}

/**
 * Check if the backend API is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiRequest<{ status: string }>('/chat/health');
    return response.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Get API status information
 */
export async function getApiStatus(): Promise<{ status: string; service: string; message?: string }> {
  return await apiRequest<{ status: string; service: string; message?: string }>('/chat/health');
} 