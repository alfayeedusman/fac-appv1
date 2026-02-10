import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Lock, CheckCircle, Copy, RefreshCw, QrCode, Trash2 } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthMFASetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface MFAFactor {
  id: string;
  factor_type: "email" | "totp";
  status: "verified" | "unverified";
  friendly_name?: string;
}

export const AuthMFASetup: React.FC<AuthMFASetupProps> = ({ onSuccess, onCancel }) => {
  const [mfaMethod, setMFAMethod] = useState<"email" | "totp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [existingFactors, setExistingFactors] = useState<MFAFactor[]>([]);
  const [step, setStep] = useState<"list" | "setup" | "verify">("list");

  // Load existing MFA factors
  useEffect(() => {
    loadMFAFactors();
  }, []);

  const loadMFAFactors = async () => {
    const result = await supabaseAuthService.getMFAFactors();
    if (result.success) {
      setExistingFactors(result.factors as MFAFactor[]);
    }
  };

  const handleSetupMFA = async () => {
    setIsLoading(true);

    try {
      let result;

      if (mfaMethod === "email") {
        result = await supabaseAuthService.setupMFAEmail();
      } else {
        result = await supabaseAuthService.setupMFATOTP();
      }

      if (result.success) {
        setFactorId(result.factorId || null);
        setQrCode(result.qrCode || null);
        setSecret(result.secret || null);
        setStep("verify");

        if (mfaMethod === "email") {
          notificationManager.success(
            "Email Sent",
            "Check your email for the verification code"
          );
        } else {
          notificationManager.success(
            "Scan QR Code",
            "Use an authenticator app to scan the QR code"
          );
        }
      } else {
        notificationManager.error("Setup Failed", result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Setup failed";
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || !factorId) {
      notificationManager.error("Missing Code", "Please enter the verification code");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await supabaseAuthService.verifyMFAFactor(factorId, verificationCode);

      if (result.success) {
        notificationManager.success(
          "MFA Enabled",
          `${mfaMethod === "email" ? "Email" : "Authenticator"} MFA has been enabled successfully`
        );

        // Reload factors
        await loadMFAFactors();
        resetForm();

        if (onSuccess) {
          onSuccess();
        }
      } else {
        notificationManager.error("Verification Failed", result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed";
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveMFA = async (id: string) => {
    if (!confirm("Are you sure you want to remove this MFA method?")) {
      return;
    }

    try {
      const result = await supabaseAuthService.removeMFAFactor(id);

      if (result.success) {
        notificationManager.success("Removed", "MFA method has been removed");
        await loadMFAFactors();
      } else {
        notificationManager.error("Failed to Remove", result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove MFA";
      notificationManager.error("Error", errorMessage);
    }
  };

  const resetForm = () => {
    setStep("list");
    setVerificationCode("");
    setFactorId(null);
    setQrCode(null);
    setSecret(null);
    setMFAMethod("email");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notificationManager.success("Copied", "Text copied to clipboard");
  };

  if (step === "list") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Existing Factors */}
          {existingFactors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Active Security Methods:</p>
              {existingFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {factor.factor_type === "totp" ? "Authenticator App" : "Email OTP"}
                      </p>
                      <p className="text-xs text-gray-600">{factor.status}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveMFA(factor.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Option to add more methods */}
          {existingFactors.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Add Another Method:</p>
            </div>
          )}

          {/* MFA Method Selection */}
          <Tabs value={mfaMethod} onValueChange={(v) => setMFAMethod(v as "email" | "totp")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">📧 Email OTP</TabsTrigger>
              <TabsTrigger value="totp">📱 Authenticator</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  You'll receive a 6-digit code via email each time you sign in
                </p>
              </div>
            </TabsContent>

            <TabsContent value="totp" className="space-y-3 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Setup Button */}
          <Button
            onClick={handleSetupMFA}
            disabled={isLoading || existingFactors.some((f) => f.factor_type === mfaMethod)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Setting up..." : `Setup ${mfaMethod === "email" ? "Email" : "Authenticator"}`}
          </Button>

          {/* Cancel Button */}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Verification Step
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Verify {mfaMethod === "email" ? "Email" : "Authenticator"}</CardTitle>
            <p className="text-sm text-gray-600">Complete the setup</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code for TOTP */}
        {mfaMethod === "totp" && qrCode && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <img src={qrCode} alt="TOTP QR Code" className="h-48 w-48" />
            </div>

            {secret && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Can't scan? Enter this code manually:</p>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <code className="flex-1 font-mono text-sm break-all">{secret}</code>
                  <Button
                    onClick={() => copyToClipboard(secret)}
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {mfaMethod === "email" ? "Email Verification Code" : "Authenticator Code"}
          </label>
          <Input
            type="text"
            placeholder={mfaMethod === "email" ? "000000" : "000000"}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
          />
          <p className="text-xs text-gray-500">
            {mfaMethod === "email" ? "Check your email for the code" : "Get the 6-digit code from your authenticator app"}
          </p>
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerifyMFA}
          disabled={isVerifying || verificationCode.length < 6}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify & Enable"}
        </Button>

        {/* Back Button */}
        <Button
          onClick={() => setStep("list")}
          variant="outline"
          className="w-full"
        >
          Back
        </Button>
      </CardContent>
    </Card>
  );
};
