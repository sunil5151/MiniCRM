import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import paymentApi from "../api/paymentApi";
import { Search, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Download, BarChart2 } from "lucide-react";
import PaymentCharts from "../components/PaymentCharts";
import { exportToCSV } from "../utils/exportUtils";

function PaymentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    totalTransactions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  // Debug: Log user state
  console.log("PaymentDashboard - User:", user);
  console.log("PaymentDashboard - User exists:", !!user);

  useEffect(() => {
    console.log("PaymentDashboard - useEffect triggered");
    
    // Redirect if not logged in
    if (!user) {
      console.log("PaymentDashboard - No user, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("PaymentDashboard - User authenticated, fetching data");
    fetchPayments();
    fetchStats();
  }, [user, navigate]);

  const fetchPayments = async (status = searchStatus, paymentMethod = searchPaymentMethod) => {
    if (!user) {
      console.log("fetchPayments - No user, skipping");
      return;
    }

    console.log("fetchPayments - Starting fetch", { status, paymentMethod });
    setIsLoading(true);
    try {
      const data = await paymentApi.fetchPayments({
        userId: user.id,
        status,
        paymentMethod,
      });
      console.log("fetchPayments - Success:", data);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) {
      console.log("fetchStats - No user, skipping");
      return;
    }

    console.log("fetchStats - Starting fetch");
    try {
      const data = await paymentApi.fetchPaymentStats({
        userId: user.id,
      });
      console.log("fetchStats - Success:", data);
      
      // Process the stats data from the backend format to the frontend format
      const processedStats = {
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        totalTransactions: 0
      };
      
      // Calculate total transactions
      let totalTransactions = 0;
      if (data.by_status && Array.isArray(data.by_status)) {
        data.by_status.forEach(stat => {
          totalTransactions += Number(stat.count) || 0;
        });
      }
      
      // Calculate amounts by status
      if (data.by_status && Array.isArray(data.by_status)) {
        data.by_status.forEach(stat => {
          const amount = Number(stat.total_amount) || 0;
          
          // Add to total amount
          processedStats.totalAmount += amount;
          
          // Add to specific status amounts
          if (stat.status === 'pending') {
            processedStats.pendingAmount += amount;
          } else if (stat.status === 'completed' || stat.status === 'success') {
            processedStats.completedAmount += amount;
          }
        });
      }
      
      processedStats.totalTransactions = totalTransactions;
      
      setStats(processedStats);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("handleSearch - Searching with:", { searchStatus, searchPaymentMethod });
    fetchPayments(searchStatus, searchPaymentMethod);
  };

  const handleCreatePayment = () => {
    console.log("handleCreatePayment - Navigating to /payments/new");
    try {
      navigate('/payments/new');
    } catch (error) {
      console.error("Error navigating to payment creation:", error);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("No payment data to export");
      return;
    }
    
    // Format data for export
    const exportData = payments.map(payment => ({
      ID: payment.id,
      Date: new Date(payment.transaction_date).toLocaleDateString(),
      Receiver: payment.receiver,
      Amount: payment.amount,
      Method: payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      Status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
    }));
    
    exportToCSV(exportData, `payment_data_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const toggleCharts = () => {
    setShowCharts(!showCharts);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "failed":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Debug: Log render state
  console.log("PaymentDashboard - Rendering with:", {
    user: !!user,
    payments: payments.length,
    isLoading,
    stats
  });

  // Early return if no user (this should not render due to useEffect redirect)
  if (!user) {
    console.log("PaymentDashboard - No user, returning null");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mini CRM Dashboard</h1>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => navigate('/leads')}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                📊 Manage Leads
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/leads')}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  👥 Admin: All Leads
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Welcome, {user?.name || user?.email || 'User'}
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Revenue</dt>
                    <dd className="text-xl font-semibold text-gray-900">{formatCurrency(stats.completedAmount)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Revenue</dt>
                    <dd className="text-xl font-semibold text-gray-900">{formatCurrency(stats.pendingAmount)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                    <dd className="text-xl font-semibold text-gray-900">{stats.totalTransactions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-end">
<button
  onClick={toggleCharts}
  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
  style={{ 
    minWidth: '180px', 
    zIndex: 1000,
    backgroundColor: '#FF6B35',
    border: 'none',
    color: 'white',
    fontWeight: 'bold'
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#E55A2E'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
>
  <BarChart2 className="h-5 w-5 mr-2" />
  {showCharts ? 'Hide Charts' : 'Show Charts'}
</button>
          
<button
  onClick={handleExportCSV}
  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
  style={{ 
    minWidth: '180px', 
    zIndex: 1000,
    backgroundColor: '#FF6B35',
    border: 'none',
    color: 'white',
    fontWeight: 'bold'
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#E55A2E'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
>
  <Download className="h-5 w-5 mr-2" />
  Export CSV
</button>
        </div>
        
        {/* Charts Section */}
        {showCharts && (
          <div className="mt-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Analytics</h2>
            <PaymentCharts payments={payments} />
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Transaction Status</label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={searchPaymentMethod}
                onChange={(e) => setSearchPaymentMethod(e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </form>
        </div>
        
        {/* Add New Payment Button */}
        <div className="mt-8 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePayment}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200 shadow-lg"
                style={{ 
                  minWidth: '180px', 
                  zIndex: 1000,
                  backgroundColor: '#FF6B35',
                  border: 'none',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E55A2E'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>
        
        {/* Payments Table */}
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          Loading payments...
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No transactions found. Click "Add Transaction" to add your first transaction.
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.transaction_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.receiver}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {getStatusIcon(payment.status)}
                              <span className="ml-2 capitalize">{payment.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => navigate(`/payments/${payment.id}`)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              View
                              <ArrowUpRight className="h-4 w-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Debug Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>User authenticated: {user ? 'Yes' : 'No'}</div>
            <div>User ID: {user?.id || 'Not found'}</div>
            <div>User Role: {user?.role || 'No role'}</div>
            <div>Payments count: {payments.length}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Current URL: {window.location.pathname}</div>
            <div>Navigate function: {typeof navigate}</div>
            <div>Stats: {JSON.stringify(stats)}</div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => alert('Debug button works!')}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Debug Alert Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDashboard;