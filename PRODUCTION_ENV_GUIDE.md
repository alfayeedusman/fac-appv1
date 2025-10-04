# Production Environment Configuration Guide

## Required Environment Variables

### 🗄️ Database Configuration
```bash
# Neon (Primary Database - PostgreSQL)
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# MySQL (Realtime Services)  
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fayeed_auto_care
```

### 🖥️ Server Configuration
```bash
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### 🔥 Firebase Configuration
```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### 🎨 Client-side Configuration (Build Time)
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

### 📧 Email Configuration
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

## 🚨 Critical Security Notes

1. **Never commit actual environment values to git**
2. **Use secure password/key generation**
3. **Enable SSL/TLS for all database connections**
4. **Rotate keys regularly**
5. **Use strong authentication for admin access**

## 🔧 Setup Instructions

1. Copy this template to your `.env` file
2. Replace all placeholder values with real credentials
3. Ensure HTTPS is configured for production
4. Test all connections before deployment
