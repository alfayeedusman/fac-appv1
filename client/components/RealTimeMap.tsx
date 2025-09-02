import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

// Set Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg';
mapboxgl.accessToken = MAPBOX_TOKEN;

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
    estimatedDuration: number;
    address: string;
    progress: number;
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

// Mock data generator
const generateMockCrewData = (): CrewMember[] => {
  const crews: CrewMember[] = [];
  const serviceTypes = ['basic', 'premium', 'deluxe', 'vip'] as const;
  const washTypes = ['exterior', 'interior', 'full', 'detailing'] as const;
  const vehicleTypes = ['car', 'suv', 'motorcycle', 'truck'] as const;
  const statuses = ['online', 'busy', 'available', 'break'] as const;

  for (let i = 1; i <= 20; i++) {
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isBusy = status === 'busy';

    const crew: CrewMember = {
      id: `crew-${i}`,
      name: `Crew Member ${i}`,
      phone: `+63 9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      status,
      location: {
        latitude: MANILA_COORDINATES.latitude + latOffset,
        longitude: MANILA_COORDINATES.longitude + lngOffset,
        accuracy: Math.floor(Math.random() * 10) + 3,
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString()
      },
      currentJob: isBusy ? {
        id: `job-${i}`,
        customer: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        washType: washTypes[Math.floor(Math.random() * washTypes.length)],
        startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        estimatedDuration: Math.floor(Math.random() * 120) + 30,
        address: `Manila Area ${i}`,
        progress: Math.floor(Math.random() * 100)
      } : undefined,
      groupId: `group-${Math.ceil(i / 4)}`,
      groupName: `Team ${Math.ceil(i / 4)}`,
      rating: 3.5 + Math.random() * 1.5,
      completedJobs: Math.floor(Math.random() * 200) + 10,
      lastActive: new Date(Date.now() - Math.random() * 1800000).toISOString()
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
        crewId: status === 'being_served' ? `crew-${Math.floor(Math.random() * 20) + 1}` : undefined,
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [crewData, setCrewData] = useState<CrewMember[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const initializingRef = useRef<boolean>(false);

  // Debug token and environment
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const info = `Token: ${token ? 'Present' : 'Missing'} | Length: ${token?.length || 0}`;
    setDebugInfo(info);
    console.log('🔍 Debug info:', info);
    console.log('🌍 Environment vars:', {
      VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN ? 'SET' : 'MISSING',
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeMap = async () => {
      console.log('🗺️ Initializing Mapbox...');
      console.log('🔑 Token:', MAPBOX_TOKEN ? 'Present' : 'Missing');
      console.log('📦 Container:', mapContainer.current ? 'Found' : 'Missing');

      if (!MAPBOX_TOKEN) {
        console.error('❌ Mapbox token not found');
        if (isMounted) {
          setError('Mapbox token not configured. Please check environment variables.');
          setIsLoading(false);
        }
        return;
      }

      try {
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Set loading timeout
        timeoutId = setTimeout(() => {
          if (isMounted && isLoading) {
            console.warn('⚠️ Map loading timeout');
            setError('Map loading timeout. Please refresh the page.');
            setIsLoading(false);
          }
        }, 15000);

        if (!isMounted) return;

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [MANILA_COORDINATES.longitude, MANILA_COORDINATES.latitude],
          zoom: 12,
          attributionControl: false
        });

        map.current.on('load', () => {
          console.log('✅ Mapbox loaded successfully');
          if (isMounted) {
            setError(null);
            setIsLoading(false);
          }
          if (timeoutId) clearTimeout(timeoutId);
        });

        map.current.on('error', (e) => {
          console.error('❌ Mapbox error:', e);
          if (isMounted) {
            setError('Map failed to load. Please check your internet connection.');
            setIsLoading(false);
          }
          if (timeoutId) clearTimeout(timeoutId);
        });

        // Add controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(
          new mapboxgl.AttributionControl({
            compact: true
          }),
          'bottom-right'
        );

        console.log('✅ Mapbox initialized successfully');
      } catch (err: any) {
        console.error('❌ Failed to initialize Mapbox:', err);
        if (isMounted) {
          setError(`Failed to initialize map: ${err.message || 'Unknown error'}`);
          setIsLoading(false);
        }
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📊 Loading map data...');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setCrewData(generateMockCrewData());
        setCustomerData(generateMockCustomerData());
        console.log('✅ Map data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading map data:', error);
        // Don't set loading state here, only set error if no map error exists
        if (!error) {
          setError('Failed to load location data');
        }
      }
    };

    loadData();
  }, []);

  // Create crew marker element
  const createCrewMarkerElement = (crew: CrewMember) => {
    const el = document.createElement('div');
    el.className = 'crew-marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = getCrewMarkerColor(crew);
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    `;

    // Add status indicator
    if (crew.currentJob) {
      const indicator = document.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.top = '-2px';
      indicator.style.right = '-2px';
      indicator.style.width = '12px';
      indicator.style.height = '12px';
      indicator.style.backgroundColor = '#F59E0B';
      indicator.style.borderRadius = '50%';
      indicator.style.border = '2px solid white';
      indicator.className = 'animate-pulse';
      el.appendChild(indicator);
    }

    if (crew.status === 'online') {
      const indicator = document.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.top = '-2px';
      indicator.style.left = '-2px';
      indicator.style.width = '12px';
      indicator.style.height = '12px';
      indicator.style.backgroundColor = '#10B981';
      indicator.style.borderRadius = '50%';
      indicator.style.border = '2px solid white';
      indicator.className = 'animate-pulse';
      el.appendChild(indicator);
    }

    el.addEventListener('click', () => {
      setSelectedCrew(crew);
      setSelectedCustomer(null);
      onCrewSelect?.(crew);
    });

    return el;
  };

  // Create customer marker element
  const createCustomerMarkerElement = (customer: Customer) => {
    const el = document.createElement('div');
    el.className = 'customer-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = getCustomerMarkerColor(customer);
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    el.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M8 19l-1-1 2-2 2 2z"/>
        <path d="M16 17h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
        <path d="M12 17v4"/>
        <path d="M7 13h10"/>
        <path d="M7 9h6"/>
        <path d="M16 9h1"/>
      </svg>
    `;

    // Add status indicator for requesting customers
    if (customer.status === 'requesting') {
      const indicator = document.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.top = '-2px';
      indicator.style.right = '-2px';
      indicator.style.width = '12px';
      indicator.style.height = '12px';
      indicator.style.backgroundColor = '#EF4444';
      indicator.style.borderRadius = '50%';
      indicator.style.border = '2px solid white';
      indicator.className = 'animate-bounce';
      el.appendChild(indicator);
    }

    el.addEventListener('click', () => {
      setSelectedCustomer(customer);
      setSelectedCrew(null);
      onCustomerSelect?.(customer);
    });

    return el;
  };

  // Update markers when data changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Filter crew data
    const filteredCrew = crewData.filter(crew => {
      if (selectedFilters.status && crew.status !== selectedFilters.status) return false;
      if (selectedFilters.groupId && crew.groupId !== selectedFilters.groupId) return false;
      if (selectedFilters.serviceType && (!crew.currentJob || crew.currentJob.serviceType !== selectedFilters.serviceType)) return false;
      return true;
    });

    // Add crew markers
    if (showCrew) {
      filteredCrew.forEach(crew => {
        const el = createCrewMarkerElement(crew);
        const marker = new mapboxgl.Marker(el)
          .setLngLat([crew.location.longitude, crew.location.latitude])
          .addTo(map.current!);

        markersRef.current[`crew-${crew.id}`] = marker;
      });
    }

    // Add customer markers
    if (showCustomers) {
      customerData.forEach(customer => {
        const el = createCustomerMarkerElement(customer);
        const marker = new mapboxgl.Marker(el)
          .setLngLat([customer.location.longitude, customer.location.latitude])
          .addTo(map.current!);

        markersRef.current[`customer-${customer.id}`] = marker;
      });
    }
  }, [crewData, customerData, showCrew, showCustomers, selectedFilters]);

  // Set up real-time updates (mock simulation)
  useEffect(() => {
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
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getCrewMarkerColor = (crew: CrewMember) => {
    switch (crew.status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'available': return '#3B82F6';
      case 'break': return '#8B5CF6';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getCustomerMarkerColor = (customer: Customer) => {
    switch (customer.membership) {
      case 'platinum': return '#E5E7EB';
      case 'gold': return '#F59E0B';
      case 'silver': return '#9CA3AF';
      case 'basic': return '#3B82F6';
      default: return '#3B82F6';
    }
  };

  // Filter crew based on selected filters
  const filteredCrewData = crewData.filter(crew => {
    if (selectedFilters.status && crew.status !== selectedFilters.status) return false;
    if (selectedFilters.groupId && crew.groupId !== selectedFilters.groupId) return false;
    if (selectedFilters.serviceType && (!crew.currentJob || crew.currentJob.serviceType !== selectedFilters.serviceType)) return false;
    return true;
  });

  // Loading state
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
    <div className="relative w-full rounded-lg overflow-hidden border" style={{ height }}>
      {/* Mapbox container */}
      <div
        ref={mapContainer}
        className="w-full h-full bg-gray-100 dark:bg-gray-800"
        style={{ minHeight: height }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error banner if map fails to load */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-30">
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </span>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback content when no map */}
      {!map.current && !isLoading && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center">
          <div className="text-center p-8">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Map Ready
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Click refresh if map doesn't appear
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-600"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Map
            </Button>
          </div>
        </div>
      )}

      {/* Selected crew popup */}
      {selectedCrew && (
        <div className="absolute bottom-20 left-4 w-80 max-w-sm z-20">
          <Card className="border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-fac-orange-500" />
                  {selectedCrew.name}
                </div>
                <Badge
                  className="text-xs text-white"
                  style={{ backgroundColor: getCrewMarkerColor(selectedCrew) }}
                >
                  {selectedCrew.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Group:</span>
                  <div className="font-medium">{selectedCrew.groupName}</div>
                </div>
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{selectedCrew.rating.toFixed(1)}</span>
                  </div>
                </div>
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
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{selectedCrew.currentJob.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
                <Button size="sm" variant="outline" onClick={() => setSelectedCrew(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected customer popup */}
      {selectedCustomer && (
        <div className="absolute bottom-20 right-4 w-72 max-w-sm z-20">
          <Card className="border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-purple-500" />
                  {selectedCustomer.name}
                </div>
                <Badge
                  className="text-xs text-white capitalize"
                  style={{ backgroundColor: getCustomerMarkerColor(selectedCustomer) }}
                >
                  {selectedCustomer.membership}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs">
                <span className="text-gray-600">Status:</span>
                <Badge variant="outline" className="ml-2 text-xs capitalize">
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
                  </div>
                </div>
              )}

              <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs z-10">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-fac-orange-500" />
          Live Status
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Online ({filteredCrewData.filter(c => c.status === 'online').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Busy ({filteredCrewData.filter(c => c.status === 'busy').length})</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Available ({filteredCrewData.filter(c => c.status === 'available').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Break ({filteredCrewData.filter(c => c.status === 'break').length})</span>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Car className="h-3 w-3 text-purple-500" />
            <span>Customers ({customerData.filter(c => c.status === 'online' || c.status === 'requesting').length})</span>
          </div>
        </div>
        {debugInfo && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500">
              <div>🔍 {debugInfo}</div>
              <div>Map: {map.current ? 'Loaded' : 'Loading'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
