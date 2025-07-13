#!/bin/bash

echo "🚀 Setting up Fayeed Auto Care with MySQL + Firebase Auth"

# Create necessary directories
mkdir -p database/mysql
mkdir -p flutter_app/assets/{images,icons,fonts}

# Install Node.js dependencies for MySQL support
echo "📦 Installing MySQL dependencies..."
npm install mysql2 firebase-admin

# Install Flutter dependencies  
echo "📱 Installing Flutter dependencies..."
cd flutter_app
cp pubspec_mysql.yaml pubspec.yaml
# flutter pub get (uncomment when Flutter is available)
cd ..

# Start MySQL and phpMyAdmin
echo "🗄️  Starting MySQL database and phpMyAdmin..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to initialize..."
sleep 30

# Check if MySQL is running
echo "🔍 Checking MySQL connection..."
docker exec fayeed_mysql mysql -ufayeed_user -pfayeed_pass_2024 -e "SHOW DATABASES;"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services running:"
echo "   MySQL: localhost:3306"
echo "   phpMyAdmin: http://localhost:8080"
echo "   Username: fayeed_user"
echo "   Password: fayeed_pass_2024"
echo "   Database: fayeed_auto_care"
echo ""
echo "🔥 Firebase Auth configuration needed:"
echo "   1. Go to Firebase Console"
echo "   2. Create new project or use existing"
echo "   3. Enable Authentication"
echo "   4. Download service account key"
echo "   5. Set environment variables:"
echo "      FIREBASE_PROJECT_ID=your-project-id"
echo "      FIREBASE_PRIVATE_KEY=your-private-key"
echo "      FIREBASE_CLIENT_EMAIL=your-client-email"
echo ""
echo "📱 To run Flutter app:"
echo "   cd flutter_app"
echo "   flutter pub get"
echo "   flutter run -d chrome"
echo ""
echo "🔧 To run Express server:"
echo "   npm run dev (with new MySQL routes)"
echo ""
