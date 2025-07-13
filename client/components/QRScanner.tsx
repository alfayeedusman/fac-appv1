import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
  Flashlight,
  FlashlightOff,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsQR from "jsqr";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: QRScanResult) => void;
}

interface QRScanResult {
  type: "branch" | "service" | "customer";
  branchId?: string;
  branchName?: string;
  serviceId?: string;
  customerId?: string;
  timestamp: string;
}

export default function QRScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startQRDetection();
      }
    } catch (err) {
      setHasPermission(false);
      setError(
        "Camera access denied. Please enable camera permissions to scan QR codes.",
      );
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setFlashlight(false);
  };

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && "applyConstraints" in track) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashlight }] as any,
          });
          setFlashlight(!flashlight);
        } catch (err) {
          console.log("Flashlight not supported on this device");
        }
      }
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(facingMode === "user" ? "environment" : "user");
    setTimeout(() => {
      requestCameraPermission();
    }, 100);
  };

  const startQRDetection = () => {
    // Real QR code detection using jsQR
    scanIntervalRef.current = setInterval(() => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          context.drawImage(
            videoRef.current,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleQRDetected(code.data);
          }
        }
      }
    }, 100); // Scan every 100ms for better performance
  };

  const handleQRDetected = (qrData: string) => {
    try {
      // Try to parse the QR code data as JSON
      const parsedData = JSON.parse(qrData);

      // Validate and structure the QR result
      let result: QRScanResult;

      if (parsedData.type === "branch" && parsedData.id) {
        result = {
          type: "branch",
          branchId: parsedData.id,
          branchName: parsedData.name || `Branch ${parsedData.id}`,
          timestamp: new Date().toISOString(),
        };
      } else if (parsedData.type === "service" && parsedData.id) {
        result = {
          type: "service",
          serviceId: parsedData.id,
          timestamp: new Date().toISOString(),
        };
      } else if (parsedData.type === "customer" && parsedData.id) {
        result = {
          type: "customer",
          customerId: parsedData.id,
          timestamp: new Date().toISOString(),
        };
      } else {
        // If not recognized format, treat as branch check-in for demo
        result = {
          type: "branch",
          branchId: "UNKNOWN",
          branchName: "Unknown Branch",
          timestamp: new Date().toISOString(),
        };
      }

      stopCamera();
      onScanSuccess(result);
      onClose();
    } catch (error) {
      // If QR data is not JSON, try to handle as plain text
      console.log("QR data is not JSON:", qrData);

      // For demo, create a result based on the raw QR data
      const result: QRScanResult = {
        type: "branch",
        branchId: qrData.includes("TUMAGA")
          ? "TUMAGA-001"
          : qrData.includes("BOALAN")
            ? "BOALAN-002"
            : "MANUAL-001",
        branchName: qrData.includes("TUMAGA")
          ? "Tumaga Hub"
          : qrData.includes("BOALAN")
            ? "Boalan Hub"
            : "Manual Entry",
        timestamp: new Date().toISOString(),
      };

      stopCamera();
      onScanSuccess(result);
      onClose();
    }
  };

  const handleManualEntry = () => {
    // For demo - simulate manual QR entry
    const mockResult: QRScanResult = {
      type: "branch",
      branchId: "MANUAL-001",
      branchName: "Manual Entry - Tumaga Hub",
      timestamp: new Date().toISOString(),
    };
    onScanSuccess(mockResult);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-fac-orange-500 p-2 rounded-xl">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    QR Scanner
                  </DialogTitle>
                  <DialogDescription>
                    Scan branch QR code to check in
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Scanner Area */}
          <div className="relative bg-black aspect-square mx-6">
            {hasPermission === null && (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Requesting camera permission...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-white mb-4">{error}</p>
                <Button
                  onClick={requestCameraPermission}
                  className="bg-fac-orange-500 hover:bg-fac-orange-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Enable Camera
                </Button>
              </div>
            )}

            {hasPermission === true && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning frame */}
                    <div className="w-64 h-64 border-2 border-fac-orange-500 relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>

                      {/* Scanning line */}
                      {isScanning && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-fac-orange-500 animate-pulse"></div>
                      )}
                    </div>

                    <p className="text-white text-center mt-4 font-medium">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleFlashlight}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    {flashlight ? (
                      <FlashlightOff className="h-5 w-5 text-white" />
                    ) : (
                      <Flashlight className="h-5 w-5 text-white" />
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={switchCamera}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    <RotateCcw className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Manual Entry Option */}
          <div className="p-6 pt-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Having trouble scanning?
              </p>
              <Button
                variant="outline"
                onClick={handleManualEntry}
                className="w-full"
              >
                Enter Branch Code Manually
              </Button>
            </div>

            {/* Status */}
            {isScanning && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-fac-orange-500 border-t-transparent"></div>
                <span>Scanning for QR code...</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
