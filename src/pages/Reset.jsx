import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/Reset.css';
import '../styles/Animations.css';

const Reset = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!formData.emailOrUsername.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      setError('Semua field harus diisi');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Reset password gagal');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password berhasil direset! Silakan login dengan password baru.');
      setFormData({ emailOrUsername: '', newPassword: '', confirmPassword: '' });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="anim-logo-fall-container">
        <img src="/asset/logo_game/coc.png" alt="logo" className="anim-falling-logo" />
        <img src="/asset/logo_game/mlbb.png" alt="logo" className="anim-falling-logo" />
        <img src="/asset/logo_game/valorant.png" alt="logo" className="anim-falling-logo" />
        <img src="/asset/logo_game/roblox.png" alt="logo" className="anim-falling-logo" />
      </div>

      <main className='reset-main'>
        <div className="reset-container">
          <h2>Reset Password</h2>

          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailOrUsername" className="form-label">Username/Email</label>
              <input
                type="text"
                className="form-control"
                id="emailOrUsername"
                placeholder="Enter your username/email"
                value={formData.emailOrUsername}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>

            <div className="row mt-3">
              <div className="col-6 reset-link">
                <div className="mb-3">
                  <div className="login-link">
                    <Link to="/login">Login</Link>
                  </div>
                </div>
              </div>
              <div className="col-6 text-end">
                <div className="mb-3">
                  <div className="register-link">
                    <Link to="/register">Don't have an account? Register</Link>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </>
  );
};

export default Reset;
