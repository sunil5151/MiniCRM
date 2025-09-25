"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate,Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

import userApi from "../api/userApi"
import authApi from "../api/authApi"
import { Search, Star, StarOff, User, Lock, LogOut, Settings, Store, MapPin, Eye, EyeOff, Upload, Camera, CreditCard } from "lucide-react"

function UserHome() {
  const { user, logout, updateProfileImage } = useAuth()
  const navigate = useNavigate()
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchName, setSearchName] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  // Add these new state variables for image upload
  const fileInputRef = useRef(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  // Add a state for proposals
  const [storeProposals, setStoreProposals] = useState({})
  // Add this state variable for proposal notifications
  const [proposalNotification, setProposalNotification] = useState(null)
  
  useEffect(() => {
    // Redirect if not logged in or not a user
    if (!user || user.role !== "user") {
      navigate("/login")
      return
    }

    fetchStores()
  }, [user, navigate])

  const fetchStores = async (name = searchName, address = searchAddress) => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await userApi.fetchStores({
        userId: user.id,
        name,
        address,
      })
      setStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchStores(searchName, searchAddress)
  }

  const handleRatingChange = (storeId, rating) => {
    // If rating is empty, don't submit
    if (!rating) return
    
    setIsLoading(true)
    
    userApi.submitRating({
      userId: user.id,
      storeId,
      rating,
      proposal: storeProposals[storeId] || ""
    })
    .then(updatedStore => {
      setStores(prevStores =>
        prevStores.map(store =>
          store.id === updatedStore.id ? updatedStore : store
        )
      )
      setIsLoading(false)
    })
    .catch(error => {
      console.error("Error submitting rating:", error)
      setIsLoading(false)
    })
  }

  // Add a function to handle proposal changes
  const handleProposalChange = (storeId, proposal) => {
    setStoreProposals(prev => ({
      ...prev,
      [storeId]: proposal
    }))
  }

  // Fix the handleProposalSubmit function by moving it inside the component
  const handleProposalSubmit = (storeId) => {
    // Don't submit if there's no proposal
    if (!storeProposals[storeId] && !stores.find(store => store.id === storeId)?.userProposal) return
    
    setIsLoading(true)
    
    userApi.submitRating({
      userId: user.id,
      storeId,
      rating: stores.find(store => store.id === storeId)?.userRating || 3, // Use existing rating or default to 3
      proposal: storeProposals[storeId] || stores.find(store => store.id === storeId)?.userProposal
    })
    .then(updatedStore => {
      setStores(prevStores =>
        prevStores.map(store =>
          store.id === updatedStore.id ? updatedStore : store
        )
      )
      setIsLoading(false)
      
      // Show notification
      setProposalNotification({
        storeId,
        message: updatedStore.userProposal ? "Proposal updated successfully!" : "Proposal submitted successfully!",
        type: "success"
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setProposalNotification(null)
      }, 3000)
      
      // Clear the proposal from the temporary state since it's now saved
      setStoreProposals(prev => {
        const newState = {...prev}
        delete newState[storeId]
        return newState
      })
    })
    .catch(error => {
      console.error("Error submitting proposal:", error)
      setIsLoading(false)
      
      // Show error notification
      setProposalNotification({
        storeId,
        message: "Failed to submit proposal. Please try again.",
        type: "error"
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setProposalNotification(null)
      }, 3000)
    })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError("Both fields are required")
      return
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters")
      return
    }

    try {
      await authApi.updatePassword({
        userId: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordSuccess("Password updated successfully")
      setPasswordForm({ oldPassword: "", newPassword: "" })
    } catch (error) {
      setPasswordError(error.error || "Failed to update password")
    }
  }

  // Move these functions inside the component
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }
    
    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!imageFile || !user) return
    
    setIsUploading(true)
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      reader.onload = async () => {
        const base64Image = reader.result
        
        // Upload to server
        const response = await authApi.uploadProfileImage({
          userId: user.id,
          imageBase64: base64Image
        })
        
        // Update user context with new image URL
        await updateProfileImage(response.imageUrl)
        
        // Reset state
        setImageFile(null)
        setImagePreview(null)
        setIsUploading(false)
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        
        // Success message
        alert("Profile image updated successfully!")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setIsUploading(false)
      alert("Failed to upload image. Please try again.")
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />)
      } else {
        stars.push(<StarOff key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Dashboard</h1>
                <p className="text-xl text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="inline-flex items-center px-8 py-4 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Settings className="w-8 h-8 mr-4" />
                Settings
              </button>
              <Link
                to="/payments"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <CreditCard className="w-8 h-8 mr-4" />
                Payment Dashboard
              </Link>
              
              <button
                onClick={logout}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-8 h-8 mr-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Card with Profile Image */}
        <div className="bg-white rounded-xl shadow-lg p-12 mb-16 animate-fade-in">
          <div className="flex items-center space-x-8">
            <div className="relative">
              {user.profile_image_url ? (
                <img 
                  src={user.profile_image_url} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                /> 
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div> 
              )}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-8 h-8" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">Welcome, {user.name}!</h2>
              <p className="text-xl text-gray-600">
                You are logged in as a <span className="font-medium text-purple-600">{user.role}</span>
              </p>
            </div>
          </div>
          
          {/* Image Preview and Upload Button */}
          {imagePreview && (
            <div className="mt-8 flex flex-col items-center space-y-6">
              <div className="relative w-64 h-64">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-64 h-64 rounded-lg object-cover"
                />
                <button 
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleImageUpload}
                disabled={isUploading}
                className={`px-8 py-4 rounded-lg text-white font-medium flex items-center text-lg ${isUploading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mr-4"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mr-4" />
                    Upload Profile Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Password Update Form */}
        {showPasswordForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-down">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* Store Listings */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <Store className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Company Listings</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Search Companies
            </button>
          </form>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading companies...</span>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No companies found.</p>
              <p className="text-gray-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            /* Companies Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <div
                  key={store.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{store.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(Number.parseFloat(store.averageRating))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Number.parseFloat(store.averageRating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Your Application</span>
                      <div className="flex items-center space-x-2">
                        {store.userRating ? (
                          <>
                            <div className="flex items-center space-x-1">
                              {renderStars(Number.parseFloat(store.userRating))}
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              {Number.parseFloat(store.userRating).toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Not applied</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apply to this company</label>
                      <select
                        value={store.userRating || ""}
                        onChange={(e) => handleRatingChange(store.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Select Rating</option>
                        <option value="1">⭐ 1 - Poor</option>
                        <option value="2">⭐⭐ 2 - Fair</option>
                        <option value="3">⭐⭐⭐ 3 - Good</option>
                        <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                      </select>
                      
                      <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Your Proposal</label>
                      <textarea
                        value={storeProposals[store.id] || store.userProposal || ""}
                        onChange={(e) => handleProposalChange(store.id, e.target.value)}
                        placeholder="Enter your proposal here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        rows="3"
                      />
                      <button
                        onClick={() => handleProposalSubmit(store.id)}
                        className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                        disabled={!storeProposals[store.id] && !store.userProposal}
                      >
                        {store.userProposal ? "Update Proposal" : "Submit Proposal"}
                      </button>

                      {/* Add notification display */}
                      {proposalNotification && proposalNotification.storeId === store.id && (
                        <div className={`mt-3 px-4 py-2 rounded-lg text-white ${proposalNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in`}>
                          {proposalNotification.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserHome