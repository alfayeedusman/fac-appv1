import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

interface VersionData {
  version: string;
  buildNumber: string;
  releaseNotes: string;
  forceUpdate: boolean;
  downloadUrl: {
    ios: string;
    android: string;
  };
  createdAt: string;
}

export default function AdminAppVersion() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [version, setVersion] = useState<VersionData>({
    version: "1.0.0",
    buildNumber: "1",
    releaseNotes: "",
    forceUpdate: false,
    downloadUrl: {
      ios: "",
      android: "",
    },
    createdAt: new Date().toISOString(),
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load current version on mount
  useEffect(() => {
    loadCurrentVersion();
  }, []);

  const loadCurrentVersion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/app-version");
      const data = await response.json();

      if (data.success && data.version) {
        setVersion(data.version);
        console.log("✅ Loaded current version:", data.version);
      }
    } catch (error) {
      console.error("Error loading version:", error);
      toast({
        title: "Error",
        description: "Failed to load current version",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionChange = (field: string, value: any) => {
    setVersion((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleDownloadUrlChange = (platform: "ios" | "android", value: string) => {
    setVersion((prev) => ({
      ...prev,
      downloadUrl: {
        ...prev.downloadUrl,
        [platform]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!version.version.trim() || !version.buildNumber.trim()) {
      Swal.fire({
        title: "Validation Error",
        text: "Version and Build Number are required",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/app-version", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: version.version,
          buildNumber: version.buildNumber,
          releaseNotes: version.releaseNotes,
          forceUpdate: version.forceUpdate,
          downloadUrl: version.downloadUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVersion(data.version);
        setHasChanges(false);
        Swal.fire({
          title: "Success!",
          text: "App version updated successfully",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
        console.log("✅ Version saved:", data.version);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update version",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: "Error",
        description: "Failed to save version",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mr-3" />
        <p className="text-muted-foreground text-lg">Loading version info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">App Version Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage app versions, release notes, and force update settings
        </p>
      </div>

      {/* Current Version Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Current Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-600 font-medium">Version</p>
              <p className="text-2xl font-bold text-blue-900">{version.version}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Build Number</p>
              <p className="text-2xl font-bold text-blue-900">{version.buildNumber}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Force Update</p>
              <Badge className={version.forceUpdate ? "bg-red-500" : "bg-green-500"}>
                {version.forceUpdate ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Last Updated</p>
              <p className="text-sm text-blue-900">
                {new Date(version.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for Force Update */}
      {version.forceUpdate && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Force Update is <strong>enabled</strong>. All users will be required to update to this version.
          </AlertDescription>
        </Alert>
      )}

      {/* Version Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Version Information</CardTitle>
          <CardDescription>
            Modify version details and download URLs for your mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Version and Build Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version" className="text-base font-semibold">
                Version Number *
              </Label>
              <Input
                id="version"
                placeholder="e.g., 1.2.3"
                value={version.version}
                onChange={(e) => handleVersionChange("version", e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Major.Minor.Patch (e.g., 1.0.0)
              </p>
            </div>
            <div>
              <Label htmlFor="buildNumber" className="text-base font-semibold">
                Build Number *
              </Label>
              <Input
                id="buildNumber"
                placeholder="e.g., 42"
                value={version.buildNumber}
                onChange={(e) => handleVersionChange("buildNumber", e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Incremental build identifier
              </p>
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <Label htmlFor="releaseNotes" className="text-base font-semibold">
              Release Notes
            </Label>
            <Textarea
              id="releaseNotes"
              placeholder="What's new in this version? (e.g., Bug fixes, new features, improvements)"
              value={version.releaseNotes}
              onChange={(e) => handleVersionChange("releaseNotes", e.target.value)}
              className="mt-1 min-h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe changes, bug fixes, and new features
            </p>
          </div>

          {/* Download URLs */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-500" />
              Download URLs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iosUrl" className="text-base font-semibold">
                  iOS App Store URL
                </Label>
                <Input
                  id="iosUrl"
                  type="url"
                  placeholder="https://apps.apple.com/app/..."
                  value={version.downloadUrl.ios}
                  onChange={(e) => handleDownloadUrlChange("ios", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="androidUrl" className="text-base font-semibold">
                  Android Play Store URL
                </Label>
                <Input
                  id="androidUrl"
                  type="url"
                  placeholder="https://play.google.com/store/apps/..."
                  value={version.downloadUrl.android}
                  onChange={(e) => handleDownloadUrlChange("android", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Force Update Toggle */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Force Update</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, all users will be required to update to this version
                </p>
              </div>
              <Switch
                checked={version.forceUpdate}
                onCheckedChange={(checked) =>
                  handleVersionChange("forceUpdate", checked)
                }
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6 flex gap-3">
            <Button
              onClick={loadCurrentVersion}
              variant="outline"
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-orange-500 hover:bg-orange-600 flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Version"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How Version Updates Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            ✓ <strong>Version Number:</strong> Use semantic versioning (Major.Minor.Patch)
          </p>
          <p>
            ✓ <strong>Build Number:</strong> Increment for each build, even if version stays the same
          </p>
          <p>
            ✓ <strong>Release Notes:</strong> Users will see these when updating the app
          </p>
          <p>
            ✓ <strong>Download URLs:</strong> Links where users can download the new version
          </p>
          <p>
            ✓ <strong>Force Update:</strong> If enabled, users cannot skip the update
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
