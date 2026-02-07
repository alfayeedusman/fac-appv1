/**
 * Real-time Location Tracking Service
 * Handles all communication with the real-time API endpoints
 */

import { log, info, warn, error as logError } from '@/utils/logger';

interface CrewLocation {
  crew_id: number;
  name: string;
  phone: string;
  crew_group_id: number;
  group_name: string;
  group_color: string;
  status: 'online' | 'offline' | 'busy' | 'available' | 'break' | 'emergency';
  status_since: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  address?: string;
  battery_level?: number;
  signal_strength?: number;
  last_update: string;
  current_job_id?: number;
  job_number?: string;
  job_status?: string;
  job_address?: string;
  service_name?: string;
  service_category?: string;
  job_progress?: number;
}

interface ActiveJob {
  id: number;
  job_number: string;
  status: 'pending' | 'assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  customer_id: number;
  service_address: string;
  service_latitude?: number;
  service_longitude?: number;
  scheduled_start: string;
  actual_start?: string;
  estimated_duration: number;
  total_amount: number;
  special_instructions?: string;
  crew_id?: number;
  crew_name?: string;
  crew_phone?: string;
  crew_latitude?: number;
  crew_longitude?: number;
  crew_last_update?: string;
  service_name: string;
  service_category: string;
  wash_type: string;
  service_duration: number;
  group_name?: string;
  group_color?: string;
  overall_progress?: number;
}

interface DashboardStats {
  crew: {
    total_crew: number;
    online_crew: number;
    busy_crew: number;
    available_crew: number;
    break_crew: number;
    offline_crew: number;
  };
  jobs: {
    total_active_jobs: number;
    pending_jobs: number;
    assigned_jobs: number;
    en_route_jobs: number;
    in_progress_jobs: number;
    completed_today: number;
  };
  revenue: {
    today_revenue: number;
    week_revenue: number;
    month_revenue: number;
  };
}

interface LocationUpdate {
  crew_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  address?: string;
  battery_level?: number;
  signal_strength?: number;
  timestamp?: string;
}

interface StatusUpdate {
  crew_id: number;
  status: 'online' | 'offline' | 'busy' | 'available' | 'break' | 'emergency';
  reason?: string;
  location_id?: number;
}

interface JobUpdate {
  job_id: number;
  status: 'pending' | 'assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  progress_percentage?: number;
  stage?: 'preparation' | 'pre_wash' | 'washing' | 'rinsing' | 'drying' | 'interior' | 'detailing' | 'inspection' | 'completed';
  notes?: string;
  photos?: string[];
}

interface RealtimeMessage {
  id: number;
  job_id?: number;
  sender_type: 'crew' | 'customer' | 'admin' | 'system';
  sender_id: number;
  recipient_type: 'crew' | 'customer' | 'admin' | 'broadcast';
  recipient_id?: number;
  message_type: 'text' | 'location' | 'photo' | 'status_update' | 'alert';
  content: string;
  metadata?: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read_at?: string;
  delivered_at?: string;
  created_at: string;
}

class RealtimeService {
  private baseUrl: string;
  private refreshInterval?: NodeJS.Timeout;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private fetchTimeout: number = 8000; // 8 second timeout
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 3;

  private pusher: any = null;
  private pusherChannels: any[] = [];

  constructor() {
    this.baseUrl = '/api/realtime';

    // Try to initialize Pusher client if VITE_PUSHER_KEY is configured
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;


    if (pusherKey && pusherCluster) {
      this.initPusher(pusherKey as string, pusherCluster as string)
        .then(() => info('✅ Pusher client initialized'))
        .catch((err) => warn('⚠️ Pusher client init failed:', err));
    } else {
      log('ℹ️ Pusher not configured on client (VITE_PUSHER_KEY missing)');
    }
  }

