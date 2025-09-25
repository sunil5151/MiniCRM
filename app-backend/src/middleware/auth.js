import { supabase } from '../config/dbConfig.js';

// Simple authentication middleware that extracts user info from Authorization header
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called for:', req.method, req.path);
    console.log('🔐 Headers received:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('🔐 Authorization header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('🔐 Token found:', token);

    // For now, let's decode the token as a simple user ID
    // In a real app, you'd verify JWT signature
    try {
      // Assuming token is just a user ID for simplicity
      const userId = parseInt(token);
      
      if (isNaN(userId)) {
        console.log('❌ Invalid token format');
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.log('❌ User not found:', error);
        return res.status(403).json({ error: 'Invalid token' });
      }

      console.log('✅ User authenticated:', { id: user.id, role: user.role });
      req.user = user;
      next();
    } catch (err) {
      console.log('❌ Token parsing error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
