import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Prefer backend-friendly env names, fall back to existing ones if needed
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY; // optional stronger key for server
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Choose the best available key for server-side use
const resolvedKey = supabaseServiceRoleKey || supabaseAnonKey;

// Basic validation to help with diagnostics
if (!supabaseUrl) {
  console.error('Supabase URL is not set. Please define SUPABASE_URL in your .env (or REACT_APP_SUPABASE_URL as a fallback).');
}
if (!resolvedKey) {
  console.error('Supabase key is not set. Please define SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in your .env (or REACT_APP_SUPABASE_ANON_KEY as a fallback).');
}

export const supabase = createClient(supabaseUrl ?? '', resolvedKey ?? '');

// Function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    if (!supabaseUrl || !resolvedKey) {
      throw new Error('Missing Supabase configuration: URL or KEY not provided.');
    }

    const { error } = await supabase
      .from('users') // Try to query a table that may exist
      .select('count', { count: 'exact', head: true });

    // PGRST116 is "table not found" which is okay for initial setup
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    console.log('✅ Connected to Supabase');
    return true;
  } catch (err) {
    // Provide more context when fetch fails or envs are missing
    const safeUrl = supabaseUrl ? new URL(supabaseUrl).host : 'undefined';
    console.error('❌ Supabase connection error:', {
      details: err?.stack || err?.message || err,
      url_host: safeUrl,
      has_key: Boolean(resolvedKey),
    });
    return false;
  }
}