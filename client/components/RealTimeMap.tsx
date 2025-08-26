import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Users,
  Car,
  Navigation,
  Activity,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Truck,
  Phone,
  Wrench,
  Droplet,
  Zap,
  Shield,
  Crown,
  UserX,
  MapPinned,
  WifiOff,
  RefreshCw
} from 'lucide-react';

// Dynamic import for Map components to handle potential loading issues
let Map: any = null;
let Marker: any = null;
let Popup: any = null;
let NavigationControl: any = null;
let FullscreenControl: any = null;
let ScaleControl: any = null;

// Lazy load map components
const loadMapComponents = async () => {
  try {
    const mapModule = await import('react-map-gl');
    Map = mapModule.default;
    Marker = mapModule.Marker;
    Popup = mapModule.Popup;
    NavigationControl = mapModule.NavigationControl;
    FullscreenControl = mapModule.FullscreenControl;
    ScaleControl = mapModule.ScaleControl;

    // Also load Mapbox CSS
    await import('mapbox-gl/dist/mapbox-gl.css');

    return true;
  } catch (error) {
    console.error('Failed to load map components:', error);
    return false;
  }
};

// Dynamic import for realtime service
let realtimeService: any = null;
const loadRealtimeService = async () => {
  try {
    const serviceModule = await import('@/services/realtimeService');
    realtimeService = serviceModule.default;
    return true;
  } catch (error) {
    console.error('Failed to load realtime service:', error);
    return false;
  }
};

// Philippines coordinates (Manila center)
const MANILA_COORDINATES = {
  latitude: 14.5995,
  longitude: 120.9842
};

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'available' | 'break';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
  };
  currentJob?: {
    id: string;
    customer: string;
    vehicleType: 'car' | 'suv' | 'motorcycle' | 'truck';
    serviceType: 'basic' | 'premium' | 'deluxe' | 'vip';
    washType: 'exterior' | 'interior' | 'full' | 'detailing';
    startTime: string;
    estimatedDuration: number; // in minutes
    address: string;
    progress: number; // 0-100
  };
  groupId: string;
  groupName: string;
  rating: number;
  completedJobs: number;
  lastActive: string;
}

interface Customer {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'online' | 'offline' | 'requesting' | 'being_served';
  membership: 'basic' | 'silver' | 'gold' | 'platinum';
  activeBooking?: {
    id: string;
    serviceType: string;
    crewId?: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  };
}

interface RealTimeMapProps {
  height?: string;
  onCrewSelect?: (crew: CrewMember) => void;
  onCustomerSelect?: (customer: Customer) => void;
  showCustomers?: boolean;
  showCrew?: boolean;
  selectedFilters?: {
    status?: string;
    groupId?: string;
    serviceType?: string;
  };
}

