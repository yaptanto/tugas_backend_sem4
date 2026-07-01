import express from 'express';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: User created with JWT token }
 *       400: { description: Validation error }
 */
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const newUser = await req.userService.register(email, username, password);
    res.json({ success: true, message: "User berhasil dibuat", data: newUser });
  } catch (err) {
    req.userService.errorResponse(res, err.message);
  }
});

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful with JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = await req.userService.login(username, password);
    res.json({ success: true, message: "Login berhasil", data: userData });
  } catch (err) {
    req.userService.errorResponse(res, err.message, 401);
  }
});

/**
 * @openapi
 * /api/reset-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Reset email sent if account exists }
 *       400: { description: Validation error }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return req.userService.errorResponse(res, "Email wajib diisi");
    }

    const result = await req.userService.requestPasswordReset(email);

    // Jika user tidak ditemukan, tetap beri respons sukses (security)
    if (!result.resetToken) {
      return res.json({
        success: true,
        message: "Jika email terdaftar, link reset password akan dikirim"
      });
    }

    // Kirim email
    try {
      const emailSent = await req.emailService.sendResetEmail(result.email, result.resetToken);
      if (!emailSent && process.env.NODE_ENV !== 'production') {
        console.log('⚠️ [DEV] Lanjut tanpa email — token tersedia di log server.');
      }
    } catch (emailErr) {
      // Jika gagal kirim email, bersihkan token dari DB
      const user = await req.prisma.users.findUnique({ where: { email } });
      if (user) {
        await req.prisma.users.update({
          where: { id: user.id },
          data: { resetToken: null, resetTokenExpiry: null }
        });
      }
      return req.userService.errorResponse(res, emailErr.message);
    }

    res.json({
      success: true,
      message: "Jika email terdaftar, link reset password akan dikirim"
    });
  } catch (err) {
    req.userService.errorResponse(res, err.message);
  }
});

/**
 * @openapi
 * /api/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword, confirmPassword]
 *             properties:
 *               newPassword: { type: string, minLength: 6 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired token }
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    if (!token) {
      return req.userService.errorResponse(res, "Token reset password tidak valid");
    }
    if (!newPassword || !confirmPassword) {
      return req.userService.errorResponse(res, "Password baru dan konfirmasi wajib diisi");
    }
    if (newPassword !== confirmPassword) {
      return req.userService.errorResponse(res, "Konfirmasi password tidak cocok");
    }
    if (newPassword.length < 6) {
      return req.userService.errorResponse(res, "Password minimal 6 karakter");
    }

    await req.userService.confirmPasswordReset(token, newPassword);
    res.json({ success: true, message: "Password berhasil direset. Silakan login." });
  } catch (err) {
    req.userService.errorResponse(res, err.message);
  }
});

export default router;