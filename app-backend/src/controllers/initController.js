import { supabase } from '../config/dbConfig.js';

export const initDatabase = async (req, res) => {
  try {
    console.log('🔄 Checking Supabase database connection...');
    
    // Check if tables exist and get current data
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
      throw usersError;
    }
    
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*');
    
    if (paymentsError) {
      console.error('❌ Error accessing payments table:', paymentsError);
      throw paymentsError;
    }
    
    // Check customers table
    let { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.log('❌ Customers table error:', customersError);
      console.log('🔧 Attempting to create customers table...');
      
      // Try to create customers table using direct SQL execution
      try {
        const { error: createError } = await supabase
          .from('customers')
          .select('id')
          .limit(1);
        
        if (createError) {
          console.log('❌ Failed to create customers table:', createError);
        } else {
          console.log('✅ Customers table created successfully');
          // Re-check the table
          const { data: newCustomersData, error: newCustomersError } = await supabase
            .from('customers')
            .select('*');
          if (!newCustomersError) {
            customersData = newCustomersData;
          }
        }
      } catch (err) {
        console.log('❌ Error creating customers table:', err.message);
      }
    }
    
    // Check leads table
    let { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) {
      console.log('❌ Leads table error:', leadsError);
      console.log('🔧 Attempting to create leads table...');
      
      // Try to create leads table using raw SQL
      try {
        const { error: createLeadsError } = await supabase.rpc('exec_sql', {
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
          `
        });
        
        if (createLeadsError) {
          console.log('❌ Failed to create leads table:', createLeadsError);
        } else {
          console.log('✅ Leads table created successfully');
          // Re-check the table
          const { data: newLeadsData, error: newLeadsError } = await supabase
            .from('leads')
            .select('*');
          if (!newLeadsError) {
            leadsData = newLeadsData;
          }
        }
      } catch (err) {
        console.log('❌ Error creating leads table:', err.message);
      }
    }
    
    console.log(`✅ Found ${usersData.length} users in database`);
    console.log(`✅ Found ${paymentsData.length} payments in database`);
    console.log(`✅ Found ${customersData?.length || 0} customers in database`);
    console.log(`✅ Found ${leadsData?.length || 0} leads in database`);
    
    // If no sample data exists, add some
    if (usersData.length === 0) {
      console.log('📝 Adding sample users...');
      
      const { data: insertedUsers, error: usersInsertError } = await supabase
        .from('users')
        .insert([
          {
            name: 'Test User',
            email: 'user@example.com',
            address: '123 User St',
            password: 'password123',
            role: 'user'
          },
          {
            name: 'Admin User',
            email: 'admin@example.com',
            address: '456 Admin Ave',
            password: 'admin123',
            role: 'admin'
          },
          {
            name: 'John Doe',
            email: 'john@example.com',
            address: '789 Main St',
            password: 'john123',
            role: 'user'
          }
        ])
        .select('id, email');

      if (usersInsertError) {
        console.error('Error inserting users:', usersInsertError);
        throw usersInsertError;
      } else {
        console.log('✅ Sample users created');

        // Add sample payments for the new users
        if (paymentsData.length === 0) {
          console.log('📝 Adding sample payments...');
          
          const userMap = {};
          insertedUsers.forEach(user => {
            userMap[user.email] = user.id;
          });

          const { error: paymentsInsertError } = await supabase
            .from('payments')
            .insert([
              {
                amount: 125.50,
                receiver: 'Electric Company',
                status: 'success',
                payment_method: 'credit_card',
                user_id: userMap['user@example.com'],
                description: 'Monthly electricity bill'
              },
              {
                amount: 75.20,
                receiver: 'Internet Provider',
                status: 'success',
                payment_method: 'bank_transfer',
                user_id: userMap['user@example.com'],
                description: 'Internet subscription'
              },
              {
                amount: 200.00,
                receiver: 'Rent Payment',
                status: 'pending',
                payment_method: 'bank_transfer',
                user_id: userMap['john@example.com'],
                description: 'Monthly rent'
              },
              {
                amount: 45.99,
                receiver: 'Grocery Store',
                status: 'failed',
                payment_method: 'debit_card',
                user_id: userMap['john@example.com'],
                description: 'Weekly groceries'
              },
              {
                amount: 1500.00,
                receiver: 'Freelance Client',
                status: 'success',
                payment_method: 'wire_transfer',
                user_id: userMap['admin@example.com'],
                description: 'Project payment'
              }
            ]);

          if (paymentsInsertError) {
            console.error('Error inserting payments:', paymentsInsertError);
            throw paymentsInsertError;
          } else {
            console.log('✅ Sample payments created');
          }
        }

        // Add sample customers and leads if they don't exist
        if (!customersError && customersData && customersData.length === 0) {
          console.log('📝 Adding sample customers...');
          
          const { data: insertedCustomers, error: customersInsertError } = await supabase
            .from('customers')
            .insert([
              {
                name: 'Acme Corporation',
                email: 'contact@acme.com',
                phone: '+1-555-0123',
                company: 'Acme Corporation',
                address: '123 Business St, New York, NY 10001',
                user_id: userMap['user@example.com']
              },
              {
                name: 'Tech Solutions Inc',
                email: 'info@techsolutions.com',
                phone: '+1-555-0456',
                company: 'Tech Solutions Inc',
                address: '456 Innovation Ave, San Francisco, CA 94105',
                user_id: userMap['john@example.com']
              },
              {
                name: 'Global Enterprises',
                email: 'hello@globalent.com',
                phone: '+1-555-0789',
                company: 'Global Enterprises',
                address: '789 Corporate Blvd, Chicago, IL 60601',
                user_id: userMap['admin@example.com']
              }
            ])
            .select('id, name, user_id');

          if (customersInsertError) {
            console.error('Error inserting customers:', customersInsertError);
          } else {
            console.log('✅ Sample customers created');

            // Add sample leads
            if (!leadsError && leadsData && leadsData.length === 0) {
              console.log('📝 Adding sample leads...');
              
              const { error: leadsInsertError } = await supabase
                .from('leads')
                .insert([
                  {
                    title: 'Website Redesign Project',
                    description: 'Complete website redesign and development for Acme Corporation',
                    status: 'New',
                    value: 15000.00,
                    priority: 'High',
                    source: 'Website',
                    customer_id: insertedCustomers[0].id,
                    assigned_to: userMap['user@example.com'],
                    created_by: userMap['admin@example.com'],
                    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    title: 'Mobile App Development',
                    description: 'Native mobile app development for iOS and Android',
                    status: 'Contacted',
                    value: 25000.00,
                    priority: 'High',
                    source: 'Referral',
                    customer_id: insertedCustomers[1].id,
                    assigned_to: userMap['john@example.com'],
                    created_by: userMap['john@example.com'],
                    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    title: 'Cloud Migration Services',
                    description: 'Migrate existing infrastructure to cloud platform',
                    status: 'Qualified',
                    value: 50000.00,
                    priority: 'Medium',
                    source: 'Cold Call',
                    customer_id: insertedCustomers[2].id,
                    assigned_to: userMap['admin@example.com'],
                    created_by: userMap['admin@example.com'],
                    expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    title: 'SEO Optimization',
                    description: 'Search engine optimization for better online visibility',
                    status: 'Proposal',
                    value: 5000.00,
                    priority: 'Low',
                    source: 'Social Media',
                    customer_id: insertedCustomers[0].id,
                    assigned_to: userMap['user@example.com'],
                    created_by: userMap['user@example.com'],
                    expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                  }
                ]);

              if (leadsInsertError) {
                console.error('Error inserting leads:', leadsInsertError);
              } else {
                console.log('✅ Sample leads created');
              }
            }
          }
        }
      }
    } else {
      console.log('ℹ️ Sample data already exists, skipping seed');
    }

    console.log('✅ Supabase database initialization completed successfully');
    
    if (res) {
      res.json({ 
        message: 'Supabase database initialized successfully',
        users: usersData.length,
        payments: paymentsData.length,
        customers: customersData?.length || 0,
        leads: leadsData?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('❌ Supabase database initialization error:', err);
    if (res) {
      res.status(500).json({ 
        error: 'Failed to initialize Supabase database',
        details: err.message
      });
    }
  }
};
