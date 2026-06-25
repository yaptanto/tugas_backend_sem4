import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({ nama: '', email: '', pesan: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);
    setFormData({ nama: '', email: '', pesan: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="contact-main">

      {/* Custom Alert */}
      {showAlert && (
        <div className="alert-overlay" onClick={() => setShowAlert(false)}>
          <div className="alert-box" onClick={(e) => e.stopPropagation()}>
            <div className="alert-icon">✓</div>
            <h3 className="alert-title">Pesan Terkirim!</h3>
            <p className="alert-message">Terimakasih atas masukan Anda</p>
            <button className="alert-btn" onClick={() => setShowAlert(false)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="contact-container">
        <form onSubmit={handleSubmit}>
          <div className="contact-form-grup">
            <label htmlFor="nama">Masukkan Nama</label><br />
            <input
              type="text" name="nama" id="nama"
              placeholder="Nama Anda"
              value={formData.nama}
              onChange={handleChange}
            />
          </div>
          <div className="contact-form-grup">
            <label htmlFor="email">Masukkan Email</label><br />
            <input
              type="email" name="email" id="email"
              placeholder="Email Anda"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="contact-form-grup">
            <label htmlFor="pesan">Pesan Keluhan</label><br />
            <input
              type="text" name="pesan" id="pesan"
              placeholder="Pesan atau Keluhan Anda"
              className="contact-keluhan"
              value={formData.pesan}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ margin: 'auto 40%' }}>
            Kirim
          </button>
        </form>
      </div>

      <div className="contact-container-contact">
        <div>untuk bagian administrasi bisa menghubungi</div>
        <div>Via Whatsapp</div>
        <div><img src="/asset/logo_sosmed/whatsapp.png" alt="" />+6289509450345</div>
        <div>Via Telegram</div>
        <div><img src="/asset/logo_sosmed/telegram.png" alt="" />+6289509450345</div>
        <div>Via Email</div>
        <div><img src="/asset/logo_sosmed/gmail.png" alt="" />rast777@gmail.com</div>
      </div>
    </main>
  );
};

export default Contact;