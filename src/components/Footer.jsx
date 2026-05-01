import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-footer">
      <div className="footer-container-1">
        <div className="footer-container">
          <div className="footer-title">Untuk Penerbit</div>
          <ul className="footer-list">
            <li><Link to="/pelajari-lebih">Pelajari lebih lanjut tentang kami</Link></li>
            <li><Link to="/about">About us</Link></li>
          </ul>
        </div>
        <div className="footer-container">
          <div className="footer-title">Butuh Bantuan?</div>
          <div className="footer-list">
            <a href="/contact"><button type="button" className="btn btn-secondary">Hubungi Kami ☎️</button></a>
          </div>
        </div>
        <div className="footer-container">
          <div className="footer-title">Area</div>
          <div className="footer-list">
            <button type="button" className="btn btn-secondary">🇮🇩 Indonesia 🌐</button>
          </div>
        </div>
        <div className="footer-container">
          <div className="footer-title">Dapatkan Berita RAST-7 di:</div>
          <div className="footer-list">
            <a href="#"><img src="/asset/logo_sosmed/facebook.png" alt="facebook.img" className="footer-img" /></a>
            <a href="#"><img src="/asset/logo_sosmed/instagram.png" alt="instagram.img" className="footer-img" /></a>
            <a href="#"><img src="/asset/logo_sosmed/youtube.png" alt="youtube.img" className="footer-img" /></a>
            <a href="#"><img src="/asset/logo_sosmed/tiktok.png" alt="tiktok.img" className="footer-img" /></a>
          </div>
        </div>
      </div>
      <div className="footer-copyright">&copy; RAST-7 Store 2025</div>
    </footer>
  );
};

export default Footer;
