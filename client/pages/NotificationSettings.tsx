import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Crown,
  Gift,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import StickyHeader from "@/components/StickyHeader";

interface NotificationSetting {
  id: string;
  type: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "booking",
      type: "booking",
      title: "Booking Updates",
      description: "Confirmations, reminders, and status changes",
      enabled: true,
      channels: { push: true, email: true, sms: false },
    },
    {
      id: "membership",
      type: "membership",
      title: "Membership Alerts",
      description: "Expiration warnings and renewal reminders",
      enabled: true,
      channels: { push: true, email: true, sms: true },
    },
    {
      id: "promotions",
      type: "promotions",
      title: "Promotions & Offers",
      description: "Special deals and discount notifications",
      enabled: true,
      channels: { push: true, email: false, sms: false },
    },
    {
      id: "system",
      type: "system",
      title: "System Updates",
      description: "App updates and maintenance notifications",
      enabled: false,
      channels: { push: true, email: false, sms: false },
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    );
  };

  const toggleChannel = (id: string, channel: "push" | "email" | "sms") => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? {
              ...setting,
              channels: {
                ...setting.channels,
                [channel]: !setting.channels[channel],
              },
            }
          : setting,
      ),
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "membership":
        return <Crown className="h-5 w-5 text-fac-orange-600" />;
      case "promotions":
        return <Gift className="h-5 w-5 text-green-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <MobileLayout>
      <StickyHeader
        showBack={true}
        backTo="/dashboard"
        title="Notification Settings"
      />

      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Notification Settings
              </h1>
              <p className="text-sm text-gray-600">Manage your alerts</p>
            </div>
          </div>
        </div>

        {/* Quick Toggle */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-fac-orange-600" />
              Master Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="master-notifications" className="font-medium">
                  All Notifications
                </Label>
                <p className="text-sm text-gray-600">
                  Enable or disable all notifications
                </p>
              </div>
              <Switch id="master-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id} className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    {getTypeIcon(setting.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {setting.title}
                      </h3>
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={() => toggleSetting(setting.id)}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {setting.description}
                    </p>

                    {setting.enabled && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Delivery Methods
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${setting.id}-push`}
                              checked={setting.channels.push}
                              onCheckedChange={() =>
                                toggleChannel(setting.id, "push")
                              }
                            />
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 text-fac-orange-600 mr-1" />
                              <Label
                                htmlFor={`${setting.id}-push`}
                                className="text-xs"
                              >
                                Push
                              </Label>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${setting.id}-email`}
                              checked={setting.channels.email}
                              onCheckedChange={() =>
                                toggleChannel(setting.id, "email")
                              }
                            />
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-blue-600 mr-1" />
                              <Label
                                htmlFor={`${setting.id}-email`}
                                className="text-xs"
                              >
                                Email
                              </Label>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${setting.id}-sms`}
                              checked={setting.channels.sms}
                              onCheckedChange={() =>
                                toggleChannel(setting.id, "sms")
                              }
                              size="sm"
                            />
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 text-green-600 mr-1" />
                              <Label
                                htmlFor={`${setting.id}-sms`}
                                className="text-xs"
                              >
                                SMS
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white py-4 text-lg font-semibold rounded-xl">
          Save Preferences
        </Button>
      </div>
    </MobileLayout>
  );
}
