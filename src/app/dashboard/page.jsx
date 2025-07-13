 "use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { RefreshCw, Calendar, AlertCircle, CheckCircle, LogOut, LogIn, Users,IndianRupee } from 'lucide-react';
import { API_URL } from '@/utils/constants';

const AuditDashboard = () => {
  const [audits, setAudits] = useState([]);
  const [checkoutData, setCheckoutData] = useState([]);
  const [checkinData, setCheckinData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'checkout', 'checkin'

  // API configuration

 // Replace with your actual API key

  // Fetch audit data
  const fetchAudits = async (type = null) => {
    try {
      setLoading(true);
      let url = `${API_URL}/audit`;
      
      const params = new URLSearchParams();
      if (type) params.append('type', type); 
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch audits');
      }
      const data = await response.json();
      setAudits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch checkout data
  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/audit`;
      
      const params = new URLSearchParams();
      params.append('type', 'check-out');

      
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch checkout data');
      }
      const data = await response.json();
      setCheckoutData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchCheckinData = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/audit`;
      
      const params = new URLSearchParams();
      params.append('type', 'check-in');
  
      
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch checkin data');
      }
      const data = await response.json();
      setCheckinData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  // Handle view changes
  const handleViewChange = (view) => {
    setSelectedView(view);
    if (view === 'checkout') {
      fetchCheckoutData();
    } else if (view === 'checkin') {
      fetchCheckinData();
    } else {
      fetchAudits();
    }
  };

  // Get current data based on selected view
  const getCurrentData = () => {
    switch (selectedView) {
      case 'checkout':
        return checkoutData;
      case 'checkin':
        return checkinData;
      default:
        return audits;
    }
  };

  // Filter audits based on type (for cases where API returns mixed data)
  const filteredAudits = filterType === 'all' 
    ? getCurrentData() 
    : getCurrentData().filter(audit => {
        const auditType = audit.auditType || 'unknown';
        return auditType.toLowerCase().includes(filterType.toLowerCase());
      });

  // Prepare monthly data
  const getMonthlyData = () => {
    const monthlyData = getCurrentData().reduce((acc, audit) => {
      const date = new Date(audit.auditDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          charges: 0
        };
      }
      
      acc[monthKey].count += 1;
      acc[monthKey].charges += audit.totalCharges || 0;
      
      return acc;
    }, {});

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Prepare daily data (last 30 days)
  const getDailyData = () => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      last30Days.push({
        date: dateKey,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
        charges: 0
      });
    }

    getCurrentData().forEach(audit => {
      const auditDate = new Date(audit.auditDate).toISOString().split('T')[0];
      const dayData = last30Days.find(day => day.date === auditDate);
      
      if (dayData) {
        dayData.count += 1;
        dayData.charges += audit.totalCharges || 0;
      }
    });

    return last30Days;
  };

  // Prepare data for charts
  const auditTypeData = getCurrentData().reduce((acc, audit) => {
    const type = audit.auditType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(auditTypeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
    count
  }));

  const statusData = getCurrentData().reduce((acc, audit) => {
    const status = audit.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalCharges = getCurrentData().reduce((sum, audit) => sum + (audit.totalCharges || 0), 0);
  const averageCharges = getCurrentData().length > 0 ? totalCharges / getCurrentData().length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading audit data...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
  //         <p className="text-red-600 mb-4">Error: {error}</p>
  //         <button 
  //           onClick={() => handleViewChange(selectedView)}
  //           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Dashboard</h1>
          <p className="text-gray-600">Overview of all audit records and analytics</p>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleViewChange('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'overview' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              All Audits ({audits.length})
            </button>
            <button
              onClick={() => handleViewChange('checkout')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'checkout' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Check-out ({checkoutData.length})
            </button>
            <button
              onClick={() => handleViewChange('checkin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'checkin' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Check-in ({checkinData.length})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {selectedView === 'checkout' ? 'Check-out Audits' : 
                   selectedView === 'checkin' ? 'Check-in Audits' : 'Total Audits'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{getCurrentData().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Charges</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalCharges.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentData().filter(a => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Charges</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(averageCharges).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly and Daily Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
                <Bar yAxisId="right" dataKey="charges" fill="#82ca9d" name="Charges (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDailyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Count" />
                <Line yAxisId="right" type="monotone" dataKey="charges" stroke="#82ca9d" strokeWidth={2} name="Charges (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg ${
                filterType === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Types
            </button>
            {Object.keys(auditTypeData).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filterType === type 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type} ({auditTypeData[type]})
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Audit Types Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distribution by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {selectedView === 'checkout' ? 'Check-out Audit Records' : 
               selectedView === 'checkin' ? 'Check-in Audit Records' : 'All Audit Records'} 
              ({filteredAudits.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAudits.map((audit) => (
                  <tr key={audit._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {audit.guestId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {audit.guestId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Room {audit.roomId?.roomNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        audit.auditType === 'check-in' 
                          ? 'bg-green-100 text-green-800'
                          : audit.auditType === 'check-out'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {audit.auditType?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(audit.auditDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        audit.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : audit.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {audit.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(audit.totalCharges || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {audit.items?.length || 0} items
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => handleViewChange(selectedView)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;