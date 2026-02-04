import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  FileImage,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  AlertTriangle,
  Crown,
  Shield,
  Star,
} from "lucide-react";
import { SubscriptionRequest } from "@/utils/subscriptionApprovalData";

interface SubscriptionRequestCardProps {
  request: SubscriptionRequest;
  onApprove: (requestId: string, notes?: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onBan: (userId: string, reason: string) => void;
  onUnban: (userId: string) => void;
}

export default function SubscriptionRequestCard({
  request,
  onApprove,
  onReject,
  onBan,
  onUnban,
}: SubscriptionRequestCardProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const hasReceipt = Boolean(request.receipt?.imageUrl);

  const getStatusColor = (status: SubscriptionRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getCustomerStatusColor = (
    status: SubscriptionRequest["customerStatus"],
  ) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "banned":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case "Classic Silver":
        return <Shield className="h-4 w-4" />;
      case "VIP Gold Ultimate":
        return <Crown className="h-4 w-4" />;
      case "Premium Platinum Elite":
        return <Star className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "gcash":
        return "text-blue-600";
      case "maya":
        return "text-green-600";
      case "bank_transfer":
        return "text-purple-600";
      case "over_counter":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleApprove = () => {
    onApprove(request.id, approvalNotes);
    setShowApprovalModal(false);
    setApprovalNotes("");
  };

  const handleReject = () => {
    onReject(request.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleBan = () => {
    onBan(request.userId, banReason);
    setShowBanModal(false);
    setBanReason("");
  };

  return (
    <>
      <Card className="glass border-border hover-lift transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center space-x-2">
              {getPackageIcon(request.packageType)}
              <span>{request.packageType}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status.toUpperCase()}
              </Badge>
              <Badge className={getCustomerStatusColor(request.customerStatus)}>
                {request.customerStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Request ID: {request.id}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {request.userName}
                  </p>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {request.userEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                </div>
              </div>
              {request.userPhone && (
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {request.userPhone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone Number
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {formatDate(request.submissionDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <CreditCard className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {request.packagePrice}
                  </p>
                  <p className="text-sm text-muted-foreground">Package Price</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground mb-3">
              Payment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Payment Method
                </p>
                <p
                  className={`text-sm capitalize ${getPaymentMethodColor(request.paymentMethod)}`}
                >
                  {request.paymentMethod.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Amount</p>
                <p className="text-sm text-foreground font-semibold">
                  {request.paymentDetails.amount}
                </p>
              </div>
              {request.paymentDetails.referenceNumber && (
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Reference Number
                  </p>
                  <p className="text-sm text-foreground font-mono">
                    {request.paymentDetails.referenceNumber}
                  </p>
                </div>
              )}
              {request.paymentDetails.accountName && (
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Account Name
                  </p>
                  <p className="text-sm text-foreground">
                    {request.paymentDetails.accountName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  Payment Date
                </p>
                <p className="text-sm text-foreground">
                  {new Date(
                    request.paymentDetails.paymentDate,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground flex items-center space-x-2">
                <FileImage className="h-4 w-4" />
                <span>Payment Receipt</span>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => hasReceipt && setShowReceipt(true)}
                disabled={!hasReceipt}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>{hasReceipt ? "View" : "Not Available"}</span>
              </Button>
            </div>
            {hasReceipt ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>File: {request.receipt?.fileName}</p>
                <p>Size: {formatFileSize(request.receipt?.fileSize || 0)}</p>
                <p>Uploaded: {formatDate(request.receipt?.uploadDate || "")}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No receipt uploaded for this request yet.
              </p>
            )}
          </div>

          {/* Review Information */}
          {request.reviewedBy && (
            <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">
                Review Information
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Reviewed by:</span>{" "}
                  {request.reviewedBy}
                </p>
                <p>
                  <span className="font-medium">Review date:</span>{" "}
                  {formatDate(request.reviewedDate!)}
                </p>
                {request.reviewNotes && (
                  <p>
                    <span className="font-medium">Notes:</span>{" "}
                    {request.reviewNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {request.status === "pending" || request.status === "under_review" ? (
            <div className="flex flex-wrap gap-2 pt-4">
              <Button
                onClick={() => setShowApprovalModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              {request.customerStatus !== "banned" && (
                <Button
                  onClick={() => setShowBanModal(true)}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Ban Customer
                </Button>
              )}
            </div>
          ) : request.customerStatus === "banned" ? (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onUnban(request.userId)}
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Unban Customer
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {hasReceipt && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Payment Receipt - {request.receipt?.fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={request.receipt?.imageUrl}
                  alt="Payment Receipt"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.warn(
                      `Failed to load receipt image: ${request.receipt?.imageUrl}`,
                    );
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgOGgxME0xMCAyMGwxLTJoMi00bC0xIDJIMTB6bTQgMGgybC0xIDJIMTR6bTMtM2gtMWwtMi4yOTMtMi4yOTNhMSAxIDAgMCAwLTEuNDE0IDBMOC41ODYgMTMuMTcxYTEgMSAwIDAgMC0uMjA3LjIyOUw3IDEwaDEwbC0xIDNoLTF6IiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03IDhWNmEyIDIgMCAwIDEgMi0yaDZhMiAyIDAgMCAxIDIgMnYyIiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9zdmc+";
                    e.currentTarget.className =
                      "w-full h-full object-contain opacity-50";
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded receipt image`);
                  }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  File size: {formatFileSize(request.receipt?.fileSize || 0)}
                </p>
                <p>Uploaded: {formatDate(request.receipt?.uploadDate || "")}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Subscription Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve this subscription request for{" "}
              <strong>{request.userName}</strong>?
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">
                Approval Notes (Optional)
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Subscription Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this subscription request:
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              required
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                variant="destructive"
              >
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Ban Customer</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Warning:</strong> Banning this customer will suspend their
              account and reject all pending requests. This action should only
              be used for violations of terms of service.
            </p>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this customer..."
              required
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleBan}
                disabled={!banReason.trim()}
                variant="destructive"
              >
                <UserX className="h-4 w-4 mr-2" />
                Ban Customer
              </Button>
              <Button variant="outline" onClick={() => setShowBanModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
