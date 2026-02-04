import { supabaseDbClient } from "@/services/supabaseDatabaseService";

import { supabaseDbClient } from "@/services/supabaseDatabaseService";

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
  packageType: string;
  packagePrice: string;
  paymentMethod: string;
  paymentDetails: {
    referenceNumber?: string;
    accountName?: string;
    amount: string;
    paymentDate: string;
  };
  receipt?: PaymentReceipt;
  status: "pending" | "approved" | "rejected" | "under_review";
  submissionDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  customerStatus: "active" | "banned" | "suspended";
  subscriptionId?: string;
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

export interface UserSubscriptionData {
  package: string;
  price: number;
  paymentMethod?: string;
  activatedDate: string;
  currentCycleStart: string;
  currentCycleEnd: string;
  daysLeft: number;
  totalWashes: {
    classic: number;
    vipProMax: number;
    premium: number;
  };
  remainingWashes: {
    classic: number;
    vipProMax: number;
    premium: number;
  };
  status: string;
  autoRenewal?: boolean;
}

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const mapStatusToRequest = (status?: string): SubscriptionRequest["status"] => {
  switch (status) {
    case "active":
      return "approved";
    case "rejected":
      return "rejected";
    case "under_review":
      return "under_review";
    default:
      return "pending";
  }
};

const mapStatusToSubscription = (status: SubscriptionRequest["status"]) => {
  switch (status) {
    case "approved":
      return "active";
    case "rejected":
      return "rejected";
    case "under_review":
      return "under_review";
    default:
      return "pending";
  }
};

const mapPaymentMethod = (method?: string) => {
  if (!method) return "online";
  const normalized = method.toLowerCase();
  if (normalized === "paymaya") return "maya";
  return normalized;
};

const buildWashLimits = (packageName: string) => {
  if (packageName.toLowerCase().includes("classic")) {
    return { classic: 5, vipProMax: 0, premium: 0 };
  }
  if (packageName.toLowerCase().includes("vip")) {
    return { classic: 10, vipProMax: 2, premium: 0 };
  }
  if (packageName.toLowerCase().includes("premium")) {
    return { classic: 999, vipProMax: 5, premium: 1 };
  }
  return { classic: 0, vipProMax: 0, premium: 0 };
};

const fetchSubscriptions = async (params?: {
  status?: SubscriptionRequest["status"] | "all";
  userId?: string;
}) => {
  const statuses = params?.status && params.status !== "all"
    ? [mapStatusToSubscription(params.status)]
    : ["pending", "under_review", "active", "rejected", "cancelled", "expired"];

  const results = await Promise.all(
    statuses.map((status) =>
      supabaseDbClient.getSubscriptions({
        status,
        userId: params?.userId,
      }),
    ),
  );

  const subscriptions = results.flatMap((result) => result.subscriptions || []);
  const seen = new Set<string>();
  return subscriptions.filter((sub) => {
    if (seen.has(sub.id)) return false;
    seen.add(sub.id);
    return true;
  });
};

export const getSubscriptionRequests = async (params?: {
  status?: SubscriptionRequest["status"] | "all";
  userId?: string;
}): Promise<SubscriptionRequest[]> => {
  const [subscriptions, usersResult, packagesResult] = await Promise.all([
    fetchSubscriptions(params),
    supabaseDbClient.getCustomers(),
    supabaseDbClient.getServicePackages(),
  ]);

  const users = usersResult.users || [];
  const packages = packagesResult.packages || [];
  const usersById = new Map(users.map((user) => [user.id, user]));
  const packagesById = new Map(packages.map((pkg: any) => [pkg.id, pkg]));

  return subscriptions.map((subscription) => {
    const user = usersById.get(subscription.userId);
    const pkg = packagesById.get(subscription.packageId);
    const submissionDate = subscription.startDate
      ? new Date(subscription.startDate).toISOString()
      : new Date().toISOString();
    const packageName = pkg?.name || subscription.packageId;
    const priceLabel = formatCurrency(subscription.finalPrice || 0);

    return {
      id: subscription.id,
      userId: subscription.userId,
      userEmail: user?.email || "",
      userName: user?.fullName || user?.email || "Customer",
      userPhone: user?.contactNumber,
      packageType: packageName,
      packagePrice: priceLabel,
      paymentMethod: mapPaymentMethod(subscription.paymentMethod),
      paymentDetails: {
        amount: priceLabel,
        paymentDate: submissionDate,
      },
      status: mapStatusToRequest(subscription.status),
      submissionDate,
      reviewedBy: undefined,
      reviewedDate: undefined,
      reviewNotes: undefined,
      customerStatus: user?.isActive === false ? "banned" : "active",
      subscriptionId: subscription.id,
    };
  });
};

