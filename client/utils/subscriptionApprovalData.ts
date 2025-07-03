export interface PaymentReceipt {
  id: string;
  imageUrl: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  packageType:
    | "Classic Silver"
    | "VIP Gold Ultimate"
    | "Premium Platinum Elite";
  packagePrice: string;
  paymentMethod: "gcash" | "maya" | "bank_transfer" | "over_counter";
  paymentDetails: {
    referenceNumber?: string;
    accountName?: string;
    amount: string;
    paymentDate: string;
  };
  receipt: PaymentReceipt;
  status: "pending" | "approved" | "rejected" | "under_review";
  submissionDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  customerStatus: "active" | "banned" | "suspended";
}

export interface CustomerStatus {
  userId: string;
  email: string;
  status: "active" | "banned" | "suspended";
  banReason?: string;
  banDate?: string;
  bannedBy?: string;
  suspensionEnd?: string;
}

// Sample subscription requests for demonstration
const sampleRequests: SubscriptionRequest[] = [
  {
    id: "SUB001",
    userId: "user_001",
    userEmail: "john.doe@example.com",
    userName: "John Doe",
    userPhone: "+63 912 345 6789",
    packageType: "VIP Gold Ultimate",
    packagePrice: "₱799/month",
    paymentMethod: "gcash",
    paymentDetails: {
      referenceNumber: "GC123456789",
      accountName: "John Doe",
      amount: "₱799.00",
      paymentDate: "2024-12-27",
    },
    receipt: {
      id: "RCP001",
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      fileName: "gcash_receipt_001.jpg",
      uploadDate: "2024-12-27T10:30:00Z",
      fileSize: 245760,
    },
    status: "pending",
    submissionDate: "2024-12-27T10:30:00Z",
    customerStatus: "active",
  },
  {
    id: "SUB002",
    userId: "user_002",
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
    userPhone: "+63 917 123 4567",
    packageType: "Classic Silver",
    packagePrice: "₱299/month",
    paymentMethod: "maya",
    paymentDetails: {
      referenceNumber: "MY987654321",
      accountName: "Jane Smith",
      amount: "₱299.00",
      paymentDate: "2024-12-26",
    },
    receipt: {
      id: "RCP002",
      imageUrl:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      fileName: "maya_payment_002.png",
      uploadDate: "2024-12-26T14:20:00Z",
      fileSize: 189440,
    },
    status: "under_review",
    submissionDate: "2024-12-26T14:20:00Z",
    customerStatus: "active",
  },
  {
    id: "SUB003",
    userId: "user_003",
    userEmail: "mike.wilson@example.com",
    userName: "Mike Wilson",
    userPhone: "+63 905 987 6543",
    packageType: "Premium Platinum Elite",
    packagePrice: "₱1,299/month",
    paymentMethod: "bank_transfer",
    paymentDetails: {
      referenceNumber: "BT456789123",
      accountName: "Michael Wilson",
      amount: "₱1,299.00",
      paymentDate: "2024-12-25",
    },
    receipt: {
      id: "RCP003",
      imageUrl:
        "https://images.unsplash.com/photo-1554224154-26032fbc4d72?w=400",
      fileName: "bank_transfer_003.pdf",
      uploadDate: "2024-12-25T09:15:00Z",
      fileSize: 512000,
    },
    status: "approved",
    submissionDate: "2024-12-25T09:15:00Z",
    reviewedBy: "admin@fac.com",
    reviewedDate: "2024-12-25T16:30:00Z",
    reviewNotes: "Payment verified and approved",
    customerStatus: "active",
  },
];

export const getSubscriptionRequests = (): SubscriptionRequest[] => {
  const stored = localStorage.getItem("fac_subscription_requests");
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with sample data
  localStorage.setItem(
    "fac_subscription_requests",
    JSON.stringify(sampleRequests),
  );
  return sampleRequests;
};

export const updateSubscriptionRequest = (
  requestId: string,
  updates: Partial<SubscriptionRequest>,
): void => {
  const requests = getSubscriptionRequests();
  const requestIndex = requests.findIndex((r) => r.id === requestId);
  if (requestIndex !== -1) {
    requests[requestIndex] = { ...requests[requestIndex], ...updates };
    localStorage.setItem("fac_subscription_requests", JSON.stringify(requests));
  }
};

export const approveSubscriptionRequest = (
  requestId: string,
  adminEmail: string,
  notes?: string,
): void => {
  updateSubscriptionRequest(requestId, {
    status: "approved",
    reviewedBy: adminEmail,
    reviewedDate: new Date().toISOString(),
    reviewNotes: notes || "Payment verified and subscription activated",
  });

  // Send notification to customer
  addApprovalNotification(requestId, "approved");
};

export const rejectSubscriptionRequest = (
  requestId: string,
  adminEmail: string,
  reason: string,
): void => {
  updateSubscriptionRequest(requestId, {
    status: "rejected",
    reviewedBy: adminEmail,
    reviewedDate: new Date().toISOString(),
    reviewNotes: reason,
  });

  // Send notification to customer
  addApprovalNotification(requestId, "rejected", reason);
};

