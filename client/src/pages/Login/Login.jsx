import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-form-panel">
          <div className="login-form-header">
            <p className="login-eyebrow">Welcome back</p>
            <h2>Sign in to EcoPrice AI</h2>
            <p className="login-subtext">Access smart pricing insights for eco-tourism stays and events.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <div className="login-options">
              <label className="checkbox-row">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <Link to="/register">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="login-footer">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>

        <div className="login-visual-panel">
          <div className="visual-card">
            <div className="visual-badge">Eco-tourism intelligence</div>
            <h3>Plan smarter, travel lighter.</h3>
            <div className="visual-scene">
              <div className="scene-mountain" />
              <div className="scene-tree tree-one" />
              <div className="scene-tree tree-two" />
              <div className="scene-hotel" />
              <div className="scene-chart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
