# 🚗 Fayeed Auto Care - Complete Car Care Management System

A comprehensive web and mobile application for managing car wash and auto care services, built with React, Node.js, MySQL, and Flutter.

## ✨ Features

### 🎯 **Customer Features**
- **User Registration & Authentication** with Email OTP verification
- **Service Booking System** with real-time scheduling
- **Home Service vs Branch Selection** with admin-configurable availability
- **Vehicle Management** - Add and manage multiple vehicles
- **QR Code Check-in** at service locations
- **Booking History & Tracking**
- **Loyalty Points & Membership System**
- **Real-time Notifications**
- **Guest Booking** for non-registered users

### 🔧 **Admin Features**
- **Dashboard Analytics** with booking insights
- **Service Management** - Configure services, pricing, and availability
- **Branch Management** - Manage multiple locations
- **Booking Management** - View, update, and track all bookings
- **User Management** - Customer profiles and membership handling
- **Staff Management** - Role-based access control
- **Notification System** - Send targeted notifications
- **Admin Configuration** - Dynamic pricing and scheduling settings

### 📱 **Technical Features**
- **Cross-platform** - React web app + Flutter mobile app
- **Real-time Database** - MySQL with proper relationships and indexing
- **Email OTP System** - Secure authentication with Nodemailer
- **QR Code Integration** - Branch check-ins and service activation
- **Responsive Design** - Works on all devices
- **Docker Support** - Easy deployment and scaling
- **API Integration** - RESTful APIs with Firebase Auth
- **Offline Support** - LocalStorage fallback when database unavailable

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  Flutter Mobile │    │   Admin Panel   │
│   (Customer)    │    │     (iOS/       │    │   (Management)  │
│                 │    │    Android)     │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────┐
          │           Node.js API Server            │
          │     ┌─────────────┬─────────────┐      │
          │     │ Express.js  │  Socket.io  │      │
          │     │   Routes    │   (Real-    │      │
          │     │             │   time)     │      │
          │     └─────────────┴─────────────┘      │
          └─────────────────┬───────────────────────┘
                           │
          ┌─────────────────┼───────────────────┐
          │                │                   │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌──────▼──────┐
    │   MySQL   │    │  Firebase │    │  Email      │
    │ Database  │    │   Auth    │    │ Service     │
    │           │    │           │    │ (Nodemailer)│
    └───────────┘    └───────────┘    └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Docker & Docker Compose**
- **MySQL** 8.0+
- **Gmail Account** (for email OTP)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd fayeed-auto-care

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Configure Environment

Update `.env` with your settings:

```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=fayeed_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=fayeed_auto_care

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-admin@your-project.iam.gserviceaccount.com

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### 3. Deploy with Docker

```bash
# Make deployment script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or deploy manually
docker-compose up -d
```

### 4. Initialize Database

The deployment script automatically:
- Creates the MySQL database
- Runs schema migrations
- Sets up the OTP table
- Populates sample data

### 5. Access the Application

- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Customer App**: http://localhost:3000/customer
- **Database Admin**: http://localhost:8080 (phpMyAdmin)
- **API Health**: http://localhost:3000/api/health

## 📋 Default Login Credentials

After deployment, use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Superadmin** | superadmin@fayeedautocare.com | SuperAdmin2024! |
| **Manager** | manager.tumaga@fayeedautocare.com | TumagaAdmin2024! |
| **VIP Customer** | john.doe@gmail.com | Customer123! |
| **Regular Customer** | anna.lopez@gmail.com | Anna2024! |

## 🗄️ Database Schema

### Core Tables

- **`users`** - Customer accounts (synced with Firebase)
- **`user_profiles`** - Extended customer information
- **`vehicles`** - Customer vehicle registrations
- **`branches`** - Service location management
- **`services`** - Available services and pricing
- **`bookings`** - Appointment scheduling
- **`payments`** - Transaction records
- **`email_otps`** - OTP verification system

### Features Tables

- **`vouchers`** - Discount and promotion system
- **`notifications`** - User notification management
- **`qr_checkins`** - QR code check-in tracking
- **`staff`** - Employee and admin management

## 🔧 Development

### Local Development Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev          # React development server
cd flutter_app && flutter run -d web  # Flutter development

# Database setup
mysql -u root -p < database/mysql/schema.sql
mysql -u root -p fayeed_auto_care < database/mysql/email_otp_schema.sql
```

