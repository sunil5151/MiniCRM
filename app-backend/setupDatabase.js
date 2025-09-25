import { supabase } from './src/config/dbConfig.js';

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Create customers table
    console.log('📝 Creating customers table...');
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          company VARCHAR(255),
          address TEXT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
        CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
      `
    });
    
    if (customersError) {
      console.log('❌ Error creating customers table:', customersError);
    } else {
      console.log('✅ Customers table created successfully');
    }
    
    // Create leads table
    console.log('📝 Creating leads table...');
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost')),
          value DECIMAL(12,2),
          priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
          source VARCHAR(100),
          customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
          expected_close_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
        CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
      `
    });
    
    if (leadsError) {
      console.log('❌ Error creating leads table:', leadsError);
    } else {
      console.log('✅ Leads table created successfully');
    }
    
    // Test table access
    console.log('🔍 Testing table access...');
    
    const { data: customersTest, error: customersTestError } = await supabase
      .from('customers')
      .select('count', { count: 'exact' });
    
    if (customersTestError) {
      console.log('❌ Customers table test failed:', customersTestError);
    } else {
      console.log('✅ Customers table accessible');
    }
    
    const { data: leadsTest, error: leadsTestError } = await supabase
      .from('leads')
      .select('count', { count: 'exact' });
    
    if (leadsTestError) {
      console.log('❌ Leads table test failed:', leadsTestError);
    } else {
      console.log('✅ Leads table accessible');
    }
    
    console.log('✅ Database setup completed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('🎉 Database setup script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Database setup script failed:', error);
  process.exit(1);
});
