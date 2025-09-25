// server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { testConnection } from './src/config/dbConfig.js';
import authRoutes from './src/routes/authRoutes.js';
import initRoutes from './src/routes/initRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import leadsRoutes from './src/routes/leadsRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import { initDatabase } from './src/controllers/initController.js';

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'https://minicrm1.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/init', initRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is running with Supabase' });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server after testing Supabase connection
testConnection().then(async (connected) => {
  if (connected) {
    // Auto-initialize database on server start
    try {
      console.log('🔄 Initializing Supabase database...');
      await initDatabase(null, { json: () => console.log('✅ Supabase database initialized successfully') });
    } catch (error) {
      console.error('❌ Supabase database initialization error:', error);
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} with Supabase`);
      console.log(`📝 Admin users endpoint: http://localhost:${PORT}/api/admin/users`);
      console.log('✅ Server is listening and ready to accept connections...');
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } else {
    console.error('Failed to connect to Supabase. Server not started.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});