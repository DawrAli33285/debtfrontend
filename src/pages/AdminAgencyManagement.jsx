import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Mail, Calendar, CheckCircle, XCircle, Shield, Phone } from 'lucide-react';
import { BASE_URL } from '../api/auth';

export default function AgencyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAgency, setEditingAgency] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact_email: '', contact_phone: '', password: '' });
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { getAgencies(); }, []);

  const getAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/admin/getAgencies`);
      const data = await response.json();
      console.log("DATA")
      console.log(data)
      setAgencies(data.agencies || data || []);
    } catch (e) {
      setError('Failed to load agencies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = (agencies || []).filter(a =>
    a?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a?.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (agency) => {
    setSearchTerm('');
    setEditingAgency(agency._id);
    setFormData({
        name: agency.name || '',
        contact_email: agency.contact_email || '',
        contact_phone: agency.contact_phone || '',
        password: '',
      });
  };

  const handleSave = async () => {
    try {
        const updateData = {
            name: formData.name,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
          };
          if (formData.password) updateData.password = formData.password;
    
          const response = await fetch(`${BASE_URL}/admin/updateAgency/${editingAgency}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
      const data = await response.json();
      setAgencies(agencies.map(a => a._id === editingAgency ? { ...a, ...formData } : a));
      setEditingAgency(null);
      alert('Agency updated successfully');
    } catch (e) {
      alert('Failed to update agency. Please try again.');
    }
  };

  const handleDelete = async (agencyId) => {
    if (!agencyId) return;
    if (!window.confirm('Are you sure you want to delete this agency?')) return;
    try {
      await fetch(`${BASE_URL}/admin/deleteAgency/${agencyId}`, { method: 'DELETE' });
      setAgencies(agencies.filter(a => a._id !== agencyId));
      alert('Agency deleted successfully');
    } catch (e) {
      alert('Failed to delete agency. Please try again.');
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const planBadgeColor = (plan) => {
    if (plan === 'enterprise')   return 'bg-purple-100 text-purple-700';
    if (plan === 'professional') return 'bg-blue-100 text-blue-700';
    if (plan === 'growth')       return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Agency Management</h1>
        <p className="text-gray-600">Manage all agencies and their settings</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading agencies...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button onClick={getAgencies} className="mt-2 text-red-700 underline">Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search */}
          {!editingAgency && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  autoComplete="off"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Agency</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Password</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgencies.length === 0 ? (
                    <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No agencies found</td>
                    </tr>
                  ) : (
                    filteredAgencies.map((agency) => (
                      <tr key={agency._id} className="hover:bg-gray-50 transition-colors">

                        {/* Agency Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {(agency.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              {editingAgency === agency._id ? (
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  placeholder="Agency name"
                                  autoComplete="off"
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                                />
                              ) : (
                                <p className="font-medium text-gray-800">{agency.name}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          {editingAgency === agency._id ? (
                            <div className="space-y-1">
                              <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder="Email"
                                autoComplete="new-password"
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                              />
                              <input
                                type="text"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                placeholder="Phone"
                                autoComplete="off"
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <Mail className="w-3 h-3" /> {agency.contact_email || '—'}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 text-xs">
                                <Phone className="w-3 h-3" /> {agency.contact_phone || '—'}
                              </div>
                            </div>
                          )}
                        </td>

                      {/* Password */}
                      <td className="px-6 py-4">
                          {editingAgency === agency._id ? (
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Leave blank to keep"
                              autoComplete="new-password"
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">••••••••</span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formatDate(agency.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {editingAgency === agency._id ? (
                              <>
                                <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                 onClick={() => { setEditingAgency(null); setFormData({ name: '', contact_email: '', contact_phone: '', password: '' }); }}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(agency)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(agency._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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