# ⚙️ **Backend Architecture Documentation**

## 📘 **Overview**
This document provides comprehensive information about the backend architecture of the Mini CRM application. The backend is built using Node.js with Express.js framework, following RESTful API principles and implementing robust security measures.

**Framework**: Node.js + Express.js 5.1.0  
**Database**: PostgreSQL via Supabase  
**Authentication**: JWT (JSON Web Tokens)  
**Architecture**: RESTful API with MVC pattern  

---

## 🏗️ **Architecture Overview**

```
app-backend/
├── src/
│   ├── controllers/        # Business Logic Controllers
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── leadsController.js
│   │   ├── paymentController.js
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   └── initController.js
│   ├── routes/            # API Route Definitions
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── leadsRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   └── initRoutes.js
│   ├── middleware/        # Custom Middleware
│   │   └── authMiddleware.js
│   ├── config/           # Configuration Files
│   │   └── dbConfig.js
│   └── utils/            # Utility Functions
│       └── helpers.js
├── .env                  # Environment Variables
├── server.js            # Server Entry Point
├── setupDatabase.js     # Database Setup Script
└── package.json         # Dependencies
```

---

## 🔧 **Server Configuration**

### **Main Server Setup**
```javascript
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import leadsRoutes from './src/routes/leadsRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **Environment Configuration**
```bash
# .env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🗄️ **Database Architecture**

### **Database Configuration**
```javascript
// src/config/dbConfig.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### **Database Schema**

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Customers Table**
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(100),
  address TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Leads Table**
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'New',
  value DECIMAL(12,2) DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'Medium',
  source VARCHAR(100),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Payments Table**
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Companies Table**
```sql
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Database Relationships**
- Users → Customers (One-to-Many)
- Users → Leads (One-to-Many, assigned_to)
- Users → Payments (One-to-Many)
- Users → Companies (One-to-Many)
- Customers → Leads (One-to-Many)
- Customers → Payments (One-to-Many)

---

## 🔐 **Authentication & Authorization**

### **JWT Authentication Middleware**
```javascript
// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { supabase } from '../config/dbConfig.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

### **Password Hashing**
```javascript
// src/utils/helpers.js
import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateJWT = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

---

## 🎯 **Controller Architecture**

### **Base Controller Pattern**
```javascript
// Example: customerController.js
import { supabase } from '../config/dbConfig.js';

export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', userId } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query with role-based filtering
    let query = supabase
      .from('customers')
      .select(`
        id, name, email, phone, company, address, created_at,
        leads!left(id, status, value)
      `)
      .order('created_at', { ascending: false });
    
    // Apply user filtering for non-admin users
    if (userId && req.user?.role !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: customers, error, count } = await query;
    
    if (error) throw error;
    
    // Transform data with calculated fields
    const transformedCustomers = customers.map(customer => ({
      ...customer,
      total_leads: customer.leads?.length || 0,
      total_value: customer.leads?.reduce((sum, lead) => 
        sum + (parseFloat(lead.value) || 0), 0
      ).toFixed(2)
    }));
    
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
```

### **Error Handling Pattern**
```javascript
// Consistent error handling across controllers
const handleControllerError = (error, res, operation = 'operation') => {
  console.error(`Error during ${operation}:`, error);
  
  if (error.code === 'PGRST116') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  if (error.code === '23505') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' });
  }
  
  res.status(500).json({ error: `Failed to complete ${operation}` });
};
```

---

## 🛣️ **Route Architecture**

### **Route Structure Pattern**
```javascript
// src/routes/customerRoutes.js
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} from '../controllers/customerController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.get('/:customerId', getCustomerById);
router.post('/', createCustomer);
router.put('/:customerId', updateCustomer);

// Admin-only routes
router.delete('/:customerId', requireRole(['admin']), deleteCustomer);

export default router;
```

### **Route Organization**
```javascript
// Route mounting in server.js
app.use('/api/auth', authRoutes);           // Authentication
app.use('/api/customers', customerRoutes);  // Customer management
app.use('/api/leads', leadsRoutes);         // Leads management
app.use('/api/payments', paymentRoutes);    // Payment processing
app.use('/api/admin', adminRoutes);         // Admin operations
app.use('/api/users', userRoutes);          // User management
app.use('/api/init', initRoutes);           // Database initialization
```

---

## 📊 **Data Processing & Analytics**

### **Statistics Calculation**
```javascript
// Example: Lead statistics calculation
export const getLeadsStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = supabase
      .from('leads')
      .select('id, status, value, priority, created_at');
    
    if (userId && req.user?.role !== 'admin') {
      query = query.eq('assigned_to', userId);
    }
    
    const { data: leads, error } = await query;
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      total_leads: leads.length,
      total_value: leads.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0),
      status_breakdown: {},
      priority_breakdown: {},
      conversion_rate: 0
    };
    
    // Process status breakdown
    leads.forEach(lead => {
      stats.status_breakdown[lead.status] = 
        (stats.status_breakdown[lead.status] || 0) + 1;
      stats.priority_breakdown[lead.priority] = 
        (stats.priority_breakdown[lead.priority] || 0) + 1;
    });
    
    // Calculate conversion rate
    const convertedLeads = stats.status_breakdown['Converted'] || 0;
    stats.conversion_rate = leads.length > 0 
      ? ((convertedLeads / leads.length) * 100).toFixed(2)
      : '0.00';
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching lead statistics:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
```