// Mock data - This will be replaced with real API calls
const generateMockCrewData = (): CrewMember[] => {
  const crews: CrewMember[] = [];
  const serviceTypes = ['basic', 'premium', 'deluxe', 'vip'] as const;
  const washTypes = ['exterior', 'interior', 'full', 'detailing'] as const;
  const vehicleTypes = ['car', 'suv', 'motorcycle', 'truck'] as const;
  const statuses = ['online', 'busy', 'available', 'break'] as const;

  // Generate realistic locations around Manila
  const manilaAreas = [
    { name: 'Makati', lat: 14.5547, lng: 121.0244 },
    { name: 'BGC', lat: 14.5176, lng: 121.0509 },
    { name: 'Ortigas', lat: 14.5866, lng: 121.0609 },
    { name: 'Quezon City', lat: 14.6760, lng: 121.0437 },
    { name: 'Manila', lat: 14.5995, lng: 120.9842 },
    { name: 'Pasig', lat: 14.5764, lng: 121.0851 },
    { name: 'Mandaluyong', lat: 14.5791, lng: 121.0359 }
  ];

  for (let i = 1; i <= 25; i++) {
    const area = manilaAreas[Math.floor(Math.random() * manilaAreas.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isBusy = status === 'busy';
    
    // Add some random offset to the area coordinates
    const latOffset = (Math.random() - 0.5) * 0.02; // ~1km radius
    const lngOffset = (Math.random() - 0.5) * 0.02;

    const crew: CrewMember = {
      id: `crew-${i}`,
      name: `Crew Member ${i}`,
      phone: `+63 9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      status,
      location: {
        latitude: area.lat + latOffset,
        longitude: area.lng + lngOffset,
        accuracy: Math.floor(Math.random() * 10) + 3,
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString() // Within last 5 minutes
      },
      currentJob: isBusy ? {
        id: `job-${i}`,
        customer: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        washType: washTypes[Math.floor(Math.random() * washTypes.length)],
        startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        estimatedDuration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        address: `${area.name}, Metro Manila`,
        progress: Math.floor(Math.random() * 100)
      } : undefined,
      groupId: `group-${Math.ceil(i / 5)}`,
      groupName: `Team ${Math.ceil(i / 5)}`,
      rating: 3.5 + Math.random() * 1.5,
      completedJobs: Math.floor(Math.random() * 200) + 10,
      lastActive: new Date(Date.now() - Math.random() * 1800000).toISOString() // Within last 30 minutes
    };

    crews.push(crew);
  }

  return crews;
};

const generateMockCustomerData = (): Customer[] => {
  const customers: Customer[] = [];
  const memberships = ['basic', 'silver', 'gold', 'platinum'] as const;
  const statuses = ['online', 'offline', 'requesting', 'being_served'] as const;

  for (let i = 1; i <= 15; i++) {
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const customer: Customer = {
      id: `customer-${i}`,
      name: `Customer ${i}`,
      location: {
        latitude: MANILA_COORDINATES.latitude + latOffset,
        longitude: MANILA_COORDINATES.longitude + lngOffset,
        address: `Address ${i}, Metro Manila`
      },
      status,
      membership: memberships[Math.floor(Math.random() * memberships.length)],
      activeBooking: status === 'requesting' || status === 'being_served' ? {
        id: `booking-${i}`,
        serviceType: 'Premium Wash',
        crewId: status === 'being_served' ? `crew-${Math.floor(Math.random() * 25) + 1}` : undefined,
        status: status === 'requesting' ? 'pending' : 'in_progress'
      } : undefined
    };

    customers.push(customer);
  }

  return customers;
};

export default function RealTimeMap({
  height = '600px',
  onCrewSelect,
  onCustomerSelect,
  showCustomers = true,
  showCrew = true,
  selectedFilters = {}
}: RealTimeMapProps) {
  const [viewState, setViewState] = useState({
    longitude: MANILA_COORDINATES.longitude,
    latitude: MANILA_COORDINATES.latitude,
    zoom: 11
  });

  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [crewData, setCrewData] = useState<CrewMember[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [realTimeCrews, setRealTimeCrews] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [mapComponentsLoaded, setMapComponentsLoaded] = useState(false);
  const [serviceLoaded, setServiceLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapbox access token - You'll need to set this up
  const MAPBOX_TOKEN = (() => {
    try {
      return process.env.REACT_APP_MAPBOX_TOKEN ||
             import.meta.env.VITE_MAPBOX_TOKEN ||
             'pk.eyJ1IjoiZmF5ZWVkYXV0b2NhcmUiLCJhIjoiY2x1dzBmb3VqMGI5aTJrcGZuaXB2bzNkZiJ9.demo-token-replace-with-real';
    } catch (error) {
      console.warn('Failed to get Mapbox token:', error);
      return 'pk.demo-token-fallback';
    }
  })();

  // Load map components and services
  useEffect(() => {
    const initializeComponents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load map components
        const mapLoaded = await loadMapComponents();
        setMapComponentsLoaded(mapLoaded);

        // Load realtime service
        const serviceLoaded = await loadRealtimeService();
        setServiceLoaded(serviceLoaded);

        if (!mapLoaded) {
          throw new Error('Failed to load map components');
        }

      } catch (error) {
        console.error('Error initializing components:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize map');
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponents();
  }, []);

  // Load initial data and set up real-time updates
  useEffect(() => {
    if (!serviceLoaded || !mapComponentsLoaded) return;

    const loadInitialData = async () => {
      try {
        if (realtimeService) {
          // Check system health first
          const healthCheck = await realtimeService.checkHealth();
          if (healthCheck.success) {
            setConnectionStatus('connected');

            // Load initial crew locations
            const crewResult = await realtimeService.getCrewLocations();
            if (crewResult.success && crewResult.crews) {
              setRealTimeCrews(crewResult.crews);
              // Convert to CrewMember format for compatibility
              const convertedCrew = realtimeService.convertCrewToMapData(crewResult.crews);
              setCrewData(convertedCrew);
            }

            // Load active jobs
            const jobsResult = await realtimeService.getActiveJobs();
            if (jobsResult.success && jobsResult.jobs) {
              setActiveJobs(jobsResult.jobs);
            }

          } else {
            setConnectionStatus('error');
            console.warn('Real-time service not available, using mock data');
            // Fallback to mock data
            setCrewData(generateMockCrewData());
            setCustomerData(generateMockCustomerData());
          }
        } else {
          // Fallback to mock data if service not available
          console.warn('Real-time service not loaded, using mock data');
          setConnectionStatus('error');
          setCrewData(generateMockCrewData());
          setCustomerData(generateMockCustomerData());
        }
      } catch (error) {
        console.error('Error loading real-time data:', error);
        setConnectionStatus('error');
        // Fallback to mock data
        setCrewData(generateMockCrewData());
        setCustomerData(generateMockCustomerData());
      }
    };

    loadInitialData();
  }, [serviceLoaded, mapComponentsLoaded]);

  // Set up real-time updates
  useEffect(() => {
    if (connectionStatus === 'connected' && realtimeService) {
      try {
        // Subscribe to real-time updates
        const unsubscribeCrew = realtimeService.subscribe('crew-locations', (data: any) => {
          if (data.success && data.crews) {
            setRealTimeCrews(data.crews);
            const convertedCrew = realtimeService.convertCrewToMapData(data.crews);
            setCrewData(convertedCrew);
          }
        });

        const unsubscribeJobs = realtimeService.subscribe('active-jobs', (data: any) => {
          if (data.success && data.jobs) {
            setActiveJobs(data.jobs);
          }
        });

        const unsubscribeError = realtimeService.subscribe('error', (error: any) => {
          console.error('Real-time update error:', error);
          setConnectionStatus('error');
        });

        // Start polling for updates
        realtimeService.startRealTimeUpdates(10000); // Update every 10 seconds

        return () => {
          try {
            unsubscribeCrew();
            unsubscribeJobs();
            unsubscribeError();
            realtimeService.stopRealTimeUpdates();
          } catch (error) {
            console.warn('Error cleaning up real-time subscriptions:', error);
          }
        };
      } catch (error) {
        console.error('Error setting up real-time updates:', error);
        setConnectionStatus('error');
      }
    } else {
      // Fallback to mock data updates
      const interval = setInterval(() => {
        setCrewData(prev => prev.map(crew => ({
          ...crew,
          location: {
            ...crew.location,
            latitude: crew.location.latitude + (Math.random() - 0.5) * 0.0001,
            longitude: crew.location.longitude + (Math.random() - 0.5) * 0.0001,
            timestamp: new Date().toISOString()
          },
          currentJob: crew.currentJob ? {
            ...crew.currentJob,
            progress: Math.min(100, crew.currentJob.progress + Math.random() * 5)
          } : undefined
        })));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [connectionStatus, serviceLoaded]);

  // Filter crew based on selected filters
  const filteredCrewData = useMemo(() => {
    return crewData.filter(crew => {
      if (selectedFilters.status && crew.status !== selectedFilters.status) return false;
      if (selectedFilters.groupId && crew.groupId !== selectedFilters.groupId) return false;
      if (selectedFilters.serviceType && (!crew.currentJob || crew.currentJob.serviceType !== selectedFilters.serviceType)) return false;
      return true;
    });
  }, [crewData, selectedFilters]);

  const getCrewMarkerColor = (crew: CrewMember) => {
    switch (crew.status) {
      case 'online': return '#10B981'; // green
      case 'busy': return '#F59E0B'; // orange
      case 'available': return '#3B82F6'; // blue
      case 'break': return '#8B5CF6'; // purple
      case 'offline': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  const getCustomerMarkerColor = (customer: Customer) => {
    switch (customer.membership) {
      case 'platinum': return '#E5E7EB'; // platinum
      case 'gold': return '#F59E0B'; // gold
      case 'silver': return '#9CA3AF'; // silver
      case 'basic': return '#3B82F6'; // blue
      default: return '#3B82F6';
    }
  };

  const getServiceIcon = (serviceType?: string) => {
    switch (serviceType) {
      case 'basic': return <Droplet className="h-3 w-3" />;
      case 'premium': return <Zap className="h-3 w-3" />;
      case 'deluxe': return <Shield className="h-3 w-3" />;
      case 'vip': return <Crown className="h-3 w-3" />;
      default: return <Wrench className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Crew Markers */}
        {showCrew && filteredCrewData.map((crew) => (
          <Marker
            key={crew.id}
            longitude={crew.location.longitude}
            latitude={crew.location.latitude}
            anchor="center"
          >
            <div
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                setSelectedCrew(crew);
                setSelectedCustomer(null);
                onCrewSelect?.(crew);
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                style={{ backgroundColor: getCrewMarkerColor(crew) }}
              >
                <Truck className="h-4 w-4 text-white" />
              </div>
              {crew.currentJob && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white"
                  style={{ backgroundColor: getCrewMarkerColor(crew) }}
                >
                  {getServiceIcon(crew.currentJob.serviceType)}
                </div>
              )}
              {crew.status === 'online' && (
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </Marker>
        ))}

        {/* Customer Markers */}
        {showCustomers && customerData.map((customer) => (
          <Marker
            key={customer.id}
            longitude={customer.location.longitude}
            latitude={customer.location.latitude}
            anchor="center"
          >
            <div
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                setSelectedCustomer(customer);
                setSelectedCrew(null);
                onCustomerSelect?.(customer);
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                style={{ backgroundColor: getCustomerMarkerColor(customer) }}
              >
                <Car className="h-3 w-3 text-white" />
              </div>
              {customer.status === 'requesting' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
              )}
              {customer.status === 'being_served' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </Marker>
        ))}

        {/* Crew Popup */}
        {selectedCrew && (
          <Popup
            longitude={selectedCrew.location.longitude}
            latitude={selectedCrew.location.latitude}
            anchor="bottom"
            onClose={() => setSelectedCrew(null)}
            closeOnClick={false}
            className="custom-popup"
          >
            <Card className="w-80 border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-fac-orange-500" />
                    {selectedCrew.name}
                  </div>
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: getCrewMarkerColor(selectedCrew) }}
                  >
                    {selectedCrew.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Group:</span>
                  <span className="font-medium">{selectedCrew.groupName}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{selectedCrew.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Completed Jobs:</span>
                  <span className="font-medium">{selectedCrew.completedJobs}</span>
                </div>

                {selectedCrew.currentJob && (
                  <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                    <h4 className="font-semibold text-xs mb-2 text-orange-800 dark:text-orange-200">
                      Current Job
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{selectedCrew.currentJob.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedCrew.currentJob.serviceType} {selectedCrew.currentJob.washType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium capitalize">{selectedCrew.currentJob.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{selectedCrew.currentJob.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedCrew.currentJob.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MapPinned className="h-3 w-3 mr-1" />
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Popup>
        )}

        {/* Customer Popup */}
        {selectedCustomer && (
          <Popup
            longitude={selectedCustomer.location.longitude}
            latitude={selectedCustomer.location.latitude}
            anchor="bottom"
            onClose={() => setSelectedCustomer(null)}
            closeOnClick={false}
            className="custom-popup"
          >
            <Card className="w-72 border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-purple-500" />
                    {selectedCustomer.name}
                  </div>
                  <Badge
                    className="text-xs capitalize"
                    style={{ backgroundColor: getCustomerMarkerColor(selectedCustomer) }}
                  >
                    {selectedCustomer.membership}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedCustomer.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="text-xs">
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium mt-1">{selectedCustomer.location.address}</p>
                </div>

                {selectedCustomer.activeBooking && (
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <h4 className="font-semibold text-xs mb-2 text-purple-800 dark:text-purple-200">
                      Active Booking
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{selectedCustomer.activeBooking.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedCustomer.activeBooking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {selectedCustomer.activeBooking.crewId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned Crew:</span>
                          <span className="font-medium">{selectedCustomer.activeBooking.crewId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs">
        <h4 className="font-semibold text-sm mb-2">Live Map Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Crew Status</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Busy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Break</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300">Customers</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Platinum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Gold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Silver</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Basic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
