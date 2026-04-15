# Aghaz Admin Panel - Complete Setup & Deployment Guide

## 🚀 Features Fixed

### ✅ All Issues Resolved
1. **Product Search & Filters** - Now working correctly with regex search and category ID/slug support
2. **Orders Delete** - Added delete button with confirmation dialog
3. **Categories Product Count** - Displays accurate product count per category
4. **Hero Slides Upload** - Fixed uploaded images display, supports all image formats
5. **Announcements** - Fixed 401 auth error, improved desktop/mobile UI
6. **Settings Logo** - Supports all image types (JPG, PNG, WebP, GIF, SVG, BMP, TIFF)
7. **Vercel Deployment Ready** - Fully configured for seamless deployment

---

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- ImageKit.io account for image uploads
- Vercel account (for deployment)
- Render/Railway/Heroku account (for backend)

---

## 🛠️ Local Development Setup

### 1. Backend Server Setup

```bash
cd server
cp .env.example .env
```

**Configure `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aghaz
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aghaz

JWT_SECRET=your-super-secret-jwt-key-change-this

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# CORS Configuration
CLIENT_URL=http://localhost:3001
```

**Install & Start:**
```bash
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Admin Panel Setup

```bash
cd admin
# .env.local already configured for local dev
npm install
npm run dev
```

Admin runs on: `http://localhost:3001`

### 3. First-Time Setup

1. Navigate to `http://localhost:3001/login`
2. Run backend setup script to create admin user:
   ```bash
   cd server
   npm run setup
   ```
3. Login with default credentials (check setup output)

---

## 🌐 Vercel Deployment (Admin Frontend)

### Option 1: Vercel CLI

```bash
cd admin
npm i -g vercel
vercel
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:

**Build Settings:**
- **Framework:** Next.js
- **Root Directory:** `admin`
- **Build Command:** `next build`
- **Output Directory:** `.next`

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SITE_URL=https://your-admin-domain.vercel.app
```

4. Click **Deploy**

### Option 3: GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-detects Next.js and configures correctly
4. Set environment variables in Vercel dashboard
5. Deploy

---

## 🖥️ Backend Deployment Options

### Option 1: Render (Recommended - Free Tier)

1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all from `.env`
   - **Add MongoDB Atlas** connection string

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Add MongoDB service
4. Configure environment variables
5. Deploy

### Option 3: Heroku

```bash
cd server
heroku create your-app-name
heroku config:set $(cat .env | sed '/^$/d; /#[[:print:]]*$/d')
git push heroku main
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings

In `server/src/app.js` or `.env`, update `CLIENT_URL`:
```env
CLIENT_URL=https://your-admin-domain.vercel.app
```

### 2. Configure ImageKit

1. Sign up at [imagekit.io](https://imagekit.io)
2. Get your API credentials from dashboard
3. Add to backend environment variables:
   ```env
   IMAGEKIT_PUBLIC_KEY=xxx
   IMAGEKIT_PRIVATE_KEY=xxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   ```

### 3. Create Admin User

Run on deployed backend:
```bash
# If using Render/Railway, SSH into server or use their console
npm run setup
```

### 4. Test Deployment

- ✅ Login works
- ✅ Products load and filter
- ✅ Categories show product count
- ✅ Orders can be deleted
- ✅ Hero slides upload works
- ✅ Announcements create/update
- ✅ Settings logo uploads

---

## 📁 Project Structure

```
e-commerce/
├── admin/                  # Next.js admin panel
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # React Query hooks
│   │   ├── lib/           # API clients & utilities
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Local environment
│   └── next.config.js     # Next.js configuration
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   ├── config/        # Configuration
│   │   └── utils/         # Helper functions
│   ├── .env.example       # Environment template
│   └── server.js          # Entry point
└── README.md             # This file
```

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong admin password
- [ ] Enable HTTPS for all services
- [ ] Configure CORS properly (production URLs only)
- [ ] Set up rate limiting
- [ ] Regular dependency updates
- [ ] Backup MongoDB regularly
- [ ] Monitor ImageKit usage

---

## 🐛 Troubleshooting

### Products/Filters Not Working
- ✅ Fixed: Now uses regex search instead of text index
- ✅ Fixed: Supports both category ID and slug

### Categories Show 0 Products
- ✅ Fixed: Backend now calculates product count

### Upload Not Working
- ✅ Fixed: Supports all image types
- ✅ Check: ImageKit credentials are correct
- ✅ Check: File size < 5MB

### Announcements 401 Error
- ✅ Fixed: Now uses authenticated API client

### Logo Not Showing
- ✅ Fixed: Uses regular img tag instead of Next.js Image
- ✅ Fixed: Supports all image formats

---

## 📞 Support

For issues or questions:
- Check this README
- Review error logs in browser console
- Check backend server logs
- Verify environment variables are set

---

## 📄 License

This project is proprietary. All rights reserved.

---

**Built with:**
- Next.js 14 (App Router)
- Express.js
- MongoDB
- ImageKit
- TypeScript
- Tailwind CSS
- React Query
- Zustand