### **Data Aggregation**
```javascript
// Monthly growth calculation
const calculateMonthlyGrowth = (records) => {
  const monthlyStats = {};
  
  records.forEach(record => {
    const date = new Date(record.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = 0;
    }
    monthlyStats[monthKey]++;
  });
  
  return Object.entries(monthlyStats)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
```

---

## 🔍 **Query Optimization**

### **Efficient Database Queries**
```javascript
// Optimized query with joins and filtering
export const getCustomersWithLeads = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        company,
        leads!inner(
          id,
          title,
          status,
          value
        )
      `)
      .eq('leads.status', 'Active')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    handleControllerError(err, res, 'fetch customers with leads');
  }
};
```

### **Pagination Implementation**
```javascript
// Consistent pagination across endpoints
const implementPagination = (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return query.range(offset, offset + limit - 1);
};

// Usage in controllers
const paginatedQuery = implementPagination(baseQuery, req.query.page, req.query.limit);
```

---

## 🛡️ **Security Implementation**

### **Input Validation**
```javascript
// Validation middleware
import Joi from 'joi';

const validateCustomer = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    company: Joi.string().max(100).optional(),
    address: Joi.string().max(500).optional()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};
```

### **SQL Injection Prevention**
```javascript
// Using parameterized queries with Supabase
const safeQuery = await supabase
  .from('customers')
  .select('*')
  .eq('email', userEmail)  // Automatically sanitized
  .ilike('name', `%${searchTerm}%`);  // Safe pattern matching
```

### **CORS Configuration**
```javascript
// Secure CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📝 **Logging & Monitoring**

### **Request Logging**
```javascript
// Custom logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

app.use(requestLogger);
```

### **Error Logging**
```javascript
// Error logging with context
const logError = (error, context = {}) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};
```

---

## 🧪 **Testing Architecture**

### **Unit Testing Setup**
```javascript
// __tests__/controllers/customerController.test.js
import { jest } from '@jest/globals';
import { getAllCustomers } from '../../src/controllers/customerController.js';

// Mock Supabase
jest.mock('../../src/config/dbConfig.js', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({
      data: mockCustomers,
      error: null,
      count: 10
    })
  }
}));

describe('Customer Controller', () => {
  test('should fetch customers with pagination', async () => {
    const req = { query: { page: 1, limit: 10 }, user: { role: 'user' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    await getAllCustomers(req, res);
    
    expect(res.json).toHaveBeenCalledWith({
      customers: expect.any(Array),
      pagination: expect.objectContaining({
        page: 1,
        limit: 10
      })
    });
  });
});
```

### **Integration Testing**
```javascript
// __tests__/integration/api.test.js
import request from 'supertest';
import app from '../../server.js';

describe('API Integration Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
  });
  
  test('GET /api/customers should return customers', async () => {
    const response = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('customers');
    expect(response.body).toHaveProperty('pagination');
  });
});
```

---

## 🚀 **Performance Optimization**

### **Database Connection Pooling**
```javascript
// Supabase automatically handles connection pooling
// Configuration in Supabase dashboard:
// - Max connections: 100
// - Connection timeout: 30s
// - Idle timeout: 600s
```

### **Caching Strategy**
```javascript
// Simple in-memory cache for frequently accessed data
const cache = new Map();

const getCachedData = (key, fetchFunction, ttl = 300000) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

### **Query Optimization**
```javascript
// Efficient bulk operations
export const bulkCreateCustomers = async (customers) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Bulk create failed: ${error.message}`);
  }
};
```

---

## 🔧 **Development Tools**

### **Database Migration**
```javascript
// setupDatabase.js
import { supabase } from './src/config/dbConfig.js';

const createTables = async () => {
  try {
    // Create tables using Supabase SQL editor or migrations
    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
};

createTables();
```

### **Seed Data**
```javascript
// src/controllers/initController.js
export const seedDatabase = async (req, res) => {
  try {
    // Insert sample users
    const { data: users } = await supabase
      .from('users')
      .insert([
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password_hash: await hashPassword('admin123'),
          role: 'admin'
        },
        {
          name: 'Regular User',
          email: 'user@example.com',
          password_hash: await hashPassword('user123'),
          role: 'user'
        }
      ])
      .select();
    
    // Insert sample customers and leads
    // ... more seed data
    
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
};
```

---

## 📊 **API Versioning**

### **Version Management**
```javascript
// Future API versioning structure
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Version-specific controllers
// src/controllers/v1/customerController.js
// src/controllers/v2/customerController.js
```

---

## 🔍 **Health Checks & Monitoring**

### **Health Check Endpoint**
```javascript
// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

This backend architecture provides a robust, scalable, and secure foundation for the Mini CRM application with proper separation of concerns, comprehensive error handling, and modern development practices.