### Building for Production

```bash
# Build React application
npm run build

# Build server
npm run build:server

# Flutter web build
cd flutter_app
flutter build web

# Start production server
npm start
```

## 📧 Email OTP Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication** in your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. **Update .env**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=generated-app-password
   ```

### Email Templates

The system includes professional email templates for:
- **Signup Verification** - Welcome and email verification
- **Password Reset** - Secure password reset codes
- **Login Verification** - Two-factor authentication

## 🏠 Home Service Configuration

### Admin Controls

Admins can configure:
- **Available Services** for home delivery
- **Service Areas** and coverage zones
- **Price Multipliers** for home service fees
- **Lead Times** for advance booking requirements

### Default Home Service Settings

```javascript
homeService: {
  enabled: true,
  availableServices: {
    carwash: ["vip_pro", "vip_pro_max", "premium", "fac"],
    autoDetailing: true,
    grapheneCoating: true,
  },
  priceMultiplier: 1.2, // 20% additional fee
  coverage: {
    areas: ["Tumaga", "Boalan", "Zamboanga City"],
    maxDistance: 15, // 15km radius
  },
  leadTime: 4, // 4 hours minimum advance booking
}
```

## 🚢 Deployment Options

### Docker Deployment (Recommended)

```bash
# Production deployment
./deploy.sh

# Check service health
./deploy.sh health

# View logs
./deploy.sh logs

# Create database backup
./deploy.sh backup
```

### Manual Deployment

```bash
# Build application
npm run build

# Start services
npm start

# Or with PM2
pm2 start dist/server/node-build.mjs --name fayeed-auto-care
```

### Cloud Deployment

The application is ready for deployment to:
- **AWS EC2/ECS**
- **Google Cloud Platform**
- **DigitalOcean Droplets**
- **Heroku**
- **Vercel** (frontend)
- **Railway** (full-stack)

## 📊 Monitoring & Maintenance

### Health Checks

- **Application**: `GET /api/health`
- **Database**: Built-in connection monitoring
- **Redis**: Cache performance tracking

### Backup Strategy

```bash
# Automated daily backups
./deploy.sh backup

# Manual backup
docker exec fayeed_mysql mysqldump -u root -p fayeed_auto_care > backup.sql
```

### Log Management

```bash
# View all logs
docker-compose logs -f

# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f mysql
```

## 🔐 Security Features

- **Firebase Authentication** - Secure user management
- **Email OTP Verification** - Two-factor authentication
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request security
- **Input Validation** - SQL injection prevention
- **Password Hashing** - Bcrypt encryption
- **JWT Tokens** - Secure session management

## 📱 Mobile App (Flutter)

### Features
- **Cross-platform** - iOS and Android
- **Offline Support** - SQLite local database
- **Push Notifications** - Firebase Cloud Messaging
- **QR Code Scanner** - Camera integration
- **Maps Integration** - Branch location services

### Building Mobile App

```bash
cd flutter_app

# Install dependencies
flutter pub get

# Run on emulator/device
flutter run

# Build for production
flutter build apk --release          # Android
flutter build ios --release          # iOS
flutter build web                    # Web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is proprietary software for Fayeed Auto Care. All rights reserved.

## 📞 Support

For technical support or deployment assistance:

- **Email**: support@fayeedautocare.com
- **Documentation**: `/docs` folder
- **API Documentation**: `http://localhost:3000/api/docs`

---

## 🎉 Success! 

Your Fayeed Auto Care system is now ready for production use with:

✅ **Complete database integration**  
✅ **Email OTP authentication**  
✅ **Home service configuration**  
✅ **Production deployment setup**  
✅ **Admin management system**  
✅ **Mobile app foundation**  

**Next Steps:**
1. Configure your production environment variables
2. Set up your Firebase project
3. Configure Gmail for OTP emails
4. Deploy using `./deploy.sh`
5. Access admin panel to configure services

Welcome to the future of car care management! 🚗✨
