import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { AdminConfigManager, type AdminConfig } from "@/utils/adminConfig";
import { getCarWashServices } from "@/utils/carWashServices";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";
import {
  Calendar,
  Clock,
  Home,
  Car,
  Bike,
  Star,
  Shield,
  MapPin,
  DollarSign,
  CheckCircle,
  X,
  Settings,
  Users,
  CreditCard,
  AlertCircle,
  Save,
  RefreshCw,
} from "lucide-react";

export default function AdminBookingSettings() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home-service");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔧 Loading booking settings from backend...");

        // First try to load from backend
        const backendSettings = await supabaseDbClient.getSettings();

        if (backendSettings.success && backendSettings.settings) {
          console.log(
            "✅ Loaded settings from backend:",
            backendSettings.settings,
          );

          // Try to find booking configuration in backend settings
          const bookingConfigSetting = backendSettings.settings.find(
            (setting: any) => setting.key === "booking_configuration",
          );

          if (bookingConfigSetting && bookingConfigSetting.value) {
            console.log(
              "📋 Found booking config in backend:",
              bookingConfigSetting.value,
            );
            setConfig(bookingConfigSetting.value);
          } else {
            console.log(
              "⚠️ No booking config in backend, using default and saving...",
            );
            // If no backend config exists, use default and save to backend
            const defaultConfig = AdminConfigManager.getConfig();
            setConfig(defaultConfig);

            // Save default config to backend
            await neonDbClient.updateSetting(
              "booking_configuration",
              defaultConfig,
              "Complete booking system configuration including pricing, scheduling, and home service settings",
              "booking",
            );
            console.log("✅ Saved default booking config to backend");
          }
        } else {
          console.log("⚠️ Backend settings failed, using local config");
          // Fallback to local config if backend fails
          const adminConfig = AdminConfigManager.getConfig();
          setConfig(adminConfig);
        }
      } catch (error) {
        console.error("❌ Error loading booking config:", error);
        // Fallback to local config on error
        try {
          const adminConfig = AdminConfigManager.getConfig();
          setConfig(adminConfig);
        } catch (localError) {
          console.error("❌ Error loading local config:", localError);
          toast({
            title: "Error",
            description:
              "Failed to load configuration from both backend and local storage",
            variant: "destructive",
          });
        }
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
      console.log("💾 Saving booking settings to backend...", config);

      // Save to backend first
      const backendResult = await neonDbClient.updateSetting(
        "booking_configuration",
        config,
        "Complete booking system configuration including pricing, scheduling, and home service settings",
        "booking",
      );

      if (backendResult.success) {
        console.log("✅ Saved to backend successfully");

        // Also save to local storage as backup
        AdminConfigManager.saveConfig(config);

        toast({
          title: "Success",
          description:
            "Booking settings saved successfully to backend database",
        });
      } else {
        console.error("❌ Backend save failed:", backendResult);

        // If backend fails, still save locally
        AdminConfigManager.saveConfig(config);

        toast({
          title: "Partial Success",
          description:
            "Settings saved locally, but backend sync failed. Check database connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error saving config:", error);

      try {
        // Fallback to local save
        AdminConfigManager.saveConfig(config);
        toast({
          title: "Warning",
          description: "Settings saved locally only. Backend sync failed.",
          variant: "destructive",
        });
      } catch (localError) {
        console.error("❌ Local save also failed:", localError);
        toast({
          title: "Error",
          description:
            "Failed to save configuration to both backend and local storage",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    try {
      const defaultConfig = AdminConfigManager.resetToDefaults();
      setConfig(defaultConfig);
      toast({
        title: "Success",
        description: "Settings reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting config:", error);
      toast({
        title: "Error",
        description: "Failed to reset configuration",
        variant: "destructive",
      });
    }
  };

  // Update functions
  const updateHomeServiceEnabled = (enabled: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: { ...config.homeService, enabled },
    });
  };

  const updateCarwashServiceAvailability = (
    serviceKey: string,
    available: boolean,
    isMotorcycle = false,
  ) => {
    if (!config) return;

    const currentServices = isMotorcycle
      ? config.homeService.availableServices.motorcycleCarwash || []
      : config.homeService.availableServices.carwash || [];

    const updatedServices = available
      ? [...currentServices.filter((s) => s !== serviceKey), serviceKey]
      : currentServices.filter((s) => s !== serviceKey);

    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        availableServices: {
          ...config.homeService.availableServices,
          ...(isMotorcycle
            ? { motorcycleCarwash: updatedServices }
            : { carwash: updatedServices }),
        },
      },
    });
  };

  const updateServiceAvailability = (
    serviceType: "autoDetailing" | "grapheneCoating",
    available: boolean,
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      homeService: {
        ...config.homeService,
        availableServices: {
          ...config.homeService.availableServices,
          [serviceType]: available,
        },
      },
    });
  };

  const updateScheduling = (updates: Partial<typeof config.scheduling>) => {
    if (!config) return;
    setConfig({
      ...config,
      scheduling: { ...config.scheduling, ...updates },
    });
  };

  const updateWorkingHours = (day: string, hours: any) => {
    if (!config) return;
    setConfig({
      ...config,
      scheduling: {
        ...config.scheduling,
        workingHours: {
          ...config.scheduling.workingHours,
          [day]: { ...config.scheduling.workingHours[day], ...hours },
        },
      },
    });
  };

  const updatePaymentMethod = (
    method: "branch" | "online" | "onsite",
    updates: any,
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      paymentMethods: {
        ...config.paymentMethods,
        [method]: { ...(config.paymentMethods as any)[method], ...updates },
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
  const availableCarwashServices =
    config.homeService.availableServices.carwash || [];
  const availableMotorcycleServices =
    config.homeService.availableServices.motorcycleCarwash || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-fac-orange-500" />
            Booking Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure all booking-related settings and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home-service" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home Service
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Home Service Tab */}
        <TabsContent value="home-service" className="space-y-6">
          {/* Home Service Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-fac-orange-500" />
                Home Service Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">
                    Enable Home Service
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to book services at their location
                  </p>
                </div>
                <Switch
                  checked={config.homeService.enabled}
                  onCheckedChange={updateHomeServiceEnabled}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
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
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        homeService: {
                          ...config.homeService,
                          priceMultiplier: parseFloat(e.target.value) || 1.0,
                        },
                      })
                    }
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: +
                    {Math.round((config.homeService.priceMultiplier - 1) * 100)}
                    % additional fee
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Minimum Lead Time (Hours)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Minimum hours in advance for home service booking
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="48"
                    value={config.homeService.leadTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        homeService: {
                          ...config.homeService,
                          leadTime: parseInt(e.target.value) || 4,
                        },
                      })
                    }
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Service Coverage Areas
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Areas where home service is available (comma separated)
                </p>
                <Input
                  value={config.homeService.coverage.areas.join(", ")}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      homeService: {
                        ...config.homeService,
                        coverage: {
                          ...config.homeService.coverage,
                          areas: e.target.value
                            .split(",")
                            .map((area) => area.trim())
                            .filter(Boolean),
                        },
                      },
                    })
                  }
                  placeholder="Tumaga, Boalan, Zamboanga City, Downtown..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Car Wash Services for Cars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-500" />
                Car Wash Services (Cars)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carwashServices.map((service) => {
                  const isAvailable = availableCarwashServices.includes(
                    service.id,
                  );
                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isAvailable
                          ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950/50"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {service.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                          <p className="text-sm font-semibold text-fac-orange-500 mt-1">
                            ₱{service.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) =>
                            updateCarwashServiceAvailability(
                              service.id,
                              checked,
                              false,
                            )
                          }
                        />
                      </div>
                      {isAvailable && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available for Cars
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Car Wash Services for Motorcycles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bike className="h-5 w-5 mr-2 text-purple-500" />
                Car Wash Services (Motorcycles)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select which services are available for motorcycle home service
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carwashServices.map((service) => {
                  const isAvailable = availableMotorcycleServices.includes(
                    service.id,
                  );
                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isAvailable
                          ? "border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/50"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {service.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                          <p className="text-sm font-semibold text-fac-orange-500 mt-1">
                            ₱{service.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) =>
                            updateCarwashServiceAvailability(
                              service.id,
                              checked,
                              true,
                            )
                          }
                        />
                      </div>
                      {isAvailable && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available for Motorcycles
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
                    <p className="font-semibold text-foreground">
                      Professional Detailing Service
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Interior and exterior detailing at customer location
                    </p>
                  </div>
                  <Switch
                    checked={config.homeService.availableServices.autoDetailing}
                    onCheckedChange={(checked) =>
                      updateServiceAvailability("autoDetailing", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

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
                    <p className="font-semibold text-foreground">
                      Premium Protection Coating
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Advanced ceramic coating applied on-site
                    </p>
                  </div>
                  <Switch
                    checked={
                      config.homeService.availableServices.grapheneCoating
                    }
                    onCheckedChange={(checked) =>
                      updateServiceAvailability("grapheneCoating", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-6">
          {/* Garage Hours Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Garage Operating Hours (Asia/Manila)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Opening Time
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {config.scheduling.workingHours.monday?.startTime ||
                      "08:00"}{" "}
                    AM
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Closing Time
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {config.scheduling.workingHours.monday?.endTime === "20:00"
                      ? "8:00 PM"
                      : config.scheduling.workingHours.monday?.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bays Per Slot
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {config.scheduling.capacityPerSlot} bays
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                ℹ️ Bookings are available until all{" "}
                {config.scheduling.capacityPerSlot} bays are full for each time
                slot. Times shown in Asia/Manila timezone.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-fac-orange-500" />
                Working Hours & Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold">
                    Capacity Per Time Slot (Bays)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Maximum bays available per time slot (currently set to 5 for
                    carwash)
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={config.scheduling.capacityPerSlot}
                    onChange={(e) =>
                      updateScheduling({
                        capacityPerSlot: parseInt(e.target.value) || 2,
                      })
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold">
                    Lead Time (Hours)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Minimum hours in advance to book (0 = immediate booking
                    available)
                  </p>
                  <Input
                    type="number"
                    min="0"
                    max="48"
                    value={config.scheduling.leadTime}
                    onChange={(e) =>
                      updateScheduling({
                        leadTime: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-32"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Working Hours by Day
                </h3>
                <div className="space-y-4">
                  {Object.entries(config.scheduling.workingHours).map(
                    ([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24">
                          <Label className="capitalize font-medium">
                            {day}
                          </Label>
                        </div>
                        <Switch
                          checked={hours.enabled}
                          onCheckedChange={(enabled) =>
                            updateWorkingHours(day, { enabled })
                          }
                        />
                        {hours.enabled && (
                          <>
                            <Input
                              type="time"
                              value={hours.startTime}
                              onChange={(e) =>
                                updateWorkingHours(day, {
                                  startTime: e.target.value,
                                })
                              }
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={hours.endTime}
                              onChange={(e) =>
                                updateWorkingHours(day, {
                                  endTime: e.target.value,
                                })
                              }
                              className="w-32"
                            />
                            <Input
                              type="number"
                              min="15"
                              max="180"
                              step="15"
                              value={hours.slotDuration}
                              onChange={(e) =>
                                updateWorkingHours(day, {
                                  slotDuration: parseInt(e.target.value) || 60,
                                })
                              }
                              className="w-24"
                              placeholder="60"
                            />
                            <span className="text-muted-foreground text-sm">
                              min slots
                            </span>
                          </>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-fac-orange-500" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Branch Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Branch Payment</Label>
                      <Switch
                        checked={config.paymentMethods.branch.enabled}
                        onCheckedChange={(enabled) =>
                          updatePaymentMethod("branch", { enabled })
                        }
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={config.paymentMethods.branch.name}
                        onChange={(e) =>
                          updatePaymentMethod("branch", {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={config.paymentMethods.branch.description}
                        onChange={(e) =>
                          updatePaymentMethod("branch", {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Online Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Online Payment</Label>
                      <Switch
                        checked={config.paymentMethods.online.enabled}
                        onCheckedChange={(enabled) =>
                          updatePaymentMethod("online", { enabled })
                        }
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={config.paymentMethods.online.name}
                        onChange={(e) =>
                          updatePaymentMethod("online", {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={config.paymentMethods.online.description}
                        onChange={(e) =>
                          updatePaymentMethod("online", {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      On-Site Payment (Home Service)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable On-Site Payment</Label>
                      <Switch
                        checked={!!config.paymentMethods.onsite?.enabled}
                        onCheckedChange={(enabled) =>
                          updatePaymentMethod("onsite", { enabled })
                        }
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={
                          config.paymentMethods.onsite?.name ||
                          "On-Site Payment"
                        }
                        onChange={(e) =>
                          updatePaymentMethod("onsite", {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={
                          config.paymentMethods.onsite?.description ||
                          "Pay the crew at your location (Home Service only)"
                        }
                        onChange={(e) =>
                          updatePaymentMethod("onsite", {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-fac-orange-500" />
                Terms & Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">
                  Terms and Conditions
                </Label>
                <Textarea
                  value={config.terms.termsAndConditions}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      terms: {
                        ...config.terms,
                        termsAndConditions: e.target.value,
                      },
                    })
                  }
                  className="mt-2 min-h-24"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">
                  Cancellation Policy
                </Label>
                <Textarea
                  value={config.terms.cancellationPolicy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      terms: {
                        ...config.terms,
                        cancellationPolicy: e.target.value,
                      },
                    })
                  }
                  className="mt-2 min-h-24"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">
                  No-Show Policy
                </Label>
                <Textarea
                  value={config.terms.noShowPolicy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      terms: { ...config.terms, noShowPolicy: e.target.value },
                    })
                  }
                  className="mt-2 min-h-24"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
