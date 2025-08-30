import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Users,
  Crown,
  Star,
  Settings,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "superadmin" | "manager" | "cashier" | "inventory_manager" | "crew";
  permissions: string[];
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  // Tab Access Permissions
  {
    id: "tab.overview",
    name: "Command Center Tab",
    description: "Access to overview dashboard",
    category: "Tab Access",
  },
  {
    id: "tab.customers",
    name: "Customer Hub Tab",
    description: "Access to customer management tab",
    category: "Tab Access",
  },
  {
    id: "tab.roles",
    name: "User & Roles Tab",
    description: "Access to role management tab",
    category: "Tab Access",
  },
  {
    id: "tab.ads",
    name: "Ad Studio Tab",
    description: "Access to advertisement management tab",
    category: "Tab Access",
  },
  {
    id: "tab.packages",
    name: "Package Studio Tab",
    description: "Access to service packages tab",
    category: "Tab Access",
  },
  {
    id: "tab.branches",
    name: "Branch Network Tab",
    description: "Access to location management tab",
    category: "Tab Access",
  },
  {
    id: "tab.analytics",
    name: "Analytics Center Tab",
    description: "Access to reports and insights tab",
    category: "Tab Access",
  },
  {
    id: "tab.bookings",
    name: "Booking Hub Tab",
    description: "Access to booking management tab",
    category: "Tab Access",
  },
  {
    id: "tab.images",
    name: "Image Manager Tab",
    description: "Access to booking images tab",
    category: "Tab Access",
  },
  {
    id: "tab.sales",
    name: "Revenue Hub Tab",
    description: "Access to revenue tracking tab",
    category: "Tab Access",
  },
  {
    id: "tab.notifications",
    name: "Notifications Tab",
    description: "Access to system alerts tab",
    category: "Tab Access",
  },
  {
    id: "tab.cms",
    name: "CMS Manager Tab",
    description: "Access to content management tab",
    category: "Tab Access",
  },
  {
    id: "tab.booking_settings",
    name: "Booking Settings Tab",
    description: "Access to booking configuration tab",
    category: "Tab Access",
  },
  {
    id: "tab.push_notifications",
    name: "Push Notifications Tab",
    description: "Access to broadcast messages tab",
    category: "Tab Access",
  },
  {
    id: "tab.gamification",
    name: "Gamification Tab",
    description: "Access to customer levels & rewards tab",
    category: "Tab Access",
  },
  {
    id: "tab.subscription_approval",
    name: "Subscription Approval Tab",
    description: "Access to payment verification tab",
    category: "Tab Access",
  },
  {
    id: "tab.pos",
    name: "Point of Sale Tab",
    description: "Access to sales terminal tab",
    category: "Tab Access",
  },
  {
    id: "tab.inventory",
    name: "Inventory Tab",
    description: "Access to stock management tab",
    category: "Tab Access",
  },
  {
    id: "tab.user_management",
    name: "User Management Tab",
    description: "Access to staff & roles tab",
    category: "Tab Access",
  },

  // User Management
  {
    id: "users.view",
    name: "View Users",
    description: "Can view user list",
    category: "User Management",
  },
  {
    id: "users.create",
    name: "Create Users",
    description: "Can add new users",
    category: "User Management",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    description: "Can modify user details",
    category: "User Management",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    description: "Can remove users",
    category: "User Management",
  },

  // Ads Management
  {
    id: "ads.view",
    name: "View Ads",
    description: "Can view advertisements",
    category: "Ads Management",
  },
  {
    id: "ads.create",
    name: "Create Ads",
    description: "Can create new ads",
    category: "Ads Management",
  },
  {
    id: "ads.edit",
    name: "Edit Ads",
    description: "Can modify existing ads",
    category: "Ads Management",
  },
  {
    id: "ads.delete",
    name: "Delete Ads",
    description: "Can remove ads",
    category: "Ads Management",
  },

  // Analytics
  {
    id: "analytics.view",
    name: "View Analytics",
    description: "Can access analytics dashboard",
    category: "Analytics",
  },
  {
    id: "analytics.export",
    name: "Export Data",
    description: "Can export analytics data",
    category: "Analytics",
  },

  // Customer Management
  {
    id: "customers.view",
    name: "View Customers",
    description: "Can view customer list",
    category: "Customer Management",
  },
  {
    id: "customers.edit",
    name: "Edit Customers",
    description: "Can modify customer details",
    category: "Customer Management",
  },
  {
    id: "customers.approve",
    name: "Approve Customers",
    description: "Can approve customer registrations",
    category: "Customer Management",
  },
  {
    id: "customers.message",
    name: "Message Customers",
    description: "Can send messages to customers",
    category: "Customer Management",
  },
  {
    id: "customers.view_details",
    name: "View Customer Details",
    description: "Can view full customer information",
    category: "Customer Management",
  },

  // Package Management
  {
    id: "packages.view",
    name: "View Packages",
    description: "Can view service packages",
    category: "Package Management",
  },
  {
    id: "packages.edit",
    name: "Edit Packages",
    description: "Can modify packages",
    category: "Package Management",
  },
  {
    id: "packages.create",
    name: "Create Packages",
    description: "Can create new packages",
    category: "Package Management",
  },
  {
    id: "packages.delete",
    name: "Delete Packages",
    description: "Can remove packages",
    category: "Package Management",
  },

  // Booking Management
  {
    id: "bookings.view_all",
    name: "View All Bookings",
    description: "Can view all system bookings",
    category: "Booking Management",
  },
  {
    id: "bookings.view_assigned",
    name: "View Assigned Bookings",
    description: "Can view bookings assigned to them",
    category: "Booking Management",
  },
  {
    id: "bookings.update_status",
    name: "Update Booking Status",
    description: "Can update booking status",
    category: "Booking Management",
  },
  {
    id: "bookings.approve",
    name: "Approve Bookings",
    description: "Can approve or reject bookings",
    category: "Booking Management",
  },
  {
    id: "bookings.cancel",
    name: "Cancel Bookings",
    description: "Can cancel bookings",
    category: "Booking Management",
  },
  {
    id: "bookings.reschedule",
    name: "Reschedule Bookings",
    description: "Can reschedule bookings",
    category: "Booking Management",
  },

  // Crew Management
  {
    id: "crew.assign",
    name: "Assign Crew",
    description: "Can assign crew to bookings",
    category: "Crew Management",
  },
  {
    id: "crew.manage",
    name: "Manage Crew",
    description: "Can manage crew members",
    category: "Crew Management",
  },
  {
    id: "crew.view_assignments",
    name: "View Crew Assignments",
    description: "Can view crew assignments",
    category: "Crew Management",
  },
  {
    id: "crew.track_location",
    name: "Track Crew Location",
    description: "Can track crew member locations",
    category: "Crew Management",
  },

  // Field Operations (for crew members)
  {
    id: "field.update_status",
    name: "Update Field Status",
    description: "Can update booking status from field",
    category: "Field Operations",
  },
  {
    id: "field.upload_photos",
    name: "Upload Progress Photos",
    description: "Can upload photos of work progress",
    category: "Field Operations",
  },
  {
    id: "field.collect_signature",
    name: "Collect Customer Signature",
    description: "Can collect electronic signatures",
    category: "Field Operations",
  },
  {
    id: "field.update_location",
    name: "Update Location",
    description: "Can update current location",
    category: "Field Operations",
  },
  {
    id: "field.accept_assignments",
    name: "Accept Assignments",
    description: "Can accept booking assignments",
    category: "Field Operations",
  },
  {
    id: "field.reject_assignments",
    name: "Reject Assignments",
    description: "Can reject booking assignments",
    category: "Field Operations",
  },

  // System Settings
  {
    id: "settings.system",
    name: "System Settings",
    description: "Can modify system settings",
    category: "System Settings",
  },
  {
    id: "settings.security",
    name: "Security Settings",
    description: "Can manage security settings",
    category: "System Settings",
  },
  {
    id: "settings.booking",
    name: "Booking Configuration",
    description: "Can configure booking settings",
    category: "System Settings",
  },
  {
    id: "settings.pricing",
    name: "Pricing Settings",
    description: "Can modify service pricing",
    category: "System Settings",
  },

  // Financial Management
  {
    id: "finance.view_revenue",
    name: "View Revenue Reports",
    description: "Can view financial reports",
    category: "Financial Management",
  },
  {
    id: "finance.process_payments",
    name: "Process Payments",
    description: "Can handle payment processing",
    category: "Financial Management",
  },
  {
    id: "finance.refunds",
    name: "Issue Refunds",
    description: "Can process refunds",
    category: "Financial Management",
  },

  // Inventory Management
  {
    id: "inventory.view",
    name: "View Inventory",
    description: "Can view inventory levels",
    category: "Inventory Management",
  },
  {
    id: "inventory.update",
    name: "Update Inventory",
    description: "Can modify inventory levels",
    category: "Inventory Management",
  },
  {
    id: "inventory.order",
    name: "Order Supplies",
    description: "Can place supply orders",
    category: "Inventory Management",
  },

  // Communication
  {
    id: "communication.send_notifications",
    name: "Send Notifications",
    description: "Can send push notifications",
    category: "Communication",
  },
  {
    id: "communication.broadcast",
    name: "Broadcast Messages",
    description: "Can send broadcast messages",
    category: "Communication",
  },
  {
    id: "communication.sms",
    name: "Send SMS",
    description: "Can send SMS messages",
    category: "Communication",
  },
];

