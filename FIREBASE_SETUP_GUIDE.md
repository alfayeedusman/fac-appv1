# Firebase Push Notifications & Image Management Setup Guide

This guide will help you set up Firebase push notifications and image management features in your Fayeed Auto Care application.

## 🚀 Features Implemented

### ✅ Firebase Push Notifications
- Real-time push notifications for booking updates
- Loyalty points and achievement notifications  
- System-wide announcements
- FCM token management
- Notification delivery tracking
- User preference management

### ✅ Image Management System
- Image upload with drag & drop support
- Multiple file upload (up to 10 files, 10MB each)
- Image categorization and tagging
- Image collections and galleries
- View and download tracking
- Search and filter functionality

### ✅ Database Integration
- Complete schema for push notifications (fcm_tokens, push_notifications, notification_deliveries)
- Image management tables (images, image_collections, image_collection_items)
- Enhanced gamification system integration
- Proper indexing for performance

## 🔧 Setup Instructions

### 1. Environment Variables

You need to set up Firebase environment variables. The FCM key has already been configured:

```bash
# Firebase Client Configuration (Already set via DevServerControl)
VITE_FIREBASE_FCM_KEY=BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA

# Additional Firebase Config (you need to add these)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin SDK (for server-side notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### 2. Database Migration

Run the database migration to create the new tables:

```bash
# Start the development server first
npm run dev:server

# Then trigger the migration via API
curl -X POST http://localhost:3000/api/neon/init
```

This will create the following new tables:
- `images` - Image storage and metadata
- `image_collections` - Image collection management
- `image_collection_items` - Many-to-many relationship for collections
- `fcm_tokens` - FCM token storage for push notifications
- `push_notifications` - Notification history and tracking
- `notification_deliveries` - Individual delivery tracking

### 3. Firebase Service Worker

The Firebase service worker (`public/firebase-messaging-sw.js`) is already configured to handle background notifications. Make sure to update the Firebase configuration in this file with your actual project details.

## 📱 Using Push Notifications

### Client-Side Setup

1. **Import and use the PushNotificationSubscriber component:**

```tsx
import PushNotificationSubscriber from '@/components/PushNotificationSubscriber';

function UserDashboard() {
  const user = getCurrentUser(); // Your user logic
  
  return (
    <div>
      <PushNotificationSubscriber 
        userId={user.id}
        className="mb-6"
      />
      {/* Other dashboard content */}
    </div>
  );
}
```

2. **The component provides:**
- Permission request handling
- FCM token registration
- Real-time notification display
- Test notification functionality (dev mode)
- User-friendly permission management

### Server-Side Notifications

Send notifications programmatically:

```typescript
import { pushNotificationService } from './server/services/pushNotificationService';

// Send booking update
await pushNotificationService.sendBookingUpdateNotification(
  bookingId, 
  userId, 
  'confirmed', 
  'Your booking has been confirmed!'
);

// Send achievement notification
await pushNotificationService.sendAchievementNotification(
  userId, 
  achievementId, 
  'Loyal Customer', 
  50
);

// Send system notification to all users
await pushNotificationService.sendSystemNotification(
  'Maintenance Notice', 
  'System will be down for maintenance from 2-4 AM',
  '/announcements'
);
```

### API Endpoints

The following endpoints are available:

**Notification Management:**
- `POST /api/notifications/register-token` - Register FCM token
- `POST /api/notifications/send` - Send custom notification (admin)
- `POST /api/notifications/booking-update` - Send booking notification
- `POST /api/notifications/loyalty-update` - Send loyalty notification
- `POST /api/notifications/achievement` - Send achievement notification
- `POST /api/notifications/system` - Send system notification
- `GET /api/notifications/history` - Get notification history (admin)
- `GET /api/notifications/stats` - Get notification statistics (admin)

## 🖼️ Using Image Management

### Client-Side Setup

1. **Import and use the ImageUploadManager component:**

```tsx
import ImageUploadManager from '@/components/ImageUploadManager';

