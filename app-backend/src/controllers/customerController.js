import { supabase } from '../config/dbConfig.js';

// Get all customers with pagination and search
export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', userId } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('customers')
      .select(`
        id, name, email, phone, company, address, created_at,
        leads!left(id, status, value)
      `)
      .order('created_at', { ascending: false });
    
    // Filter by user if not admin
    if (userId && req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    // Search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: customers, error, count } = await query;
    
    if (error) throw error;
    
    // Transform data with lead statistics
    const transformedCustomers = customers.map(customer => {
      const leads = customer.leads || [];
      const totalLeads = leads.length;
      const totalValue = leads.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0);
      const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        created_at: customer.created_at,
        total_leads: totalLeads,
        total_value: totalValue.toFixed(2),
        converted_leads: convertedLeads
      };
    });
    
    res.json({
      customers: transformedCustomers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { userId } = req.query;
    
    let query = supabase
      .from('customers')
      .select(`
        id, name, email, phone, company, address, created_at,
        leads!left(id, title, description, status, value, created_at)
      `)
      .eq('id', customerId);
    
    // Filter by user if not admin
    if (userId && req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: customer, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }
    
    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;
    const userId = req.user?.id;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email already exists for this user
    const { data: existingCustomers, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .eq('user_id', userId);
    
    if (checkError) throw checkError;
    
    if (existingCustomers.length > 0) {
      return res.status(400).json({ error: 'Customer with this email already exists' });
    }
    
    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        name,
        email,
        phone,
        company,
        address,
        user_id: userId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(customer);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, email, phone, company, address } = req.body;
    const userId = req.user?.id;
    
    // Build update query
    let query = supabase
      .from('customers')
      .update({ name, email, phone, company, address })
      .eq('id', customerId);
    
    // Filter by user if not admin
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: customer, error } = await query.select().single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found or access denied' });
      }
      throw error;
    }
    
    res.json(customer);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id;
    
    // Build delete query
    let query = supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    
    // Filter by user if not admin
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Build base query
    let query = supabase
      .from('customers')
      .select(`
        id, created_at,
        leads!left(id, status, value)
      `);
    
    // Filter by user if not admin
    if (userId && req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: customers, error } = await query;
    
    if (error) throw error;
    
    // Calculate statistics
    const totalCustomers = customers.length;
    let totalLeads = 0;
    let totalValue = 0;
    let convertedLeads = 0;
    
    customers.forEach(customer => {
      const leads = customer.leads || [];
      totalLeads += leads.length;
      leads.forEach(lead => {
        totalValue += parseFloat(lead.value) || 0;
        if (lead.status === 'Converted') {
          convertedLeads++;
        }
      });
    });
    
    // Monthly customer growth
    const monthlyStats = {};
    customers.forEach(customer => {
      const date = new Date(customer.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = 0;
      }
      monthlyStats[monthKey]++;
    });
    
    const monthly = Object.entries(monthlyStats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    res.json({
      total_customers: totalCustomers,
      total_leads: totalLeads,
      total_value: totalValue.toFixed(2),
      converted_leads: convertedLeads,
      conversion_rate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : '0',
      monthly_growth: monthly
    });
  } catch (err) {
    console.error('Error fetching customer statistics:', err);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
};