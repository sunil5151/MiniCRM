import { supabase } from '../config/dbConfig.js';
import { isValidRating } from '../utils/validators.js';

// Get all companies with search functionality and user's application
export const getAllStores = async (req, res) => {
  try {
    const { userId, name, address } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Build the query with filters
    let query = supabase
      .from('companies')
      .select(`
        id, name, address,
        applications!left(rating)
      `);
    
    // Apply search filters
    if (name && address) {
      query = query.ilike('name', `%${name}%`).ilike('address', `%${address}%`);
    } else if (name) {
      query = query.ilike('name', `%${name}%`);
    } else if (address) {
      query = query.ilike('address', `%${address}%`);
    }
    
    const { data: companies, error } = await query.order('name');
    
    if (error) throw error;
    
    // Get user's specific applications
    const { data: userApplications, error: appError } = await supabase
      .from('applications')
      .select('company_id, rating')
      .eq('user_id', userId);
    
    if (appError) throw appError;
    
    // Create a map of user applications
    const userAppMap = {};
    userApplications.forEach(app => {
      userAppMap[app.company_id] = app.rating;
    });
    
    // Transform data to match original format
    const transformedCompanies = companies.map(company => {
      // Calculate average rating
      const ratings = company.applications.map(app => app.rating).filter(r => r !== null);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
      
      return {
        id: company.id,
        name: company.name,
        address: company.address,
        averagerating: averageRating.toString(),
        userrating: userAppMap[company.id] || null
      };
    });
    
    res.json(transformedCompanies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Rename function but keep the same name for API compatibility
export const getAllCompanies = getAllStores;

// Submit or update an application for a company
export const submitRating = async (req, res) => {
  try {
    const { userId, rating, proposal } = req.body;
    const companyId = req.params.storeId;
    
    // Validate inputs
    if (!userId || !companyId || rating === undefined) {
      return res.status(400).json({ error: 'User ID, company ID, and rating are required' });
    }
    
    if (!isValidRating(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }
    
    // Check if user has already applied to this company
    const { data: existingApplications, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId);
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingApplications.length > 0) {
      // Update existing application
      const { error: updateError } = await supabase
        .from('applications')
        .update({ rating, proposal })
        .eq('id', existingApplications[0].id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new application
      const { error: insertError } = await supabase
        .from('applications')
        .insert([{
          user_id: userId,
          company_id: companyId,
          rating,
          proposal
        }]);
      
      if (insertError) throw insertError;
    }
    
    // Get updated company info with new average rating
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        id, name, address,
        applications!left(rating)
      `)
      .eq('id', companyId)
      .single();
    
    if (companyError) throw companyError;
    
    // Get user's specific application
    const { data: userApp, error: userAppError } = await supabase
      .from('applications')
      .select('rating, proposal')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();
    
    if (userAppError && userAppError.code !== 'PGRST116') throw userAppError;
    
    // Calculate average rating
    const ratings = company.applications.map(app => app.rating).filter(r => r !== null);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    // Transform data to match original format
    const transformedCompany = {
      id: company.id,
      name: company.name,
      address: company.address,
      averagerating: averageRating.toString(),
      userrating: userApp?.rating || null,
      userproposal: userApp?.proposal || null
    };
    
    res.json(transformedCompany || { message: 'Application submitted but company not found' });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Rename function but keep the same name for API compatibility
export const submitApplication = submitRating;