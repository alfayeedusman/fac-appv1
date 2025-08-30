#!/bin/bash

# =====================================================
# phpMyAdmin Setup Script for Fayeed Auto Care
# Custom installation with access at /facmydb
# =====================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PHPMYADMIN_VERSION="5.2.1"
PHPMYADMIN_DIR="/var/www/phpmyadmin"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
PHP_VERSION="8.2"
CUSTOM_PATH="/facmydb"

# Database configuration
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-fayeed_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-fayeed_pass_2024}"
MYSQL_DATABASE="${MYSQL_DATABASE:-fayeed_auto_care}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root. Use sudo."
        exit 1
    fi
}

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    print_status "Detected OS: $OS $VER"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing required dependencies..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get update
        apt-get install -y nginx php${PHP_VERSION} php${PHP_VERSION}-fpm php${PHP_VERSION}-mysql \
                          php${PHP_VERSION}-mbstring php${PHP_VERSION}-zip php${PHP_VERSION}-gd \
                          php${PHP_VERSION}-json php${PHP_VERSION}-curl php${PHP_VERSION}-xml \
                          php${PHP_VERSION}-intl php${PHP_VERSION}-bcmath php${PHP_VERSION}-bz2 \
                          wget unzip mysql-client curl
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        yum update -y
        yum install -y epel-release
        yum install -y nginx php php-fpm php-mysql php-mbstring php-zip php-gd \
                      php-json php-curl php-xml php-intl php-bcmath php-bz2 \
                      wget unzip mysql curl
    else
        print_error "Unsupported operating system: $OS"
        exit 1
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to download and install phpMyAdmin
install_phpmyadmin() {
    print_status "Downloading phpMyAdmin version $PHPMYADMIN_VERSION..."
    
    # Create phpMyAdmin directory
    mkdir -p "$PHPMYADMIN_DIR"
    
    # Download phpMyAdmin
    cd /tmp
    wget "https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.zip"
    
    # Extract phpMyAdmin
    unzip -q "phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.zip"
    
    # Move files to web directory
    cp -r "phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages/"* "$PHPMYADMIN_DIR/"
    
    # Set proper permissions
    chown -R www-data:www-data "$PHPMYADMIN_DIR"
    chmod -R 755 "$PHPMYADMIN_DIR"
    
    # Create temp directory
    mkdir -p "$PHPMYADMIN_DIR/tmp"
    chmod 777 "$PHPMYADMIN_DIR/tmp"
    
    print_success "phpMyAdmin installed to $PHPMYADMIN_DIR"
}

