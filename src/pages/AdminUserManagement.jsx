import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { BASE_URL } from '../api/auth';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', business_name: '', contact_name: '' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/admin/getUsers`);
      const data = await response.json();
      console.log('API Response:', data);
      setUsers(data.users || data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || []).filter(user =>
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
      setSearchTerm('');  
    setEditingUser(user._id);
    setFormData({
      email: user.email || '',
      password: '',
      business_name: user.business_name || '',
      contact_name: user.contact_name || '',
    });
  };

  const handleSave = async () => {
    try {
      const updateData = {
        email: formData.email,
        business_name: formData.business_name,
        contact_name: formData.contact_name,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${BASE_URL}/admin/updateUser/${editingUser}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      setUsers(users.map(u => u._id === editingUser ? { ...u, ...updateData } : u));
      setEditingUser(null);
      setFormData({ email: '', password: '', business_name: '', contact_name: '' });
      alert('User updated successfully');
    } catch (e) {
      console.error('Error updating user:', e);
      alert('Failed to update user. Please try again.');
    }
  };





  const handleDelete = async (userId) => {
    if (!userId) { alert('Error: User ID is undefined'); return; }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${BASE_URL}/admin/deleteUser/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully');
    } catch (e) {
      console.error('Error deleting user:', e);
      alert('Failed to delete user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const planBadgeColor = (plan) => {
    if (plan === 'unlimited') return 'bg-purple-100 text-purple-700';
    if (plan === 'growth')    return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users and their access permissions</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button onClick={getUsers} className="mt-2 text-red-700 underline hover:text-red-800">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search */}
          {!editingUser && <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or business name..."
                value={searchTerm}
                autoComplete="off"      
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Password</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">

                        {/* Business / Contact */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {(user.business_name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              {editingUser === user._id ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    placeholder="Business name"
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                                  />
                                  <input
                                    type="text"
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="Contact name"
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-gray-800">{user.business_name || '—'}</p>
                                  <p className="text-xs text-gray-500">{user.contact_name || '—'}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          {editingUser === user._id ? (
                             <input
                             type="email"
                             value={formData.email}
                             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                             autoComplete="new-password"
                             className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Password */}
                        <td className="px-6 py-4">
                          {editingUser === user._id ? (
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Leave blank to keep"
                              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">••••••••</span>
                          )}
                        </td>

                        {/* Plan */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${planBadgeColor(user.subscription_plan)}`}>
                            {user.subscription_plan || 'starter'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formatDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {editingUser === user._id ? (
                              <>
                                <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', business_name: '', contact_name: '' }); }}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                             
                                <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

     
   
    </div>
  );
}