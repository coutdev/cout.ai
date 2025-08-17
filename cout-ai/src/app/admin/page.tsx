'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
  UsersIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';

interface UserApproval {
  id: string;
  email: string;
  password: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  todayRequests: number;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<UserApproval[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UserApproval[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    todayRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UserApproval | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'deny' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { user, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email?.includes('admin') || user?.email === 'your-admin-email@example.com';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !isAdmin) {
      router.push('/');
      return;
    }

    if (user && isAdmin) {
      loadDashboardData();
    }
  }, [user, authLoading, isAdmin, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all user approval requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_approvals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (requestsError) throw requestsError;

      setRequests(requestsData || []);
      setFilteredRequests(requestsData || []);

      // Calculate stats
      const total = requestsData?.length || 0;
      const pending = requestsData?.filter(r => r.status === 'pending').length || 0;
      const approved = requestsData?.filter(r => r.status === 'approved').length || 0;
      const denied = requestsData?.filter(r => r.status === 'denied').length || 0;
      
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = requestsData?.filter(r => 
        r.requested_at.split('T')[0] === today
      ).length || 0;

      setStats({ total, pending, approved, denied, todayRequests });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterRequests(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterRequests(searchTerm, status);
  };

  const filterRequests = (search: string, status: string) => {
    let filtered = requests;

    if (search) {
      filtered = filtered.filter(request =>
        request.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }

    setFilteredRequests(filtered);
  };

  const openActionModal = (request: UserApproval, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setModalAction(action);
    setAdminNotes(action === 'approve' ? 'Welcome to Cout.AI!' : '');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedRequest || !modalAction) return;

    setActionLoading(selectedRequest.id);
    try {
      const functionName = modalAction === 'approve' ? 'approve_user' : 'deny_user';
      
      const { data, error } = await supabase.rpc(functionName, {
        user_email: selectedRequest.email,
        admin_message: adminNotes || (modalAction === 'approve' ? 'Approved by administrator' : 'Denied by administrator')
      });

      if (error) throw error;

      // Reload data to get updated status
      await loadDashboardData();

      // Close modal
      setShowModal(false);
      setSelectedRequest(null);
      setModalAction(null);
      setAdminNotes('');

    } catch (error) {
      console.error(`Error ${modalAction}ing user:`, error);
      alert(`Error ${modalAction}ing user. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'denied':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen gradient-bg-subtle flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-subtle">
      {/* Header */}
      <div className="relative border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Back to App</span>
        </button>

        {/* Theme Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-3">
          <ColorPicker />
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user registration approvals for Cout.AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Denied</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.denied}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registration Requests ({filteredRequests.length})
            </h2>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {request.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.requested_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {request.processed_at ? formatDate(request.processed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openActionModal(request, 'approve')}
                              disabled={actionLoading === request.id}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'deny')}
                              disabled={actionLoading === request.id}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              Deny
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            {request.status === 'approved' ? 'Approved' : 'Denied'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {modalAction === 'approve' ? 'Approve User' : 'Deny User'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Email: <span className="font-medium">{selectedRequest.email}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Requested: {formatDate(selectedRequest.requested_at)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder={modalAction === 'approve' 
                    ? 'Welcome message (optional)' 
                    : 'Reason for denial (optional)'
                  }
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading === selectedRequest.id}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`flex-1 ${modalAction === 'approve' ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium transition-colors'}`}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    modalAction === 'approve' ? 'Approve User' : 'Deny User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 