# Inventory Pro - Setup & Start Guide

## 1. MongoDB Setup
- MongoDB locally install karo: https://www.mongodb.com/try/download/community
- Ya free cloud MongoDB Atlas use karo: https://cloud.mongodb.com

## 2. Gmail App Password Setup (OTP ke liye)
1. Google Account → Security → 2-Step Verification ON karo
2. Security → App Passwords → "Mail" → Generate karo
3. Wo 16-digit password copy karo

## 3. Backend .env File Configure karo
File: `backend/.env`

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=koi_bhi_random_string_likho_yahan_123abc
JWT_EXPIRES_IN=7d

EMAIL_USER=tumhari_gmail@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx  (Gmail App Password)

CLIENT_URL=http://localhost:5173
```

## 4. Start karo

### Terminal 1 - Backend:
```bash
cd inventory/backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd inventory/frontend
npm run dev
```

## 5. Browser mein kholo:
```
http://localhost:5173
```

---

## Features Summary:
- ✅ Login / Signup (email OTP verification)
- ✅ Forgot Password (email OTP)
- ✅ Change Password
- ✅ Stock In - New Entry with Auto-fill
- ✅ Stock In - Replenish Existing Stock
- ✅ Stock Out - Dropdown se stock select, cartons reduce
- ✅ Auto-remember values (dropdown suggestions)
- ✅ Auto-fill when same Article + Gender match
- ✅ Stock Table with Edit/Delete
- ✅ Excel Export (xlsx)
- ✅ Excel Import (xlsx)
- ✅ Catalogue with Print option
- ✅ Movement History (in/out sab records)
- ✅ Dashboard with stats
