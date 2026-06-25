import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PointContext } from "../components/PointContext";
import Notification from "../components/Notification";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from '../utils/api.js';
import "../styles/Voucher.css";

const Voucher = () => {
  const [inputCode, setInputCode] = useState("");
  const [notif, setNotif] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { addPoints } = useContext(PointContext);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);

    let timer;

    api.get('/api/vouchers/active')
      .then(res => res.json())
      .then(result => {
        if (!result.success || !result.data?.length) return;

        result.data.forEach((v, i) => {
          timer = setTimeout(() => {
            setNotif({
              msg: `Kode ${v.code} = ${v.rewardValue} poin`,
              id: Date.now() + i
            });
          }, i * 3000);
        });
      })
      .catch(() => {});

    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    const sessionData = sessionStorage.getItem('userData');
    if (!sessionData) {
      setNotif({ msg: "Silakan login terlebih dahulu.", id: Date.now() });
      return;
    }
    const user = JSON.parse(sessionData);

    try {
      const response = await api.post('/api/redeem', { userId: user.id, code: inputCode });
      const result = await response.json();

      if (result.success) {
        addPoints(result.newPoints - user.points); // Update context UI
        
        // Update session storage
        user.points = result.newPoints;
        sessionStorage.setItem('userData', JSON.stringify(user));

        setNotif({ msg: result.message, id: Date.now() });
        setTimeout(() => navigate("/point"), 2000);
      } else {
        setNotif({ msg: result.message, id: Date.now() });
      }
    } catch (_) {
      setNotif({ msg: `Gagal terhubung ke server: ${_.message}`, id: Date.now() });
    }
  };

  return (
    <>
      <main className="redeem-section">
        {/* Tampilkan notifikasi jika state notif terisi */}
        {notif && <Notification key={notif.id} msg={notif.msg} />}

        <div className="container text-center">
          <h1 className="page-heading">Redeem Code</h1>

          {isLoggedIn ? (
            <div className="redeem-box">
              <div className="redeem-icon mb-3">
                <i className="bi bi-ticket-perforated"></i>
              </div>

              <p className="mb-3 fs-5">Enter your voucher code</p>

              <form onSubmit={handleRedeem}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <p className="privacy-text mb-3">
                  By clicking "Redeem Code", you agree to our
                  <a href="#"> Privacy Policy</a>.
                </p>

                <button
                  type="submit"
                  className="btn btn-primary voucher-btn-redeem w-100"
                >
                  Redeem Code
                </button>
              </form>
            </div>
          ) : (
            <div className="redeem-box">
              <div className="redeem-icon mb-3">
                <i className="bi bi-lock-fill"></i>
              </div>
              <h3 className="mb-3" style={{ fontFamily: 'Audiowide, sans-serif', color: '#fff' }}>
                Login Required
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', marginBottom: '1.5rem' }}>
                You must be logged in to redeem voucher codes.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" className="auth-btn login-btn">Login</Link>
                <Link to="/register" className="auth-btn register-btn">Register</Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Voucher;
