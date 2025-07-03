export type UserRole = "customer" | "admin" | "cashier" | "inventory_manager";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdDate: string;
  lastLogin?: string;
  isActive: boolean;
  employeeId?: string;
  department?: string;
}

export interface Permission {
  module: "pos" | "inventory" | "admin" | "reports" | "users" | "subscriptions";
  actions: ("view" | "create" | "edit" | "delete" | "approve")[];
}

// Default role permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  customer: [],
  admin: [
    { module: "pos", actions: ["view", "create", "edit", "delete"] },
    { module: "inventory", actions: ["view", "create", "edit", "delete"] },
    {
      module: "admin",
      actions: ["view", "create", "edit", "delete", "approve"],
    },
    { module: "reports", actions: ["view", "create"] },
    { module: "users", actions: ["view", "create", "edit", "delete"] },
    {
      module: "subscriptions",
      actions: ["view", "create", "edit", "delete", "approve"],
    },
  ],
  cashier: [
    { module: "pos", actions: ["view", "create"] },
    { module: "inventory", actions: ["view"] },
    { module: "reports", actions: ["view"] },
  ],
  inventory_manager: [
    { module: "inventory", actions: ["view", "create", "edit", "delete"] },
    { module: "reports", actions: ["view", "create"] },
    { module: "pos", actions: ["view"] },
  ],
};

export const getUserRole = (email: string): UserRole => {
  const users = getUserAccounts();
  const user = users.find((u) => u.email === email);
  return user?.role || "customer";
};

export const getUserAccounts = (): UserAccount[] => {
  const stored = localStorage.getItem("fac_user_accounts");
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default admin account
  const defaultAccounts: UserAccount[] = [
    {
      id: "admin_001",
      email: "admin@fayeedautocare.com",
      name: "System Administrator",
      role: "admin",
      permissions: rolePermissions.admin,
      createdDate: new Date().toISOString(),
      isActive: true,
      employeeId: "EMP001",
      department: "Administration",
    },
  ];

  localStorage.setItem("fac_user_accounts", JSON.stringify(defaultAccounts));
  return defaultAccounts;
};

export const createUserAccount = (
  userData: Omit<UserAccount, "id" | "createdDate" | "permissions">,
): UserAccount => {
  const accounts = getUserAccounts();

  const newAccount: UserAccount = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdDate: new Date().toISOString(),
    permissions: rolePermissions[userData.role] || [],
  };

  accounts.push(newAccount);
  localStorage.setItem("fac_user_accounts", JSON.stringify(accounts));

  return newAccount;
};

export const updateUserRole = (userId: string, newRole: UserRole): void => {
  const accounts = getUserAccounts();
  const accountIndex = accounts.findIndex((a) => a.id === userId);

  if (accountIndex !== -1) {
    accounts[accountIndex].role = newRole;
    accounts[accountIndex].permissions = rolePermissions[newRole] || [];
    localStorage.setItem("fac_user_accounts", JSON.stringify(accounts));
  }
};

export const hasPermission = (
  userEmail: string,
  module: Permission["module"],
  action: Permission["actions"][0],
): boolean => {
  const user = getUserAccounts().find((u) => u.email === userEmail);
  if (!user) return false;

  const modulePermission = user.permissions.find((p) => p.module === module);
  return modulePermission?.actions.includes(action) || false;
};