# Function to configure phpMyAdmin
configure_phpmyadmin() {
    print_status "Configuring phpMyAdmin..."
    
    # Copy our custom configuration
    if [ -f "./config/phpmyadmin/config.inc.php" ]; then
        cp "./config/phpmyadmin/config.inc.php" "$PHPMYADMIN_DIR/config.inc.php"
        print_success "Custom phpMyAdmin configuration applied"
    else
        # Create basic configuration if custom file doesn't exist
        cat > "$PHPMYADMIN_DIR/config.inc.php" << EOF
<?php
\$cfg['blowfish_secret'] = 'fayeed-auto-care-32-char-secret-key!';
\$i = 0;
\$i++;
\$cfg['Servers'][\$i]['host'] = '$MYSQL_HOST';
\$cfg['Servers'][\$i]['port'] = '$MYSQL_PORT';
\$cfg['Servers'][\$i]['auth_type'] = 'cookie';
\$cfg['Servers'][\$i]['only_db'] = '$MYSQL_DATABASE';
\$cfg['UploadDir'] = '/tmp/';
\$cfg['SaveDir'] = '/tmp/';
\$cfg['CheckConfigurationPermissions'] = false;
\$cfg['AllowArbitraryServer'] = false;
\$cfg['LoginCookieValidity'] = 3600;
\$cfg['Servers'][\$i]['hide_db'] = '^(information_schema|performance_schema|mysql|sys)$';
\$cfg['TitleServer'] = 'Fayeed Auto Care - Database Administration';
\$cfg['AllowUserDropDatabase'] = false;
?>
EOF
        print_warning "Basic phpMyAdmin configuration created"
    fi
    
    # Set proper permissions for config file
    chown www-data:www-data "$PHPMYADMIN_DIR/config.inc.php"
    chmod 644 "$PHPMYADMIN_DIR/config.inc.php"
    
    # Remove setup directory for security
    rm -rf "$PHPMYADMIN_DIR/setup"
    
    print_success "phpMyAdmin configuration completed"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx for custom path $CUSTOM_PATH..."
    
    # Create Nginx configuration for phpMyAdmin
    cat > "$NGINX_CONF_DIR/phpmyadmin" << EOF
server {
    listen 80;
    server_name _;
    
    # Main application root
    root /var/www/html;
    index index.php index.html index.htm;
    
    # phpMyAdmin configuration for custom path $CUSTOM_PATH
    location $CUSTOM_PATH {
        alias $PHPMYADMIN_DIR;
        index index.php index.html index.htm;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Handle PHP files
        location ~ $CUSTOM_PATH/(.+\.php)$ {
            alias $PHPMYADMIN_DIR;
            
            # Security - deny access to sensitive directories
            location ~ $CUSTOM_PATH/(libraries|setup|config)/ {
                deny all;
                return 404;
            }
            
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
            fastcgi_index index.php;
            
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $PHPMYADMIN_DIR/\$1;
            fastcgi_param SCRIPT_NAME $CUSTOM_PATH/\$1;
            fastcgi_param REQUEST_URI \$request_uri;
            fastcgi_param DOCUMENT_ROOT $PHPMYADMIN_DIR;
            fastcgi_param PHP_VALUE "upload_max_filesize=100M \\n post_max_size=100M \\n max_execution_time=300";
            
            fastcgi_connect_timeout 300;
            fastcgi_send_timeout 300;
            fastcgi_read_timeout 300;
        }
        
        # Handle static files
        location ~ $CUSTOM_PATH/(.+\.(css|js|png|jpg|jpeg|gif|ico|svg))$ {
            alias $PHPMYADMIN_DIR/\$1;
            expires 30d;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Deny access to sensitive files
        location ~ $CUSTOM_PATH/(config\.inc\.php|\.ht|\.user\.ini|\.git) {
            deny all;
            return 404;
        }
        
        # Handle directory index
        location = $CUSTOM_PATH/ {
            alias $PHPMYADMIN_DIR/;
            index index.php;
        }
    }
    
    # Block sensitive files globally
    location ~ $CUSTOM_PATH.*\.(txt|log|md)$ {
        deny all;
        return 404;
    }
}
EOF
    
    # Enable the site
    ln -sf "$NGINX_CONF_DIR/phpmyadmin" "$NGINX_ENABLED_DIR/phpmyadmin"
    
    # Remove default Nginx site if it exists
    rm -f "$NGINX_ENABLED_DIR/default"
    
    # Test Nginx configuration
    nginx -t
    if [ $? -eq 0 ]; then
        print_success "Nginx configuration is valid"
        systemctl reload nginx
        print_success "Nginx reloaded successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to configure PHP-FPM
configure_php_fpm() {
    print_status "Configuring PHP-FPM..."
    
    # Update PHP-FPM configuration for better performance
    PHP_FPM_CONF="/etc/php/${PHP_VERSION}/fpm/php.ini"
    
    if [ -f "$PHP_FPM_CONF" ]; then
        # Backup original configuration
        cp "$PHP_FPM_CONF" "${PHP_FPM_CONF}.backup"
        
        # Update PHP settings for phpMyAdmin
        sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' "$PHP_FPM_CONF"
        sed -i 's/post_max_size = .*/post_max_size = 100M/' "$PHP_FPM_CONF"
        sed -i 's/max_execution_time = .*/max_execution_time = 300/' "$PHP_FPM_CONF"
        sed -i 's/max_input_time = .*/max_input_time = 300/' "$PHP_FPM_CONF"
        sed -i 's/memory_limit = .*/memory_limit = 512M/' "$PHP_FPM_CONF"
        
        # Restart PHP-FPM
        systemctl restart php${PHP_VERSION}-fpm
        print_success "PHP-FPM configured and restarted"
    else
        print_warning "PHP-FPM configuration file not found at $PHP_FPM_CONF"
    fi
}

# Function to create MySQL user for phpMyAdmin
create_mysql_user() {
    print_status "Creating MySQL user for phpMyAdmin..."
    
    # Test MySQL connection
    if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root -p"${MYSQL_ROOT_PASSWORD:-}" -e "SELECT 1;" 2>/dev/null; then
        # Create database if it doesn't exist
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root -p"${MYSQL_ROOT_PASSWORD:-}" << EOF
CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOF
        print_success "MySQL user created/updated successfully"
    else
        print_warning "Could not connect to MySQL. Please ensure MySQL is running and create the user manually:"
        print_warning "User: $MYSQL_USER"
        print_warning "Password: $MYSQL_PASSWORD"
        print_warning "Database: $MYSQL_DATABASE"
    fi
}

# Function to enable services
enable_services() {
    print_status "Enabling and starting services..."
    
    # Enable and start Nginx
    systemctl enable nginx
    systemctl start nginx
    
    # Enable and start PHP-FPM
    systemctl enable php${PHP_VERSION}-fpm
    systemctl start php${PHP_VERSION}-fpm
    
    print_success "Services enabled and started"
}

# Function to create secure access script
create_access_script() {
    print_status "Creating access management script..."
    
    cat > "/usr/local/bin/phpmyadmin-access" << 'EOF'
#!/bin/bash

# phpMyAdmin Access Management Script
# Usage: phpmyadmin-access [enable|disable|status|logs]

NGINX_CONF="/etc/nginx/sites-available/phpmyadmin"
NGINX_ENABLED="/etc/nginx/sites-enabled/phpmyadmin"

case "$1" in
    enable)
        ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
        nginx -t && systemctl reload nginx
        echo "phpMyAdmin access enabled at /facmydb"
        ;;
    disable)
        rm -f "$NGINX_ENABLED"
        nginx -t && systemctl reload nginx
        echo "phpMyAdmin access disabled"
        ;;
    status)
        if [ -L "$NGINX_ENABLED" ]; then
            echo "phpMyAdmin access is ENABLED"
            echo "Access URL: http://$(hostname -I | awk '{print $1}')/facmydb"
        else
            echo "phpMyAdmin access is DISABLED"
        fi
        ;;
    logs)
        tail -f /var/log/nginx/access.log | grep facmydb
        ;;
    *)
        echo "Usage: $0 [enable|disable|status|logs]"
        echo "  enable  - Enable phpMyAdmin access"
        echo "  disable - Disable phpMyAdmin access"
        echo "  status  - Show current access status"
        echo "  logs    - Show phpMyAdmin access logs"
        ;;
