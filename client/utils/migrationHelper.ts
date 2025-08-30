import { neonDbClient } from '@/services/neonDatabaseService';
import { toast } from '@/hooks/use-toast';

// Helper to migrate existing localStorage data to Neon database
export class DataMigrationHelper {
  private static instance: DataMigrationHelper;
  
  static getInstance(): DataMigrationHelper {
    if (!DataMigrationHelper.instance) {
      DataMigrationHelper.instance = new DataMigrationHelper();
    }
    return DataMigrationHelper.instance;
  }

  // Check if migration is needed
  hasLocalStorageData(): boolean {
    const keys = [
      'fac_users',
      'fac_bookings', 
      'system_notifications',
      'admin_settings',
      'fayeed_ads',
      'fayeed_ad_dismissals'
    ];
    
    return keys.some(key => {
      const data = localStorage.getItem(key);
      return data && JSON.parse(data).length > 0;
    });
  }

  // Get migration summary
  getMigrationSummary(): { [key: string]: number } {
    const summary: { [key: string]: number } = {};
    
    const dataTypes = [
      { key: 'fac_users', label: 'Users' },
      { key: 'fac_bookings', label: 'Bookings' },
      { key: 'system_notifications', label: 'Notifications' },
      { key: 'admin_settings', label: 'Settings' },
      { key: 'fayeed_ads', label: 'Ads' },
    ];

    dataTypes.forEach(({ key, label }) => {
      try {
        const data = localStorage.getItem(key);
        summary[label] = data ? JSON.parse(data).length : 0;
      } catch {
        summary[label] = 0;
      }
    });

    return summary;
  }

  // Migrate all localStorage data to Neon database
  async migrateAllData(): Promise<{ success: boolean; migrated: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;

    try {
      // Check database connection
      const connectionTest = await neonDbClient.testConnection();
      if (!connectionTest.connected) {
        throw new Error('Database not connected');
      }

      // Migrate users (register them)
      await this.migrateUsers(errors, migrated);
      
      // Migrate bookings
      await this.migrateBookings(errors, migrated);
      
      // Migrate settings
      await this.migrateSettings(errors, migrated);
      
      // Migrate ads
      await this.migrateAds(errors, migrated);

      return { success: errors.length === 0, migrated, errors };
    } catch (error) {
      errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, migrated, errors };
    }
  }

  private async migrateUsers(errors: string[], migrated: number): Promise<void> {
    try {
      const users = this.getLocalStorageData('fac_users');
      for (const user of users) {
        try {
          const result = await neonDbClient.register({
            email: user.email,
            password: user.password,
            fullName: user.fullName,
            contactNumber: user.contactNumber || '',
            address: user.address || '',
            branchLocation: user.branchLocation || 'Main Branch',
            role: user.role || 'user',
            carUnit: user.carUnit,
            carPlateNumber: user.carPlateNumber,
            carType: user.carType,
          });
          
          if (result.success) {
            migrated++;
          } else {
            if (!result.error?.includes('already exists')) {
              errors.push(`Failed to migrate user ${user.email}: ${result.error}`);
            }
          }
        } catch (error) {
          errors.push(`Error migrating user ${user.email}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Error reading users from localStorage: ${error}`);
    }
  }

  private async migrateBookings(errors: string[], migrated: number): Promise<void> {
    try {
      const bookings = this.getLocalStorageData('fac_bookings');
      for (const booking of bookings) {
        try {
          const result = await neonDbClient.createBooking({
            userId: booking.userId,
            guestInfo: booking.guestInfo,
            type: booking.type || 'registered',
            category: booking.category || 'carwash',
            service: booking.service,
            unitType: booking.unitType || 'car',
            unitSize: booking.unitSize,
            plateNumber: booking.plateNumber,
            vehicleModel: booking.vehicleModel,
            date: booking.date,
            timeSlot: booking.timeSlot,
            branch: booking.branch,
            serviceLocation: booking.serviceLocation,
            estimatedDuration: booking.estimatedDuration,
            basePrice: parseFloat(booking.basePrice) || 0,
            totalPrice: parseFloat(booking.totalPrice) || 0,
            currency: booking.currency || 'PHP',
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus || 'pending',
            receiptUrl: booking.receiptUrl,
            status: booking.status || 'pending',
            notes: booking.notes,
            specialRequests: booking.specialRequests,
            pointsEarned: booking.pointsEarned || 0,
            loyaltyRewardsApplied: booking.loyaltyRewardsApplied,
            assignedCrew: booking.assignedCrew,
            crewNotes: booking.crewNotes,
            completedAt: booking.completedAt,
            customerRating: booking.customerRating,
            customerFeedback: booking.customerFeedback,
          });
          
          if (result.success) {
            migrated++;
          } else {
            errors.push(`Failed to migrate booking ${booking.id}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error migrating booking ${booking.id}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Error reading bookings from localStorage: ${error}`);
    }
  }

  private async migrateSettings(errors: string[], migrated: number): Promise<void> {
    try {
      const settings = this.getLocalStorageData('admin_settings');
      for (const setting of settings) {
        try {
          const result = await neonDbClient.updateSetting(
            setting.key,
            setting.value,
            setting.description,
            setting.category
          );
          
          if (result.success) {
            migrated++;
          } else {
            errors.push(`Failed to migrate setting ${setting.key}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error migrating setting ${setting.key}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Error reading settings from localStorage: ${error}`);
    }
  }

  private async migrateAds(errors: string[], migrated: number): Promise<void> {
    try {
      const ads = this.getLocalStorageData('fayeed_ads');
      for (const ad of ads) {
        try {
          const result = await neonDbClient.createAd({
            title: ad.title,
            content: ad.content,
            imageUrl: ad.imageUrl,
            duration: ad.duration,
            isActive: ad.isActive,
            targetPages: ad.targetPages,
            adminEmail: ad.adminEmail,
            impressions: ad.impressions || 0,
            clicks: ad.clicks || 0,
          });
          
          if (result.success) {
            migrated++;
          } else {
            errors.push(`Failed to migrate ad ${ad.id}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error migrating ad ${ad.id}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Error reading ads from localStorage: ${error}`);
    }
  }

  private getLocalStorageData(key: string): any[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Clear localStorage data after successful migration
  clearLocalStorageData(): void {
    const keys = [
      'fac_users',
      'fac_bookings',
      'system_notifications', 
      'admin_settings',
      'fayeed_ads',
      'fayeed_ad_dismissals'
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
    });

    toast({
      title: 'LocalStorage Cleared',
      description: 'All data has been migrated to Neon database and localStorage has been cleared.',
    });
  }

  // Show migration prompt to user
  showMigrationPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      const summary = this.getMigrationSummary();
      const hasData = Object.values(summary).some(count => count > 0);
      
      if (!hasData) {
        resolve(false);
        return;
      }

      const summaryText = Object.entries(summary)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      toast({
        title: 'Local Data Found',
        description: `Found local data: ${summaryText}. Would you like to migrate to Neon database?`,
        action: (
          <div className="flex gap-2">
            <button 
              onClick={() => resolve(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Migrate
            </button>
            <button 
              onClick={() => resolve(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Skip
            </button>
          </div>
        ),
      });
    });
  }
}

// Export singleton instance
export const migrationHelper = DataMigrationHelper.getInstance();