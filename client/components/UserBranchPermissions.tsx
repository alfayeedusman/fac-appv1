import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building2, Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { User as UserType } from '@/services/neonDatabaseService';
import BranchFilter from './BranchFilter';

interface UserBranchPermissionsProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<UserType>) => Promise<void>;
}

export default function UserBranchPermissions({
  user,
  isOpen,
  onClose,
  onUpdate,
}: UserBranchPermissionsProps) {
  const [assignedBranch, setAssignedBranch] = useState(user.branchLocation || '');
  const [canViewAll, setCanViewAll] = useState(user.canViewAllBranches || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(user.id, {
        branchLocation: assignedBranch,
        canViewAllBranches: canViewAll,
      });

      toast({
        title: "Permissions Updated",
        description: `Branch permissions for ${user.fullName} have been updated successfully.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-fac-orange-500" />
            Branch Access Permissions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                Role: {user.role}
              </p>
            </div>
          </div>

          {/* Assigned Branch */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Assigned Branch
            </Label>
            <BranchFilter
              value={assignedBranch}
              onChange={setAssignedBranch}
              showAllOption={false}
              canViewAllBranches={true}
              label=""
            />
            <p className="text-xs text-muted-foreground">
              This is the user's primary branch location
            </p>
          </div>

          {/* View All Branches Permission */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  View All Branches
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow this user to view bookings from all branches
                </p>
              </div>
              <Switch
                checked={canViewAll}
                onCheckedChange={setCanViewAll}
              />
            </div>
          </div>

          {/* Warning */}
          {user.role !== 'admin' && user.role !== 'superadmin' && canViewAll && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Cross-Branch Access
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This {user.role} will be able to see bookings, sales, and analytics from all branches.
                </p>
              </div>
            </div>
          )}

          {/* Info for Admin/Superadmin */}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {user.role === 'superadmin' ? 'Super Admins' : 'Admins'} always have access to all branches by default.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !assignedBranch}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