const ROLE_PRESETS = {
  user: [],
  crew: [
    // Field Operations
    "field.update_status",
    "field.upload_photos",
    "field.collect_signature",
    "field.update_location",
    "field.accept_assignments",
    "field.reject_assignments",
    // Basic Booking Access
    "bookings.view_assigned",
    "bookings.update_status",
  ],
  manager: [
    // Tab Access
    "tab.overview",
    "tab.customers",
    "tab.bookings",
    "tab.analytics",
    // Customer Management
    "customers.view",
    "customers.edit",
    "customers.approve",
    "customers.message",
    "customers.view_details",
    // Booking Management
    "bookings.view_all",
    "bookings.approve",
    "bookings.cancel",
    "bookings.reschedule",
    // Crew Management
    "crew.assign",
    "crew.view_assignments",
    "crew.track_location",
    // Analytics
    "analytics.view",
  ],
  cashier: [
    // Tab Access
    "tab.pos",
    "tab.customers",
    "tab.packages",
    // Customer Management
    "customers.view",
    "customers.view_details",
    // Package Management
    "packages.view",
    // Financial
    "finance.process_payments",
  ],
  inventory_manager: [
    // Tab Access
    "tab.inventory",
    "tab.packages",
    "tab.analytics",
    // Inventory Management
    "inventory.view",
    "inventory.update",
    "inventory.order",
    // Package Management
    "packages.view",
    "packages.edit",
    "packages.create",
    // Analytics
    "analytics.view",
  ],
  admin: [
    // Most tab access except user roles
    "tab.overview",
    "tab.customers",
    "tab.ads",
    "tab.packages",
    "tab.branches",
    "tab.analytics",
    "tab.bookings",
    "tab.images",
    "tab.sales",
    "tab.notifications",
    "tab.cms",
    "tab.booking_settings",
    "tab.push_notifications",
    "tab.gamification",
    "tab.subscription_approval",
    "tab.pos",
    "tab.inventory",
    "tab.user_management",
    // User Management
    "users.view",
    "users.create",
    "users.edit",
    // Ads Management
    "ads.view",
    "ads.create",
    "ads.edit",
    "ads.delete",
    // Analytics
    "analytics.view",
    "analytics.export",
    // Customer Management
    "customers.view",
    "customers.edit",
    "customers.approve",
    "customers.message",
    "customers.view_details",
    // Package Management
    "packages.view",
    "packages.edit",
    "packages.create",
    "packages.delete",
    // Booking Management
    "bookings.view_all",
    "bookings.approve",
    "bookings.cancel",
    "bookings.reschedule",
    // Crew Management
    "crew.manage",
    "crew.assign",
    "crew.view_assignments",
    "crew.track_location",
    // System Settings
    "settings.booking",
    "settings.pricing",
    // Financial
    "finance.view_revenue",
    "finance.process_payments",
    "finance.refunds",
    // Communication
    "communication.send_notifications",
    "communication.broadcast",
    "communication.sms",
  ],
  superadmin: DEFAULT_PERMISSIONS.map((p) => p.id),
};

