"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import authApi from "../api/authApi"
import { validateForm } from "../utils/validators"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff, Mail, Lock, Crown } from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"
import "./styles/animations.css"

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateForm(formData, ["email", "password"])
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const userData = await authApi.loginUser(formData)
      
      // Debug information
      console.log("Login response:", userData)
      console.log("User role:", userData.role)
      console.log("Role type:", typeof userData.role)
      
      login(userData)

      // Redirect based on role
      switch (userData.role) {
        case "admin":
          navigate("/admin")
          break
        case "contractor":
          navigate("/owner")
          break
        case "store_owner": // Add this case to handle store_owner role
          console.log("Detected store_owner role, redirecting to /owner")
          navigate("/owner")
          break
        default:
          console.log("Using default redirection for role:", userData.role)
          navigate("/user")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ general: error.error || "Login failed" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mb-4 transform hover:scale-110 transition-transform duration-300">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Mini CRM</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign in to manage your customers and leads.</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm animate-slide-down">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm animate-slide-down">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:underline">
                Forgot your password ?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Log In"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or, Login with</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Geometric Pattern */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {/* Large Circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-300 rounded-full opacity-30 animate-float-delayed"></div>
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-teal-400 rounded-full opacity-15 animate-float"></div>

          {/* Geometric Shapes */}
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-40 right-40 w-12 h-12 bg-orange-400 rounded-full animate-bounce-slow"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full gap-4 p-8">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-sm animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "3s",
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-lg transform rotate-12 animate-spin-slow"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">Welcome Back</h2>
            <p className="text-xl opacity-90 animate-fade-in-up-delayed">
              Sign in to access your account and continue your journey
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
