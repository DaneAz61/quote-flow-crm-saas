
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://inkzjelwuhhvowgohrui.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlua3pqZWx3dWhodm93Z29ocnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDY4OTQsImV4cCI6MjA2MDM4Mjg5NH0.E-33iONybDFclNEe-P6-chTWTXd5pQ2mw1RwFKqaopI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
