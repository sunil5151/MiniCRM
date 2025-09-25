import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Supabase connection...');
console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Key (first 20 chars):', process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Connection successful');
    
    console.log('\n2. Testing insert operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: 'Test User',
        email: 'test@example.com',
        address: 'Test Address',
        password: 'testpass',
        role: 'user'
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return false;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Clean up test data
    await supabase.from('users').delete().eq('email', 'test@example.com');
    console.log('✅ Test data cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

testConnection().then(success => {
  console.log('\nTest result:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
});
