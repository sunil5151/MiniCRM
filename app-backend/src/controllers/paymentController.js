import { supabase } from '../config/dbConfig.js';

// Get all payments with optional filtering
export const getAllPayments = async (req, res) => {
  try {
    const { userId, status, payment_method, startDate, endDate } = req.query;
    
    // Build the query with filters
    let query = supabase
      .from('payments')
      .select(`
        id, amount, receiver, status, payment_method, 
        description, transaction_date, user_id,
        users!inner(name)
      `)
      .order('transaction_date', { ascending: false });
    
    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (payment_method) {
      query = query.eq('payment_method', payment_method);
    }
    
    if (startDate && endDate) {
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
    } else if (startDate) {
      query = query.gte('transaction_date', startDate);
    } else if (endDate) {
      query = query.lte('transaction_date', endDate);
    }
    
    const { data: payments, error } = await query;
    
    if (error) throw error;
    
    // Transform data to match original format
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      receiver: payment.receiver,
      status: payment.status,
      payment_method: payment.payment_method,
      description: payment.description,
      transaction_date: payment.transaction_date,
      user_id: payment.user_id,
      user_name: payment.users.name
    }));
    
    res.json(transformedPayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get payment statistics for dashboard
export const getPaymentStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Build base query
    let baseQuery = supabase.from('payments').select('status, payment_method, amount, transaction_date');
    
    if (userId) {
      baseQuery = baseQuery.eq('user_id', userId);
    }
    
    const { data: allPayments, error } = await baseQuery;
    
    if (error) throw error;
    
    // Calculate statistics manually (since Supabase doesn't support complex aggregations easily)
    
    // Group by status
    const statusStats = {};
    const methodStats = {};
    
    allPayments.forEach(payment => {
      // Status stats
      if (!statusStats[payment.status]) {
        statusStats[payment.status] = { count: 0, total_amount: 0 };
      }
      statusStats[payment.status].count++;
      statusStats[payment.status].total_amount += parseFloat(payment.amount);
      
      // Method stats
      if (!methodStats[payment.payment_method]) {
        methodStats[payment.payment_method] = { count: 0, total_amount: 0 };
      }
      methodStats[payment.payment_method].count++;
      methodStats[payment.payment_method].total_amount += parseFloat(payment.amount);
    });
    
    // Convert to array format
    const by_status = Object.entries(statusStats).map(([status, stats]) => ({
      status,
      count: stats.count.toString(),
      total_amount: stats.total_amount.toString()
    }));
    
    const by_method = Object.entries(methodStats).map(([payment_method, stats]) => ({
      payment_method,
      count: stats.count.toString(),
      total_amount: stats.total_amount.toString()
    }));
    
    // Monthly stats for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentPayments = allPayments.filter(payment => 
      new Date(payment.transaction_date) >= sixMonthsAgo
    );
    
    const monthlyStats = {};
    recentPayments.forEach(payment => {
      const date = new Date(payment.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total_amount: 0, count: 0 };
      }
      monthlyStats[monthKey].total_amount += parseFloat(payment.amount);
      monthlyStats[monthKey].count++;
    });
    
    const monthly = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        total_amount: stats.total_amount.toString(),
        count: stats.count.toString()
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    res.json({
      by_status,
      by_method,
      monthly
    });
  } catch (err) {
    console.error('Error fetching payment statistics:', err);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};

// Get a single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id, amount, receiver, status, payment_method, 
        description, transaction_date, user_id,
        users!inner(name, email)
      `)
      .eq('id', paymentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Payment not found' });
      }
      throw error;
    }
    
    // Transform data to match original format
    const transformedPayment = {
      id: payment.id,
      amount: payment.amount,
      receiver: payment.receiver,
      status: payment.status,
      payment_method: payment.payment_method,
      description: payment.description,
      transaction_date: payment.transaction_date,
      user_id: payment.user_id,
      user_name: payment.users.name,
      user_email: payment.users.email
    };
    
    res.json(transformedPayment);
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const { amount, receiver, status, payment_method, user_id, description } = req.body;
    
    // Validate required fields
    if (!amount || !receiver || !status || !payment_method || !user_id) {
      return res.status(400).json({ 
        error: 'Amount, receiver, status, payment method, and user ID are required' 
      });
    }
    
    // Validate status
    if (!['success', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be one of: success, failed, pending' 
      });
    }
    
    // Insert new payment
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        amount,
        receiver,
        status,
        payment_method,
        user_id,
        description
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(payment);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['success', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required (success, failed, or pending)' 
      });
    }
    
    // Update payment status
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Payment not found' });
      }
      throw error;
    }
    
    res.json(payment);
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};