  /**
   * Fetch with timeout and network detection
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    // Check network status first
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be slow or unreachable');
      }
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit data to subscribers
   */
  private emit(eventType: string, data: any): void {
    this.subscribers.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        warn(`Error in ${eventType} subscriber:`, error);
      }
    });
  }

  /**
   * Start real-time polling
   */
  async initPusher(key: string, cluster: string) {
    try {
      // Dynamically load Pusher script
      if (!(window as any).Pusher) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://js.pusher.com/7.2/pusher.min.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = (e) => reject(e);
          document.head.appendChild(s);
        });
      }

      const Pusher = (window as any).Pusher;
      Pusher.logToConsole = false;

      // Configure auth endpoint for private channel subscriptions
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      const sessionToken = localStorage.getItem('sessionToken');

      const authHeaders: Record<string, string> = {};
      if (sessionToken) {
        authHeaders['Authorization'] = `Bearer ${sessionToken}`;
      } else {
        // Fallback for older clients that used header-based auth
        authHeaders['x-user-id'] = userId || '';
        authHeaders['x-user-role'] = userRole || '';
      }

      this.pusher = new Pusher(key, {
        cluster,
        forceTLS: true,
        authEndpoint: '/api/realtime/pusher/auth',
        auth: {
          headers: authHeaders,
        },
      });

      // Subscribe to public realtime channel (non-private)
      const publicChannel = this.pusher.subscribe('public-realtime');
      publicChannel.bind('new-message', (data: any) => this.emit('new-message', data));
      publicChannel.bind('booking.created', (data: any) => this.emit('booking.created', data));
      publicChannel.bind('booking.updated', (data: any) => this.emit('booking.updated', data));
      publicChannel.bind('subscription.renewed', (data: any) => this.emit('subscription.renewed', data));
      publicChannel.bind('subscription.failed', (data: any) => this.emit('subscription.failed', data));
      publicChannel.bind('pos.transaction.created', (data: any) => this.emit('pos.transaction.created', data));
      publicChannel.bind('pos.expense.created', (data: any) => this.emit('pos.expense.created', data));
      publicChannel.bind('inventory.created', (data: any) => this.emit('inventory.created', data));
      publicChannel.bind('inventory.updated', (data: any) => this.emit('inventory.updated', data));
      publicChannel.bind('inventory.deleted', (data: any) => this.emit('inventory.deleted', data));
      publicChannel.bind('stock.movement', (data: any) => this.emit('stock.movement', data));

      this.pusherChannels.push(publicChannel);

      // Subscribe to private public channel (for admins) if auth succeeds
      const privatePublic = this.pusher.subscribe('private-public-realtime');
      privatePublic.bind('booking.created', (data: any) => this.emit('booking.created', data));
      privatePublic.bind('booking.updated', (data: any) => this.emit('booking.updated', data));
      privatePublic.bind('pos.transaction.created', (data: any) => this.emit('pos.transaction.created', data));
      privatePublic.bind('inventory.updated', (data: any) => this.emit('inventory.updated', data));
      this.pusherChannels.push(privatePublic);

      // Subscribe to user specific channel if logged in (private)
      if (userId) {
        const privateUserChannel = `private-user-customer-${userId}`;
        const userChannel = this.pusher.subscribe(privateUserChannel);
        userChannel.bind('new-message', (data: any) => this.emit('new-message', data));
        userChannel.bind('booking.created', (data: any) => this.emit('booking.created', data));
        userChannel.bind('booking.updated', (data: any) => this.emit('booking.updated', data));
        userChannel.bind('subscription.renewed', (data: any) => this.emit('subscription.renewed', data));
        this.pusherChannels.push(userChannel);
      }

      // Subscribe to branch channel if available in localStorage
      const branchId = localStorage.getItem('userBranch') || localStorage.getItem('branchLocation');
      if (branchId) {
        const privateBranch = `private-branch-${branchId}`;
        const branchChannel = this.pusher.subscribe(privateBranch);
        branchChannel.bind('pos.transaction.created', (data: any) => this.emit('pos.transaction.created', data));
        this.pusherChannels.push(branchChannel);
      }

      info('🔌 Pusher channels subscribed');
    } catch (error) {
      warn('⚠️ Failed to initialize Pusher client:', error);
      // Do not throw - fallback to polling
    }
  }

  startRealTimeUpdates(intervalMs: number = 5000): void {
    if (this.refreshInterval) {
      this.stopRealTimeUpdates();
    }

    this.refreshInterval = setInterval(async () => {
      // Circuit breaker: stop polling if too many consecutive errors
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        console.warn('⚠️ Too many consecutive errors, pausing real-time updates');
        this.emit('error', {
          message: 'Real-time updates paused due to connection issues',
          consecutiveErrors: this.consecutiveErrors
        });
        return;
      }

      // Skip if offline
      if (!navigator.onLine) {
        log('📡 Offline - skipping real-time update');
        this.consecutiveErrors++;
        return;
      }

      try {
        // Get latest crew locations
        const crewData = await this.getCrewLocations();
        this.emit('crew-locations', crewData);

        // Get active jobs
        const jobsData = await this.getActiveJobs();
        this.emit('active-jobs', jobsData);

        // Get dashboard stats
        const statsData = await this.getDashboardStats();
        this.emit('dashboard-stats', statsData);

        // Reset error counter on success
        this.consecutiveErrors = 0;

      } catch (error) {
        this.consecutiveErrors++;
        warn(`Real-time update error (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);
        this.emit('error', error);
      }
    }, intervalMs);

    info(`🔄 Real-time updates started (${intervalMs}ms interval)`);
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
      this.consecutiveErrors = 0; // Reset error counter
      info('⏹️ Real-time updates stopped');
    }
  }

  /**
   * Reset error counter (useful after connection is restored)
   */
  resetErrorCounter(): void {
    this.consecutiveErrors = 0;
    info('✅ Error counter reset - resuming normal operation');
  }

  // ============================================================================
  // CREW LOCATION METHODS
  // ============================================================================

  /**
   * Update crew location
   */
  async updateCrewLocation(data: LocationUpdate): Promise<{ success: boolean; location_id?: number; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/crew/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update location');
      }

      return result;
    } catch (error) {
      console.error('Update crew location error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all crew locations
   */
  async getCrewLocations(): Promise<{ success: boolean; crews?: CrewLocation[]; error?: string; timestamp?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/crew/locations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get crew locations');
      }

      return result;
    } catch (error) {
      console.error('Get crew locations error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // CREW STATUS METHODS
  // ============================================================================

  /**
   * Update crew status
   */
  async updateCrewStatus(data: StatusUpdate): Promise<{ success: boolean; status_id?: number; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/crew/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      return result;
    } catch (error) {
      console.error('Update crew status error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get crew status history
   */
  async getCrewStatusHistory(crewId: number, limit: number = 50): Promise<{ success: boolean; history?: any[]; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/crew/${crewId}/status-history?limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get status history');
      }

      return result;
    } catch (error) {
      console.error('Get status history error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // JOB MANAGEMENT METHODS
  // ============================================================================

  /**
   * Update job status and progress
   */
  async updateJob(data: JobUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/jobs/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update job');
      }

      return result;
    } catch (error) {
      console.error('Update job error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get active jobs with locations
   */
  async getActiveJobs(): Promise<{ success: boolean; jobs?: ActiveJob[]; error?: string; timestamp?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/jobs/active`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get active jobs');
      }

      return result;
    } catch (error) {
      console.error('Get active jobs error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // DASHBOARD METHODS
  // ============================================================================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{ success: boolean; stats?: DashboardStats; error?: string; timestamp?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/dashboard/stats`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get dashboard stats');
      }

      return result;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // MESSAGING METHODS
  // ============================================================================

  /**
   * Send real-time message
   */
  async sendMessage(data: {
    job_id?: number;
    sender_type: 'crew' | 'customer' | 'admin' | 'system';
    sender_id: number;
    recipient_type: 'crew' | 'customer' | 'admin' | 'broadcast';
    recipient_id?: number;
    message_type: 'text' | 'location' | 'photo' | 'status_update' | 'alert';
    content: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<{ success: boolean; message_id?: number; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      return result;
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get recent messages
   */
  async getMessages(recipientType: string, recipientId: number, limit: number = 50): Promise<{ success: boolean; messages?: RealtimeMessage[]; error?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/messages/${recipientType}/${recipientId}?limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get messages');
      }

      return result;
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // SYSTEM HEALTH METHODS
  // ============================================================================

  /**
   * Check system health
   */
  async checkHealth(): Promise<{ success: boolean; status?: string; database?: string; error?: string; timestamp?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`);
      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert crew data for map display
   */
  convertCrewToMapData(crews: CrewLocation[]): any[] {
    return crews.map(crew => ({
      id: `crew-${crew.crew_id}`,
      name: crew.name,
      phone: crew.phone,
      status: crew.status,
      location: {
        latitude: crew.latitude,
        longitude: crew.longitude,
        accuracy: crew.accuracy,
        timestamp: crew.last_update
      },
      currentJob: crew.current_job_id ? {
        id: crew.current_job_id,
        customer: `Job ${crew.job_number}`,
        vehicleType: 'car', // Default, should come from API
        serviceType: crew.service_category || 'basic',
        washType: 'full', // Default, should come from API
        startTime: crew.status_since,
        estimatedDuration: 60, // Default
        address: crew.job_address || crew.address,
        progress: crew.job_progress || 0
      } : undefined,
      groupId: `group-${crew.crew_group_id}`,
      groupName: crew.group_name,
      rating: 4.5, // Default rating
      completedJobs: 0, // Should come from API
      lastActive: crew.last_update
    }));
  }

  /**
   * Get distance between two coordinates (Haversine formula)
   */
  getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Format duration in minutes to human readable string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'available': return '#3B82F6';
      case 'break': return '#8B5CF6';
      case 'emergency': return '#EF4444';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
export type { 
  CrewLocation, 
  ActiveJob, 
  DashboardStats, 
  LocationUpdate, 
  StatusUpdate, 
  JobUpdate, 
  RealtimeMessage 
};
