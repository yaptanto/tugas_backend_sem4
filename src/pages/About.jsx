import React from 'react';
import '../styles/About.css';
const About = () => {
  return (
    <>

      <main className="about-main">
        <div className="about-container">
          <img src="/asset/logo.png" alt="logo.png" />
          <h3>Untuk Halaman "Tentang Kami" (About Us)</h3>
          <p className="about-isi-dalam">
            Halaman ini bertujuan untuk membangun kepercayaan dan memberi tahu pelanggan siapa Anda.
          </p>
          <br />
          <h3>Tentang Rast7</h3>
          <p>Selamat datang di Rast7!</p>
          <p>Kami adalah platform top-up game tepercaya Anda, 
          didirikan oleh sesama gamer yang mengerti pentingnya kecepatan dan kemudahan dalam bermain. 
          Kami tahu bahwa setiap detik dalam permainan sangat berharga. 
          Itulah mengapa misi kami adalah menyediakan layanan top-up yang instan, aman, dan tanpa ribet.</p>
          <br />
          <p>Di Rast7, kami berkomitmen untuk memberikan pengalaman terbaik bagi para gamer di Indonesia. Kami percaya bahwa top-up seharusnya tidak rumit.</p>
          <br /><br />
          <div className="about-isi">
            <ul><strong>Mengapa Memilih Rast7?</strong>
              <li>
                <strong>Proses Cepat & Instan:</strong> Pesanan Anda diproses secara otomatis 24/7. 
                Setelah pembayaran berhasil, 
                top-up akan langsung masuk ke akun game Anda dalam hitungan detik.
              </li>
              <li>
                <strong>Pembayaran Aman & Lengkap:</strong> Kami menyediakan berbagai metode pembayaran populer (seperti e-wallet, virtual account bank, dan lainnya) yang didukung oleh sistem keamanan terenkripsi untuk menjamin keamanan transaksi Anda.
              </li>
              <li>
                <strong>Harga Kompetitif:</strong> Kami selalu berusaha memberikan harga terbaik dan paling bersaing untuk semua game favorit Anda.
              </li>
              <li>
                <strong>Layanan Pelanggan Andal:</strong> Tim support kami siap membantu Anda jika Anda mengalami kendala atau memiliki pertanyaan.
              </li>
            </ul>
          </div>
          <br />
          Terima kasih telah menjadikan Rast7 sebagai partner top-up Anda. Selamat bermain!
        </div>
      </main>
    </>
  );
};

export default About;