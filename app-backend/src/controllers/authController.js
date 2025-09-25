import { supabase } from '../config/dbConfig.js';
import { validateRegistration, validateLogin, validatePasswordUpdate } from '../utils/validators.js';

// Register a new user
export const register = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  
  // Validate input
  const validation = validateRegistration({ name, email, address, password, role });
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  const sanitizedRole = role === 'admin' ? 'admin' : 'user';
  
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
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, address, password, role: sanitizedRole }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ 
      id: data.id,
      name,
      email,
      role: sanitizedRole
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  const { userId, imageBase64 } = req.body;
  
  if (!userId || !imageBase64) {
    return res.status(400).json({ error: 'User ID and image are required' });
  }
  
  try {
    // Check if user exists
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (userError) throw userError;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    
    // Upload to Supabase Storage
    const fileName = `profile-${userId}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    // Update user record with image URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    res.json({ imageUrl: publicUrl });
  } catch (err) {
    console.error('Profile image upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, profile_image_url')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Find user by email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (error) throw error;
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    // Check password (plaintext comparison - insecure, but per requirements)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Return user info without password and a simple token (user ID)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image_url: user.profile_image_url,
      token: user.id.toString() // Simple token - just the user ID as string
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Update user password
export const updatePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  
  // Validate input
  const validation = validatePasswordUpdate({ currentPassword: oldPassword, newPassword });
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Find user by ID
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (userError) throw userError;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Check old password (plaintext comparison - insecure, but per requirements)
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};