import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  Users,
  Car,
  Navigation,
  Filter,
  RefreshCw,
  Search,
  Settings,
  Activity,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Truck,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Crown,
  UserPlus
} from 'lucide-react';

interface LocationData {
  id: string;
  type: 'customer' | 'crew';
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'busy' | 'available';
  lastUpdate: string;
  metadata?: {
    // For customers
    totalBookings?: number;
    lastBooking?: string;
    customerRating?: number;
    loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalSpent?: number;
    averageServiceValue?: number;
    serviceFrequency?: 'low' | 'medium' | 'high' | 'vip';
    preferredServices?: string[];
    lastServiceDate?: string;
    customerRank?: number;
    rankCategory?: 'new' | 'regular' | 'loyal' | 'vip' | 'champion';
    monthlyVisits?: number;
    // For crew
    currentAssignments?: number;
    completedJobs?: number;
    crewRating?: number;
    groupId?: string;
    groupName?: string;
  };
}

interface HeatMapFilters {
  type: 'all' | 'customers' | 'crew';
  status: 'all' | 'online' | 'offline' | 'busy' | 'available';
  timeRange: '1h' | '6h' | '24h' | '7d';
  groupId?: string;
  customerRank?: 'all' | 'new' | 'regular' | 'loyal' | 'vip' | 'champion';
  loyaltyLevel?: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum';
  serviceFrequency?: 'all' | 'low' | 'medium' | 'high' | 'vip';
}

interface AdminHeatMapProps {
  onLocationSelect?: (location: LocationData) => void;
  height?: string;
}

