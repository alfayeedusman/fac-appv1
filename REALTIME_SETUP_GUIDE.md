# Real-time Location Tracking System Setup Guide

This guide will help you set up the complete real-time location tracking system for Fayeed Auto Care, including the FAC MAP with live crew tracking and job management.

## 🚀 Quick Start

### 1. Database Setup

**Step 1: Connect to Database**
- Click [Connect to Neon](#open-mcp-popover) or [Connect to Supabase](#open-mcp-popover) for cloud database
- Or use local MySQL/PostgreSQL database

**Step 2: Run Database Migration**
```bash
# For MySQL
mysql -u root -p fayeed_auto_care < database/migrations/001_realtime_location_tracking.sql

# For PostgreSQL (if using Supabase/Neon)
psql -h your-host -U your-user -d your-database -f database/migrations/001_realtime_location_tracking.sql
```

### 2. Mapbox Setup

**Step 1: Get Mapbox Access Token**
1. Go to [Mapbox](https://mapbox.com) and create a free account
2. Navigate to Account → Access Tokens
3. Create a new access token with these scopes:
   - `styles:read`
   - `fonts:read` 
   - `datasets:read`
   - `vision:read`

**Step 2: Configure Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Mapbox token:
VITE_MAPBOX_TOKEN=pk.your-actual-mapbox-token-here
REACT_APP_MAPBOX_TOKEN=pk.your-actual-mapbox-token-here
```

### 3. Database Configuration
```bash
# Add database connection details to .env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=fayeed_auto_care
DB_PORT=3306
```

### 4. Install Dependencies and Start System
```bash
# Install new dependencies
npm install

# Start the development server
npm run dev
```

## 🗺️ FAC MAP Features

### Live Location Tracking
- **Real-time crew positions** with GPS accuracy
- **Status indicators** (Online, Busy, Available, Break, Offline)
- **Battery and signal monitoring** for crew devices
- **Automatic offline detection** after 5 minutes of inactivity

### Job Management on Map
- **Active job visualization** with crew assignments
- **Job progress tracking** with completion percentage
- **Service type indicators** (Basic, Premium, Deluxe, VIP)
- **Real-time job updates** and status changes

### Customer Tracking
- **Customer locations** for home services
- **Membership tier visualization** (Platinum, Gold, Silver, Basic)
- **Active booking requests** with priority levels
- **Service history** and location preferences

### Interactive Features
- **Click crew markers** to see detailed information
- **Real-time messaging** between crew, customers, and admin
- **Geofence alerts** for important locations
- **Route optimization** suggestions

## 📊 Dashboard Integration

### Real-time Statistics
```typescript
// Auto-updating dashboard stats
{
  crew: {
    total_crew: 25,
    online_crew: 18,
    busy_crew: 12,
    available_crew: 6,
    break_crew: 2,
    offline_crew: 7
  },
  jobs: {
    total_active_jobs: 15,
    pending_jobs: 3,
    assigned_jobs: 4,
    en_route_jobs: 2,
    in_progress_jobs: 6,
    completed_today: 23
  },
  revenue: {
    today_revenue: 15750.00,
    week_revenue: 87500.00,
    month_revenue: 346200.00
  }
}
```

## 🔧 API Endpoints

### Crew Location Management
```bash
# Update crew location
POST /api/realtime/crew/location
{
  "crew_id": 1,
  "latitude": 14.5995,
  "longitude": 120.9842,
  "accuracy": 10,
  "speed": 25.5,
  "heading": 180,
  "battery_level": 85,
  "signal_strength": 90
}

# Get all crew locations
GET /api/realtime/crew/locations
```

### Job Management
```bash
# Update job status
POST /api/realtime/jobs/update
{
  "job_id": 123,
  "status": "in_progress",
  "progress_percentage": 65,
  "stage": "washing",
  "notes": "Customer requested extra attention to rims"
}

# Get active jobs with locations
GET /api/realtime/jobs/active
```

### Real-time Messaging
```bash
# Send message
POST /api/realtime/messages/send
{
  "job_id": 123,
  "sender_type": "crew",
  "sender_id": 1,
  "recipient_type": "admin",
  "message_type": "status_update",
  "content": "Job 50% complete, estimated 30 minutes remaining"
}
```

## 🛠️ Configuration Options

### Real-time Update Settings
```bash
# Environment variables for fine-tuning
REALTIME_UPDATE_INTERVAL=5000        # Update frequency (ms)
LOCATION_ACCURACY_THRESHOLD=50       # Minimum GPS accuracy (meters)
OFFLINE_TIMEOUT_MINUTES=5           # Time before marking offline
GEOFENCE_DEFAULT_RADIUS=100         # Default geofence size (meters)
```

### Database Performance Optimization
```sql
-- Enable these MySQL settings for optimal performance
innodb_buffer_pool_size = 1G         -- 70% of available RAM
innodb_log_file_size = 256M
max_connections = 500
query_cache_size = 128M
```

## 📱 Mobile Integration

### Crew Mobile App Integration
The system is designed to work with mobile apps that can:
- Send GPS location updates every 10 seconds
- Update job status and progress
- Take and upload photos
- Receive real-time messages and alerts

### Customer Mobile App Integration
- Request services with location
- Track assigned crew in real-time
- Receive status updates
- Rate completed services

## 🔐 Security Features

### Data Protection
- **GPS data encryption** in transit and at rest
- **Role-based access control** for sensitive location data
- **Audit logging** for all location and job updates
- **GDPR compliance** with data retention policies

### Privacy Controls
- **Location history retention** (configurable)
- **Crew privacy modes** for break times
- **Customer consent management** for location tracking
- **Data anonymization** for analytics

## 📈 Analytics and Reporting

### Location Analytics
- **Distance traveled** by crew members
- **Service area coverage** heat maps
- **Response time analysis** from assignment to arrival
- **Fuel efficiency scoring** based on routes

### Performance Metrics
- **Average job completion time** by service type
- **Crew productivity analysis** based on locations
- **Customer satisfaction correlation** with response times
- **Revenue optimization** based on location data

## 🚨 Alerts and Notifications

### Automatic Alerts
- **Crew going offline** unexpectedly
- **Jobs taking longer than estimated**
- **Crew entering/exiting geofenced areas**
- **Emergency situations** with immediate escalation

### Custom Geofences
Create custom zones for:
- **Branch locations** with check-in/check-out
- **Customer service areas** with arrival notifications
- **Restricted zones** with access alerts
- **High-value areas** with security monitoring

## 🔧 Troubleshooting

### Common Issues

**1. Map not loading**
```bash
# Check Mapbox token
echo $VITE_MAPBOX_TOKEN

# Verify token has correct permissions at:
# https://account.mapbox.com/access-tokens/
```

**2. No crew locations showing**
```bash
# Check database connection
npm run test:db

# Verify crew_locations table exists
mysql -u root -p -e "DESCRIBE fayeed_auto_care.crew_locations;"
```

**3. Real-time updates not working**
```bash
# Check API health
curl http://localhost:3000/api/realtime/health

# Verify websocket connection (if implemented)
# Check browser console for connection errors
```

**4. Performance issues**
```bash
# Check database performance
mysql -u root -p -e "SHOW PROCESSLIST;"

# Monitor update frequency
# Adjust REALTIME_UPDATE_INTERVAL if needed
```

### Database Maintenance

**Weekly Tasks:**
```sql
-- Clean old location data (older than 30 days)
DELETE FROM crew_locations WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Update analytics tables
CALL update_location_analytics();

-- Optimize tables
OPTIMIZE TABLE crew_locations, job_progress, realtime_messages;
```

**Monthly Tasks:**
```sql
-- Archive completed jobs older than 90 days
-- Update performance indexes
-- Generate monthly reports
```

## 🔄 Backup and Recovery

### Automated Backups
```bash
# Daily backup script
#!/bin/bash
mysqldump -u root -p --single-transaction fayeed_auto_care > backup_$(date +%Y%m%d).sql

# Backup real-time data only
mysqldump -u root -p --tables crew_locations crew_status job_progress > realtime_backup_$(date +%Y%m%d).sql
```

### Recovery Procedures
```bash
# Restore from backup
mysql -u root -p fayeed_auto_care < backup_20240315.sql

# Verify data integrity
mysql -u root -p -e "SELECT COUNT(*) FROM fayeed_auto_care.crew_locations WHERE created_at >= CURDATE();"
```

## 🚀 Launch Checklist

### Pre-Launch Verification
- [ ] Database migration completed successfully
- [ ] Mapbox token configured and working
- [ ] All crew members added to system
- [ ] Service types configured
- [ ] Real-time updates functioning
- [ ] Mobile apps connected (if applicable)
- [ ] Backup systems in place
- [ ] Monitoring alerts configured

### Go-Live Steps
1. **Switch to production database**
2. **Update Mapbox token for production domain**
3. **Configure production environment variables**
4. **Start monitoring systems**
5. **Train crew on new system**
6. **Announce launch to customers**

### Post-Launch Monitoring
- Monitor system performance for first 48 hours
- Collect feedback from crew and admin users
- Monitor database performance and optimize queries
- Verify real-time updates are accurate
- Check mobile app connectivity (if applicable)

## 📞 Support

### System Health Monitoring
```bash
# Check system status
curl http://your-domain.com/api/realtime/health

# Monitor key metrics
curl http://your-domain.com/api/realtime/dashboard/stats
```

### Error Reporting
- Check browser console for JavaScript errors
- Review server logs for API errors
- Monitor database logs for performance issues
- Set up automated alerts for system failures

---

## 🎉 Congratulations!

Your real-time location tracking system is now ready for launch! The FAC MAP provides comprehensive visibility into your operations with:

- **Live crew tracking** with accurate GPS locations
- **Real-time job management** with progress monitoring
- **Customer location services** with advanced features
- **Analytics and reporting** for business optimization
- **Mobile-ready architecture** for future expansion

Your Fayeed Auto Care business now has enterprise-level location tracking capabilities! 🚗✨
