import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Database,
  Bug,
  Trash2,
  UserX,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { resetAppState, resetUserSession } from "@/utils/resetApp";

interface DebugPanelProps {
  className?: string;
}

export default function DebugPanel({ className = "" }: DebugPanelProps) {
  const [showPanel, setShowPanel] = useState(false);

  const getUserInfo = () => {
    return {
      email: localStorage.getItem("userEmail") || "Not logged in",
      role: localStorage.getItem("userRole") || "No role",
      authenticated: localStorage.getItem("isAuthenticated") || "false",
      registeredUsers: JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      ).length,
      hasWelcomed:
        localStorage.getItem(`welcomed_${localStorage.getItem("userEmail")}`) ||
        "false",
    };
  };

  const clearSpecificData = (type: string) => {
    switch (type) {
      case "subscriptions":
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("subscription_")) {
            localStorage.removeItem(key);
          }
        });
        alert("Subscription data cleared!");
        break;
      case "washLogs":
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("washLogs_")) {
            localStorage.removeItem(key);
          }
        });
        alert("Wash logs cleared!");
        break;
      case "userSession":
        resetUserSession();
        alert("User session cleared!");
        break;
      case "everything":
        if (
          confirm(
            "Are you sure you want to clear ALL data? This will reset the entire app.",
          )
        ) {
          resetAppState();
        }
        break;
    }
  };

  const userInfo = getUserInfo();

  if (!showPanel) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(true)}
        className={`fixed bottom-4 left-4 z-50 ${className}`}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Debug Panel
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(false)}
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Current User Info:</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Email:</span>
                <Badge variant="outline" className="text-xs">
                  {userInfo.email}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <Badge variant="outline" className="text-xs">
                  {userInfo.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <Badge
                  variant={
                    userInfo.authenticated === "true"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {userInfo.authenticated}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Welcomed:</span>
                <Badge variant="outline" className="text-xs">
                  {userInfo.hasWelcomed}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Users:</span>
                <Badge variant="outline" className="text-xs">
                  {userInfo.registeredUsers}
                </Badge>
              </div>
            </div>
          </div>

          {/* Reset Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              Reset Actions:
            </h4>

            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSpecificData("userSession")}
              className="w-full justify-start"
            >
              <UserX className="h-4 w-4 mr-2" />
              Clear User Session
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSpecificData("subscriptions")}
              className="w-full justify-start"
            >
              <Database className="h-4 w-4 mr-2" />
              Clear Subscriptions
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSpecificData("washLogs")}
              className="w-full justify-start"
            >
              <Database className="h-4 w-4 mr-2" />
              Clear Wash Logs
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => clearSpecificData("everything")}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Entire App
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Quick Navigation:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  window.location.href = "/dashboard";
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  window.location.href = "/profile";
                }}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  window.location.href = "/welcome";
                }}
              >
                Welcome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  window.location.href = "/login";
                }}
              >
                Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
