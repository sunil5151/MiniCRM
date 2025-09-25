import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminUserDetail from './pages/AdminUserDetail';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import AdminAddUser from './pages/AdminAddUser';
import AdminCompanies from './pages/AdminCompanies';
import AdminCompanyForm from './pages/AdminCompanyForm';
import ContractorHome from './pages/ContractorHome';
import CompanyForm from './pages/CompanyForm';
import LandingPage from './pages/landingpage';
// New Payment Dashboard Pages
import PaymentDashboard from './pages/PaymentDashboard';
import NewPayment from './pages/NewPayment';
import PaymentDetail from './pages/PaymentDetail';
// CRM Leads Pages
import LeadsDashboard from './pages/LeadsDashboard';
import NewLead from './pages/NewLead';
import LeadDetail from './pages/LeadDetail';
import AdminLeads from './pages/AdminLeads';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Set landing page as the default route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/user" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Payment Dashboard Routes */}
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <PaymentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/payments/new" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <NewPayment />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/payments/:paymentId" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <PaymentDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* CRM Leads Routes */}
          <Route 
            path="/leads" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LeadsDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leads/new" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <NewLead />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leads/:leadId" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LeadDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leads/:leadId/edit" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LeadDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stores" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCompanies />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stores/new" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCompanyForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/new" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAddUser />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/leads" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeads />
              </ProtectedRoute>
            } 
          />
          
          {/* Store Owner routes */}
          <Route 
            path="/owner" 
            element={
              <ProtectedRoute allowedRoles={['contractor', 'store_owner']}>
                <ContractorHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/owner/store/new" 
            element={
              <ProtectedRoute allowedRoles={['contractor', 'store_owner']}>
                <CompanyForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect to landing page instead of login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;