import * as Yup from 'yup';

// Authentication Schemas
export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['user', 'admin'], 'Please select a valid role')
    .required('Role is required'),
});

// Customer Management Schemas
export const customerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Customer name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    )
    .nullable(),
  company: Yup.string()
    .max(100, 'Company name must be less than 100 characters')
    .nullable(),
  address: Yup.string()
    .max(500, 'Address must be less than 500 characters')
    .nullable(),
});

// Lead Management Schemas
export const leadSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .required('Lead title is required'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable(),
  status: Yup.string()
    .oneOf(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'], 'Please select a valid status')
    .required('Status is required'),
  value: Yup.number()
    .min(0, 'Value must be a positive number')
    .max(999999999, 'Value is too large')
    .nullable(),
  customer_id: Yup.string()
    .required('Please select a customer'),
  source: Yup.string()
    .max(100, 'Source must be less than 100 characters')
    .nullable(),
  priority: Yup.string()
    .oneOf(['Low', 'Medium', 'High'], 'Please select a valid priority')
    .required('Priority is required'),
});

// Payment Schemas
export const paymentSchema = Yup.object({
  amount: Yup.number()
    .min(0.01, 'Amount must be greater than 0')
    .max(999999999, 'Amount is too large')
    .required('Amount is required'),
  payment_method: Yup.string()
    .oneOf(['credit_card', 'bank_transfer', 'paypal', 'cash', 'other'], 'Please select a valid payment method')
    .required('Payment method is required'),
  status: Yup.string()
    .oneOf(['pending', 'completed', 'failed'], 'Please select a valid status')
    .required('Status is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .nullable(),
  customer_id: Yup.string()
    .required('Please select a customer'),
});

// Search and Filter Schemas
export const searchSchema = Yup.object({
  query: Yup.string()
    .max(100, 'Search query must be less than 100 characters'),
  status: Yup.string()
    .nullable(),
  dateFrom: Yup.date()
    .nullable(),
  dateTo: Yup.date()
    .nullable()
    .min(Yup.ref('dateFrom'), 'End date must be after start date'),
});

// Profile Update Schema
export const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    )
    .nullable(),
});

// Password Change Schema
export const passwordChangeSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});
