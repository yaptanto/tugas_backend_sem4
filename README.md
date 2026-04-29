# Backend - Tugas Backend Semester 4

Backend API untuk manajemen user dengan Express.js dan Prisma ORM.

## Fitur

- Register user baru
- Login dengan username atau email
- Upload avatar (file disimpan di database)
- Update profil user
- Delete user
- List semua user

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Multer** - File upload handling
- **SQLite** - Database (default)

## Prerequisites

- Node.js >= 18.x
- npm atau yarn

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
npx prisma migrate dev
```

3. Jalankan server:
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### 1. Register User
```
POST /api/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

### 2. Login
```
POST /api/login
Content-Type: application/json

Body:
{
  "username": "username",  // bisa email atau username
  "password": "password123"
}
```

### 3. Get All Users
```
GET /api/users
```

### 4. Upload Avatar
```
POST /api/upload-avatar
Content-Type: multipart/form-data

Form Data:
- avatar: [file gambar]
- userId: [id user]
```

### 5. Get Avatar
```
GET /api/avatar/:userId
```

### 6. Update Profile
```
PUT /api/profile/:userId
Content-Type: application/json

Body:
{
  "username": "newusername",
  "email": "newemail@example.com",
  "password": "newpassword",
  "birthday": "1990-01-01",
  "gender": "male"
}
```

### 7. Delete User
```
DELETE /api/deleteUser/:userId
```

## Struktur Database

Tabel `users`:
- `id` - Primary key
- `email` - Email user (unik)
- `username` - Username (unik)
- `password` - Password (plain text)
- `avatar` - Buffer gambar (Bytes)
- `joinDate` - Tanggal bergabung
- `birthday` - Tanggal lahir
- `gender` - Jenis kelamin
- `level` - Level user (default: 1)
- `createdAt` - Timestamp pembuatan

## Catatan

- Password disimpan sebagai plain text (untuk development)
- Avatar disimpan sebagai buffer di database
- File upload dibatasi maksimal 10 MB
- Format gambar yang diterima: jpeg, jpg, png, gif, webp
