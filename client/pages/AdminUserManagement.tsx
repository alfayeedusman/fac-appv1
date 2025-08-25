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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Plus,
  Search,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import {
  getUserAccounts,
  createUserAccount,
  updateUserRole,
  UserAccount,
  UserRole,
  rolePermissions,
} from "@/utils/userRoles";
import { notificationManager } from "@/components/NotificationModal";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "cashier" as UserRole,
    employeeId: "",
    department: "",
    isActive: true,
  });

  const roleOptions = [
    { value: "admin", label: "Administrator", color: "red" },
    { value: "cashier", label: "Cashier", color: "blue" },
    { value: "inventory_manager", label: "Inventory Manager", color: "green" },
    { value: "customer", label: "Customer", color: "gray" },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, users]);

  const loadUsers = () => {
    setUsers(getUserAccounts());
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name) {
      notificationManager.error(
        "Missing Information",
        "Please fill required fields",
      );
      return;
    }

    // Check if email already exists
    if (users.some((u) => u.email === newUser.email)) {
      notificationManager.error(
        "Email Exists",
        "User with this email already exists",
      );
      return;
    }

    try {
      createUserAccount({
        ...newUser,
        lastLogin: undefined,
      });

      notificationManager.success(
        "User Created",
        `${newUser.name} has been added as ${newUser.role}`,
      );

      setNewUser({
        email: "",
        name: "",
        role: "cashier",
        employeeId: "",
        department: "",
        isActive: true,
      });
      setShowAddUserModal(false);
      loadUsers();
    } catch (error) {
      notificationManager.error("Error", "Failed to create user");
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    try {
      updateUserRole(userId, newRole);

      const user = users.find((u) => u.id === userId);
      notificationManager.success(
        "Role Updated",
        `${user?.name}'s role updated to ${newRole}`,
      );

      loadUsers();
    } catch (error) {
      notificationManager.error("Error", "Failed to update role");
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const option = roleOptions.find((r) => r.value === role);
    return option?.color || "gray";
  };

  const getRoleDisplay = (role: UserRole) => {
    const option = roleOptions.find((r) => r.value === role);
    return option?.label || role;
  };

  const getPermissionSummary = (role: UserRole) => {
    const permissions = rolePermissions[role] || [];
    return permissions.map((p) => p.module).join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter((u) => u.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserX className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter((u) => !u.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inactive Users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddUserModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole: UserRole) =>
                            handleRoleChange(user.id, newRole)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <Badge
                                  style={{
                                    backgroundColor: role.color,
                                    color: "white",
                                  }}
                                  className="mr-2"
                                >
                                  {role.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.employeeId || "-"}</TableCell>
                      <TableCell>{user.department || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userRole">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={newUser.employeeId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, employeeId: e.target.value })
                  }
                  placeholder="EMP001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newUser.department}
                onChange={(e) =>
                  setNewUser({ ...newUser, department: e.target.value })
                }
                placeholder="Operations"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Role Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {getPermissionSummary(newUser.role)
                  .split(", ")
                  .filter(Boolean)
                  .map((permission, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {permission}
                    </span>
                  )) || (
                  <span className="text-muted-foreground">No permissions</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
