/**
 * Admin Dashboard
 */

import { useState, useEffect } from 'react';
import { adminApi } from '../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ role: 'tutor', approvalStatus: 'pending' })
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, status) => {
    try {
      await adminApi.approveTutor(userId, status);
      toast.success(`Tutor ${status}!`);
      loadData();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats?.users || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.questions || 0}</h3>
          <p>Questions</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.answers || 0}</h3>
          <p>Answers</p>
        </div>
        <div className="stat-card">
          <h3>₹{stats?.totalEarnings || 0}</h3>
          <p>Total Earnings</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Pending Tutor Approvals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No pending approvals.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.tutorProfile?.approvalStatus || 'pending'}</td>
                  <td>
                    <button 
                      onClick={() => handleApprove(user._id, 'approved')}
                      className="btn btn-sm btn-primary"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApprove(user._id, 'rejected')}
                      className="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
