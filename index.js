import express from 'express';
import { prisma } from './lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const extname = ALLOWED_IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase());
        const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'));
        }
    }
});

app.get('/api/users', async(req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                joinDate: true,
                birthday: true,
                gender: true,
                avatar: true,
                level: true,
                createdAt: true
            }
        });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/register', async(req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ success: false, message: "Email, username, dan password wajib diisi" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
        }

        const existingUser = await prisma.users.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ success: false, message: "Email sudah digunakan" });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ success: false, message: "Username sudah digunakan" });
            }
        }

        const createUser = await prisma.users.create({
            data: {
                email,
                username,
                password,
                joinDate: new Date().toISOString().split('T')[0],
                createdAt: new Date()
            }
        });
        res.json({ success: true, message: "User berhasil dibuat", data: createUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/upload-avatar', upload.single('avatar'), async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID diperlukan" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File gambar diperlukan" });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { avatar: true }
        });

        if (user?.avatar) {
            const oldAvatarPath = path.join('.', user.avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        await prisma.users.update({
            where: { id: userId },
            data: { avatar: avatarPath }
        });

        res.json({
            success: true,
            message: "Avatar berhasil diupload",
            data: { avatar: avatarPath }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/profile/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, password, birthday, gender } = req.body;

        const updateData = Object.fromEntries(
            Object.entries({ username, email, password, birthday, gender })
                .filter(([, v]) => v !== undefined)
        );

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData
        });

        res.json({
            success: true,
            message: "Profile berhasil diupdate",
            data: updatedUser
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username/Email dan Password wajib diisi" });
        }

        const user = await prisma.users.findFirst({
            where: { OR: [{ email: username }, { username: username }] }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Username/Email tidak ditemukan" });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Password salah" });
        }

        res.json({ success: true, message: "Login berhasil", data: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar || "/asset/profile.png",
            level: user.level || 1,
            joinDate: user.joinDate || new Date().toISOString().split('T')[0],
            birthday: user.birthday || "-",
            gender: user.gender || "-"
        }});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/deleteUser/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { avatar: true }
        });

        if (user?.avatar) {
            const avatarPath = path.join('.', user.avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        await prisma.users.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: "User berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(3000, () => {
    console.log("Server berhasil dijalankan di http://localhost:3000");
});