import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  Navigation,
  Activity,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  User,
  Route,
  MapPinned,
  Timer,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

interface CrewLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'busy' | 'available' | 'on_break';
  lastUpdate: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery?: number;
  isTracking: boolean;
  currentJob?: {
    id: string;
    customerName: string;
    location: string;
    estimatedArrival?: string;
  };
  groupId?: string;
  groupName?: string;
}

interface LocationUpdate {
  crewId: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: string;
  metadata?: any;
}

interface RealTimeLocationTrackerProps {
  userRole: 'admin' | 'manager' | 'supervisor';
  onCrewSelect?: (crew: CrewLocation) => void;
  height?: string;
  showControls?: boolean;
}

export default function RealTimeLocationTracker({ 
  userRole, 
  onCrewSelect, 
  height = "500px",
  showControls = true 
}: RealTimeLocationTrackerProps) {
  const [crewLocations, setCrewLocations] = useState<CrewLocation[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(5); // seconds
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationHistory, setLocationHistory] = useState<Map<string, LocationUpdate[]>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOfflineCrew, setShowOfflineCrew] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data generation for demonstration
  const generateMockCrewLocations = (): CrewLocation[] => {
    const mockCrew: CrewLocation[] = [];
    const philippinesCenter = { lat: 14.5995, lng: 120.9842 }; // Manila
    
    for (let i = 1; i <= 20; i++) {
      const latOffset = (Math.random() - 0.5) * 0.2;
      const lngOffset = (Math.random() - 0.5) * 0.2;
      const status = ['online', 'offline', 'busy', 'available', 'on_break'][Math.floor(Math.random() * 5)] as any;
      
      mockCrew.push({
        id: `crew-${i}`,
        name: `Crew Member ${i}`,
        lat: philippinesCenter.lat + latOffset,
        lng: philippinesCenter.lng + lngOffset,
        status,
        lastUpdate: new Date(Date.now() - Math.random() * 300000).toISOString(), // Random time within last 5 minutes
        accuracy: 5 + Math.random() * 20, // 5-25 meters
        speed: status === 'busy' ? Math.random() * 50 : 0, // km/h
        heading: Math.random() * 360, // degrees
        battery: 20 + Math.random() * 80, // 20-100%
        isTracking: status !== 'offline',
        currentJob: status === 'busy' ? {
          id: `job-${i}`,
          customerName: `Customer ${i}`,
          location: `Location ${i}`,
          estimatedArrival: new Date(Date.now() + Math.random() * 1800000).toISOString() // Within next 30 mins
        } : undefined,
        groupId: `group-${Math.ceil(i / 4)}`,
        groupName: `Team ${Math.ceil(i / 4)}`
      });
    }
    
    return mockCrew;
  };

  const simulateLocationUpdate = (crew: CrewLocation): CrewLocation => {
    if (!crew.isTracking || crew.status === 'offline') return crew;
    
    // Simulate small movement (GPS drift or actual movement)
    const movementRange = crew.status === 'busy' ? 0.001 : 0.0001; // Larger movement if busy
    const latChange = (Math.random() - 0.5) * movementRange;
    const lngChange = (Math.random() - 0.5) * movementRange;
    
    return {
      ...crew,
      lat: crew.lat + latChange,
      lng: crew.lng + lngChange,
      lastUpdate: new Date().toISOString(),
      accuracy: 5 + Math.random() * 15,
      speed: crew.status === 'busy' ? Math.random() * 50 : Math.random() * 5,
      heading: crew.heading! + (Math.random() - 0.5) * 30, // Small heading changes
      battery: Math.max(10, crew.battery! - Math.random() * 0.5) // Gradual battery drain
    };
  };

  useEffect(() => {
    // Initial load
    const loadCrewLocations = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockLocations = generateMockCrewLocations();
        setCrewLocations(mockLocations);
        setLastUpdate(new Date());
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load crew locations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCrewLocations();
  }, []);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setCrewLocations(prev => {
          const updated = prev.map(simulateLocationUpdate);
          
          // Store location updates in history
          updated.forEach(crew => {
            if (crew.isTracking) {
              const update: LocationUpdate = {
                crewId: crew.id,
                timestamp: crew.lastUpdate,
                location: {
                  lat: crew.lat,
                  lng: crew.lng,
                  accuracy: crew.accuracy || 10
                },
                status: crew.status,
                metadata: {
                  speed: crew.speed,
                  heading: crew.heading,
                  battery: crew.battery
                }
              };
              
              setLocationHistory(prevHistory => {
                const newHistory = new Map(prevHistory);
                const crewHistory = newHistory.get(crew.id) || [];
                crewHistory.push(update);
                
                // Keep only last 50 updates per crew
                if (crewHistory.length > 50) {
                  crewHistory.shift();
                }
                
                newHistory.set(crew.id, crewHistory);
                return newHistory;
              });
            }
          });
          
          setLastUpdate(new Date());
          return updated;
        });
      }, updateInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, updateInterval]);

  const startTracking = () => {
    setIsTracking(true);
    toast({
      title: "Real-time Tracking Started",
      description: `Location updates every ${updateInterval} seconds`,
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Real-time Tracking Stopped",
      description: "Location updates have been paused",
    });
  };

  const refreshLocations = async () => {
    const mockLocations = generateMockCrewLocations();
    setCrewLocations(mockLocations);
    setLastUpdate(new Date());
    toast({
      title: "Locations Refreshed",
      description: "All crew locations have been updated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'available': return 'bg-blue-500';
      case 'busy': return 'bg-orange-500';
      case 'on_break': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Activity className="h-3 w-3" />;
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <Clock className="h-3 w-3" />;
      case 'on_break': return <Timer className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const filteredCrew = crewLocations.filter(crew => {
    if (!showOfflineCrew && crew.status === 'offline') return false;
    if (filterStatus !== 'all' && crew.status !== filterStatus) return false;
    if (filterGroup !== 'all' && crew.groupId !== filterGroup) return false;
    if (searchTerm && !crew.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getTrackingStats = () => {
    const online = crewLocations.filter(c => c.status === 'online' || c.status === 'available').length;
    const busy = crewLocations.filter(c => c.status === 'busy').length;
    const offline = crewLocations.filter(c => c.status === 'offline').length;
    const tracking = crewLocations.filter(c => c.isTracking).length;
    
    return { online, busy, offline, tracking };
  };

  const stats = getTrackingStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time locations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPinned className="h-6 w-6 text-fac-orange-500" />
                <div>
                  <h3 className="text-xl font-bold">Real-Time Location Tracking</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {isTracking ? `Live updates every ${updateInterval}s` : 'Tracking paused'}
                    {lastUpdate && ` • Last update: ${lastUpdate.toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={updateInterval.toString()} onValueChange={(value) => setUpdateInterval(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 second</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={refreshLocations} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                {isTracking ? (
                  <Button onClick={stopTracking} variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.online}</div>
                <div className="text-xs text-green-700">Online</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.busy}</div>
                <div className="text-xs text-orange-700">Busy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
                <div className="text-xs text-gray-700">Offline</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.tracking}</div>
                <div className="text-xs text-blue-700">Tracking</div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search crew..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="on_break">On Break</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="group-1">Team 1</SelectItem>
                  <SelectItem value="group-2">Team 2</SelectItem>
                  <SelectItem value="group-3">Team 3</SelectItem>
                  <SelectItem value="group-4">Team 4</SelectItem>
                  <SelectItem value="group-5">Team 5</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOfflineCrew(!showOfflineCrew)}
                className="flex items-center gap-2"
              >
                {showOfflineCrew ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showOfflineCrew ? 'Hide' : 'Show'} Offline
              </Button>
              
              {isTracking && (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1 animate-pulse">
                  <Zap className="h-3 w-3" />
                  Live Tracking
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tracking Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={mapRef}
                className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden"
                style={{ height }}
              >
                <div className="absolute inset-0 p-4">
                  {/* Simulated Map */}
                  <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
                        {[...Array(400)].map((_, i) => (
                          <div key={i} className="border border-gray-300"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Crew location dots */}
                    {filteredCrew.map((crew) => {
                      const x = ((crew.lng - 120.84) / 0.3) * 100; // Normalize to 0-100%
                      const y = ((14.75 - crew.lat) / 0.3) * 100; // Invert Y and normalize
                      
                      return (
                        <div
                          key={crew.id}
                          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                            selectedCrew?.id === crew.id ? 'scale-150 z-20' : 'scale-100 z-10'
                          }`}
                          style={{
                            left: `${Math.max(5, Math.min(95, x))}%`,
                            top: `${Math.max(5, Math.min(95, y))}%`,
                          }}
                          onClick={() => {
                            setSelectedCrew(crew);
                            onCrewSelect?.(crew);
                          }}
                          title={`${crew.name} - ${crew.status}`}
                        >
                          {/* Main dot */}
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(crew.status)} shadow-lg flex items-center justify-center`}>
                            <User className="h-2 w-2 text-white" />
                          </div>
                          
                          {/* Tracking indicator */}
                          {crew.isTracking && isTracking && (
                            <div className={`absolute inset-0 w-4 h-4 rounded-full ${getStatusColor(crew.status)} animate-ping opacity-75`}></div>
                          )}
                          
                          {/* Label */}
                          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                            {crew.name}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
                      <h4 className="font-semibold text-sm mb-2">Legend</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Online/Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Busy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>On Break</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          <span>Offline</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crew Details & List */}
        <div className="space-y-4">
          {/* Selected Crew Details */}
          {selectedCrew ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-fac-orange-500" />
                  {selectedCrew.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(selectedCrew.status)} text-white`}>
                    {getStatusIcon(selectedCrew.status)}
                    <span className="ml-1 capitalize">{selectedCrew.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge variant="outline">{selectedCrew.groupName}</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium">{new Date(selectedCrew.lastUpdate).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-medium">±{selectedCrew.accuracy?.toFixed(0)}m</span>
                  </div>
                  {selectedCrew.speed !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium">{selectedCrew.speed.toFixed(0)} km/h</span>
                    </div>
                  )}
                  {selectedCrew.battery !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery:</span>
                      <span className={`font-medium ${selectedCrew.battery < 20 ? 'text-red-600' : ''}`}>
                        {selectedCrew.battery.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <Badge variant={selectedCrew.isTracking ? "default" : "secondary"}>
                      {selectedCrew.isTracking ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                {selectedCrew.currentJob && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Current Job</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Customer:</strong> {selectedCrew.currentJob.customerName}</div>
                      <div><strong>Location:</strong> {selectedCrew.currentJob.location}</div>
                      {selectedCrew.currentJob.estimatedArrival && (
                        <div><strong>ETA:</strong> {new Date(selectedCrew.currentJob.estimatedArrival).toLocaleTimeString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Select a crew member on the map to view details</p>
              </CardContent>
            </Card>
          )}
          
          {/* Crew List */}
          <Card>
            <CardHeader>
              <CardTitle>Crew List ({filteredCrew.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredCrew.map((crew) => (
                  <div 
                    key={crew.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCrew?.id === crew.id ? 'bg-fac-orange-50 border border-fac-orange-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCrew(crew);
                      onCrewSelect?.(crew);
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(crew.status)} ${crew.isTracking && isTracking ? 'animate-pulse' : ''}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{crew.name}</p>
                      <p className="text-xs text-gray-500">{crew.groupName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(crew.lastUpdate).toLocaleTimeString()}
                      </p>
                      {crew.isTracking && (
                        <Badge variant="outline" className="text-xs">Live</Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredCrew.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No crew members match the current filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
