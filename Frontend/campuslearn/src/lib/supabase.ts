import { createClient } from '@supabase/supabase-js';

// Get environment variables (you can set these in your .env file)
const supabaseUrl = 'https://moikeoljuxygsrnuhfws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWtlb2xqdXh5Z3NybnVoZndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjkzNjMsImV4cCI6MjA3NTY0NTM2M30.yiIU8-5ECNVFJHgNmQK3TO4KSecjahi85wGNf9gC5Wo';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default supabase;