import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || user?.email || 'Current account',
    email: user?.email || 'Not available',
    hotel: 'Not available',
    phone: 'Not available',
    location: 'Not available',
    bio: 'Profile details available from your account.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
              <span>{(profile.name || 'A').slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p>{profile.hotel}</p>
          </div>
          <button
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
          </div>

          <div className="profile-section">
            <h3>Hotel Information</h3>
            <div className="form-group">
              <label>Hotel Name</label>
              <input
                type="text"
                name="hotel"
                value={profile.hotel}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="save-btn">Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
