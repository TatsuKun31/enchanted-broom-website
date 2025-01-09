import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wpjrdzpagwnxksikwrly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwanJkenBhZ3dueGtzaWt3cmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjQwMDAsImV4cCI6MjA1MTkwMDAwMH0.OGLgopPvYx9s2t4OnsXycHwXurZUp3qPlQCs49iaO6o";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token has been refreshed');
  }

  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.id);
  }
});

// Add automatic retry for failed requests
const maxRetries = 3;
let currentRetry = 0;

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && !session) {
    if (currentRetry < maxRetries) {
      currentRetry++;
      console.log(`Retrying auth check (${currentRetry}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
      await supabase.auth.getSession();
    } else {
      console.error('Max retries reached for auth check');
      currentRetry = 0;
    }
  }
});