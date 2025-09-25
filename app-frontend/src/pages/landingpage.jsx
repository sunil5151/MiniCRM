"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import {
  FileText,
  Search,
  Users,
  Shield,
  Building,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Globe,
  AlertTriangle,
} from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isDarkMode } = useTheme()
  
  // Debug: Log theme state
  console.log("LandingPage - isDarkMode:", isDarkMode)

  const features = [
    {
      icon: <Building className="w-8 h-8" />,
      title: "Customer Profile Management",
      description:
        "Create and manage comprehensive customer profiles with contact details, company information, and complete relationship history.",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Lead Management",
      description:
        "Create, track, and manage sales leads with detailed descriptions, status tracking, and value specifications. Full CRUD operations available.",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Advanced Search",
      description:
        "Server-side search functionality to find customers by name, company, or their contact information efficiently.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Sales Pipeline",
      description:
        "Streamlined sales process to track leads through different stages with complete opportunity tracking.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Authentication",
      description:
        "JWT-based authentication system with role-based access control for sales users and administrators.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "CRM Analytics",
      description:
        "Comprehensive analytics and reporting tools to track customer relationships and sales performance.",
    },
  ]

  const stats = [
    { number: "500+", label: "Active Customers" },
    { number: "1000+", label: "Managed Leads" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-lg mr-3`}>
                <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Mini CRM</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                Features
              </a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                About
              </a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                Contact
              </a>
              <ThemeToggle className="mx-2" />
              <Link
                to="/login"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'} text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105`}
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 dark:border-gray-700 py-4 animate-fade-in">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                  Features
                </a>
                <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                  About
                </a>
                <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                  Contact
                </a>
                <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'} text-white px-6 py-2 rounded-lg text-center transition-all duration-300`}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-purple-800 via-blue-800 to-teal-700' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500'} text-white transition-all duration-200`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-20 w-32 h-32 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'} rounded-full opacity-20 animate-float`}></div>
          <div className={`absolute top-40 right-32 w-24 h-24 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-300'} rounded-full opacity-30 animate-float-delayed`}></div>
          <div className={`absolute bottom-32 left-16 w-40 h-40 ${isDarkMode ? 'bg-teal-600' : 'bg-teal-400'} rounded-full opacity-15 animate-float`}></div>
          <div className={`absolute top-32 right-20 w-16 h-16 ${isDarkMode ? 'bg-yellow-600' : 'bg-yellow-400'} transform rotate-45 animate-pulse`}></div>
          <div className={`absolute bottom-40 right-40 w-12 h-12 ${isDarkMode ? 'bg-orange-600' : 'bg-orange-400'} rounded-full animate-bounce-slow`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Streamline Your Customer Relationships
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto animate-fade-in-up-delayed">
              The complete CRM platform for managing customers, leads, and business relationships with advanced
              analytics and customer management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed">
              <Link
                to="/register"
                className={`${isDarkMode ? 'bg-gray-100 text-purple-700 hover:bg-white' : 'bg-white text-purple-600 hover:bg-gray-100'} px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg`}
              >
                Get Started Free
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className={`border-2 border-white text-white px-8 py-4 rounded-lg font-semibold ${isDarkMode ? 'hover:bg-gray-100 hover:text-purple-700' : 'hover:bg-white hover:text-purple-600'} transition-all duration-300 transform hover:scale-105`}
              >
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features for Modern CRM</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive CRM platform provides all the tools you need to manage customer relationships and
              drive sales growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-purple-600 dark:text-purple-400">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Implementation Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our CRM platform leverages cutting-edge technologies to deliver a robust and scalable customer management solution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Full-Stack Architecture</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Built with modern React frontend and robust Node.js backend with comprehensive API endpoints.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Authentication</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    JWT-based authentication with role-based access control for enhanced security.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cloud Storage Integration</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Seamless file uploads and management with Supabase Storage integration.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deployment Considerations</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    While Docker containerization was explored for deployment, we've optimized for traditional hosting
                    solutions to ensure maximum compatibility and performance.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gradient-to-br from-purple-700 to-blue-700' : 'bg-gradient-to-br from-purple-600 to-blue-600'} rounded-xl p-8 text-white transition-all duration-200`}>
              <h3 className="text-2xl font-bold mb-6">Technical Highlights</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>React with modern hooks and context</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>RESTful API with comprehensive endpoints</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Responsive design with Tailwind CSS</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Real-time customer search and filtering</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Paginated data loading</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Form validation and error handling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gradient-to-r from-purple-700 to-blue-700' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white transition-all duration-200`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Customer Management?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of companies already using Mini CRM to streamline their customer relationships and drive
            sales growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className={`${isDarkMode ? 'bg-gray-100 text-purple-700 hover:bg-white' : 'bg-white text-purple-600 hover:bg-gray-100'} px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className={`border-2 border-white text-white px-8 py-4 rounded-lg font-semibold ${isDarkMode ? 'hover:bg-gray-100 hover:text-purple-700' : 'hover:bg-white hover:text-purple-600'} transition-all duration-300 transform hover:scale-105`}
            >
              Login Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-lg mr-3`}>
                  <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold">Mini CRM</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The comprehensive CRM platform designed to manage customer relationships and streamline
                sales processes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors duration-200">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors duration-200">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors duration-200">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#contact" className="hover:text-white transition-colors duration-200">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Mini CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up-delayed {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animate-fade-in-up-delayed { animation: fade-in-up-delayed 1s ease-out 0.3s both; }
      `}</style>
    </div>
  )
}

export default LandingPage