export default function AdminHeatMap({ onLocationSelect, height = "600px" }: AdminHeatMapProps) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [filters, setFilters] = useState<HeatMapFilters>({
    type: 'all',
    status: 'all',
    timeRange: '24h',
    customerRank: 'all',
    loyaltyLevel: 'all',
    serviceFrequency: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [crewGroups, setCrewGroups] = useState<Array<{id: string, name: string, memberCount: number}>>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app this would come from API
  const generateMockLocations = (): LocationData[] => {
    const philippinesCenter = { lat: 14.5995, lng: 120.9842 }; // Manila
    const locations: LocationData[] = [];

    // Generate crew locations
    for (let i = 1; i <= 20; i++) {
      const latOffset = (Math.random() - 0.5) * 0.2; // ±0.1 degrees (~11km)
      const lngOffset = (Math.random() - 0.5) * 0.2;
      
      locations.push({
        id: `crew-${i}`,
        type: 'crew',
        name: `Crew Member ${i}`,
        lat: philippinesCenter.lat + latOffset,
        lng: philippinesCenter.lng + lngOffset,
        status: ['online', 'offline', 'busy', 'available'][Math.floor(Math.random() * 4)] as any,
        lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        metadata: {
          currentAssignments: Math.floor(Math.random() * 3),
          completedJobs: Math.floor(Math.random() * 100),
          crewRating: 3 + Math.random() * 2,
          groupId: `group-${Math.ceil(i / 4)}`,
          groupName: `Team ${Math.ceil(i / 4)}`
        }
      });
    }

    // Generate customer locations with ranking system
    for (let i = 1; i <= 50; i++) {
      const latOffset = (Math.random() - 0.5) * 0.3;
      const lngOffset = (Math.random() - 0.5) * 0.3;

      // Generate realistic customer data
      const totalBookings = Math.floor(Math.random() * 100) + 1;
      const totalSpent = totalBookings * (500 + Math.random() * 2000); // ₱500-2500 per booking
      const monthlyVisits = Math.floor(Math.random() * 12) + 1;
      const averageServiceValue = totalSpent / totalBookings;

      // Determine service frequency based on bookings
      let serviceFrequency: 'low' | 'medium' | 'high' | 'vip';
      if (totalBookings >= 50) serviceFrequency = 'vip';
      else if (totalBookings >= 25) serviceFrequency = 'high';
      else if (totalBookings >= 10) serviceFrequency = 'medium';
      else serviceFrequency = 'low';

      // Calculate customer rank (1-100, higher is better)
      const bookingScore = Math.min(totalBookings * 2, 60); // Max 60 points for bookings
      const spendingScore = Math.min(totalSpent / 1000, 30); // Max 30 points for spending
      const frequencyScore = Math.min(monthlyVisits, 10); // Max 10 points for frequency
      const customerRank = Math.min(bookingScore + spendingScore + frequencyScore, 100);

      // Determine rank category
      let rankCategory: 'new' | 'regular' | 'loyal' | 'vip' | 'champion';
      if (customerRank >= 80) rankCategory = 'champion';
      else if (customerRank >= 60) rankCategory = 'vip';
      else if (customerRank >= 40) rankCategory = 'loyal';
      else if (customerRank >= 20) rankCategory = 'regular';
      else rankCategory = 'new';

      // Determine loyalty level based on rank
      let loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
      if (customerRank >= 75) loyaltyLevel = 'platinum';
      else if (customerRank >= 55) loyaltyLevel = 'gold';
      else if (customerRank >= 35) loyaltyLevel = 'silver';
      else loyaltyLevel = 'bronze';

      const preferredServices = [
        'Basic Wash', 'Premium Wash', 'Deluxe Detail', 'Interior Clean',
        'Wax & Polish', 'Engine Bay Clean'
      ].slice(0, Math.floor(Math.random() * 3) + 1);

      locations.push({
        id: `customer-${i}`,
        type: 'customer',
        name: `Customer ${i}`,
        lat: philippinesCenter.lat + latOffset,
        lng: philippinesCenter.lng + lngOffset,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        lastUpdate: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        metadata: {
          totalBookings,
          lastBooking: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          customerRating: 3 + Math.random() * 2,
          loyaltyLevel,
          totalSpent,
          averageServiceValue,
          serviceFrequency,
          preferredServices,
          lastServiceDate: new Date(Date.now() - Math.random() * 1209600000).toISOString(), // Within 2 weeks
          customerRank: Math.round(customerRank),
          rankCategory,
          monthlyVisits
        }
      });
    }

    return locations;
  };

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockLocations = generateMockLocations();
        setLocations(mockLocations);
        
        // Generate crew groups
        const groups = [];
        for (let i = 1; i <= 5; i++) {
          groups.push({
            id: `group-${i}`,
            name: `Team ${i}`,
            memberCount: mockLocations.filter(l => l.metadata?.groupId === `group-${i}`).length
          });
        }
        setCrewGroups(groups);
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load location data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = locations;

    if (filters.type !== 'all') {
      filtered = filtered.filter(loc => loc.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(loc => loc.status === filters.status);
    }

    if (filters.groupId) {
      filtered = filtered.filter(loc => loc.metadata?.groupId === filters.groupId);
    }

    // Customer-specific filters
    if (filters.customerRank && filters.customerRank !== 'all') {
      filtered = filtered.filter(loc =>
        loc.type === 'customer' && loc.metadata?.rankCategory === filters.customerRank
      );
    }

    if (filters.loyaltyLevel && filters.loyaltyLevel !== 'all') {
      filtered = filtered.filter(loc =>
        loc.type === 'customer' && loc.metadata?.loyaltyLevel === filters.loyaltyLevel
      );
    }

    if (filters.serviceFrequency && filters.serviceFrequency !== 'all') {
      filtered = filtered.filter(loc =>
        loc.type === 'customer' && loc.metadata?.serviceFrequency === filters.serviceFrequency
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.metadata?.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.metadata?.preferredServices?.some(service =>
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredLocations(filtered);
  }, [locations, filters, searchTerm]);

  const refreshData = () => {
    const newLocations = generateMockLocations();
    setLocations(newLocations);
    toast({
      title: "Data Refreshed",
      description: "Location data has been updated",
    });
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'crew') {
      switch (status) {
        case 'online': return 'bg-green-500';
        case 'busy': return 'bg-orange-500';
        case 'available': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    } else {
      return status === 'online' ? 'bg-purple-500' : 'bg-gray-400';
    }
  };

  const getLocationStats = () => {
    const totalCrew = filteredLocations.filter(l => l.type === 'crew').length;
    const onlineCrew = filteredLocations.filter(l => l.type === 'crew' && l.status === 'online').length;
    const busyCrew = filteredLocations.filter(l => l.type === 'crew' && l.status === 'busy').length;
    const totalCustomers = filteredLocations.filter(l => l.type === 'customer').length;
    const onlineCustomers = filteredLocations.filter(l => l.type === 'customer' && l.status === 'online').length;

    // Customer ranking stats
    const vipCustomers = filteredLocations.filter(l => l.type === 'customer' && l.metadata?.rankCategory === 'vip').length;
    const championCustomers = filteredLocations.filter(l => l.type === 'customer' && l.metadata?.rankCategory === 'champion').length;
    const loyalCustomers = filteredLocations.filter(l => l.type === 'customer' && l.metadata?.rankCategory === 'loyal').length;
    const newCustomers = filteredLocations.filter(l => l.type === 'customer' && l.metadata?.rankCategory === 'new').length;

    // Top customers by rank
    const topCustomers = filteredLocations
      .filter(l => l.type === 'customer')
      .sort((a, b) => (b.metadata?.customerRank || 0) - (a.metadata?.customerRank || 0))
      .slice(0, 5);

    return {
      totalCrew,
      onlineCrew,
      busyCrew,
      totalCustomers,
      onlineCustomers,
      availableCrew: totalCrew - busyCrew,
      vipCustomers,
      championCustomers,
      loyalCustomers,
      newCustomers,
      topCustomers
    };
  };

  const stats = getLocationStats();

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-fac-orange-500" />
            Live Location Heat Map
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time tracking of crew and customer locations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            variant="outline" 
            size="sm"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-blue-700">Total Crew</p>
                <p className="text-xl font-bold text-blue-900">{stats.totalCrew}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-500 p-2 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-green-700">Online Crew</p>
                <p className="text-xl font-bold text-green-900">{stats.onlineCrew}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-orange-700">Busy Crew</p>
                <p className="text-xl font-bold text-orange-900">{stats.busyCrew}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Car className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-purple-700">Customers</p>
                <p className="text-xl font-bold text-purple-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Navigation className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-indigo-700">Active</p>
                <p className="text-xl font-bold text-indigo-900">{stats.onlineCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-emerald-700">Available</p>
                <p className="text-xl font-bold text-emerald-900">{stats.availableCrew}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Ranking Stats */}
      {(filters.type === 'customers' || filters.type === 'all') && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-yellow-700">Champions</p>
                  <p className="text-xl font-bold text-yellow-900">{stats.championCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-red-700">VIP</p>
                  <p className="text-xl font-bold text-red-900">{stats.vipCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-purple-700">Loyal</p>
                  <p className="text-xl font-bold text-purple-900">{stats.loyalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-blue-700">Regular</p>
                  <p className="text-xl font-bold text-blue-900">{filteredLocations.filter(l => l.type === 'customer' && l.metadata?.rankCategory === 'regular').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-gray-500 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-gray-700">New</p>
                  <p className="text-xl font-bold text-gray-900">{stats.newCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={filters.type} onValueChange={(value: any) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="crew">Crew Only</SelectItem>
                <SelectItem value="customers">Customers Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value: any) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.groupId || ''} onValueChange={(value) => setFilters({...filters, groupId: value || undefined})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Groups</SelectItem>
                {crewGroups.map(group => {
                  try {
                    const safeGroupName = String(group?.name || 'Unknown Group').replace(/[^\w\s\-\(\)]/g, '');
                    const safeMemberCount = String(group?.memberCount || 0);
                    const safeContent = `${safeGroupName} (${safeMemberCount})`;

                    return (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {safeContent}
                      </SelectItem>
                    );
                  } catch (error) {
                    console.warn('Error rendering crew group SelectItem:', error, group);
                    return (
                      <SelectItem key={group.id || Math.random()} value={String(group.id || 'unknown')}>
                        Group ({String(group?.memberCount || 0)})
                      </SelectItem>
                    );
                  }
                })}
              </SelectContent>
            </Select>

            {(filters.type === 'customers' || filters.type === 'all') && (
              <>
                <Select value={filters.customerRank || 'all'} onValueChange={(value: any) => setFilters({...filters, customerRank: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Ranks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value="champion">🏆 Champions</SelectItem>
                    <SelectItem value="vip">👑 VIP</SelectItem>
                    <SelectItem value="loyal">💎 Loyal</SelectItem>
                    <SelectItem value="regular">⭐ Regular</SelectItem>
                    <SelectItem value="new">🆕 New</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.loyaltyLevel || 'all'} onValueChange={(value: any) => setFilters({...filters, loyaltyLevel: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="platinum">🥇 Platinum</SelectItem>
                    <SelectItem value="gold">🥇 Gold</SelectItem>
                    <SelectItem value="silver">🥉 Silver</SelectItem>
                    <SelectItem value="bronze">🎖️ Bronze</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.serviceFrequency || 'all'} onValueChange={(value: any) => setFilters({...filters, serviceFrequency: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequency</SelectItem>
                    <SelectItem value="vip">🔥 VIP (50+ visits)</SelectItem>
                    <SelectItem value="high">📈 High (25+ visits)</SelectItem>
                    <SelectItem value="medium">📊 Medium (10+ visits)</SelectItem>
                    <SelectItem value="low">📉 Low (under 10 visits)</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Map and Details */}
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
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading location data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-4">
                    {/* Simulated Map with Dots */}
                    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                      {/* Grid background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
                          {[...Array(400)].map((_, i) => (
                            <div key={i} className="border border-gray-300"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Location dots */}
                      {filteredLocations.map((location) => {
                        const x = ((location.lng - 120.84) / 0.3) * 100; // Normalize to 0-100%
                        const y = ((14.75 - location.lat) / 0.3) * 100; // Invert Y and normalize
                        
                        return (
                          <div
                            key={location.id}
                            className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getStatusColor(location.status, location.type)} hover:scale-125 transition-all duration-200 shadow-lg`}
                            style={{
                              left: `${Math.max(5, Math.min(95, x))}%`,
                              top: `${Math.max(5, Math.min(95, y))}%`,
                            }}
                            onClick={() => {
                              setSelectedLocation(location);
                              onLocationSelect?.(location);
                            }}
                            title={`${location.name} - ${location.status}`}
                          >
                            {location.type === 'crew' && (
                              <Truck className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
                            )}
                            {location.type === 'customer' && (
                              <>
                                {location.status === 'online' && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                )}
                                {/* Customer rank indicator */}
                                {location.metadata?.rankCategory && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center text-white font-bold"
                                       style={{
                                         backgroundColor:
                                           location.metadata.rankCategory === 'champion' ? '#FFD700' :
                                           location.metadata.rankCategory === 'vip' ? '#C0392B' :
                                           location.metadata.rankCategory === 'loyal' ? '#8E44AD' :
                                           location.metadata.rankCategory === 'regular' ? '#3498DB' : '#95A5A6'
                                       }}>
                                    {location.metadata.rankCategory === 'champion' ? '👑' :
                                     location.metadata.rankCategory === 'vip' ? 'V' :
                                     location.metadata.rankCategory === 'loyal' ? 'L' :
                                     location.metadata.rankCategory === 'regular' ? 'R' : 'N'}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border max-w-xs">
                        <h4 className="font-semibold text-sm mb-2">Legend</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700">Status</div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>Crew Online</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span>Crew Busy</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span>Customer Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span>Offline</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700">Customer Rank</div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">👑</div>
                              <span>Champion</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">V</div>
                              <span>VIP</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>
                              <span>Loyal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
                              <span>Regular</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                              <span>New</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          {selectedLocation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedLocation.type === 'crew' ? (
                    <Truck className="h-5 w-5 text-fac-orange-500" />
                  ) : (
                    <Car className="h-5 w-5 text-purple-500" />
                  )}
                  {selectedLocation.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedLocation.status, selectedLocation.type).replace('bg-', 'bg-') + ' text-white'}>
                    {selectedLocation.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedLocation.lastUpdate).toLocaleString()}
                  </span>
                </div>
                
                {selectedLocation.type === 'crew' && selectedLocation.metadata && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Group:</span>
                      <span className="text-sm font-medium">{selectedLocation.metadata.groupName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assignments:</span>
                      <span className="text-sm font-medium">{selectedLocation.metadata.currentAssignments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed:</span>
                      <span className="text-sm font-medium">{selectedLocation.metadata.completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{selectedLocation.metadata.crewRating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedLocation.type === 'customer' && selectedLocation.metadata && (
                  <div className="space-y-3">
                    {/* Customer Rank */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Customer Rank</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`capitalize ${
                              selectedLocation.metadata.rankCategory === 'champion' ? 'bg-yellow-500 text-white' :
                              selectedLocation.metadata.rankCategory === 'vip' ? 'bg-red-600 text-white' :
                              selectedLocation.metadata.rankCategory === 'loyal' ? 'bg-purple-600 text-white' :
                              selectedLocation.metadata.rankCategory === 'regular' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}
                          >
                            {selectedLocation.metadata.rankCategory === 'champion' ? '👑 Champion' :
                             selectedLocation.metadata.rankCategory === 'vip' ? '💎 VIP' :
                             selectedLocation.metadata.rankCategory === 'loyal' ? '⭐ Loyal' :
                             selectedLocation.metadata.rankCategory === 'regular' ? '📈 Regular' : '🆕 New'}
                          </Badge>
                          <span className="text-lg font-bold text-gray-900">#{selectedLocation.metadata.customerRank}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-700">{selectedLocation.metadata.totalBookings}</div>
                        <div className="text-xs text-green-600">Total Bookings</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-700">{selectedLocation.metadata.monthlyVisits}</div>
                        <div className="text-xs text-blue-600">Monthly Visits</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent:</span>
                        <span className="text-sm font-medium text-green-600">₱{selectedLocation.metadata.totalSpent?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. Service Value:</span>
                        <span className="text-sm font-medium">₱{selectedLocation.metadata.averageServiceValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Service Frequency:</span>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            selectedLocation.metadata.serviceFrequency === 'vip' ? 'text-red-600 border-red-300' :
                            selectedLocation.metadata.serviceFrequency === 'high' ? 'text-orange-600 border-orange-300' :
                            selectedLocation.metadata.serviceFrequency === 'medium' ? 'text-blue-600 border-blue-300' :
                            'text-gray-600 border-gray-300'
                          }`}
                        >
                          {selectedLocation.metadata.serviceFrequency}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Loyalty Tier:</span>
                        <Badge
                          className={`capitalize ${
                            selectedLocation.metadata.loyaltyLevel === 'platinum' ? 'bg-gray-400 text-white' :
                            selectedLocation.metadata.loyaltyLevel === 'gold' ? 'bg-yellow-500 text-white' :
                            selectedLocation.metadata.loyaltyLevel === 'silver' ? 'bg-gray-300 text-gray-800' :
                            'bg-orange-400 text-white'
                          }`}
                        >
                          {selectedLocation.metadata.loyaltyLevel === 'platinum' ? '🥇 Platinum' :
                           selectedLocation.metadata.loyaltyLevel === 'gold' ? '🥈 Gold' :
                           selectedLocation.metadata.loyaltyLevel === 'silver' ? '🥉 Silver' : '🎖️ Bronze'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customer Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{selectedLocation.metadata.customerRating?.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Service:</span>
                        <span className="text-sm font-medium">
                          {selectedLocation.metadata.lastServiceDate ?
                            new Date(selectedLocation.metadata.lastServiceDate).toLocaleDateString() :
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Preferred Services */}
                    {selectedLocation.metadata.preferredServices && selectedLocation.metadata.preferredServices.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Services</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedLocation.metadata.preferredServices.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Click on a location marker to view details</p>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLocations.slice(0, 5).map((location) => (
                  <div key={location.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(location.status, location.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{location.name}</p>
                      <p className="text-xs text-gray-500">
                        {location.status} • {new Date(location.lastUpdate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
