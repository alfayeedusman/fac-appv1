import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordUpdate = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/settings" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight">
                Security
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Protect your account
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label
                htmlFor="current-password"
                className="font-bold text-black"
              >
                Current Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    handlePasswordChange("current", e.target.value)
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password" className="font-bold text-black">
                New Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange("new", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="confirm-password"
                className="font-bold text-black"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
                className="mt-1"
              />
            </div>

            <Button
              onClick={handlePasswordUpdate}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-3 rounded-xl"
            >
              UPDATE PASSWORD
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-black text-sm">
                    Biometric Login
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Use fingerprint or face unlock
                  </p>
                </div>
              </div>
              <Switch
                checked={biometricLogin}
                onCheckedChange={setBiometricLogin}
                className="data-[state=checked]:bg-fac-orange-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-black text-sm">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Add extra security to your account
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
                className="data-[state=checked]:bg-fac-orange-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-black text-sm">
                    Login Alerts
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Get notified of new sign-ins
                  </p>
                </div>
              </div>
              <Switch
                checked={loginAlerts}
                onCheckedChange={setLoginAlerts}
                className="data-[state=checked]:bg-fac-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Security Status */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Security Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold text-green-700 text-sm">
                  Strong Password
                </span>
              </div>
              <span className="text-xs text-green-600 font-medium">SECURE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold text-green-700 text-sm">
                  Email Verified
                </span>
              </div>
              <span className="text-xs text-green-600 font-medium">
                VERIFIED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-700 text-sm">
                  2FA Disabled
                </span>
              </div>
              <span className="text-xs text-orange-600 font-medium">
                RECOMMENDED
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
