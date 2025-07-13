# 🚀 Database Setup Instructions

## Quick Start

### 1. **MySQL Setup**

```bash
# Create database and import complete schema + data
mysql -u root -p < fayeed_auto_care_complete.sql

# OR import step by step:
mysql -u root -p < fayeed_auto_care_schema.sql
mysql -u root -p fayeed_auto_care < fayeed_auto_care_sample_data.sql
```

### 2. **SQLite Setup**

```bash
# Create SQLite database
sqlite3 fayeed_auto_care.sqlite < fayeed_auto_care_schema.sqlite

# Add sample data
sqlite3 fayeed_auto_care.sqlite < fayeed_auto_care_sample.sql
```

### 3. **Docker MySQL Setup**

```bash
# Start MySQL with phpMyAdmin
docker-compose up -d

# Import to Docker MySQL
docker exec -i mysql_container mysql -u root -ppassword < fayeed_auto_care_complete.sql
```

## 📋 **Sample Accounts**

After import, you can test with these accounts:

| Role             | Email                             | Password         |
| ---------------- | --------------------------------- | ---------------- |
| Superadmin       | superadmin@fayeedautocare.com     | SuperAdmin2024!  |
| Manager          | manager.tumaga@fayeedautocare.com | TumagaAdmin2024! |
| VIP Customer     | john.doe@gmail.com                | Customer123!     |
| Regular Customer | anna.lopez@gmail.com              | Anna2024!        |

## 🔧 **Development Notes**

- **MySQL**: Production-ready with full relations and constraints
- **SQLite**: Mobile/offline development, compatible with Flutter
- **Sample Data**: 6 users, 2 branches, 4 services, sample bookings
- **QR Codes**: Branch QR data included for testing scanner

## 📱 **QR Code Testing**

Test QR scanner with these JSON QR codes:

**Tumaga Branch:**

```json
{ "type": "branch", "id": "TUMAGA-001", "name": "Fayeed Auto Care - Tumaga" }
```

**Boalan Branch:**

```json
{ "type": "branch", "id": "BOALAN-002", "name": "Fayeed Auto Care - Boalan" }
```

## 🔄 **Sync Configuration**

Both databases support:

- ✅ Firebase Auth sync
- ✅ Offline/online sync queue
- ✅ Real-time updates
- ✅ Cross-platform compatibility

---

**Need Help?** Check `SAMPLE_LOGIN_CREDENTIALS.md` for full account details.
