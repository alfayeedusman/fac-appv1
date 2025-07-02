import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  LogOut,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  icon,
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "danger":
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
      case "info":
        return <Info className="h-12 w-12 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "warning":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "info":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-orange-500 hover:bg-orange-600 text-white";
    }
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div
          className={cn(
            "transition-all duration-200",
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100",
          )}
        >
          <DialogHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={cn("flex-1", getConfirmButtonStyle())}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Logout specific modal
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Logout Confirmation"
      description="Are you sure you want to logout? You'll need to sign in again to access your account."
      confirmText="Yes, Logout"
      cancelText="Stay Logged In"
      type="warning"
      icon={<LogOut className="h-12 w-12 text-orange-500" />}
    />
  );
}

// Delete confirmation modal
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
}: DeleteModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Confirmation"
      description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmText="Yes, Delete"
      cancelText="Cancel"
      type="danger"
      icon={<Trash2 className="h-12 w-12 text-red-500" />}
    />
  );
}

// Cancel booking modal
interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelBookingModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Cancel Booking"
      description="Are you sure you want to cancel this booking? You can reschedule later if needed."
      confirmText="Yes, Cancel Booking"
      cancelText="Keep Booking"
      type="warning"
      icon={<XCircle className="h-12 w-12 text-orange-500" />}
    />
  );
}
