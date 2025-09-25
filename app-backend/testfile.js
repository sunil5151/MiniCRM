import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);
console.log('Supabase Key (first 20 chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND');

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('   REACT_APP_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_KEY:', !!supabaseKey);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('\n🔄 Testing Supabase connection...');
  
  try {
    // Test 1: Simple health check using auth
    console.log('\n1. Testing authentication endpoint...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('Auth error details:', JSON.stringify(authError, null, 2));
    } else {
      console.log('✅ Auth endpoint accessible');
    }

    // Test 2: Try a simple RPC call or basic query
    console.log('\n2. Testing database connection...');
    
    // Try to access any table - this will fail gracefully if no tables exist
    const { data, error, status, statusText } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    console.log('Response status:', status);
    console.log('Response statusText:', statusText);
    
    if (error) {
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      if (error.code === 'PGRST116') {
        console.log('✅ Connection successful! Table "users" does not exist yet (this is expected)');
        return true;
      } else if (error.code === '42P01') {
        console.log('✅ Connection successful! Table "users" does not exist yet (this is expected)');
        return true;
      } else {
        console.log('❌ Database connection failed');
        return false;
      }
    } else {
      console.log('✅ Connection successful! Found', data?.length || 0, 'records in users table');
      return true;
    }

  } catch (error) {
    console.error('❌ Connection test failed with exception:');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message || 'No message');
    console.error('Error stack:', error.stack || 'No stack');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Test 3: Try a different approach - test with a simple select
async function testAlternativeConnection() {
  console.log('\n3. Testing alternative connection method...');
  
  try {
    // Try to query system tables or use a different approach
    const { data, error } = await supabase
      .rpc('version'); // This should work if connection is good
    
    if (error) {
      console.log('RPC version error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ RPC call successful:', data);
      return true;
    }
  } catch (err) {
    console.log('RPC test failed:', err.message);
  }

  // Try another approach
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('Schema query error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Schema query successful');
      return true;
    }
  } catch (err) {
    console.log('Schema test failed:', err.message);
  }

  return false;
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting Supabase connection tests...\n');
  
  const test1 = await testSupabaseConnection();
  const test2 = await testAlternativeConnection();
  
  if (test1 || test2) {
    console.log('\n✅ At least one connection test passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create tables in Supabase dashboard');
    console.log('   2. Run this test again to verify tables');
    return true;
  } else {
    console.log('\n❌ All connection tests failed!');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify your Supabase URL and service key');
    console.log('   2. Check if your Supabase project is active');
    console.log('   3. Ensure the service role key has proper permissions');
    return false;
  }
}

runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
