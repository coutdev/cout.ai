'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // First attempt normal Supabase sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If sign in failed, check if this user has a pending/denied registration request
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          
          // Check if there's a registration request for this email
          const { data: approvalData, error: approvalError } = await supabase
            .from('user_approvals')
            .select('status, requested_at, admin_notes')
            .eq('email', email)
            .single();

          if (approvalError && approvalError.code !== 'PGRST116') {
            // Database error, rethrow original auth error
            throw error;
          }

          if (approvalData) {
            switch (approvalData.status) {
              case 'pending':
                throw new Error(
                  'Your registration request is still pending administrator approval. ' +
                  'Please wait for an email notification or check your status at /register-status'
                );
              case 'denied':
                throw new Error(
                  'Your registration request was denied. ' +
                  (approvalData.admin_notes 
                    ? `Reason: ${approvalData.admin_notes}` 
                    : 'Please contact support for more information.')
                );
              case 'approved':
                throw new Error(
                  'Your registration was approved but your account setup is incomplete. ' +
                  'Please contact support for assistance.'
                );
              default:
                throw error; // Fall back to original error
            }
          }
        }
        
        // No approval record found or different error, throw original
        throw error;
      }

      // Successful sign in
      setSession(data.session);
      setUser(data.user);

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear session and user
      setSession(null);
      setUser(null);

      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      // Note: Success handling is typically done in the UI component
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 