esac
EOF
    
    chmod +x "/usr/local/bin/phpmyadmin-access"
    print_success "Access management script created at /usr/local/bin/phpmyadmin-access"
}

# Function to display final information
display_final_info() {
    print_success "phpMyAdmin installation completed successfully!"
    echo
    echo "=========================================="
    echo "  Fayeed Auto Care - phpMyAdmin Setup"
    echo "=========================================="
    echo
    echo "Access Information:"
    echo "  URL: http://$(hostname -I | awk '{print $1}')$CUSTOM_PATH"
    echo "  Path: $CUSTOM_PATH"
    echo "  Database: $MYSQL_DATABASE"
    echo
    echo "Login Credentials:"
    echo "  Username: $MYSQL_USER"
    echo "  Password: $MYSQL_PASSWORD"
    echo
    echo "Management Commands:"
    echo "  Enable access:  phpmyadmin-access enable"
    echo "  Disable access: phpmyadmin-access disable"
    echo "  Check status:   phpmyadmin-access status"
    echo "  View logs:      phpmyadmin-access logs"
    echo
    echo "Files and Directories:"
    echo "  phpMyAdmin: $PHPMYADMIN_DIR"
    echo "  Nginx config: $NGINX_CONF_DIR/phpmyadmin"
    echo "  PHP-FPM version: $PHP_VERSION"
    echo
    echo "Security Notes:"
    echo "  - Only database '$MYSQL_DATABASE' is accessible"
    echo "  - Setup directory has been removed"
    echo "  - Security headers are configured"
    echo "  - File upload limit: 100MB"
    echo
    print_warning "For production use, consider:"
    print_warning "  - Adding IP restrictions"
    print_warning "  - Enabling HTTPS/SSL"
    print_warning "  - Setting up fail2ban"
    print_warning "  - Regular security updates"
    echo "=========================================="
}

# Main installation function
main() {
    echo "=========================================="
    echo "  Fayeed Auto Care - phpMyAdmin Setup"
    echo "=========================================="
    echo
    
    # Check if running as root
    check_root
    
    # Detect operating system
    detect_os
    
    # Install dependencies
    install_dependencies
    
    # Download and install phpMyAdmin
    install_phpmyadmin
    
    # Configure phpMyAdmin
    configure_phpmyadmin
    
    # Configure Nginx
    configure_nginx
    
    # Configure PHP-FPM
    configure_php_fpm
    
    # Create MySQL user
    create_mysql_user
    
    # Enable services
    enable_services
    
    # Create access management script
    create_access_script
    
    # Display final information
    display_final_info
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Fayeed Auto Care phpMyAdmin Setup Script"
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --uninstall    Remove phpMyAdmin installation"
        echo
        echo "Environment variables:"
        echo "  MYSQL_HOST     MySQL host (default: localhost)"
        echo "  MYSQL_PORT     MySQL port (default: 3306)"
        echo "  MYSQL_USER     MySQL username (default: fayeed_user)"
        echo "  MYSQL_PASSWORD MySQL password (default: fayeed_pass_2024)"
        echo "  MYSQL_DATABASE MySQL database (default: fayeed_auto_care)"
        exit 0
        ;;
    --uninstall)
        print_status "Uninstalling phpMyAdmin..."
        rm -rf "$PHPMYADMIN_DIR"
        rm -f "$NGINX_CONF_DIR/phpmyadmin"
        rm -f "$NGINX_ENABLED_DIR/phpmyadmin"
        rm -f "/usr/local/bin/phpmyadmin-access"
        systemctl reload nginx
        print_success "phpMyAdmin uninstalled successfully"
        exit 0
        ;;
    *)
        main
        ;;
esac
