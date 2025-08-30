# 🚀 Database Setup Instructions - Fayeed Auto Care

> **Complete database setup guide for MySQL, PostgreSQL, and SQLite**

This guide provides detailed instructions for setting up the Fayeed Auto Care database with sample data, user accounts, and all necessary configurations for development and production environments.

[![Database](https://img.shields.io/badge/database-MySQL%208.0%2B-orange.svg)](https://mysql.com/)
[![Setup Time](https://img.shields.io/badge/setup%20time-10%20minutes-green.svg)](https://github.com/fayeedautocare)
[![Data](https://img.shields.io/badge/sample%20data-500%2B%20records-blue.svg)](https://github.com/fayeedautocare)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [⚡ Quick Start](#-quick-start)
- [🗄️ MySQL Setup](#️-mysql-setup)
- [🐘 PostgreSQL Setup](#-postgresql-setup)
- [📱 SQLite Setup](#-sqlite-setup)
- [🐳 Docker Setup](#-docker-setup)
- [👥 Sample User Accounts](#-sample-user-accounts)
- [🔧 Configuration](#-configuration)
- [✅ Verification](#-verification)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

### 📊 **Database Options**

| Database | Use Case | File Size | Performance | Complexity |
|----------|----------|-----------|-------------|------------|
| **MySQL** | Production, Web app | ~10MB | Excellent | Medium |
| **PostgreSQL** | Enterprise, Advanced features | ~12MB | Excellent | High |
| **SQLite** | Mobile app, Development | ~5MB | Good | Low |

### 📦 **What's Included**

- **15 Core Tables** with proper relationships and constraints
- **500+ Sample Records** across all tables for realistic testing
- **6 Test User Accounts** with different roles and membership levels
- **2 Service Branches** with complete location data
- **15 Service Offerings** with pricing and duration information
- **100+ Sample Bookings** with various statuses and payment records
- **Complete Audit Trail** with logging and tracking capabilities

---

## ⚡ Quick Start

### 🚀 **One-Command Setup**

**MySQL (Recommended):**
```bash
# Start MySQL with Docker and import complete database
docker-compose up -d mysql && sleep 30 && mysql -h 127.0.0.1 -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/complete/fayeed_auto_care_complete.sql
```

**SQLite (Mobile/Development):**
```bash
# Copy pre-built SQLite database
cp sqlite/fayeed_auto_care.sqlite /path/to/your/app/database/
```

### ✅ **Verification**
```bash
# Test database connection and sample data
mysql -h 127.0.0.1 -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care -e "
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM bookings) as bookings,
    (SELECT COUNT(*) FROM branches) as branches;
"
```

---

## 🗄️ MySQL Setup

### 📋 **Prerequisites**

- **MySQL Server** 8.0 or higher
- **MySQL Client** for command-line access
- **Admin privileges** to create databases and users

### 🔧 **Installation**

#### **Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install MySQL Server
sudo apt install mysql-server mysql-client

# Secure MySQL installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### **macOS:**
```bash
# Using Homebrew
brew install mysql@8.0

# Start MySQL service
brew services start mysql@8.0

# Secure installation
mysql_secure_installation
```

#### **Windows:**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and choose "Server only" or "Full" installation
3. Configure root password during installation
4. Start MySQL service from Services panel

### 🗄️ **Database Creation**

#### **Method 1: Automated Setup**
```bash
# Navigate to database exports directory
cd database/exports

# Run setup script
chmod +x mysql/setup.sh
./mysql/setup.sh
```

#### **Method 2: Manual Setup**

**Step 1: Create Database and User**
```bash
# Connect to MySQL as root
mysql -u root -p

# Execute the following SQL commands:
```

```sql
-- Create database with proper character set
CREATE DATABASE fayeed_auto_care 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create dedicated user for the application
CREATE USER 'fayeed_user'@'localhost' IDENTIFIED BY 'fayeed_pass_2024';
CREATE USER 'fayeed_user'@'%' IDENTIFIED BY 'fayeed_pass_2024';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON fayeed_auto_care.* TO 'fayeed_user'@'localhost';
GRANT ALL PRIVILEGES ON fayeed_auto_care.* TO 'fayeed_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'fayeed_user';

-- Exit MySQL
EXIT;
```

**Step 2: Import Database Schema and Data**
```bash
# Import complete database (schema + data)
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/complete/fayeed_auto_care_complete.sql

# OR import step by step for better control
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/schema/01_create_tables.sql
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/schema/02_create_indexes.sql
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/schema/03_create_triggers.sql
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/data/01_sample_data.sql
```

### 🔧 **MySQL Configuration**

#### **Optimize for Performance**
```sql
-- Connect to MySQL and run these optimizations
mysql -u root -p

-- Set optimal configuration
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_type = 1;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 2;

-- Enable binary logging for replication
SET GLOBAL log_bin = 1;
SET GLOBAL binlog_format = 'ROW';

-- Show current configuration
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';
```

#### **Create MySQL Configuration File**
```bash
# Create/edit MySQL configuration file
sudo nano /etc/mysql/mysql.conf.d/fayeed.cnf  # Linux
nano /usr/local/etc/my.cnf  # macOS
```

```ini
[mysqld]
# Basic Settings
user = mysql
pid-file = /var/run/mysqld/mysqld.pid
socket = /var/run/mysqld/mysqld.sock
port = 3306
basedir = /usr
datadir = /var/lib/mysql
tmpdir = /tmp
lc-messages-dir = /usr/share/mysql

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance Tuning
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_type = 1
query_cache_size = 64M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1

# Security
bind-address = 127.0.0.1
skip-networking = 0
```

---

## 🐘 PostgreSQL Setup

### 📋 **Prerequisites**

- **PostgreSQL** 13 or higher
- **psql client** for command-line access

### 🔧 **Installation**

#### **Linux (Ubuntu/Debian):**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **macOS:**
```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15
```

### 🗄️ **Database Setup**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE fayeed_auto_care;
CREATE USER fayeed_user WITH PASSWORD 'fayeed_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE fayeed_auto_care TO fayeed_user;
ALTER USER fayeed_user CREATEDB;

# Exit PostgreSQL
\q

# Import database schema and data
psql -U fayeed_user -d fayeed_auto_care -f postgresql/fayeed_auto_care_complete.sql
```

---

## 📱 SQLite Setup

### 📋 **For Mobile Development**

SQLite is perfect for Flutter mobile apps and offline-first applications.

#### **Method 1: Use Pre-built Database**
```bash
# Copy the pre-built SQLite database
cp sqlite/fayeed_auto_care.sqlite /path/to/your/flutter/app/assets/databases/

# For Flutter, add to pubspec.yaml:
flutter:
  assets:
    - assets/databases/fayeed_auto_care.sqlite
```

#### **Method 2: Create from SQL Script**
```bash
# Create new SQLite database from schema
sqlite3 fayeed_auto_care.sqlite < sqlite/schema.sql

# Add sample data
sqlite3 fayeed_auto_care.sqlite < sqlite/sample_data.sql

# Verify database
sqlite3 fayeed_auto_care.sqlite "SELECT name FROM sqlite_master WHERE type='table';"
```

### 🔧 **SQLite Optimization**

```sql
-- Connect to SQLite database
sqlite3 fayeed_auto_care.sqlite

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Set journal mode for better performance
PRAGMA journal_mode = WAL;

-- Enable automatic index creation
PRAGMA automatic_index = ON;

-- Set cache size (in KB)
PRAGMA cache_size = 10000;

-- Verify settings
PRAGMA foreign_keys;
PRAGMA journal_mode;
```

---

## 🐳 Docker Setup

### 🚀 **Quick Docker Setup**

#### **Using Docker Compose (Recommended)**

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: fayeed_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password_123
      MYSQL_DATABASE: fayeed_auto_care
      MYSQL_USER: fayeed_user
      MYSQL_PASSWORD: fayeed_pass_2024
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/complete:/docker-entrypoint-initdb.d
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: fayeed_phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_USER: fayeed_user
      PMA_PASSWORD: fayeed_pass_2024
      UPLOAD_LIMIT: 100M
    ports:
      - "8080:80"
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

**Start Services:**
```bash
# Start MySQL and phpMyAdmin
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f mysql
docker-compose logs -f phpmyadmin
```

#### **Manual Docker Setup**

```bash
# Create MySQL container
docker run -d \
  --name fayeed_mysql \
  -e MYSQL_ROOT_PASSWORD=root_password_123 \
  -e MYSQL_DATABASE=fayeed_auto_care \
  -e MYSQL_USER=fayeed_user \
  -e MYSQL_PASSWORD=fayeed_pass_2024 \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# Wait for MySQL to start
sleep 30

# Import database
docker exec -i fayeed_mysql mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care < mysql/complete/fayeed_auto_care_complete.sql

# Create phpMyAdmin container
docker run -d \
  --name fayeed_phpmyadmin \
  --link fayeed_mysql:mysql \
  -e PMA_HOST=mysql \
  -e PMA_USER=fayeed_user \
  -e PMA_PASSWORD=fayeed_pass_2024 \
  -p 8080:80 \
  phpmyadmin/phpmyadmin
```

### 🔗 **Access URLs**

- **phpMyAdmin**: http://localhost:8080
- **Direct MySQL**: localhost:3306

---

## 👥 Sample User Accounts

### 🔑 **Login Credentials**

After database import, you can use these test accounts:

#### **Admin Accounts**
| Role | Name | Email | Password | Access Level |
|------|------|-------|----------|--------------|
| **Super Admin** | Al-Fayeed Usman | superadmin@fayeedautocare.com | SuperAdmin2024! | Full system access |
| **Branch Manager** | Maria Santos | manager.tumaga@fayeedautocare.com | TumagaAdmin2024! | Branch operations |
| **Staff Member** | Juan Carlos | staff.tumaga@fayeedautocare.com | StaffTumaga2024! | Service operations |
| **Cashier** | Ana Reyes | cashier.boalan@fayeedautocare.com | CashierBoalan2024! | Payment processing |

#### **Customer Accounts**
| Membership | Name | Email | Password | Features |
|------------|------|-------|----------|----------|
| **VIP Gold** | John Michael Doe | john.doe@gmail.com | Customer123! | Premium member, multiple vehicles |
| **VIP Silver** | Anna Marie Lopez | anna.lopez@gmail.com | Anna2024! | Active subscriber, loyalty points |
| **Classic Pro** | Mike Chen Rodriguez | mike.chen@gmail.com | Mike2024! | Regular bookings, payment history |
| **Regular** | Sarah Johnson Smith | sarah.j@gmail.com | Sarah2024! | New customer, basic features |

### 👤 **Customer Profiles**

#### **John Doe (VIP Gold Member)**
```json
{
  "fullName": "John Michael Doe",
  "email": "john.doe@gmail.com",
  "phoneNumber": "+63 917 123 4567",
  "address": "123 Main Street, Tumaga, Zamboanga City",
  "membershipTier": "VIP Gold",
  "loyaltyPoints": 2500,
  "totalSpent": 15750.00,
  "vehicles": [
    {
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "plateNumber": "ABC 1234",
      "color": "Pearl White"
    },
    {
      "make": "Honda",
      "model": "CR-V",
      "year": 2021,
      "plateNumber": "XYZ 5678",
      "color": "Metallic Silver"
    }
  ]
}
```

#### **Anna Lopez (VIP Silver Member)**
```json
{
  "fullName": "Anna Marie Lopez",
  "email": "anna.lopez@gmail.com",
  "phoneNumber": "+63 918 987 6543",
  "address": "456 Oak Avenue, Boalan, Zamboanga City",
  "membershipTier": "VIP Silver",
  "loyaltyPoints": 1250,
  "totalSpent": 8500.00,
  "vehicles": [
    {
      "make": "Nissan",
      "model": "Altima",
      "year": 2020,
      "plateNumber": "DEF 9012",
      "color": "Deep Blue"
    }
  ]
}
```

### 🏢 **Branch Information**

#### **Tumaga Branch**
```json
{
  "id": "branch_tumaga_001",
  "name": "Fayeed Auto Care - Tumaga",
  "address": "Tumaga Road, Zamboanga City, Philippines",
  "coordinates": {
    "latitude": 6.9214,
    "longitude": 122.0790
  },
  "phoneNumber": "+63 62 123 4567",
  "operatingHours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 6:00 PM",
    "saturday": "8:00 AM - 6:00 PM",
    "sunday": "9:00 AM - 5:00 PM"
  },
  "capacity": 15,
  "services": ["all"],
  "amenities": ["wifi", "waiting_area", "restroom", "vending_machine"]
}
```

#### **Boalan Branch**
```json
{
  "id": "branch_boalan_002",
  "name": "Fayeed Auto Care - Boalan",
  "address": "Boalan Road, Zamboanga City, Philippines",
  "coordinates": {
    "latitude": 6.9100,
    "longitude": 122.0730
  },
  "phoneNumber": "+63 62 765 4321",
  "operatingHours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 6:00 PM",
    "saturday": "8:00 AM - 6:00 PM",
    "sunday": "9:00 AM - 5:00 PM"
  },
  "capacity": 12,
  "services": ["all"],
  "amenities": ["wifi", "waiting_area", "restroom"]
}
```

### 🚗 **Service Offerings**

| Service | Duration | Price (PHP) | Category | Description |
|---------|----------|-------------|----------|-------------|
| **Quick Wash** | 20 min | ₱250 | Basic | Exterior wash and rinse |
| **Classic Wash** | 45 min | ₱450 | Standard | Complete wash with interior |
| **Premium Wash** | 90 min | ₱850 | Premium | Detailed cleaning and wax |
| **VIP Pro Wash** | 120 min | ₱1,200 | VIP | Full detailing service |
| **VIP Pro Max** | 150 min | ₱1,800 | VIP | Complete detailing with protection |
| **Engine Cleaning** | 60 min | ₱800 | Specialty | Engine bay cleaning |
| **Interior Detailing** | 90 min | ₱1,000 | Specialty | Deep interior cleaning |
| **Ceramic Coating** | 180 min | ₱3,500 | Premium | Paint protection coating |

---

## 🔧 Configuration

### ⚙️ **Application Configuration**

#### **Database Connection Settings**

**Node.js/Express (.env):**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fayeed_auto_care
DB_USER=fayeed_user
DB_PASSWORD=fayeed_pass_2024

# Connection Pool Settings
DB_CONNECTION_LIMIT=20
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
```

**Flutter (config.dart):**
```dart
class DatabaseConfig {
  static const String databaseName = 'fayeed_auto_care.db';
  static const int databaseVersion = 1;
  
  // For SQLite in Flutter
  static const String databasePath = 'assets/databases/fayeed_auto_care.sqlite';
  
  // For API connection
  static const String apiBaseUrl = 'https://api.fayeedautocare.com';
}
```

#### **phpMyAdmin Configuration**

**Access phpMyAdmin:**
- **URL**: http://localhost:8080
- **Username**: fayeed_user
- **Password**: fayeed_pass_2024
- **Server**: mysql (if using Docker) or localhost

**Configure phpMyAdmin:**
```php
// config.inc.php (if needed)
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['user'] = 'fayeed_user';
$cfg['Servers'][$i]['password'] = 'fayeed_pass_2024';
$cfg['UploadDir'] = '/tmp/';
$cfg['SaveDir'] = '/tmp/';
$cfg['MaxRows'] = 100;
```

---

## ✅ Verification

### 🔍 **Database Health Check**

#### **Test Database Connection**
```bash
# MySQL connection test
mysql -h localhost -u fayeed_user -pfayeed_pass_2024 -e "SELECT 'Connection successful' as status;"

# PostgreSQL connection test
psql -h localhost -U fayeed_user -d fayeed_auto_care -c "SELECT 'Connection successful' as status;"

# SQLite connection test
sqlite3 fayeed_auto_care.sqlite "SELECT 'Connection successful' as status;"
```

#### **Verify Sample Data**
```sql
-- Check record counts
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'branches', COUNT(*) FROM branches
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

-- Check user accounts
SELECT email, full_name, created_at FROM users ORDER BY created_at LIMIT 10;

-- Check services
SELECT name, base_price, duration_minutes FROM services ORDER BY base_price;

-- Check recent bookings
SELECT 
    b.id,
    u.full_name,
    s.name as service_name,
    br.name as branch_name,
    b.booking_date,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN services s ON b.service_id = s.id
JOIN branches br ON b.branch_id = br.id
ORDER BY b.created_at DESC
LIMIT 10;
```

#### **Test Application Integration**
```bash
# Test API health endpoint
curl -X GET http://localhost:3000/api/health

# Test database connection through API
curl -X GET http://localhost:3000/api/services

# Test user authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@gmail.com","password":"Customer123!"}'
```

### 📊 **Performance Verification**

#### **Database Performance Test**
```sql
-- Test query performance
EXPLAIN SELECT * FROM bookings WHERE user_id = 'user_john_doe_001' AND booking_date >= '2024-01-01';

-- Check index usage
SHOW INDEX FROM bookings;
SHOW INDEX FROM users;
SHOW INDEX FROM services;

-- Analyze table optimization
ANALYZE TABLE users, bookings, services, branches;
```

#### **Connection Pool Test**
```bash
# Test multiple concurrent connections
for i in {1..10}; do
  mysql -h localhost -u fayeed_user -pfayeed_pass_2024 -e "SELECT CONNECTION_ID(), NOW();" &
done
wait
```

---

## 🔧 Troubleshooting

### ❗ **Common Issues**

#### **MySQL Connection Errors**

**Issue**: Access denied for user 'fayeed_user'@'localhost'
```bash
# Solution 1: Reset user password
mysql -u root -p
ALTER USER 'fayeed_user'@'localhost' IDENTIFIED BY 'fayeed_pass_2024';
FLUSH PRIVILEGES;

# Solution 2: Recreate user
DROP USER IF EXISTS 'fayeed_user'@'localhost';
CREATE USER 'fayeed_user'@'localhost' IDENTIFIED BY 'fayeed_pass_2024';
GRANT ALL PRIVILEGES ON fayeed_auto_care.* TO 'fayeed_user'@'localhost';
FLUSH PRIVILEGES;
```

**Issue**: Can't connect to MySQL server
```bash
# Check MySQL service status
sudo systemctl status mysql    # Linux
brew services list | grep mysql  # macOS

# Start MySQL service
sudo systemctl start mysql     # Linux
brew services start mysql@8.0  # macOS

# Check MySQL port
netstat -an | grep 3306
```

#### **Import Errors**

**Issue**: Error importing SQL file
```bash
# Check SQL file syntax
mysql -u fayeed_user -pfayeed_pass_2024 --execute="SELECT 1;" > /dev/null && echo "Connection OK"

# Import with verbose output
mysql -u fayeed_user -pfayeed_pass_2024 -v fayeed_auto_care < mysql/complete/fayeed_auto_care_complete.sql

# Check for specific errors
mysql -u fayeed_user -pfayeed_pass_2024 fayeed_auto_care -e "SHOW WARNINGS;"
```

#### **Docker Issues**

**Issue**: Docker container won't start
```bash
# Check Docker service
sudo systemctl status docker
sudo systemctl start docker

# Check container logs
docker logs fayeed_mysql
docker logs fayeed_phpmyadmin

# Remove and recreate containers
docker-compose down
docker-compose up -d
```

#### **Performance Issues**

**Issue**: Slow query performance
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Check current configuration
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';

-- Optimize tables
OPTIMIZE TABLE users, bookings, services, branches;

-- Update table statistics
ANALYZE TABLE users, bookings, services, branches;
```

### 🔍 **Debug Mode**

#### **Enable MySQL Debugging**
```sql
-- Enable general query log
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/tmp/mysql-general.log';

-- Monitor queries
-- Linux/macOS: tail -f /tmp/mysql-general.log
-- Windows: type /tmp/mysql-general.log
```

#### **Check Database Status**
```sql
-- Show database status
SHOW STATUS LIKE 'Connections';
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';
SHOW STATUS LIKE 'Uptime';

-- Show process list
SHOW PROCESSLIST;

-- Show engine status
SHOW ENGINE INNODB STATUS;
```

---

## 📞 Support

### 🆘 **Getting Help**

#### **Support Channels**
- 📧 **Database Support**: db@fayeedautocare.com
- 💬 **Live Chat**: Available during business hours
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/fayeedautocare/issues)
- 📖 **Documentation**: https://docs.fayeedautocare.com

#### **Community Resources**
- 💬 **Discord**: [Developer Community](https://discord.gg/fayeedautocare)
- 📱 **Telegram**: [@fayeeddev](https://t.me/fayeeddev)
- 🐦 **Twitter**: [@fayeedautocare](https://twitter.com/fayeedautocare)

### 📚 **Additional Resources**

#### **Database Documentation**
- **MySQL Manual**: https://dev.mysql.com/doc/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQLite Documentation**: https://www.sqlite.org/docs.html

#### **Video Tutorials**
- **Database Setup Walkthrough**: [YouTube](https://youtube.com/fayeedautocare)
- **phpMyAdmin Tutorial**: [Admin Guide Video](https://youtu.be/phpmyadmin-fayeed)
- **Mobile Database Sync**: [Flutter Database Video](https://youtu.be/flutter-db-fayeed)

---

## ✅ Setup Complete!

Your Fayeed Auto Care database is now ready with:

✅ **Production-ready schema** with 15+ optimized tables  
✅ **500+ sample records** for comprehensive testing  
✅ **6 test user accounts** with different roles and memberships  
✅ **2 service branches** with complete location data  
✅ **15 service offerings** with realistic pricing  
✅ **Performance optimizations** with proper indexing  
✅ **Security configurations** with proper user privileges  
✅ **Backup and maintenance** procedures established

### 🎯 **Next Steps**

1. **Verify Installation**: Test database connections and sample data
2. **Configure Application**: Update connection strings in your apps
3. **Test Functionality**: Try user login, booking creation, payment processing
4. **Customize Data**: Replace sample data with your actual business data
5. **Set up Monitoring**: Configure database monitoring and alerts
6. **Plan Backups**: Set up automated backup procedures

### 📞 **Need Help?**

If you encounter any issues during database setup:
- 📧 **Email**: db@fayeedautocare.com
- 💬 **Live Chat**: Available on our website
- 🐛 **Issues**: Report problems on GitHub

---

**🎉 Your database is now powering the future of car care!** 🚗💾✨

*Built with ❤️ by the Fayeed Auto Care database team*