export default function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user" as User["role"],
    permissions: [] as string[],
    status: "active" as User["status"],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );

      // Ensure we have an array
      if (!Array.isArray(registeredUsers)) {
        console.warn("registeredUsers is not an array, resetting to empty array");
        localStorage.setItem("registeredUsers", "[]");
        setUsers([]);
        return;
      }

      // Convert to our User interface format with safe fallbacks
      const formattedUsers: User[] = registeredUsers
        .filter((user: any) => user && typeof user === 'object' && user.email) // Filter out invalid entries
        .map((user: any) => {
          const userRole = user.role || "user";
          const validRole = ["user", "crew", "manager", "cashier", "inventory_manager", "admin", "superadmin"].includes(userRole)
            ? userRole
            : "user";

          return {
            id: user.id || user.email || `user_${Date.now()}_${Math.random()}`,
            fullName: user.fullName || user.name || "Unknown User",
            email: user.email || "",
            role: validRole as User["role"],
            permissions: user.permissions || ROLE_PRESETS[validRole as keyof typeof ROLE_PRESETS] || [],
            status: (user.status && ["active", "inactive", "suspended"].includes(user.status)) 
              ? user.status 
              : "active",
            createdAt: user.createdAt || user.registeredAt || new Date().toISOString(),
            lastLogin: user.lastLogin || undefined,
          };
        });

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      // Reset to empty array on error
      localStorage.setItem("registeredUsers", "[]");
      setUsers([]);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "user",
      permissions: [],
      status: "active",
    });
    setEditingUser(null);
  };

  const handleRoleChange = (role: User["role"]) => {
    setFormData({
      ...formData,
      role,
      permissions: ROLE_PRESETS[role as keyof typeof ROLE_PRESETS] || [],
    });
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter((p) => p !== permissionId)
      : [...formData.permissions, permissionId];

    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleCreateUser = () => {
    try {
      if (!formData.fullName || !formData.email || !formData.password) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Please fill in all required fields',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );

      // Ensure existingUsers is an array
      if (!Array.isArray(existingUsers)) {
        console.warn("existingUsers is not an array, resetting");
        localStorage.setItem("registeredUsers", "[]");
      }

      const userArray = Array.isArray(existingUsers) ? existingUsers : [];

      const userExists = userArray.find(
        (user: any) => user && user.email === formData.email,
      );
      if (userExists) {
        Swal.fire({
          title: 'Duplicate Email',
          text: 'User with this email already exists',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions,
        status: formData.status,
        createdAt: new Date().toISOString(),
        // Additional required fields for compatibility
        address: "Admin Created Account",
        contactNumber: "+63 999 000 0000",
        carUnit: "N/A",
        carPlateNumber: "N/A",
        carType: "N/A",
        selectedPackage: "classic",
      };

      userArray.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(userArray));

      // Create basic subscription data for new user
      const subscriptionData = {
        package: "Regular Member",
        daysLeft: 0,
        currentCycleStart: new Date().toISOString().split("T")[0],
        currentCycleEnd: new Date().toISOString().split("T")[0],
        daysLeftInCycle: 0,
        autoRenewal: false,
        remainingWashes: { classic: 0, vipProMax: 0, premium: 0 },
        totalWashes: { classic: 0, vipProMax: 0, premium: 0 },
      };

      localStorage.setItem(
        `subscription_${formData.email}`,
        JSON.stringify(subscriptionData),
      );
      localStorage.setItem(`washLogs_${formData.email}`, JSON.stringify([]));

      loadUsers();
      setIsCreateModalOpen(false);
      resetForm();

      Swal.fire({
        title: 'Success!',
        text: 'User created successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error creating user:", error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to create user. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    try {
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );

      const userIndex = existingUsers.findIndex(
        (user: any) => user.email === editingUser.email,
      );
      if (userIndex === -1) return;

      // Update user data, including password if provided
      const updatedUser = {
        ...existingUsers[userIndex],
        fullName: formData.fullName,
        role: formData.role,
        permissions: formData.permissions,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      // Only update password if a new one was provided
      if (formData.password && formData.password.trim() !== "") {
        updatedUser.password = formData.password;
      }

      existingUsers[userIndex] = updatedUser;

      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));
      loadUsers();
      setIsEditModalOpen(false);
      resetForm();

      Swal.fire({
        title: 'Success!',
        text: 'User updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error updating user:", error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to update user. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === "superadmin") {
      Swal.fire({
        title: 'Access Denied',
        text: 'Cannot delete superadmin users',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      try {
        const existingUsers = JSON.parse(
          localStorage.getItem("registeredUsers") || "[]",
        );

        const filteredUsers = existingUsers.filter(
          (u: any) => u.email !== user.email,
        );
        localStorage.setItem("registeredUsers", JSON.stringify(filteredUsers));

        // Clean up user data
        localStorage.removeItem(`subscription_${user.email}`);
        localStorage.removeItem(`washLogs_${user.email}`);

        loadUsers();

        Swal.fire({
          title: 'Deleted!',
          text: 'User deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 3000,
          timerProgressBar: true
        });
      } catch (error) {
        console.error("Error deleting user:", error);

        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete user. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      permissions: user.permissions,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <UserCheck className="h-4 w-4" />;
      case "crew":
        return <Wrench className="h-4 w-4" />;
      case "cashier":
        return <Star className="h-4 w-4" />;
      case "inventory_manager":
        return <Settings className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-gradient-to-r from-yellow-500 to-orange-600";
      case "admin":
        return "bg-gradient-to-r from-purple-500 to-blue-600";
      case "manager":
        return "bg-gradient-to-r from-blue-500 to-cyan-600";
      case "crew":
        return "bg-gradient-to-r from-red-500 to-pink-600";
      case "cashier":
        return "bg-gradient-to-r from-emerald-500 to-green-600";
      case "inventory_manager":
        return "bg-gradient-to-r from-orange-500 to-red-600";
      default:
        return "bg-gradient-to-r from-green-500 to-teal-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900";
      case "inactive":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900";
      case "suspended":
        return "text-red-600 bg-red-100 dark:bg-red-900";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900";
    }
  };

  const groupedPermissions = DEFAULT_PERMISSIONS.reduce(
    (groups, permission) => {
      const category = permission.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Shield className="h-6 w-6 mr-3 text-fac-orange-500" />
            User & Role Management
          </h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fac-orange-500 hover:bg-fac-orange-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="crew">Crew</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {Object.entries(groupedPermissions).map(
                    ([category, permissions]) => (
                      <div key={category}>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                          {category}
                        </h4>
                        <div className="space-y-2 pl-4">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(
                                  permission.id,
                                )}
                                onCheckedChange={() =>
                                  handlePermissionToggle(permission.id)
                                }
                              />
                              <Label
                                htmlFor={permission.id}
                                className="text-sm"
                              >
                                {permission.name}
                                <span className="text-xs text-muted-foreground block">
                                  {permission.description}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-fac-orange-500 hover:bg-fac-orange-600"
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white",
                        getRoleColor(user.role),
                      )}
                    >
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.fullName}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={cn("text-xs", getRoleColor(user.role))}>
                        {user.role.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(user.status))}
                      >
                        {user.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.role !== "superadmin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Permissions:</strong> {user.permissions.length}{" "}
                  assigned
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tab Access:</strong>{" "}
                  {user.permissions.filter(p => p.startsWith('tab.')).length} tabs
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Created:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.permissions.filter(p => p.startsWith('tab.')).slice(0, 3).map(tabPerm => {
                    const tabName = DEFAULT_PERMISSIONS.find(p => p.id === tabPerm)?.name || tabPerm;
                    return (
                      <Badge key={tabPerm} variant="outline" className="text-xs">
                        {tabName.replace(" Tab", "")}
                      </Badge>
                    );
                  })}
                  {user.permissions.filter(p => p.startsWith('tab.')).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.permissions.filter(p => p.startsWith('tab.')).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.fullName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email (Read Only)</Label>
                <Input
                  id="editEmail"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editPassword">Change Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="editPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter new password (leave blank to keep current)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to keep the current password unchanged
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as User["status"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        {category}
                      </h4>
                      <div className="space-y-2 pl-4">
                        {permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={formData.permissions.includes(
                                permission.id,
                              )}
                              onCheckedChange={() =>
                                handlePermissionToggle(permission.id)
                              }
                            />
                            <Label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm"
                            >
                              {permission.name}
                              <span className="text-xs text-muted-foreground block">
                                {permission.description}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              className="bg-fac-orange-500 hover:bg-fac-orange-600"
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
