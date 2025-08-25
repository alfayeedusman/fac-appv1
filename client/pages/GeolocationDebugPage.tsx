import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  getGeolocationErrorDetails, 
  getGeolocationErrorMessage, 
  getGeolocationErrorHelp,
  isGeolocationSupported,
  isGeolocationContextSecure,
  getCurrentPositionAsync,
  watchPositionAsync,
  clearWatch
} from '@/utils/geolocationUtils';
import { MapPin, Shield, Globe, Clock } from 'lucide-react';

export default function GeolocationDebugPage() {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const logError = (error: any, context: string) => {
    const errorInfo = {
      context,
      timestamp: new Date().toISOString(),
      details: error.name === 'GeolocationError' && error.details ? error.details :
               error instanceof GeolocationPositionError ? getGeolocationErrorDetails(error) : error,
    };
    setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors
    console.error(`Geolocation ${context}:`, errorInfo);
  };

  const testGetCurrentPosition = async () => {
    try {
      toast({
        title: "Testing getCurrentPosition...",
        description: "Requesting current location",
      });

      const position = await getCurrentPositionAsync();
      setLocation(position);
      
      toast({
        title: "Success!",
        description: `Location: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
      });
    } catch (error: any) {
      logError(error, 'getCurrentPosition');

      // Handle new formatted GeolocationError from utilities
      if (error.name === 'GeolocationError' && error.originalError instanceof GeolocationPositionError) {
        const errorHelp = getGeolocationErrorHelp(error.originalError);
        toast({
          title: errorHelp.title,
          description: errorHelp.description,
          variant: "destructive",
        });
      } else if (error instanceof GeolocationPositionError) {
        // Handle direct GeolocationPositionError (fallback)
        const errorHelp = getGeolocationErrorHelp(error);
        toast({
          title: errorHelp.title,
          description: errorHelp.description,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const testWatchPosition = () => {
    if (isTracking) {
      // Stop tracking
      if (watchId !== null) {
        clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
      toast({
        title: "Stopped tracking",
        description: "Location tracking has been stopped",
      });
      return;
    }

    // Start tracking
    toast({
      title: "Starting tracking...",
      description: "Beginning continuous location updates",
    });

    const id = watchPositionAsync(
      (position) => {
        setLocation(position);
        toast({
          title: "Location updated",
          description: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        });
      },
      (error: any) => {
        logError(error, 'watchPosition');

        // Handle new formatted GeolocationError from utilities
        let errorHelp;
        if (error.name === 'GeolocationError' && error.originalError instanceof GeolocationPositionError) {
          errorHelp = getGeolocationErrorHelp(error.originalError);
        } else if (error instanceof GeolocationPositionError) {
          // Handle direct GeolocationPositionError (fallback)
          errorHelp = getGeolocationErrorHelp(error);
        } else {
          errorHelp = {
            title: "Location Error",
            description: error instanceof Error ? error.message : "Unknown error occurred"
          };
        }

        toast({
          title: errorHelp.title,
          description: errorHelp.description,
          variant: "destructive",
        });
      }
    );

    if (id !== null) {
      setWatchId(id);
      setIsTracking(true);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geolocation Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Browser Support</span>
                  <Badge variant={isGeolocationSupported() ? "default" : "destructive"}>
                    {isGeolocationSupported() ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Secure Context</span>
                  <Badge variant={isGeolocationContextSecure() ? "default" : "destructive"}>
                    {isGeolocationContextSecure() ? "Secure" : "Insecure"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tracking Status</span>
                  <Badge variant={isTracking ? "default" : "secondary"}>
                    {isTracking ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button onClick={testGetCurrentPosition}>
              <Globe className="h-4 w-4 mr-2" />
              Get Current Position
            </Button>
            
            <Button 
              onClick={testWatchPosition}
              variant={isTracking ? "destructive" : "default"}
            >
              <Clock className="h-4 w-4 mr-2" />
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Button>
          </div>

          {location && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Current Location</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Latitude:</strong> {location.lat.toFixed(8)}</p>
                  <p><strong>Longitude:</strong> {location.lng.toFixed(8)}</p>
                  {(location as any).accuracy && (
                    <p><strong>Accuracy:</strong> {(location as any).accuracy.toFixed(2)}m</p>
                  )}
                  {(location as any).timestamp && (
                    <p><strong>Timestamp:</strong> {new Date((location as any).timestamp).toLocaleString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Error Log ({errors.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearErrors}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {errors.map((error, index) => (
                <Card key={index} className="border-red-200 bg-red-50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="destructive" className="text-xs">
                        {error.context}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Type:</strong> {error.details.type}</p>
                      <p><strong>Code:</strong> {error.details.code}</p>
                      <p><strong>Message:</strong> {error.details.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to Test Error Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Permission Denied:</strong> Block location access when prompted</p>
          <p><strong>Position Unavailable:</strong> Disable GPS/location services in your device settings</p>
          <p><strong>Timeout:</strong> Use a slow network connection or disable internet briefly</p>
          <p><strong>Insecure Context:</strong> Access via HTTP (not HTTPS) on a non-localhost domain</p>
        </CardContent>
      </Card>
    </div>
  );
}
