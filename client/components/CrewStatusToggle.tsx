import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Activity,
  MapPin,
  Clock,
  Navigation,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Wifi,
  WifiOff,
  Timer,
  User
} from 'lucide-react';
import {
  getGeolocationErrorDetails,
  getGeolocationErrorMessage,
  getGeolocationErrorHelp
} from '@/utils/geolocationUtils';

export type CrewStatus = 'online' | 'offline' | 'busy' | 'available' | 'on_break';

interface CrewStatusData {
  id: string;
  status: CrewStatus;
  lastStatusChange: string;
  locationEnabled: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  breakStartTime?: string;
  totalWorkTime?: number;
  todayStats: {
    workingTime: number;
    breakTime: number;
    assignmentsCompleted: number;
  };
}

interface CrewStatusToggleProps {
  crewId: string;
  initialStatus?: CrewStatus;
  onStatusChange?: (status: CrewStatus) => void;
  onLocationToggle?: (enabled: boolean) => void;
  compact?: boolean;
}

export default function CrewStatusToggle({ 
  crewId, 
  initialStatus = 'offline', 
  onStatusChange, 
  onLocationToggle,
  compact = false 
}: CrewStatusToggleProps) {
  const [crewData, setCrewData] = useState<CrewStatusData>({
    id: crewId,
    status: initialStatus,
    lastStatusChange: new Date().toISOString(),
    locationEnabled: false,
    todayStats: {
      workingTime: 0,
      breakTime: 0,
      assignmentsCompleted: 0
    }
  });
  
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);

  useEffect(() => {
    // Load crew status from localStorage or API
    const savedStatus = localStorage.getItem(`crew_status_${crewId}`);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        setCrewData(parsed);
      } catch (error) {
        console.error('Error loading crew status:', error);
      }
    }
  }, [crewId]);

  useEffect(() => {
    // Save crew status to localStorage
    localStorage.setItem(`crew_status_${crewId}`, JSON.stringify(crewData));
  }, [crewData, crewId]);

  const updateStatus = async (newStatus: CrewStatus) => {
    if (newStatus === crewData.status) return;

    setIsChangingStatus(true);
    
    try {
      // Validate location requirement for online status
      if (newStatus === 'online' || newStatus === 'available') {
        if (!crewData.locationEnabled) {
          setShowLocationWarning(true);
          setIsChangingStatus(false);
          return;
        }
      }

      // Handle break timing
      let updatedData = { ...crewData };
      
      if (newStatus === 'on_break') {
        updatedData.breakStartTime = new Date().toISOString();
      } else if (crewData.status === 'on_break' && crewData.breakStartTime) {
        const breakDuration = Date.now() - new Date(crewData.breakStartTime).getTime();
        updatedData.todayStats.breakTime += breakDuration;
        updatedData.breakStartTime = undefined;
      }

      updatedData.status = newStatus;
      updatedData.lastStatusChange = new Date().toISOString();

      setCrewData(updatedData);
      onStatusChange?.(newStatus);

      // Show status change notification
      const statusMessages = {
        online: 'You are now online and ready for assignments',
        offline: 'You are now offline',
        busy: 'Status set to busy',
        available: 'You are available for new assignments',
        on_break: 'Break time started. Take your time!'
      };

      toast({
        title: "Status Updated",
        description: statusMessages[newStatus],
        duration: 3000,
      });

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const toggleLocation = async (enabled: boolean) => {
    if (enabled) {
      // Request location permission
      if (!navigator.geolocation) {
        toast({
          title: "Location Not Supported",
          description: "Your device doesn't support location tracking",
          variant: "destructive",
        });
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        setCrewData(prev => ({
          ...prev,
          locationEnabled: true,
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }));

        onLocationToggle?.(true);
        setShowLocationWarning(false);

        toast({
          title: "Location Enabled",
          description: `GPS location is now active (±${Math.round(position.coords.accuracy)}m accuracy)`,
        });

      } catch (error) {
        // Use proper geolocation error handling utilities
        const errorDetails = getGeolocationErrorDetails(error as GeolocationPositionError);
        const errorHelp = getGeolocationErrorHelp(error as GeolocationPositionError);

        console.error('Location error:', JSON.stringify(errorDetails));

        toast({
          title: errorHelp.title,
          description: errorHelp.description,
          variant: "destructive",
        });

        // Show additional help for permission errors
        if ((error as GeolocationPositionError).code === 1 && errorHelp.helpText) {
          setTimeout(() => {
            toast({
              title: "💡 Location Setup Help",
              description: errorHelp.helpText,
              duration: 10000,
            });
          }, 2000);
        }
      }
    } else {
      setCrewData(prev => ({
        ...prev,
        locationEnabled: false,
        currentLocation: undefined
      }));
      
      onLocationToggle?.(false);

      toast({
        title: "Location Disabled",
        description: "GPS tracking has been turned off",
      });
    }
  };

  const getStatusColor = (status: CrewStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500 text-white';
      case 'available': return 'bg-blue-500 text-white';
      case 'busy': return 'bg-orange-500 text-white';
      case 'on_break': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: CrewStatus) => {
    switch (status) {
      case 'online': return <Activity className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Clock className="h-4 w-4" />;
      case 'on_break': return <Pause className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            crewData.status === 'online' || crewData.status === 'available' 
              ? 'bg-green-500 animate-pulse' 
              : crewData.status === 'busy' || crewData.status === 'on_break'
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}></div>
          <Badge className={getStatusColor(crewData.status)}>
            {getStatusIcon(crewData.status)}
            <span className="ml-1 capitalize">{crewData.status.replace('_', ' ')}</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className={`h-4 w-4 ${crewData.locationEnabled ? 'text-green-500' : 'text-gray-400'}`} />
          <Switch
            checked={crewData.locationEnabled}
            onCheckedChange={toggleLocation}
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Status Control */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-fac-orange-500" />
                Work Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Control your availability and location sharing
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(crewData.status)}
              <Badge className={getStatusColor(crewData.status)} size="lg">
                {crewData.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Status Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Change Status
                </label>
                <Select 
                  value={crewData.status} 
                  onValueChange={(value: CrewStatus) => updateStatus(value)}
                  disabled={isChangingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">✅ Available - Ready for work</SelectItem>
                    <SelectItem value="online">🟢 Online - Active</SelectItem>
                    <SelectItem value="busy">🟠 Busy - Working</SelectItem>
                    <SelectItem value="on_break">⏸️ On Break</SelectItem>
                    <SelectItem value="offline">⚫ Offline - End of shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Status Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => updateStatus('available')}
                  variant={crewData.status === 'available' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isChangingStatus}
                  className="flex items-center gap-2"
                >
                  <Play className="h-3 w-3" />
                  Available
                </Button>
                <Button
                  onClick={() => updateStatus('on_break')}
                  variant={crewData.status === 'on_break' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isChangingStatus}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-3 w-3" />
                  Break
                </Button>
              </div>
            </div>

            {/* Location Settings */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Location Tracking
                </label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {crewData.locationEnabled ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Wifi className="h-4 w-4" />
                        <span className="text-sm font-medium">GPS Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-sm font-medium">GPS Off</span>
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={crewData.locationEnabled}
                    onCheckedChange={toggleLocation}
                  />
                </div>
              </div>

              {crewData.currentLocation && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  📍 {crewData.currentLocation.lat.toFixed(6)}, {crewData.currentLocation.lng.toFixed(6)}
                  {crewData.currentLocation.accuracy && (
                    <span className="ml-2">±{Math.round(crewData.currentLocation.accuracy)}m</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Warning */}
          {showLocationWarning && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Location Required</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please enable location tracking to go online. This helps managers assign nearby jobs to you.
              </p>
              <Button
                onClick={() => toggleLocation(true)}
                size="sm"
                className="mt-2"
              >
                Enable Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-4 w-4 text-fac-orange-500" />
            Today's Activity
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatTime(crewData.todayStats.workingTime)}
              </p>
              <p className="text-xs text-gray-600">Working Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatTime(crewData.todayStats.breakTime)}
              </p>
              <p className="text-xs text-gray-600">Break Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {crewData.todayStats.assignmentsCompleted}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <div className="text-xs text-gray-500 text-center">
        Last status change: {new Date(crewData.lastStatusChange).toLocaleString()}
      </div>
    </div>
  );
}
