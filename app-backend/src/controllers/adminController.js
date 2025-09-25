import { supabase } from '../config/dbConfig.js';
import { validateRegistration } from '../utils/validators.js';

// Get all users with company information for contractors
export const getAllUsers = async (req, res) => {
  try {
    // Get all users first
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, address, role, profile_image_url, created_at')
      .order('name');
    
    if (usersError) throw usersError;
    
    // Check if companies table exists by trying to query it
    let companiesExist = false;
    try {
      const { data: companiesTest, error: companiesTestError } = await supabase
        .from('companies')
        .select('count', { count: 'exact', head: true });
      companiesExist = !companiesTestError;
    } catch (err) {
      console.log('Companies table does not exist, proceeding without company data');
      companiesExist = false;
    }
    
    if (companiesExist) {
      // Get companies and applications data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id, owner_user_id,
          applications!left(id, rating)
        `);
      
      if (companiesError) {
        console.log('Error fetching companies, proceeding without company data:', companiesError);
        // If companies query fails, fall back to users only
        const transformedUsers = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          profile_image_url: user.profile_image_url,
          created_at: user.created_at,
          companyid: null,
          companyaveragerating: '0',
          applicationscount: '0'
        }));
        
        return res.json(transformedUsers);
      }
      
      // Create a map of user companies and their stats
      const userCompanyMap = {};
      companies.forEach(company => {
        if (company.owner_user_id) {
          const ratings = company.applications.map(app => app.rating).filter(r => r !== null);
          const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
          
          userCompanyMap[company.owner_user_id] = {
            companyId: company.id,
            companyAverageRating: averageRating.toString(),
            applicationsCount: company.applications.length.toString()
          };
        }
      });
      
      // Transform users with company data
      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at,
        companyid: userCompanyMap[user.id]?.companyId || null,
        companyaveragerating: userCompanyMap[user.id]?.companyAverageRating || '0',
        applicationscount: userCompanyMap[user.id]?.applicationsCount || '0'
      }));
      
      res.json(transformedUsers);
    } else {
      // If companies table doesn't exist, return users with null company data
      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at,
        companyid: null,
        companyaveragerating: '0',
        applicationscount: '0'
      }));
      
      res.json(transformedUsers);
    }
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// Get all companies with applications
export const getAllStores = async (req, res) => {
  try {
    // Check if companies table exists
    let companiesExist = false;
    try {
      const { data: companiesTest, error: companiesTestError } = await supabase
        .from('companies')
        .select('count', { count: 'exact', head: true });
      companiesExist = !companiesTestError;
    } catch (err) {
      companiesExist = false;
    }
    
    if (!companiesExist) {
      return res.json([]);
    }
    
    // Check if applications table exists
    let applicationsExist = false;
    try {
      const { data: applicationsTest, error: applicationsTestError } = await supabase
        .from('applications')
        .select('count', { count: 'exact', head: true });
      applicationsExist = !applicationsTestError;
    } catch (err) {
      applicationsExist = false;
    }
    
    if (applicationsExist) {
      // Get companies with applications
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id, name, email, address,
          applications!left(id, rating)
        `)
        .order('name');
      
      if (companiesError) throw companiesError;
      
      // Transform data to match original format
      const transformedCompanies = companies.map(company => {
        const ratings = company.applications.map(app => app.rating).filter(r => r !== null);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        return {
          id: company.id,
          name: company.name,
          email: company.email,
          address: company.address,
          averagerating: averageRating.toString(),
          applicationscount: company.applications.length.toString()
        };
      });
      
      res.json(transformedCompanies);
    } else {
      // If applications table doesn't exist, return companies with zero stats
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, email, address')
        .order('name');
      
      if (companiesError) throw companiesError;
      
      const transformedCompanies = companies.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        address: company.address,
        averagerating: '0',
        applicationscount: '0'
      }));
      
      res.json(transformedCompanies);
    }
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Rename function but keep the same name for API compatibility
export const getAllCompanies = getAllStores;

// Get user by ID
export const getUserById = async (req, res) => {
  const userId = req.params.id;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, address, created_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
export const createUser = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  
  // Validate input
  const validation = validateRegistration(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (checkError) throw checkError;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Insert new user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, address, password, role }])
      .select('id')
      .single();
    
    if (insertError) throw insertError;
    
    // Return user info without password
    res.status(201).json({
      id: user.id,
      name,
      email,
      role,
      address
    });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Create new company
export const createStore = async (req, res) => {
  const { name, email, address, items, owner_user_id } = req.body;
  
  try {
    // Check if owner exists and is a contractor
    const { data: owners, error: ownerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', owner_user_id)
      .eq('role', 'contractor');
    
    if (ownerError) throw ownerError;
    
    if (owners.length === 0) {
      return res.status(400).json({ error: 'Invalid company owner ID or user is not a contractor' });
    }
    
    // Insert new company
    const { data: company, error: insertError } = await supabase
      .from('companies')
      .insert([{ name, email, address, owner_user_id }])
      .select('id')
      .single();
    
    if (insertError) throw insertError;
    
    // Return company info
    res.status(201).json({
      id: company.id,
      name,
      email,
      address,
      owner_user_id,
      items: items || []
    });
  } catch (err) {
    console.error('Company creation error:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

// Rename function but keep the same name for API compatibility
export const createCompany = createStore;

// Get company by owner ID
export const getStoreByOwnerId = async (req, res) => {
  const ownerId = req.params.ownerId;
  
  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        applications!left(id, rating)
      `)
      .eq('owner_user_id', ownerId)
      .single();
    
    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found for this owner' });
      }
      throw companyError;
    }
    
    // Calculate average rating and applications count
    const ratings = company.applications.map(app => app.rating).filter(r => r !== null);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    // Transform data to match original format
    const transformedCompany = {
      ...company,
      averagerating: averageRating.toString(),
      applicationscount: company.applications.length.toString()
    };
    
    // Remove the applications array from the response
    delete transformedCompany.applications;
    
    res.json(transformedCompany);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// Rename function but keep the same name for API compatibility
export const getCompanyByOwnerId = getStoreByOwnerId;

// Get users who have applied to a specific company
export const getStoreRatingUsers = async (req, res) => {
  const companyId = req.params.storeId;
  
  try {
    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' });
      }
      throw companyError;
    }
    
    // Get users who applied to this company
    const { data: applicationUsers, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        rating, proposal, created_at,
        users!inner(id, name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (applicationsError) throw applicationsError;
    
    // Transform data to match original format
    const transformedUsers = applicationUsers.map(app => ({
      id: app.users.id,
      name: app.users.name,
      email: app.users.email,
      rating: app.rating,
      proposal: app.proposal,
      application_date: app.created_at
    }));
    
    res.json(transformedUsers);
  } catch (err) {
    console.error('Error fetching application users:', err);
    res.status(500).json({ error: 'Failed to fetch application users' });
  }
};

// Rename function but keep the same name for API compatibility
export const getCompanyApplicationUsers = getStoreRatingUsers;