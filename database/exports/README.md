# 📦 Database Exports - Fayeed Auto Care

This folder contains exported database files for easy import into your local development environment.

## 📁 **Files Included**

### **MySQL Export**

- `fayeed_auto_care_schema.sql` - Complete database schema
- `fayeed_auto_care_sample_data.sql` - Sample data with test accounts
- `fayeed_auto_care_complete.sql` - Schema + Sample data combined

### **SQLite Export**

- `fayeed_auto_care.sqlite` - Complete SQLite database with sample data
- `fayeed_auto_care_schema.sqlite` - Schema only

## 🚀 **Quick Import Instructions**

### **For MySQL:**

```bash
# Import schema only
mysql -u root -p < fayeed_auto_care_schema.sql

# Import with sample data
mysql -u root -p < fayeed_auto_care_complete.sql

# Or step by step:
mysql -u root -p < fayeed_auto_care_schema.sql
mysql -u root -p fayeed_auto_care < fayeed_auto_care_sample_data.sql
```

### **For SQLite:**

```bash
# Copy the database file
cp fayeed_auto_care.sqlite /path/to/your/project/

# Or create from schema
sqlite3 fayeed_auto_care.sqlite < fayeed_auto_care_schema.sqlite
```

## 🔐 **Sample Login Credentials**

Refer to `../SAMPLE_LOGIN_CREDENTIALS.md` for test account details.

## 📊 **Sample Data Includes**

- 6 Test user accounts (Superadmin, Admin, VIP customers, Regular customers)
- 2 Branches (Tumaga, Boalan)
- 4 Services (Car Wash, Detailing, Oil Change, Tire Service)
- Sample bookings and transactions
- Loyalty points and membership levels
- QR codes for branch check-ins

## 🔄 **Sync Configuration**

Both databases are configured for:

- Firebase Auth integration
- Real-time synchronization
- Offline capability
- Cross-platform compatibility

Last Updated: $(date)
