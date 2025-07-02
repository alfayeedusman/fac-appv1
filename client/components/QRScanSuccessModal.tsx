import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  MapPin,
  Clock,
  Car,
  Crown,
  Zap,
  Calendar,
  Gift,
} from "lucide-react";

interface QRScanResult {
  type: "branch" | "service" | "customer";
  branchId?: string;
  branchName?: string;
  serviceId?: string;
  customerId?: string;
  timestamp: string;
}

interface QRScanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: QRScanResult | null;
  onStartService: () => void;
}

export default function QRScanSuccessModal({
  isOpen,
  onClose,
  scanResult,
  onStartService,
}: QRScanSuccessModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartService = async () => {
    setIsProcessing(true);

    // Simulate service start process
    setTimeout(() => {
      onStartService();
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!scanResult) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500 p-4 rounded-full animate-bounce">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            QR Code Scanned Successfully! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch Information */}
          <Card className="bg-gradient-to-br from-fac-orange-50 to-orange-100 dark:from-fac-orange-950 dark:to-orange-900 border-fac-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-fac-orange-500 p-3 rounded-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {scanResult.branchName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Branch ID: {scanResult.branchId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-fac-orange-600" />
                  <span className="text-muted-foreground">Check-in Time</span>
                </div>
                <div className="font-medium text-foreground">
                  {getCurrentDateTime()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Available Services
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Classic Wash</p>
                    <p className="text-xs text-muted-foreground">
                      30 min • Exterior clean
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Available</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">VIP ProMax</p>
                    <p className="text-xs text-muted-foreground">
                      60 min • Full service
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Available</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-fac-orange-500 p-2 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Premium Detail
                    </p>
                    <p className="text-xs text-muted-foreground">
                      90 min • Complete detail
                    </p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700">1 Left</Badge>
              </div>
            </div>
          </div>

          {/* Membership Status */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Gift className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      VIP Gold Member
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Check-in successful • Package updated
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartService}
              disabled={isProcessing}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-semibold py-3"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Starting Service...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Start Wash Service</span>
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isProcessing}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule for Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
