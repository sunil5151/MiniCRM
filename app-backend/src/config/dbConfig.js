import { supabase, testSupabaseConnection } from './supabaseConfig.js';
import dotenv from 'dotenv';
dotenv.config();

// Export Supabase client as the main database connection
export { supabase as pool };
export { supabase };
// Export the test connection function
export { testSupabaseConnection as testConnection };