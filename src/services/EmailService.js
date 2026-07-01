import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.envMode = this.detectEnvironment();

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.fromEmail = process.env.SMTP_USER;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    console.log(`\n📧 EmailService initialized (mode: ${this.envMode})`);
    console.log(`📧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
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
      const info = await this.transporter.sendMail(mailOptions);
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
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error.message);
      return false;
    }
  }
}

export default EmailService;
