import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [alertData, setAlertData] = useState(null);
  const [isLoggedIn] = useState(() => {
    const token = sessionStorage.getItem('authToken');
    const stored = sessionStorage.getItem('currentUser');
    return !!(token && stored);
  });

  const [formData, setFormData] = useState(() => {
    const stored = sessionStorage.getItem('currentUser');
    let username = '';
    let email = '';
    if (stored) {
      try {
        const u = JSON.parse(stored);
        username = u.username || '';
        email = u.email || '';
      } catch (err) {
        console.error('Error parsing stored user details:', err);
      }
    }
    return { nama: username, email: email, pesan: '' };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      setAlertData({
        type: 'error',
        title: 'Harus Login',
        message: 'Silakan login terlebih dahulu untuk mengirim masukan/keluhan.'
      });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: formData.nama,
          pesan: formData.pesan
        })
      });
      const json = await res.json();
      if (json.success) {
        setAlertData({
          type: 'success',
          title: 'Pesan Terkirim!',
          message: json.message || 'Terimakasih atas masukan Anda.'
        });
        setFormData(p => ({ ...p, pesan: '' }));
      } else {
        setAlertData({
          type: 'error',
          title: 'Gagal Mengirim',
          message: json.message || 'Terjadi kesalahan saat mengirim pesan.'
        });
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setAlertData({
        type: 'error',
        title: 'Koneksi Error',
        message: 'Gagal menghubungi server. Silakan coba lagi.'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="contact-main">

      {/* Custom Alert */}
      {alertData && (
        <div className="alert-overlay" onClick={() => setAlertData(null)}>
          <div className="alert-box" onClick={(e) => e.stopPropagation()}>
            <div className={`alert-icon ${alertData.type === 'error' ? 'alert-icon--error' : ''}`}>
              {alertData.type === 'error' ? '✕' : '✓'}
            </div>
            <h3 className="alert-title">{alertData.title}</h3>
            <p className="alert-message">{alertData.message}</p>
            <div style={{ marginTop: '10px' }}>
              <button className="alert-btn" onClick={() => setAlertData(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="contact-container">
        <form onSubmit={handleSubmit}>
          {!isLoggedIn && (
            <div className="contact-auth-warning">
              Silakan login terlebih dahulu untuk mengirim keluhan/masukan.
            </div>
          )}
          <div className="contact-form-grup">
            <label htmlFor="nama">Nama Pengguna</label><br />
            <input
              type="text" name="nama" id="nama"
              placeholder="Nama Anda"
              value={formData.nama}
              onChange={handleChange}
              disabled={true}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <div className="contact-form-grup">
            <label htmlFor="email">Email</label><br />
            <input
              type="email" name="email" id="email"
              placeholder="Email Anda"
              value={formData.email}
              onChange={handleChange}
              disabled={true}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <div className="contact-form-grup">
            <label htmlFor="pesan">Pesan Keluhan</label><br />
            <input
              type="text" name="pesan" id="pesan"
              placeholder={isLoggedIn ? "Tulis masukan atau keluhan Anda di sini" : "Login diperlukan"}
              className="contact-keluhan"
              value={formData.pesan}
              onChange={handleChange}
              disabled={!isLoggedIn}
              required
            />
          </div>
          <button type="submit" className="contact-submit-btn" disabled={!isLoggedIn} style={!isLoggedIn ? { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' } : {}}>
            Kirim Pesan
          </button>
        </form>
      </div>

      <div className="contact-container-contact">
        <h2 className="contact-title-admin">Kontak Administrasi</h2>
        <p className="contact-desc-admin">Untuk bagian administrasi, Anda dapat menghubungi kami melalui:</p>
        
        <div className="contact-methods-list">
          <div className="contact-method-item">
            <span className="contact-method-label">Via Whatsapp</span>
            <a href="https://wa.me/6289509450345" target="_blank" rel="noopener noreferrer" className="contact-method-link">
              <img src="/asset/logo_sosmed/whatsapp.png" alt="Whatsapp Logo" />
              <span>+6289509450345</span>
            </a>
          </div>
          
          <div className="contact-method-item">
            <span className="contact-method-label">Via Telegram</span>
            <a href="https://t.me/6289509450345" target="_blank" rel="noopener noreferrer" className="contact-method-link">
              <img src="/asset/logo_sosmed/telegram.png" alt="Telegram Logo" />
              <span>+6289509450345</span>
            </a>
          </div>
          
          <div className="contact-method-item">
            <span className="contact-method-label">Via Email</span>
            <a href="mailto:rast777@gmail.com" className="contact-method-link">
              <img src="/asset/logo_sosmed/gmail.png" alt="Gmail Logo" />
              <span>rast777@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;