export const updateSubscriptionRequest = async (
  requestId: string,
  updates: Partial<SubscriptionRequest>,
): Promise<{ success: boolean; error?: string }> => {
  if (!updates.status) {
    return { success: true };
  }

  const result = await supabaseDbClient.approveSubscriptionUpgrade(
    requestId,
    mapStatusToSubscription(updates.status),
  );

  return { success: result.success, error: result.error };
};

export const approveSubscriptionRequest = async (
  requestId: string,
  _adminEmail: string,
  _notes?: string,
): Promise<{ success: boolean; error?: string }> => {
  return updateSubscriptionRequest(requestId, { status: "approved" });
};

export const rejectSubscriptionRequest = async (
  requestId: string,
  _adminEmail: string,
  _reason: string,
): Promise<{ success: boolean; error?: string }> => {
  return updateSubscriptionRequest(requestId, { status: "rejected" });
};

export const banCustomer = async (
  userId: string,
  _adminEmail: string,
  _reason: string,
): Promise<{ success: boolean; error?: string }> => {
  const result = await supabaseDbClient.updateUserStatus(userId, false);
  return { success: result.success, error: result.error };
};

export const unbanCustomer = async (
  userId: string,
  _adminEmail: string,
): Promise<{ success: boolean; error?: string }> => {
  const result = await supabaseDbClient.updateUserStatus(userId, true);
  return { success: result.success, error: result.error };
};

export const getSubscriptionStats = async () => {
  const requests = await getSubscriptionRequests({ status: "all" });

  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    underReview: requests.filter((r) => r.status === "under_review").length,
    banned: requests.filter((r) => r.customerStatus === "banned").length,
  };
};

export const getUserSubscriptionRequest = async (
  userEmail: string,
): Promise<SubscriptionRequest | null> => {
  const usersResult = await supabaseDbClient.getCustomers();
  const user = (usersResult.users || []).find(
    (item) => item.email === userEmail,
  );

  if (!user) return null;

  const requests = await getSubscriptionRequests({ userId: user.id });
  const sorted = requests.sort(
    (a, b) =>
      new Date(b.submissionDate).getTime() -
      new Date(a.submissionDate).getTime(),
  );

  return sorted[0] || null;
};

export const getUserSubscriptionStatus = async (
  userEmail: string,
): Promise<{
  hasRequest: boolean;
  status: SubscriptionRequest["status"] | null;
  request: SubscriptionRequest | null;
}> => {
  const request = await getUserSubscriptionRequest(userEmail);

  return {
    hasRequest: !!request,
    status: request?.status || null,
    request,
  };
};

export const getUserSubscriptionData = async (
  userEmail: string,
): Promise<UserSubscriptionData | null> => {
  if (!userEmail) return null;

  const usersResult = await supabaseDbClient.getCustomers();
  const user = (usersResult.users || []).find(
    (item) => item.email === userEmail,
  );

  if (!user) return null;

  const [subscriptionsResult, packagesResult] = await Promise.all([
    supabaseDbClient.getSubscriptions({ userId: user.id, status: "active" }),
    supabaseDbClient.getServicePackages(),
  ]);

  const subscription = subscriptionsResult.subscriptions?.[0];
  if (!subscription) return null;

  const packages = packagesResult.packages || [];
  const pkg = packages.find((item: any) => item.id === subscription.packageId);
  const packageName = pkg?.name || subscription.packageId;
  const washLimits = buildWashLimits(packageName);
  const endDate = subscription.endDate
    ? new Date(subscription.endDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    package: packageName,
    price: subscription.finalPrice || 0,
    paymentMethod: mapPaymentMethod(subscription.paymentMethod),
    activatedDate: subscription.startDate
      ? new Date(subscription.startDate).toISOString()
      : new Date().toISOString(),
    currentCycleStart: subscription.startDate
      ? new Date(subscription.startDate).toISOString()
      : new Date().toISOString(),
    currentCycleEnd: endDate.toISOString(),
    daysLeft,
    totalWashes: washLimits,
    remainingWashes: washLimits,
    status: subscription.status || "active",
    autoRenewal: subscription.autoRenew,
  };
};
