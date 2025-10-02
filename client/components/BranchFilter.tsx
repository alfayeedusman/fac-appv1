import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Building2 } from "lucide-react";
import { neonDbClient } from "@/services/neonDatabaseService";

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  isActive: boolean;
}

interface BranchFilterProps {
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
  label?: string;
  disabled?: boolean;
  canViewAllBranches?: boolean;
  userBranch?: string | null;
}

export default function BranchFilter({
  value,
  onChange,
  showAllOption = true,
  label = "Filter by Branch",
  disabled = false,
  canViewAllBranches = false,
  userBranch = null,
}: BranchFilterProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const result = await neonDbClient.getBranches();
      if (result.success && result.branches) {
        // Filter active branches only
        const activeBranches = result.branches.filter((b: Branch) => b.isActive);
        
        // If user can't view all branches, filter to show only their branch
        if (!canViewAllBranches && userBranch) {
          const userBranchData = activeBranches.filter(
            (b: Branch) => b.name === userBranch || b.code === userBranch
          );
          setBranches(userBranchData);
          
          // Auto-select user's branch if not already selected
          if (userBranchData.length > 0 && (!value || value === 'all')) {
            onChange(userBranchData[0].name);
          }
        } else {
          setBranches(activeBranches);
        }
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading branches..." : "Select branch"} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && canViewAllBranches && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">All Branches</span>
              </div>
            </SelectItem>
          )}
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.name}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {branch.code} • {branch.city}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!canViewAllBranches && userBranch && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          You can only view bookings from your assigned branch
        </p>
      )}
    </div>
  );
}
