import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, Upload, TrendingUp, Activity, DollarSign, Clock, ArrowUp, ArrowDown, Database, Zap } from 'lucide-react';
import { BASE_URL } from '../api/auth';
import {Link, useNavigate} from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: { count: 0, growth: 0 },
    activeUsers: { count: 0, growth: 0 },
    totalFiles: { count: 0, growth: 0 },
    storageUsed: { size: '0.00', growth: 0 }
  });
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate=useNavigate()

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/admin/dashboard/stats`);
      const data = await response.json();
      
      if (data.success) {
        // Map backend response shape to frontend state shape
        setStats({
          totalUsers:  { count: data.stats.users.total,     growth: data.stats.users.growth },
          activeUsers: { count: data.stats.agencies.active, growth: data.stats.agencies.growth },
          totalFiles:  { count: data.stats.claims.total,    growth: data.stats.claims.growth },
          storageUsed: { size: (data.stats.assignments.total / 1024).toFixed(2), growth: 0 },
        });
        // Backend sends monthlyTrend (not monthlyGrowth), uses "claims" not "files"
        setMonthlyGrowth(
          (data.monthlyTrend || []).map(m => ({
            month: m.month,
            users: m.users,
            files: m.claims,
          }))
        );
        // Backend sends recentClaims (not recentActivity)
        setRecentActivity(
          (data.recentClaims || []).map(c => ({
            email:  c.user_id?.email || c.user_id?.business_name || 'Unknown',
            action: `Upload – ${c.status}`,
            time:   c.createdAt,
          }))
        );
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  const getActivityIcon = (action) => {
    if (action.includes('Upload')) return { icon: Upload, bg: 'bg-blue-100', color: 'text-blue-600' };
    if (action.includes('Download')) return { icon: Download, bg: 'bg-green-100', color: 'text-green-600' };
    return { icon: Users, bg: 'bg-purple-100', color: 'text-purple-600' };
  };

  const StatCard = ({ icon: Icon, title, value, change, trend, gradient, iconBg }) => (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBg} p-3 rounded-xl shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        
           
        
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const maxUsers = Math.max(...monthlyGrowth.map(m => m.users), 1);
  const maxFiles = Math.max(...monthlyGrowth.map(m => m.files), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-5">Welcome back! Here's your system overview.</p>
        </div>

{/* Quick Navigation */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <button
    onClick={() => navigate('/superadmin/usermanagement')}
    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 text-left"
  >
    <div className="flex items-center gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">User Management</p>
        <p className="text-sm text-gray-500">Manage users & permissions</p>
      </div>
    </div>
  </button>

  <button
    onClick={() => navigate('/superadmin/agencymanagement')}
    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 text-left"
  >
    <div className="flex items-center gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Agency Management</p>
        <p className="text-sm text-gray-500">Manage Agencies & permissions</p>
      </div>
    </div>
  </button>


  <button
    onClick={() => navigate('/superadmin/claimanagement')}
    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 text-left"
  >
    <div className="flex items-center gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Claim Management</p>
        <p className="text-sm text-gray-500">Manage Active Claims</p>
      </div>
    </div>
  </button>
</div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.count}
            change={`${stats.totalUsers.growth >= 0 ? '+' : ''}${stats.totalUsers.growth}%`}
            trend={stats.totalUsers.growth >= 0 ? 'up' : 'down'}
            gradient="bg-gradient-to-br from-blue-400 to-blue-600"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />
          <StatCard 
            icon={Activity}
            title="Active Users"
            value={stats.activeUsers.count}
            change={`${stats.activeUsers.growth >= 0 ? '+' : ''}${stats.activeUsers.growth}%`}
            trend={stats.activeUsers.growth >= 0 ? 'up' : 'down'}
            gradient="bg-gradient-to-br from-green-400 to-green-600"
            iconBg="bg-gradient-to-br from-green-500 to-green-600 text-white"
          />
          <StatCard 
            icon={FileText}
            title="Total Files"
            value={stats.totalFiles.count}
            change={`${stats.totalFiles.growth >= 0 ? '+' : ''}${stats.totalFiles.growth}%`}
            trend={stats.totalFiles.growth >= 0 ? 'up' : 'down'}
            gradient="bg-gradient-to-br from-purple-400 to-purple-600"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          />
         
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Growth Chart */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Monthly Growth</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Files</span>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {monthlyGrowth.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No data available</p>
              ) : (
                monthlyGrowth.map((stat, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700 w-12">{stat.month}</span>
                      <div className="flex-1 space-y-2">
                        <div className="relative">
                          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out group-hover:from-blue-600 group-hover:to-blue-700" 
                              style={{ width: `${Math.min((stat.users / maxUsers) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="absolute -top-6 right-0 text-xs font-medium text-gray-600">{stat.users}</span>
                        </div>
                        <div className="relative">
                          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out group-hover:from-purple-600 group-hover:to-purple-700" 
                              style={{ width: `${Math.min((stat.files / maxFiles) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="absolute -top-6 right-0 text-xs font-medium text-gray-600">{stat.files}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, idx) => {
                  const { icon: Icon, bg, color } = getActivityIcon(activity.action);
                  return (
                    <div key={idx} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`p-2.5 rounded-xl ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{getTimeAgo(activity.time)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
}