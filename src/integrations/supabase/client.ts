import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from "sonner";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
});

// Add response interceptor for 401 errors
supabase.rest.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.status === 401) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      toast.error('Your session has expired. Please sign in again.');
    }
    return Promise.reject(error);
  }
);