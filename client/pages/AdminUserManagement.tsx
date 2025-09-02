import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Trash2,
  Settings,
  Crown,
  UserPlus,
  User,
} from "lucide-react";
import { neonDbClient, User } from "@/services/neonDatabaseService";
import Swal from "sweetalert2";

// Role definitions with permissions
const roleDefinitions = {
  superadmin: {
    name: "Super Administrator",
    description: "Full system access",
    color: "bg-red-500",
    permissions: [
      'dashboard', 'customers', 'user-management', 'ads', 'packages', 
      'branches', 'analytics', 'sales', 'inventory', 'notifications',
      'cms', 'push-notifications', 'gamification', 'subscription-approval',
      'booking', 'pos', 'crew-management', 'images', 'database'
    ]
  },
  admin: {
    name: "Administrator", 
    description: "Most system features",
    color: "bg-orange-500",
    permissions: [
      'dashboard', 'customers', 'ads', 'packages', 'branches', 'analytics',
      'sales', 'inventory', 'notifications', 'cms', 'push-notifications',
      'gamification', 'subscription-approval', 'booking', 'pos', 'crew-management'
    ]
  },
  manager: {
    name: "Manager",
    description: "Operations management",
    color: "bg-blue-500", 
    permissions: [
      'dashboard', 'customers', 'booking', 'crew-management', 'inventory', 'pos', 'analytics'
    ]
  },
  cashier: {
    name: "Cashier",
    description: "POS and basic operations",
    color: "bg-green-500",
    permissions: ['dashboard', 'pos', 'customers', 'booking']
  },
  inventory_manager: {
    name: "Inventory Manager",
    description: "Inventory and supplies",
    color: "bg-purple-500",
    permissions: ['dashboard', 'inventory', 'analytics']
  },
  crew: {
    name: "Crew Member",
    description: "Field operations",
    color: "bg-gray-500",
    permissions: ['dashboard', 'booking']
  }
};

// Available features/tabs for permission assignment
const availableFeatures = [
  { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard view' },
  { id: 'customers', name: 'Customer Hub', description: 'Manage customers' },
  { id: 'user-management', name: 'User Management', description: 'Manage staff accounts' },
  { id: 'ads', name: 'Ad Studio', description: 'Advertisement management' },
  { id: 'packages', name: 'Package Studio', description: 'Service packages' },
  { id: 'branches', name: 'Branch Network', description: 'Branch management' },
  { id: 'analytics', name: 'Analytics Center', description: 'Business insights' },
  { id: 'sales', name: 'Sales Dashboard', description: 'Sales tracking' },
  { id: 'inventory', name: 'Inventory Dashboard', description: 'Stock management' },
  { id: 'notifications', name: 'Notifications', description: 'System notifications' },
  { id: 'cms', name: 'Content Management', description: 'Website content' },
  { id: 'push-notifications', name: 'Push Notifications', description: 'Send notifications' },
  { id: 'gamification', name: 'Gamification', description: 'Rewards system' },
  { id: 'subscription-approval', name: 'Subscription Approval', description: 'Approve subscriptions' },
  { id: 'booking', name: 'Booking Hub', description: 'Booking management' },
  { id: 'pos', name: 'Point of Sale', description: 'POS system' },
  { id: 'crew-management', name: 'Crew Management', description: 'Staff operations' },
  { id: 'images', name: 'Image Manager', description: 'Media management' },
  { id: 'database', name: 'Database Management', description: 'System database' },
];

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "",
    contactNumber: "",
    branchLocation: "",
    permissions: [] as string[]
  });

  // Load staff users
  const loadStaffUsers = async () => {
    try {
      setLoading(true);
      console.log('👨‍💼 Loading staff users...');
      const result = await neonDbClient.getStaffUsers();
      
      if (result.success && result.users) {
        console.log('✅ Staff users loaded:', result.users);
        setUsers(result.users);
      } else {
        console.warn('⚠️ Failed to load staff users');
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error loading staff users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffUsers();
  }, []);

  // Handle role change and auto-set permissions
  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({
      ...prev,
      role,
      permissions: roleDefinitions[role as keyof typeof roleDefinitions]?.permissions || []
    }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (featureId: string, checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, featureId]
        : prev.permissions.filter(p => p !== featureId)
    }));
  };

  // Create new staff user
  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.role) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    try {
      const result = await neonDbClient.createStaffUser(newUser);
      
      if (result.success) {
        await Swal.fire({
          title: 'User Created!',
          text: `${newUser.fullName} has been added as ${roleDefinitions[newUser.role as keyof typeof roleDefinitions]?.name}`,
          icon: 'success',
          confirmButtonColor: '#f97316'
        });
        
        setIsAddModalOpen(false);
        setNewUser({
          fullName: "",
          email: "",
          role: "",
          contactNumber: "",
          branchLocation: "",
          permissions: []
        });
        loadStaffUsers(); // Refresh list
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to create user. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleInfo = roleDefinitions[role as keyof typeof roleDefinitions];
    return (
      <Badge className={`${roleInfo?.color || 'bg-gray-500'} text-white font-bold`}>
        {roleInfo?.name || role}
      </Badge>
    );
  };

  const getPermissionCount = (role: string) => {
    const roleInfo = roleDefinitions[role as keyof typeof roleDefinitions];
    return roleInfo?.permissions.length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="gradient-primary p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-foreground">
                  User Management
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage staff accounts and permissions
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-futuristic font-bold py-3 px-6 rounded-xl"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Staff User
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="glass border-border shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Staff Members ({filteredUsers.length})</span>
            <Button
              onClick={loadStaffUsers}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading staff users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm">Add your first staff member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-fac-orange-500 to-red-500 p-2 rounded-full">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.contactNumber && (
                              <p className="text-xs text-muted-foreground">{user.contactNumber}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {getPermissionCount(user.role)} features
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.branchLocation || 'All Branches'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={user.isActive 
                            ? "bg-green-500 text-white" 
                            : "bg-red-500 text-white"
                          }
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            title="Edit Permissions"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-fac-orange-500" />
              <span>Add New Staff Member</span>
            </DialogTitle>
            <DialogDescription>
              Create a new staff account and assign role-based permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newUser.contactNumber}
                  onChange={(e) => setNewUser(prev => ({ ...prev, contactNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="branch">Branch Location</Label>
                <Input
                  id="branch"
                  value={newUser.branchLocation}
                  onChange={(e) => setNewUser(prev => ({ ...prev, branchLocation: e.target.value }))}
                  placeholder="Enter branch location"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={newUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleDefinitions).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newUser.role && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {roleDefinitions[newUser.role as keyof typeof roleDefinitions]?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Feature Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Select which features this user can access. Default permissions are set based on role.
              </p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={feature.id}
                      checked={newUser.permissions.includes(feature.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionToggle(feature.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor={feature.id} className="text-sm font-medium">
                        {feature.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Selected:</strong> {newUser.permissions.length} features
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