function ImageManagement() {
  const handleUploadComplete = (uploadedImages) => {
    console.log('Images uploaded:', uploadedImages);
    // Handle successful upload
  };

  return (
    <ImageUploadManager
      category="gallery"
      uploadedBy={currentUserId}
      onUploadComplete={handleUploadComplete}
      showGallery={true}
      maxFiles={10}
    />
  );
}
```

2. **The component provides:**
- Drag & drop file upload
- Multiple file selection
- Image preview and management
- Metadata editing (alt text, description, tags)
- Image gallery with search and filter
- View and download tracking

### API Endpoints

**Image Management:**
- `POST /api/images/upload` - Upload single image
- `POST /api/images/upload-multiple` - Upload multiple images
- `GET /api/images` - Get images with filtering/pagination
- `GET /api/images/:id` - Get single image (with view tracking)
- `PUT /api/images/:id` - Update image metadata
- `DELETE /api/images/:id` - Delete image
- `POST /api/images/collections` - Create image collection
- `GET /api/images/collections` - Get image collections
- `POST /api/images/collections/:id/images` - Add images to collection
- `GET /api/images/stats` - Get image statistics

## 🎮 Gamification Integration

The gamification system is fully integrated with the notification system:

### Automatic Notifications

- **Achievement Unlocked:** Users receive push notifications when they unlock achievements
- **Level Up:** Notifications when users reach new loyalty levels
- **Points Earned:** Real-time notifications for loyalty point transactions
- **Rewards Available:** Notifications about available rewards

### Database Schema

The following gamification tables are included:
- `customer_levels` - Customer loyalty levels
- `achievements` - Available achievements  
- `user_achievements` - User progress tracking
- `loyalty_transactions` - Points transaction history

## 🧪 Testing

### 1. Test Push Notifications

1. **Enable notifications in your browser**
2. **Use the PushNotificationSubscriber component** to subscribe
3. **Send a test notification** (dev mode only):

```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123", "title": "Test", "message": "Hello!"}'
```

### 2. Test Image Upload

1. **Navigate to a page with ImageUploadManager**
2. **Drag and drop images** or click to browse
3. **Fill in metadata** (optional)
4. **Click upload** and verify images appear in gallery

### 3. Test Gamification Notifications

Trigger achievement notifications through your app logic or directly:

```bash
curl -X POST http://localhost:3000/api/notifications/achievement \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "achievementId": "first_booking",
    "achievementName": "First Booking",
    "points": 100
  }'
```

## 🔧 Troubleshooting

### Push Notifications Not Working

1. **Check browser support:** Ensure using Chrome, Firefox, or Safari
2. **Verify permissions:** Check notification permissions in browser settings
3. **Check Firebase config:** Ensure all environment variables are set correctly
4. **Check service worker:** Verify `firebase-messaging-sw.js` is accessible
5. **Check console:** Look for Firebase initialization errors

### Image Upload Issues

1. **File size limits:** Ensure images are under 10MB
2. **File types:** Only image files (JPG, PNG, GIF, WebP) are supported
3. **Upload directory:** Ensure `public/uploads/images/` directory exists and is writable
4. **Network issues:** Check for upload timeout or network errors

### Database Issues

1. **Run migration:** Ensure database migration has been executed
2. **Check connections:** Verify database connection string is correct
3. **Check indexes:** Ensure all indexes are created for performance

## 📊 Monitoring & Analytics

### Notification Analytics

Track notification performance through the admin dashboard:
- Delivery success rates
- Click-through rates
- User engagement metrics
- Device distribution

### Image Analytics

Monitor image usage:
- Upload frequency
- Storage usage
- Most viewed images
- Download patterns

## 🚀 Next Steps

1. **Complete Firebase project setup** with your actual credentials
2. **Run the database migration** to create new tables
3. **Test push notifications** with the subscriber component
4. **Test image upload** functionality
5. **Integrate components** into your existing pages
6. **Configure Firebase Admin SDK** for server-side notifications
7. **Set up monitoring** and analytics

## 📝 Implementation Summary

✅ **Completed Features:**
- Firebase push notification service with FCM integration
- Client-side notification subscription management
- Server-side notification sending (booking, loyalty, achievement, system)
- Comprehensive image management system with upload, gallery, and metadata
- Database schema updates with proper indexing
- API endpoints for all functionality
- Real-time notification handling with service worker
- Gamification integration with automatic notifications

The system is now ready for testing and deployment. Make sure to configure your Firebase project and run the database migration to get started!
