# 🖥️ **Frontend Architecture Documentation**

## 📘 **Overview**
This document provides detailed information about the frontend architecture of the Mini CRM application. The frontend is built using React.js with modern development practices and follows a component-based architecture.

**Framework**: React.js 19.1.0  
**Build Tool**: Vite 6.3.5  
**Styling**: Tailwind CSS 4.1.11  
**State Management**: React Context API  

---

## 🏗️ **Architecture Overview**

```
src/
├── components/          # Reusable UI Components
│   ├── PaymentCharts.jsx
│   ├── ProtectedRoute.jsx
│   └── ThemeToggle.jsx
├── pages/              # Page Components
│   ├── auth/           # Authentication Pages
│   ├── dashboard/      # Dashboard Pages
│   ├── customers/      # Customer Management
│   ├── leads/          # Leads Management
│   └── payments/       # Payment Management
├── context/            # React Context Providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── api/                # API Integration Layer
│   ├── authApi.js
│   ├── customerApi.js
│   ├── leadsApi.js
│   └── paymentApi.js
├── utils/              # Utility Functions
│   ├── validationSchemas.js
│   ├── validators.js
│   └── exportUtils.js
├── assets/             # Static Assets
└── config/             # Configuration Files
```

---

## ⚛️ **Component Architecture**

### **Component Hierarchy**
```
App.jsx
├── AuthProvider
│   ├── ThemeProvider
│   │   ├── Router
│   │   │   ├── Routes
│   │   │   │   ├── Public Routes
│   │   │   │   │   ├── LandingPage
│   │   │   │   │   ├── LoginPage
│   │   │   │   │   └── RegisterPage
│   │   │   │   └── Protected Routes
│   │   │   │       ├── ProtectedRoute
│   │   │   │       │   ├── User Routes
│   │   │   │       │   │   ├── UserHome
│   │   │   │       │   │   ├── PaymentDashboard
│   │   │   │       │   │   ├── LeadsDashboard
│   │   │   │       │   │   └── CustomerPages
│   │   │   │       │   └── Admin Routes
│   │   │   │       │       ├── AdminHome
│   │   │   │       │       ├── AdminUsers
│   │   │   │       │       └── AdminLeads
```

### **Component Types**

#### **1. Page Components**
Large components that represent entire pages or views.

**Examples:**
- `LoginPage.jsx` - User authentication
- `PaymentDashboard.jsx` - Payment management interface
- `LeadsDashboard.jsx` - Leads management interface
- `AdminHome.jsx` - Admin dashboard

**Characteristics:**
- Handle routing and navigation
- Manage page-level state
- Coordinate multiple child components
- Handle API calls and data fetching

#### **2. Layout Components**
Components that provide structure and navigation.

**Examples:**
- `ProtectedRoute.jsx` - Route protection wrapper
- Navigation components
- Header/Footer components

#### **3. Feature Components**
Components that implement specific business features.

**Examples:**
- `PaymentCharts.jsx` - Data visualization
- `CustomerForm.jsx` - Customer creation/editing
- `LeadDetail.jsx` - Lead information display

#### **4. UI Components**
Reusable UI elements and controls.

**Examples:**
- `ThemeToggle.jsx` - Dark/Light mode switcher
- Button components
- Form input components
- Modal components

---

## 🔄 **State Management**

### **Context API Implementation**

#### **AuthContext**
Manages user authentication state and operations.

```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Features:**
- User authentication state
- Login/logout operations
- Persistent storage integration
- Loading state management

#### **ThemeContext**
Manages application theme (dark/light mode).

```javascript
// ThemeContext.jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Features:**
- Theme state management
- System preference detection
- Persistent theme storage
- CSS class application

### **Local State Management**
Component-level state using React hooks:

- `useState` - Component state
- `useEffect` - Side effects and lifecycle
- `useCallback` - Memoized callbacks
- `useMemo` - Memoized values

---

## 🔌 **API Integration**

### **API Layer Structure**
```javascript
// api/authApi.js
const authApi = {
  loginUser: async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  },
  
  registerUser: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  }
};

export default authApi;
```

### **HTTP Client Configuration**
```javascript
// config.js
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_BASE;

// Request interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **API Modules**

#### **Authentication API**
- `loginUser()` - User login
- `registerUser()` - User registration
- `refreshToken()` - Token refresh

#### **Customer API**
- `getAllCustomers()` - Fetch customers with pagination
- `getCustomerById()` - Get single customer
- `createCustomer()` - Create new customer
- `updateCustomer()` - Update customer
- `deleteCustomer()` - Delete customer
- `getCustomerStats()` - Get statistics

#### **Leads API**
- `getAllLeads()` - Fetch leads with filtering
- `getLeadById()` - Get single lead
- `createLead()` - Create new lead
- `updateLead()` - Update lead
- `deleteLead()` - Delete lead
- `getLeadsStats()` - Get statistics

#### **Payment API**
- `getAllPayments()` - Fetch payments
- `createPayment()` - Create payment
- `updatePayment()` - Update payment
- `getPaymentStats()` - Get statistics

---

## 🎨 **Styling Architecture**

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
```

