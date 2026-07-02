import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/Reset.css';

const Reset = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    oldPassword: '',
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

    if (!formData.emailOrUsername.trim() || !formData.oldPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
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
      const response = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Gagal mengubah password');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password berhasil diubah! Silakan login dengan password baru.');
      setFormData({ emailOrUsername: '', oldPassword: '', newPassword: '', confirmPassword: '' });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Change password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
<main className='reset-main'>
        <div className="reset-container">
          <h2>Ubah Password</h2>

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
              <label htmlFor="emailOrUsername" className="form-label">Email / Username</label>
              <input
                type="text"
                className="form-control"
                id="emailOrUsername"
                placeholder="Masukkan email atau username"
                value={formData.emailOrUsername}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label">Password Lama</label>
              <input
                type="password"
                className="form-control"
                id="oldPassword"
                placeholder="Masukkan password lama"
                value={formData.oldPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Password Baru</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="Masukkan password baru"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password Baru</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Konfirmasi password baru"
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
                  Mengubah...
                </>
              ) : 'Ubah Password'}
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
