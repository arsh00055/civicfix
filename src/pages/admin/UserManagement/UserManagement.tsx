import React, { useState, useEffect, Suspense } from 'react';
import { usersAPI, adminAPI } from '../../../services/api/endpoints';
import type { User } from '../../../types';
import Header from '../../../components/layout/Header/Header';
import { useAppSelector } from '../../../app/store/hooks';
import Sidebar from '../../../components/layout/sidebar/Sidebar';

// Lazy-loaded components
import {
  UserManagementHeader,
  ErrorBanner,
  UserStats,
  UserFilters,
  UsersTable,
  LoadingState,
  ErrorState
} from './components/lazy';

interface UserManagementProps {
  role: string | null;
}

type UserRole = 'citizen' | 'volunteer' | 'admin';

const UserManagementPage: React.FC<UserManagementProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getUsers();
      setUsers(response.data);
      
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUser(userId);
      
      await usersAPI.updateUserRole(userId, newRole);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRetry = () => {
    fetchUsers();
  };

  // Loading state
  if (loading && !users.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !users.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 pb-8">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <UserManagementHeader onRefresh={handleRetry} />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onDismiss={() => setError(null)} />
              </Suspense>

              {/* Stats */}
              <Suspense fallback={<div>Loading stats...</div>}>
                <UserStats users={users} />
              </Suspense>

              {/* Filters */}
              <Suspense fallback={<div>Loading filters...</div>}>
                <UserFilters
                  searchTerm={searchTerm}
                  roleFilter={roleFilter}
                  onSearchChange={handleSearch}
                  onRoleFilterChange={setRoleFilter}
                  onClearFilters={handleClearFilters}
                />
              </Suspense>

              {/* Users Table */}
              <Suspense fallback={<div>Loading users table...</div>}>
                <UsersTable
                  users={filteredUsers}
                  updatingUser={updatingUser}
                  onUpdateRole={updateUserRole}
                  onDeleteUser={deleteUser}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementPage;