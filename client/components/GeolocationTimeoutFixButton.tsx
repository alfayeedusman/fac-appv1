import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { debugAndFixTimeout } from '@/utils/immediateGeolocationFix';

interface GeolocationTimeoutFixButtonProps {
  onLocationFixed?: (location: { lat: number; lng: number }) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function GeolocationTimeoutFixButton({
  onLocationFixed,
  className = '',
  size = 'default',
  variant = 'destructive'
}: GeolocationTimeoutFixButtonProps) {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleFixTimeout = async () => {
    setIsFixing(true);
    
    try {
      toast({
        title: "🚨 Fixing GPS Timeout",
        description: "Running comprehensive GPS diagnosis and fix...",
        duration: 3000,
      });

      const result = await debugAndFixTimeout();
      console.log('🔧 GPS timeout fix result:', result);
      
      // Check if we got a working location
      let workingLocation = null;
      
      if (result.diagnosis?.success && result.diagnosis.location) {
        workingLocation = result.diagnosis.location;
      } else if (result.workaround?.success && result.workaround.location) {
        workingLocation = result.workaround.location;
      }
      
      if (workingLocation) {
        setIsFixed(true);
        
        // Call the callback if provided
        if (onLocationFixed) {
          onLocationFixed({
            lat: workingLocation.lat,
            lng: workingLocation.lng
          });
        }
        
        toast({
          title: "✅ GPS Timeout Fixed!",
          description: `Location acquired: ±${Math.round(workingLocation.accuracy || 1000)}m accuracy`,
          duration: 6000,
        });
        
        // Reset the fixed state after a delay
        setTimeout(() => {
          setIsFixed(false);
        }, 5000);
        
      } else {
        toast({
          title: "⚠️ GPS Fix Partial",
          description: "Timeout diagnosed but no location available. Check device settings.",
          variant: "destructive",
          duration: 8000,
        });
        
        // Show next steps
        setTimeout(() => {
          toast({
            title: "💡 Next Steps",
            description: "Try: Enable location services → Move outdoors → Refresh page",
            duration: 10000,
          });
        }, 2000);
      }
      
    } catch (error) {
      console.error('GPS timeout fix failed:', error);
      
      toast({
        title: "❌ GPS Fix Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={handleFixTimeout}
      disabled={isFixing}
      size={size}
      variant={isFixed ? "default" : variant}
      className={`flex items-center gap-2 ${isFixed ? 'bg-green-600 hover:bg-green-700 text-white' : ''} ${className}`}
      title="Fix GPS timeout issues immediately"
    >
      {isFixing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFixed ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      
      <span className="text-sm">
        {isFixing ? 'Fixing...' : isFixed ? '✅ Fixed' : '🚨 Fix GPS'}
      </span>
    </Button>
  );
}
