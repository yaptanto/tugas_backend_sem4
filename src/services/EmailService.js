import nodemailer from 'nodemailer';
import dns from 'dns';
import net from 'net';

const IPV4_CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

class EmailService {
  constructor() {
    this.envMode = this.detectEnvironment();

    this.smtpHost = process.env.SMTP_HOST;
    this.smtpPort = Number(process.env.SMTP_PORT);

    this.fromEmail = process.env.SMTP_USER;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Cache hasil resolve IPv4, supaya tidak resolve DNS di setiap kirim email
    this._resolvedIp = null;
    this._resolvedAt = 0;

    console.log(`\n📧 EmailService initialized (mode: ${this.envMode})`);
    console.log(`📧 SMTP: ${this.smtpHost}:${this.smtpPort}`);
    console.log(`📧 Frontend URL: ${this.frontendUrl}\n`);

    // Test SMTP connection at startup (non-blocking, async)
    this.verifyConnection().then(ok => {
      if (ok) {
        console.log('✅ SMTP connection verified successfully');
      } else {
        console.warn('⚠️ SMTP connection FAILED — password reset emails will not work.');
        console.warn('⚠️ Check SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS variables.');
      }
    });
  }

  /**
   * Detect apakah environment production atau development.
   * Railway tidak otomatis set NODE_ENV, jadi kita deteksi dari env var Railway.
   */
  detectEnvironment() {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.RAILWAY_ENVIRONMENT) return 'production (Railway)';
    if (process.env.RAILWAY_SERVICE_NAME) return 'production (Railway)';
    return 'development';
  }

  isProduction() {
    return this.envMode.startsWith('production');
  }

  /**
   * Resolve SMTP_HOST ke alamat IPv4 secara manual.
   *
   * KENAPA INI PERLU:
   * nodemailer (v7+) me-resolve hostname ke IPv4 DAN IPv6 sekaligus, lalu
   * memilih salah satu SECARA RANDOM untuk konek. Opsi `family: 4` di
   * createTransport() TIDAK dibaca sama sekali oleh SMTP transport, jadi
   * tidak ada efeknya.
   *
   * Di Railway, container biasanya tidak punya outbound route ke IPv6,
   * jadi begitu nodemailer random-pick alamat IPv6 Gmail, koneksinya
   * gagal dengan ENETUNREACH — persis seperti yang muncul di log.
   *
   * Solusinya: resolve ke IPv4 duluan pakai dns.resolve4(), lalu kirim
   * hasilnya (IP literal) sebagai `host` ke nodemailer. Kalau host yang
   * dikasih sudah berupa IP, nodemailer tidak akan resolve ulang / pilih
   * random lagi — otomatis selalu pakai IPv4.
   */
  async resolveSmtpHost() {
    const now = Date.now();

    // Kalau host sudah IP literal, tidak perlu resolve
    if (net.isIP(this.smtpHost)) {
      return this.smtpHost;
    }

    if (this._resolvedIp && now - this._resolvedAt < IPV4_CACHE_TTL_MS) {
      return this._resolvedIp;
    }

    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(this.smtpHost, (err, addrs) => {
          if (err || !addrs || !addrs.length) {
            return reject(err || new Error('Tidak ada A record (IPv4) ditemukan'));
          }
          resolve(addrs);
        });
      });

      this._resolvedIp = addresses[0];
      this._resolvedAt = now;
      console.log(`📧 Resolved ${this.smtpHost} -> ${this._resolvedIp} (IPv4, dipaksa)`);
      return this._resolvedIp;
    } catch (err) {
      console.warn(`⚠️ Gagal resolve IPv4 untuk ${this.smtpHost}: ${err.message}`);
      console.warn('⚠️ Fallback ke hostname asli (bisa saja tetap kena masalah IPv6 di Railway).');
      return this.smtpHost;
    }
  }

  /**
   * Buat transporter baru dengan host yang sudah dipastikan IPv4.
   * `tls.servername` tetap diisi hostname asli supaya validasi
   * sertifikat SSL/TLS Gmail tidak gagal (karena kita connect via IP).
   */
  async getTransporter() {
    const connectHost = await this.resolveSmtpHost();

    return nodemailer.createTransport({
      host: connectHost,
      port: this.smtpPort,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        servername: this.smtpHost,
      },
      connectionTimeout: 15000,
    });
  }

  /**
   * Kirim email reset password
   * @param {string} to - Email tujuan
   * @param {string} token - Reset token
   */
  async sendResetEmail(to, token) {
    const resetLink = `${this.frontendUrl}/reset-password/${token}`;

    const mailOptions = {
      from: `"Rast7" <${this.fromEmail}>`,
      to,
      subject: 'Reset Password - Rast7',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #6C63FF, #3F3D9E); padding: 32px 24px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .body { padding: 32px 24px; }
            .body p { color: #555; line-height: 1.6; margin: 0 0 16px; font-size: 14px; }
            .btn { display: block; background: #6C63FF; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; margin: 24px 0; }
            .btn:hover { background: #5A52E0; }
            .footer { padding: 24px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
            .note { background: #FFF3E0; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #E65100; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password</h1>
            </div>
            <div class="body">
              <p>Halo,</p>
              <p>Kami menerima permintaan reset password untuk akun Rast7 Anda. Klik tombol di bawah untuk melanjutkan:</p>
              <a href="${resetLink}" class="btn">Reset Password</a>
              <div class="note">
                ⏰ Link ini berlaku selama <strong>15 menit</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
              </div>
              <p>Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser:</p>
              <p style="font-size: 12px; word-break: break-all; color: #6C63FF;">${resetLink}</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Rast7. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`\n🔐 Reset token untuk ${to}: ${token}`);
    console.log(`🔐 Link: ${resetLink}\n`);

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email terkirim ke ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Gagal kirim email:', error.message);

      if (this.isProduction()) {
        throw new Error('Gagal mengirim email reset password. Silakan coba lagi.');
      }

      // Dev mode: jangan gagalkan request, user bisa pakai link di log
      console.log('⚠️ [DEV] Email gagal dikirim, tapi token sudah di-log di atas.');
      console.log('⚠️ [DEV] Buka link di atas di browser untuk reset password.');
      return false;
    }
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection() {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error.message);
      return false;
    }
  }
}

export default EmailService;