export const banCustomer = (
  userId: string,
  adminEmail: string,
  reason: string,
): void => {
  // Update all requests for this user
  const requests = getSubscriptionRequests();
  const updatedRequests = requests.map((request) => {
    if (request.userId === userId) {
      return {
        ...request,
        customerStatus: "banned" as const,
        reviewNotes: `Customer banned: ${reason}`,
        reviewedBy: adminEmail,
        reviewedDate: new Date().toISOString(),
      };
    }
    return request;
  });

  localStorage.setItem(
    "fac_subscription_requests",
    JSON.stringify(updatedRequests),
  );

  // Store customer ban status
  const customerStatuses = getCustomerStatuses();
  const existingIndex = customerStatuses.findIndex(
    (cs) => cs.userId === userId,
  );

  const banStatus: CustomerStatus = {
    userId,
    email: requests.find((r) => r.userId === userId)?.userEmail || "",
    status: "banned",
    banReason: reason,
    banDate: new Date().toISOString(),
    bannedBy: adminEmail,
  };

  if (existingIndex !== -1) {
    customerStatuses[existingIndex] = banStatus;
  } else {
    customerStatuses.push(banStatus);
  }

  localStorage.setItem(
    "fac_customer_statuses",
    JSON.stringify(customerStatuses),
  );

  // Send notification to customer
  addBanNotification(userId, reason);
};

export const unbanCustomer = (userId: string, adminEmail: string): void => {
  // Update customer status
  const customerStatuses = getCustomerStatuses();
  const statusIndex = customerStatuses.findIndex((cs) => cs.userId === userId);

  if (statusIndex !== -1) {
    customerStatuses[statusIndex].status = "active";
    customerStatuses[statusIndex].banReason = undefined;
    customerStatuses[statusIndex].banDate = undefined;
    customerStatuses[statusIndex].bannedBy = undefined;
  }

  localStorage.setItem(
    "fac_customer_statuses",
    JSON.stringify(customerStatuses),
  );

  // Update subscription requests
  const requests = getSubscriptionRequests();
  const updatedRequests = requests.map((request) => {
    if (request.userId === userId) {
      return {
        ...request,
        customerStatus: "active" as const,
      };
    }
    return request;
  });

  localStorage.setItem(
    "fac_subscription_requests",
    JSON.stringify(updatedRequests),
  );
};

export const getCustomerStatuses = (): CustomerStatus[] => {
  const stored = localStorage.getItem("fac_customer_statuses");
  return stored ? JSON.parse(stored) : [];
};

export const getRequestsByStatus = (
  status: SubscriptionRequest["status"],
): SubscriptionRequest[] => {
  return getSubscriptionRequests().filter(
    (request) => request.status === status,
  );
};

export const getRequestsByCustomerStatus = (
  status: CustomerStatus["status"],
): SubscriptionRequest[] => {
  return getSubscriptionRequests().filter(
    (request) => request.customerStatus === status,
  );
};

export const addSubscriptionRequest = (
  request: Omit<SubscriptionRequest, "id" | "submissionDate">,
): SubscriptionRequest => {
  const requests = getSubscriptionRequests();
  const newRequest: SubscriptionRequest = {
    ...request,
    id: `SUB${String(requests.length + 1).padStart(3, "0")}`,
    submissionDate: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem("fac_subscription_requests", JSON.stringify(requests));
  return newRequest;
};

// Notification helpers
const addApprovalNotification = (
  requestId: string,
  type: "approved" | "rejected",
  reason?: string,
): void => {
  const request = getSubscriptionRequests().find((r) => r.id === requestId);
  if (!request) return;

  const notification = {
    id: `approval_${requestId}_${Date.now()}`,
    type: "subscription",
    title:
      type === "approved"
        ? "Subscription Approved! 🎉"
        : "Subscription Request Update",
    message:
      type === "approved"
        ? `Your ${request.packageType} subscription has been approved and activated!`
        : `Your subscription request has been rejected. Reason: ${reason}`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/manage-subscription",
    actionText: type === "approved" ? "View Subscription" : "Try Again",
  };

  // Add to user notifications (this would normally be done via API)
  const userNotifications = JSON.parse(
    localStorage.getItem(`notifications_${request.userEmail}`) || "[]",
  );
  userNotifications.unshift(notification);
  localStorage.setItem(
    `notifications_${request.userEmail}`,
    JSON.stringify(userNotifications),
  );
};

const addBanNotification = (userId: string, reason: string): void => {
  const requests = getSubscriptionRequests();
  const userRequest = requests.find((r) => r.userId === userId);
  if (!userRequest) return;

  const notification = {
    id: `ban_${userId}_${Date.now()}`,
    type: "system",
    title: "Account Status Update",
    message: `Your account has been suspended. Reason: ${reason}. Please contact support for assistance.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/profile",
    actionText: "Contact Support",
  };

  // Add to user notifications
  const userNotifications = JSON.parse(
    localStorage.getItem(`notifications_${userRequest.userEmail}`) || "[]",
  );
  userNotifications.unshift(notification);
  localStorage.setItem(
    `notifications_${userRequest.userEmail}`,
    JSON.stringify(userNotifications),
  );
};

export const getSubscriptionStats = () => {
  const requests = getSubscriptionRequests();

  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    underReview: requests.filter((r) => r.status === "under_review").length,
    banned: requests.filter((r) => r.customerStatus === "banned").length,
  };
};
