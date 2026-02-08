import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Lock, ShieldAlert, LogOut, Save, Edit2, X, CheckCircle } from "lucide-react";
import { supabaseUserProfileService, UserProfile, UserProfileUpdate } from "@/services/supabaseUserProfileService";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { AuthMFASetup } from "@/components/AuthMFASetup";
import { notificationManager } from "@/components/NotificationModal";

interface UserAccountSettingsProps {
  onLogout?: () => void;
}

export const UserAccountSettings: React.FC<UserAccountSettingsProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);

  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    fullName: "",
    contactNumber: "",
    address: "",
    branchLocation: "",
  });

  const userId = localStorage.getItem("userId") || "";

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!userId) return;

    setIsLoadingProfile(true);
    const result = await supabaseUserProfileService.getUserProfile(userId);

    if (result.success && result.profile) {
      setProfile(result.profile);
      setProfileForm({
        fullName: result.profile.fullName,
        contactNumber: result.profile.contactNumber,
        address: result.profile.address,
        branchLocation: result.profile.branchLocation,
      });
    } else {
      notificationManager.error("Error", result.message || "Failed to load profile");
    }

    setIsLoadingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!userId || !profileForm.fullName) {
      notificationManager.error("Error", "Full name is required");
      return;
    }

    setIsSavingProfile(true);

    const result = await supabaseUserProfileService.updateUserProfile(userId, profileForm);

    if (result.success && result.profile) {
      setProfile(result.profile);
      setIsEditingProfile(false);
      notificationManager.success("Success", "Profile updated successfully");
    } else {
      notificationManager.error("Error", result.message || "Failed to save profile");
    }

    setIsSavingProfile(false);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        contactNumber: profile.contactNumber,
        address: profile.address,
        branchLocation: profile.branchLocation,
      });
    }
    setIsEditingProfile(false);
  };

  const handleLogout = async () => {
    const result = await supabaseAuthService.signOut();

    if (result.success) {
      notificationManager.success("Logged Out", "You have been logged out successfully");
      if (onLogout) {
        onLogout();
      }
    } else {
      notificationManager.error("Error", result.message);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      return;
    }

    const result = await supabaseUserProfileService.deactivateUserAccount(userId);

    if (result.success) {
      notificationManager.success("Account Deactivated", "Your account has been deactivated");
      handleLogout();
    } else {
      notificationManager.error("Error", result.message);
    }
  };

  if (isLoadingProfile) {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 text-center">
          <p className="text-gray-600">Loading account settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 text-center">
          <p className="text-red-600">Failed to load account settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Tab */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab Content */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                {!isEditingProfile && (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
                <div className="mt-1 flex items-center space-x-1">
                  {profile.emailVerified && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-600">Verified</p>
                    </>
                  )}
                </div>
              </div>

              {isEditingProfile ? (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      value={profileForm.fullName || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <Input
                      value={profileForm.contactNumber || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <Input
                      value={profileForm.address || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Your address"
                    />
                  </div>

                  {/* Branch Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Location</label>
                    <select
                      value={profileForm.branchLocation || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, branchLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a branch</option>
                      <option value="manila">Manila</option>
                      <option value="cebu">Cebu</option>
                      <option value="davao">Davao</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Display Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-gray-900">{profile.fullName}</p>
                  </div>

                  {profile.contactNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                      <p className="text-gray-900">{profile.contactNumber}</p>
                    </div>
                  )}

                  {profile.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <p className="text-gray-900">{profile.address}</p>
                    </div>
                  )}

                  {profile.branchLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch Location</label>
                      <p className="text-gray-900 capitalize">{profile.branchLocation}</p>
                    </div>
                  )}

                  {/* Loyalty Points */}
                  <Separator />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loyalty Points</label>
                    <p className="text-2xl font-bold text-blue-600">{profile.loyaltyPoints} pts</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab Content */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-yellow-600" />
                <CardTitle>Security Settings</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {showMFASetup ? (
                <AuthMFASetup
                  onSuccess={() => {
                    setShowMFASetup(false);
                    notificationManager.success("MFA Enabled", "Multi-factor authentication is now active");
                  }}
                  onCancel={() => setShowMFASetup(false)}
                />
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-4">
                      Protect your account with two-factor authentication. You'll need to enter an extra code when signing in.
                    </p>
                    <Button
                      onClick={() => setShowMFASetup(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Setup Two-Factor Authentication
                    </Button>
                  </div>

                  <Separator />

                  {/* Change Password Option */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">
                      To change your password, use the "Forgot Password" option on the login page
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab Content */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <CardTitle>Account Management</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Logout */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Sign out from this device
                </p>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <Separator />

              {/* Deactivate Account */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium text-red-600">Deactivate Account</h3>
                <p className="text-sm text-gray-600 mb-3">
                  This action will permanently deactivate your account. This cannot be undone.
                </p>
                <Button
                  onClick={handleDeactivateAccount}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
              </div>

              {/* Account Info */}
              <Separator />
              <div className="space-y-2 text-sm text-gray-600">
                <p>Account ID: {profile.id}</p>
                <p>Role: <span className="font-medium capitalize">{profile.role}</span></p>
                <p>Member Since: {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
