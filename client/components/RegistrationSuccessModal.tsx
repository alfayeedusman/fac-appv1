import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Zap, ArrowRight } from "lucide-react";

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToLogin: () => void;
  userEmail: string;
  packageType: string;
}

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  onContinueToLogin,
  userEmail,
  packageType,
}: RegistrationSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-fac-orange-500 to-purple-600 p-4 rounded-full animate-bounce">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
            Welcome to the Future! 🚀
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Registration completed successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Your Fayeed Auto Care account has been created and is ready to
              use.
            </p>
          </div>

          {/* User Details Card */}
          <div className="bg-gradient-to-br from-fac-orange-50 to-purple-100 dark:from-fac-orange-950 dark:to-purple-900 rounded-xl p-6 border border-fac-orange-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-fac-orange-500 to-purple-600 p-3 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Account Created
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Selected Plan:
              </span>
              <Badge className="bg-gradient-to-r from-fac-orange-500 to-purple-600 text-white text-sm px-3 py-1">
                <Zap className="h-4 w-4 mr-1" />
                {packageType === "regular"
                  ? "Regular Member"
                  : packageType === "classic"
                    ? "Classic Pro"
                    : packageType === "vip-silver"
                      ? "VIP Silver Elite"
                      : packageType === "vip-gold"
                        ? "VIP Gold Ultimate"
                        : packageType}
              </Badge>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sign in with your email and password</li>
              <li>• Complete your profile setup</li>
              <li>• Start using FAC services</li>
              <li>• Enjoy the future of car care!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onContinueToLogin}
              className="w-full bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white font-semibold transition-all duration-300"
            >
              Continue to Sign In
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950"
            >
              I'll sign in later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
