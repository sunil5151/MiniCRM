-- ========================================
-- Supabase Table Creation Script
-- Run this in Supabase Dashboard > SQL Editor
-- ========================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
    payment_method VARCHAR(100),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create customers table
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

-- 4. Create leads table
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

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(transaction_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);

-- 6. Insert sample data
INSERT INTO users (name, email, address, password, role) VALUES
    ('Test User', 'user@example.com', '123 User St', 'password123', 'user'),
    ('Admin User', 'admin@example.com', '456 Admin Ave', 'admin123', 'admin'),
    ('John Doe', 'john@example.com', '789 Main St', 'john123', 'user')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for payments
WITH user_ids AS (
    SELECT id, email FROM users WHERE email IN ('user@example.com', 'admin@example.com', 'john@example.com')
)
INSERT INTO payments (amount, receiver, status, payment_method, user_id, description) 
SELECT 
    amount, receiver, status, payment_method, user_ids.id, description
FROM (
    VALUES 
        (125.50, 'Electric Company', 'success', 'credit_card', 'user@example.com', 'Monthly electricity bill'),
        (75.20, 'Internet Provider', 'success', 'bank_transfer', 'user@example.com', 'Internet subscription'),
        (200.00, 'Rent Payment', 'pending', 'bank_transfer', 'john@example.com', 'Monthly rent'),
        (45.99, 'Grocery Store', 'failed', 'debit_card', 'john@example.com', 'Weekly groceries'),
        (1500.00, 'Freelance Client', 'success', 'wire_transfer', 'admin@example.com', 'Project payment')
) AS payment_data(amount, receiver, status, payment_method, user_email, description)
JOIN user_ids ON user_ids.email = payment_data.user_email;

-- 7. Set up Row Level Security (RLS) - Optional but recommended
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
    );

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own payments" ON payments
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Create policies for customers table
CREATE POLICY "Users can view their own customers" ON customers
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
    );

CREATE POLICY "Users can insert their own customers" ON customers
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own customers" ON customers
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Create policies for leads table
CREATE POLICY "Users can view their assigned leads" ON leads
    FOR SELECT USING (
        assigned_to::text = auth.uid()::text OR 
        created_by::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
    );

CREATE POLICY "Users can insert leads" ON leads
    FOR INSERT WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can update their leads" ON leads
    FOR UPDATE USING (
        assigned_to::text = auth.uid()::text OR 
        created_by::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
    );

-- Note: If you're using service role key in backend, you might want to disable RLS
-- or create more permissive policies for backend operations
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
