import { createClient, AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from "sonner";

const SUPABASE_URL = "https://wpjrdzpagwnxksikwrly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwanJkenBhZ3dueGtzaWt3cmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjQwMDAsImV4cCI6MjA1MTkwMDAwMH0.OGLgopPvYx9s2t4OnsXycHwXurZUp3qPlQCs49iaO6o";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage // Explicitly set storage
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
  // Add retry configuration
  db: {
    schema: 'public'
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === AuthChangeEvent.SIGNED_OUT) {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    toast.error("You have been signed out");
  }
  
  if (event === AuthChangeEvent.TOKEN_REFRESHED) {
    console.log('Token has been refreshed');
  }

  if (event === AuthChangeEvent.SIGNED_IN) {
    console.log('User signed in:', session?.user?.id);
    toast.success("Successfully signed in");
  }

  // Handle auth errors
  if (event === AuthChangeEvent.USER_DELETED || event === AuthChangeEvent.USER_UPDATED) {
    console.log('User profile changed, refreshing session');
    supabase.auth.refreshSession();
  }
});

// Add automatic retry for failed requests
const maxRetries = 3;
let currentRetry = 0;

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === AuthChangeEvent.SIGNED_IN && !session) {
    if (currentRetry < maxRetries) {
      currentRetry++;
      console.log(`Retrying auth check (${currentRetry}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
      try {
        await supabase.auth.getSession();
      } catch (error) {
        console.error('Error refreshing session:', error);
        toast.error("Failed to refresh session. Please try signing in again.");
      }
    } else {
      console.error('Max retries reached for auth check');
      currentRetry = 0;
      toast.error("Connection issues detected. Please refresh the page.");
    }
  }
});

// Add interceptor for failed requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    if (!response.ok && response.status === 401) {
      // Try to refresh the session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) {
        // Retry the original request
        return await originalFetch(...args);
      }
    }
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    toast.error("Failed to connect to the server. Please check your internet connection.");
    throw error;
  }
};