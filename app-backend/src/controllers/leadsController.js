import { supabase } from '../config/dbConfig.js';

// Get all leads with pagination and filtering
export const getAllLeads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      userId
    } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query - include title since it exists in database
    let query = supabase
      .from('leads')
      .select('id, title, description, status, value, user_id, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    // Role-based filtering - users can only see their own leads
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Search functionality - search in both title and description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Status filter
    if (status) {
      query = query.eq('status', status);
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: leads, error, count } = await query;
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }
    
    res.json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('❌ Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads', details: err.message });
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    let query = supabase
      .from('leads')
      .select('id, title, description, status, value, user_id, created_at, updated_at')
      .eq('id', leadId);
    
    // Role-based access control
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }
    
    const { data: lead, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }
      throw error;
    }
    
    res.json(lead);
  } catch (err) {
    console.error('Error fetching lead:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};

// Create new lead
export const createLead = async (req, res) => {
  try {
    console.log('🔍 Received request body:', req.body);
    console.log('🔍 User info:', req.user);
    
    const { 
      title,
      description, 
      status = 'New', 
      value
    } = req.body;
    
    // Validate required fields - only description is required
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Generate default title if not provided - ensure it's never null/undefined
    const defaultTitle = (title && title.trim()) ? title.trim() : `Lead - ${new Date().toLocaleDateString()}`;
    
    console.log('🔍 Generated title:', defaultTitle);
    console.log('🔍 Description:', description);
    console.log('🔍 Status:', status);
    console.log('🔍 Value:', value);
    console.log('🔍 User ID:', req.user.id);
    
    const leadData = {
      title: defaultTitle,
      description: description.trim(),
      status,
      value: parseFloat(value) || 0,
      user_id: req.user.id
    };
    
    console.log('🔍 Final lead data to insert:', leadData);
    
    // Create lead with all required columns including title
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select('id, title, description, status, value, user_id, created_at, updated_at')
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('✅ Lead created successfully:', lead);
    res.status(201).json(lead);
  } catch (err) {
    console.error('❌ Error creating lead:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to create lead', details: err.message });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { 
      title,
      description, 
      status, 
      value
    } = req.body;
    
    // Build update query with role-based access control
    let query = supabase
      .from('leads')
      .update({ 
        title,
        description, 
        status, 
        value: value ? parseFloat(value) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
    
    // Role-based access control
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }
    
    const { data: lead, error } = await query
      .select('id, title, description, status, value, user_id, created_at, updated_at')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }
      throw error;
    }
    
    res.json(lead);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Build delete query with role-based access control
    let query = supabase
      .from('leads')
      .delete()
      .eq('id', leadId);
    
    // Role-based access control
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

// Get leads statistics
export const getLeadsStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Build base query - only use existing columns
    let query = supabase
      .from('leads')
      .select('id, status, value, created_at, user_id');
    
    // Role-based filtering
    if (req.user?.role === 'admin') {
      if (userId) {
        query = query.eq('user_id', userId);
      }
    } else {
      query = query.eq('user_id', req.user.id);
    }
    
    const { data: leads, error } = await query;
    
    if (error) {
      console.error('❌ Supabase query error in getLeadsStats:', error);
      throw error;
    }
    
    // Calculate statistics
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0);
    
    // Status breakdown
    const statusStats = {
      'New': 0,
      'Contacted': 0,
      'Qualified': 0,
      'Proposal': 0,
      'Negotiation': 0,
      'Converted': 0,
      'Lost': 0
    };
    
    leads.forEach(lead => {
      if (statusStats.hasOwnProperty(lead.status)) {
        statusStats[lead.status]++;
      }
    });
    
    // Monthly lead creation
    const monthlyStats = {};
    leads.forEach(lead => {
      const date = new Date(lead.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = 0;
      }
      monthlyStats[monthKey]++;
    });
    
    const monthly = Object.entries(monthlyStats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Conversion rate
    const convertedLeads = statusStats['Converted'];
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : '0';
    
    res.json({
      total_leads: totalLeads,
      total_value: totalValue.toFixed(2),
      converted_leads: convertedLeads,
      conversion_rate: conversionRate,
      status_breakdown: statusStats,
      monthly_growth: monthly
    });
  } catch (err) {
    console.error('❌ Error fetching leads statistics:', err);
    res.status(500).json({ error: 'Failed to fetch leads statistics', details: err.message });
  }
};

// Get leads by user (for admin to view user's leads)
export const getLeadsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Only admin can view other users' leads
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Build query - include title
    let query = supabase
      .from('leads')
      .select('id, title, description, status, value, user_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Status filter
    if (status) {
      query = query.eq('status', status);
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: leads, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching user leads:', err);
    res.status(500).json({ error: 'Failed to fetch user leads' });
  }
};
