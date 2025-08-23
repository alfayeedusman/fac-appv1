import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { AdminConfigManager, type AdminConfig } from '@/utils/adminConfig';
import { getCarWashServices } from '@/utils/carWashServices';
import { 
  Home, 
  Settings, 
  Car, 
  Star, 
  Shield, 
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  X
} from 'lucide-react';

export default function AdminHomeService() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfig = () => {
      try {
        const adminConfig = AdminConfigManager.getConfig();
        setConfig(adminConfig);
      } catch (error) {
        console.error('Error loading admin config:', error);
        toast({
          title: "Error",
          description: "Failed to load configuration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      AdminConfigManager.saveConfig(config);
      toast({
        title: "Success",
        description: "Home service settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateHomeServiceEnabled = (enabled: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        enabled,
      },
    });
  };

  const updateCarwashServiceAvailability = (serviceKey: string, available: boolean) => {
    if (!config) return;
    
    const currentServices = config.homeService.availableServices.carwash || [];
    const updatedServices = available
      ? [...currentServices.filter(s => s !== serviceKey), serviceKey]
      : currentServices.filter(s => s !== serviceKey);

    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        availableServices: {
          ...config.homeService.availableServices,
          carwash: updatedServices,
        },
      },
    });
  };

  const updateAutoDetailingAvailability = (available: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        availableServices: {
          ...config.homeService.availableServices,
          autoDetailing: available,
        },
      },
    });
  };

  const updateGrapheneCoatingAvailability = (available: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        availableServices: {
          ...config.homeService.availableServices,
          grapheneCoating: available,
        },
      },
    });
  };

  const updatePriceMultiplier = (multiplier: number) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        priceMultiplier: multiplier,
      },
    });
  };

  const updateLeadTime = (leadTime: number) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        leadTime: leadTime,
      },
    });
  };

  const updateCoverageAreas = (areas: string[]) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        coverage: {
          ...config.homeService.coverage,
          areas: areas,
        },
      },
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!config) {
    return <div className="p-6">Error loading configuration</div>;
  }

  const carwashServices = getCarWashServices();
  const availableCarwashServices = config.homeService.availableServices.carwash || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Home className="h-8 w-8 mr-3 text-fac-orange-500" />
            Home Service Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure which services are available for home service delivery
          </p>
        </div>
        <Button 
          onClick={saveConfig} 
          disabled={saving}
          className="bg-fac-orange-500 hover:bg-fac-orange-600"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-fac-orange-500" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Home Service */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Enable Home Service</Label>
              <p className="text-sm text-muted-foreground">Allow customers to book services at their location</p>
            </div>
            <Switch
              checked={config.homeService.enabled}
              onCheckedChange={updateHomeServiceEnabled}
            />
          </div>

          <Separator />

          {/* Price Multiplier */}
          <div>
            <Label className="text-base font-semibold flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Home Service Fee Multiplier
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Additional charge for home service (1.0 = no extra charge)
            </p>
            <Input
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              value={config.homeService.priceMultiplier}
              onChange={(e) => updatePriceMultiplier(parseFloat(e.target.value) || 1.0)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: +{Math.round((config.homeService.priceMultiplier - 1) * 100)}% additional fee
            </p>
          </div>

          <Separator />

          {/* Lead Time */}
          <div>
            <Label className="text-base font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Minimum Advance Booking Time (Hours)
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Minimum hours in advance customers must book home service
            </p>
            <Input
              type="number"
              min="1"
              max="48"
              value={config.homeService.leadTime}
              onChange={(e) => updateLeadTime(parseInt(e.target.value) || 4)}
              className="w-32"
            />
          </div>

          <Separator />

          {/* Coverage Areas */}
          <div>
            <Label className="text-base font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Service Coverage Areas
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Areas where home service is available (comma separated)
            </p>
            <Input
              value={config.homeService.coverage.areas.join(', ')}
              onChange={(e) => updateCoverageAreas(e.target.value.split(',').map(area => area.trim()).filter(Boolean))}
              placeholder="Tumaga, Boalan, Zamboanga City, Downtown..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Car Wash Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2 text-blue-500" />
            Car Wash Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carwashServices.map((service) => {
              const isAvailable = availableCarwashServices.includes(service.id);
              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isAvailable 
                      ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950/50' 
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{service.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      <p className="text-sm font-semibold text-fac-orange-500 mt-1">₱{service.basePrice.toLocaleString()}</p>
                    </div>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={(checked) => updateCarwashServiceAvailability(service.id, checked)}
                    />
                  </div>
                  {isAvailable && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available for Home Service
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Other Services */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Auto Detailing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-500" />
              Auto Detailing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Professional Detailing Service</p>
                <p className="text-sm text-muted-foreground">Interior and exterior detailing at customer location</p>
              </div>
              <Switch
                checked={config.homeService.availableServices.autoDetailing}
                onCheckedChange={updateAutoDetailingAvailability}
              />
            </div>
            {config.homeService.availableServices.autoDetailing && (
              <Badge className="bg-green-500 text-white text-xs mt-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Available for Home Service
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Graphene Coating */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-orange-500" />
              Graphene Coating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Premium Protection Coating</p>
                <p className="text-sm text-muted-foreground">Advanced ceramic coating applied on-site</p>
              </div>
              <Switch
                checked={config.homeService.availableServices.grapheneCoating}
                onCheckedChange={updateGrapheneCoatingAvailability}
              />
            </div>
            {config.homeService.availableServices.grapheneCoating && (
              <Badge className="bg-green-500 text-white text-xs mt-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Available for Home Service
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-fac-orange-50 to-purple-50 dark:from-fac-orange-950/50 dark:to-purple-950/50">
        <CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-4">Current Home Service Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Status:</strong> {config.homeService.enabled ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Additional Fee:</strong> +{Math.round((config.homeService.priceMultiplier - 1) * 100)}%</p>
              <p><strong>Lead Time:</strong> {config.homeService.leadTime} hours</p>
            </div>
            <div>
              <p><strong>Available Car Wash Services:</strong> {availableCarwashServices.length}</p>
              <p><strong>Auto Detailing:</strong> {config.homeService.availableServices.autoDetailing ? 'Available' : 'Not Available'}</p>
              <p><strong>Graphene Coating:</strong> {config.homeService.availableServices.grapheneCoating ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
