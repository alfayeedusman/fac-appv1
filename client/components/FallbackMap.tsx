import React from 'react';
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
  RefreshCw,
  MapPinned,
  Truck,
  Crown
} from 'lucide-react';

interface FallbackMapProps {
  height?: string;
  error?: string;
  onRetry?: () => void;
}

// Mock data for fallback display
const mockCrewData = [
  { id: '1', name: 'Crew Member 1', status: 'online', location: 'Manila North', type: 'crew' },
  { id: '2', name: 'Crew Member 2', status: 'busy', location: 'Manila South', type: 'crew' },
  { id: '3', name: 'Crew Member 3', status: 'available', location: 'Manila East', type: 'crew' },
  { id: '4', name: 'Crew Member 4', status: 'break', location: 'Manila West', type: 'crew' },
];

const mockCustomerData = [
  { id: '1', name: 'Customer A', status: 'requesting', location: 'Makati', membership: 'platinum' },
  { id: '2', name: 'Customer B', status: 'being_served', location: 'BGC', membership: 'gold' },
  { id: '3', name: 'Customer C', status: 'online', location: 'Quezon City', membership: 'silver' },
];

export default function FallbackMap({ height = '600px', error, onRetry }: FallbackMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'available': return 'bg-blue-500';
      case 'break': return 'bg-purple-500';
      case 'requesting': return 'bg-red-500';
      case 'being_served': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'platinum': return 'bg-gray-300';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-blue-950 dark:via-green-950 dark:to-purple-950" style={{ height }}>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Fallback Map View</span>
                {error && (
                  <Badge variant="destructive" className="text-xs">
                    Map Service Unavailable
                  </Badge>
                )}
              </div>
              {onRetry && (
                <Button onClick={onRetry} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Map
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Layout for Locations */}
      <div className="absolute inset-0 p-4 pt-24 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Crew Section */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                Crew Locations ({mockCrewData.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCrewData.map((crew) => (
                <div key={crew.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(crew.status)}`}></div>
                    <div>
                      <p className="font-medium">{crew.name}</p>
                      <p className="text-sm text-gray-500">{crew.location}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {crew.status}
                  </Badge>
                </div>
              ))}
              
              {/* Status Legend */}
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Status Legend:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
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
              </div>
            </CardContent>
          </Card>

          {/* Customer Section */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-purple-500" />
                Customer Locations ({mockCustomerData.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCustomerData.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(customer.status)}`}></div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-xs">
                      {customer.status.replace('_', ' ')}
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${getMembershipColor(customer.membership)}`} title={customer.membership}></div>
                  </div>
                </div>
              ))}

              {/* Membership Legend */}
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Membership:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Map Service Error:</span>
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manila Skyline Illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-200 to-transparent dark:from-gray-700 opacity-50">
        <div className="flex items-end justify-center h-full pb-4 space-x-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-400 dark:bg-gray-600"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 40 + 20}px`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
