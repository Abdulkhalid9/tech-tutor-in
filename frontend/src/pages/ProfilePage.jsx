/**
 * Profile Page
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    tutorProfile: {
      expertise: user?.tutorProfile?.expertise?.join(', ') || '',
      bio: user?.tutorProfile?.bio || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tutorProfile.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        tutorProfile: { ...formData.tutorProfile, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { name: formData.name };
      if (user.role === 'tutor') {
        updateData.tutorProfile = {
          expertise: formData.tutorProfile.expertise.split(',').map(s => s.trim()).filter(Boolean),
          bio: formData.tutorProfile.bio
        };
      }
      
      const response = await authApi.updateProfile(updateData);
      updateUser(response.data.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user?.name}</h2>
            <span className="role-badge">{user?.role}</span>
            {user?.role === 'tutor' && (
              <span className={`approval-badge ${user?.tutorProfile?.approvalStatus}`}>
                {user?.tutorProfile?.approvalStatus}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
            />
            <small>Email cannot be changed</small>
          </div>

          {user?.role === 'tutor' && (
            <>
              <div className="form-group">
                <label>Expertise (comma-separated)</label>
                <input
                  type="text"
                  name="tutorProfile.expertise"
                  value={formData.tutorProfile.expertise}
                  onChange={handleChange}
                  placeholder="Mathematics, Physics, Chemistry"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="tutorProfile.bio"
                  value={formData.tutorProfile.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {user?.tutorProfile?.approvalStatus === 'approved' && (
                <div className="form-group">
                  <label>Earnings</label>
                  <p className="earnings">₹{user?.tutorProfile?.earnings || 0}</p>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
