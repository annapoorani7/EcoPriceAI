import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    hotelName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (Object.values(formData).some((field) => !field)) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');

      const payload = {
        name: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        hotel: formData.hotelName,
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-form-panel">
          <div className="register-header">
            <p className="register-eyebrow">Create account</p>
            <h2>Register your eco-hotel</h2>
            <p className="register-subtext">Join EcoPrice AI and start optimizing pricing for your eco-resort in India.</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}

            <div className="register-grid">
              <div>
                <label className="field-label" htmlFor="hotelName">Hotel Name</label>
                <input id="hotelName" name="hotelName" value={formData.hotelName} onChange={handleChange} placeholder="Western Ghats Eco Retreat" />
              </div>
              <div>
                <label className="field-label" htmlFor="ownerName">Owner Name</label>
                <input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div>
                <label className="field-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="owner@example.com" />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="full-width">
                <label className="field-label" htmlFor="location">Location</label>
                <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Munnar, Kerala" />
              </div>
              <div>
                <label className="field-label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create password" />
              </div>
              <div>
                <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="register-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="register-visual-panel">
          <div className="register-visual-card">
            <div className="visual-pill">Smart hospitality</div>
            <h3>Bring your property online with intelligent pricing.</h3>
            <div className="register-illustration">
              <div className="illustration-mountain" />
              <div className="illustration-tree tree-a" />
              <div className="illustration-tree tree-b" />
              <div className="illustration-hotel" />
              <div className="illustration-chart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
