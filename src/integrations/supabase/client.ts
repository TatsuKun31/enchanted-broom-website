import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://wpjrdzpagwnxksikwrly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwanJkenBhZ3dueGtzaWt3cmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjQwMDAsImV4cCI6MjA1MTkwMDAwMH0.OGLgopPvYx9s2t4OnsXycHwXurZUp3qPlQCs49iaO6o';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
});

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any application cache/state that should be removed on sign out
    console.log('User signed out');
  }

  if (event === 'SIGNED_IN') {
    console.log('User signed in');
  }
});

// Handle auth errors globally
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token was refreshed successfully');
  }
  if (event === 'USER_UPDATED') {
    console.log('User was updated');
  }
});