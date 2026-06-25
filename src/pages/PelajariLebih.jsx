import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PelajariLebih.css';

const PelajariLebih = () => {
  return (
    <>
<main className="pelajari-main">
        <div className="pelajari-container">
          <div className="pelajari-logo">
            <img src="/asset/logo.png" alt="icon_game" width="120px" />
          </div>
          <div className="pelajari-isi-container">
            <h4>"Pelajari Lebih Lanjut" (Learn More)</h4>
            <br />
            <h4>Pelajari Cara Top Up di Rast7</h4>
            <br />
            <p>
              Top-up di Rast7 sangat mudah! 
              Kami telah merancang proses yang sederhana agar Anda bisa kembali ke permainan secepat mungkin. 
              Ikuti 3 langkah mudah di bawah ini:
            </p>
          </div>
          <div>
            <ol>
              <li><strong>Pilih Game & Masukkan ID Anda</strong></li>
              <ul>
                <li>Pilih game favorit Anda dari daftar yang kami sediakan.</li>
                <li>
                  Masukkan User ID dan Server/Zone ID Anda (jika diperlukan). 
                  Pastikan Anda memasukkannya dengan benar untuk menghindari kesalahan.
                </li>
              </ul>
              <li><strong>Pilih Nominal & Metode Pembayaran</strong></li>
              <ul>
                <li>Pilih jumlah diamond, UC, atau mata uang game yang Anda inginkan.</li>
                <li>
                  Pilih metode pembayaran yang paling nyaman untuk Anda. 
                  Kami menyediakan berbagai opsi mulai dari e-wallet (DANA, OVO, GoPay) hingga transfer bank.
                </li>
              </ul>
              <li><strong>Selesaikan Pembayaran & Top-Up Masuk!</strong></li>
              <ul>
                <li>Lakukan pembayaran sesuai instruksi yang muncul di layar.</li>
                <li>
                  Setelah pembayaran terkonfirmasi, sistem kami akan segera memproses pesanan Anda. 
                  Top-up akan masuk secara otomatis ke akun game Anda dalam hitungan detik!
                </li>
              </ul>
            </ol>
          </div>
          <div>
            <strong className="pelajari-center">Masih Bingung?</strong><br />
            Jika Anda memiliki pertanyaan lebih lanjut, 
            jangan ragu untuk mengunjungi halaman 
            <Link to="/faq">FAQ (Tanya Jawab)</Link> kami atau langsung hubungi 
            <Link to="/contact">Layanan Pelanggan</Link> kami. Kami siap membantu!
          </div>
        </div>
      </main>

  
    </>
  );
};

export default PelajariLebih;