### **CSS Organization**
```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}

/* Custom animations */
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### **Dark Mode Implementation**
```javascript
// Dark mode classes automatically applied based on ThemeContext
const cardClasses = `
  bg-white dark:bg-gray-800 
  text-gray-900 dark:text-gray-100 
  border border-gray-200 dark:border-gray-700
`;
```

---

## 🛣️ **Routing Architecture**

### **Route Structure**
```javascript
// App.jsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected User Routes */}
  <Route path="/user" element={
    <ProtectedRoute allowedRoles={['user']}>
      <UserHome />
    </ProtectedRoute>
  } />
  
  <Route path="/payments" element={
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <PaymentDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/leads" element={
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <LeadsDashboard />
    </ProtectedRoute>
  } />
  
  {/* Protected Admin Routes */}
  <Route path="/admin/*" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminRoutes />
    </ProtectedRoute>
  } />
</Routes>
```

### **Route Protection**
```javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

---

## ✅ **Form Validation**

### **Validation Schema**
```javascript
// utils/validationSchemas.js
import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const customerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Customer name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});
```

### **Formik Integration**
```javascript
// Example form component
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../utils/validationSchemas';

const LoginForm = () => {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      <Form>
        <Field
          type="email"
          name="email"
          placeholder="Email"
          className="form-input"
        />
        <ErrorMessage name="email" component="div" className="error-message" />
        
        <Field
          type="password"
          name="password"
          placeholder="Password"
          className="form-input"
        />
        <ErrorMessage name="password" component="div" className="error-message" />
        
        <button type="submit">Login</button>
      </Form>
    </Formik>
  );
};
```

---

## 📊 **Data Visualization**

### **Chart.js Integration**
```javascript
// components/PaymentCharts.jsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PaymentCharts = ({ payments }) => {
  const processChartData = () => {
    // Data processing logic
    return { pieData, barData };
  };
  
  const { pieData, barData } = processChartData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <Pie data={pieData} options={pieOptions} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};
```

---

## 📱 **Responsive Design**

### **Mobile-First Approach**
```javascript
// Responsive component example
const ResponsiveCard = ({ children }) => {
  return (
    <div className="
      w-full 
      sm:w-1/2 
      md:w-1/3 
      lg:w-1/4 
      p-2
    ">
      <div className="
        bg-white 
        dark:bg-gray-800 
        rounded-lg 
        shadow-md 
        p-4 
        sm:p-6
      ">
        {children}
      </div>
    </div>
  );
};
```

### **Breakpoint Strategy**
- `sm`: 640px - Small tablets
- `md`: 768px - Tablets
- `lg`: 1024px - Small laptops
- `xl`: 1280px - Desktops
- `2xl`: 1536px - Large screens

---

## 🔧 **Development Tools**

### **Build Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### **Environment Variables**
```bash
# .env
VITE_API_BASE=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🧪 **Testing Strategy**

### **Testing Setup**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
```

### **Component Testing**
```javascript
// __tests__/LoginPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('renders login form', () => {
  renderWithRouter(<LoginPage />);
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
});
```

---

## 🚀 **Performance Optimization**

### **Code Splitting**
```javascript
// Lazy loading components
import { lazy, Suspense } from 'react';

const PaymentDashboard = lazy(() => import('./pages/PaymentDashboard'));
const LeadsDashboard = lazy(() => import('./pages/LeadsDashboard'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <PaymentDashboard />
</Suspense>
```

### **Memoization**
```javascript
// Memoized components
import { memo, useMemo, useCallback } from 'react';

const CustomerCard = memo(({ customer, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(customer.id);
  }, [customer.id, onEdit]);
  
  const customerInfo = useMemo(() => {
    return `${customer.name} - ${customer.company}`;
  }, [customer.name, customer.company]);
  
  return (
    <div className="card">
      <h3>{customerInfo}</h3>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
});
```

---

## 📦 **Build and Deployment**

### **Build Process**
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### **Build Optimization**
- Tree shaking for unused code elimination
- Code splitting for better loading performance
- Asset optimization (images, fonts)
- CSS purging for smaller bundle size

---

## 🔍 **Debugging and Development**

### **Development Tools**
- React Developer Tools
- Redux DevTools (if using Redux)
- Vite HMR (Hot Module Replacement)
- ESLint for code quality
- Prettier for code formatting

### **Error Boundaries**
```javascript
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}
```

---

## 🎯 **Best Practices**

### **Component Guidelines**
1. **Single Responsibility**: Each component should have one clear purpose
2. **Prop Validation**: Use PropTypes or TypeScript for type checking
3. **Consistent Naming**: Use PascalCase for components, camelCase for functions
4. **Small Components**: Keep components focused and manageable
5. **Reusability**: Design components to be reusable across the application

### **State Management Guidelines**
1. **Lift State Up**: Move state to the lowest common ancestor
2. **Context Sparingly**: Use Context for truly global state
3. **Local State First**: Start with local state, lift when necessary
4. **Immutable Updates**: Always update state immutably

### **Performance Guidelines**
1. **Lazy Loading**: Load components and routes on demand
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **Bundle Analysis**: Regularly analyze bundle size
4. **Image Optimization**: Optimize and lazy load images

This frontend architecture provides a solid foundation for a scalable, maintainable, and performant React application with modern development practices.
