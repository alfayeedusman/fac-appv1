import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MapPin,
  Activity,
  Clock,
  Star,
  CheckCircle,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Shield,
  User
} from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'available' | 'on_break';
  rating: number;
  location?: {
    lat: number;
    lng: number;
    lastUpdate: string;
  };
  stats: {
    completedJobs: number;
    totalAssignments: number;
    averageRating: number;
    totalWorkHours: number;
  };
  joinedAt: string;
  role: 'member' | 'leader' | 'supervisor';
}

interface CrewGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  leaderId?: string;
  members: CrewMember[];
  maxMembers: number;
  settings: {
    autoAssign: boolean;
    workingHours: {
      start: string;
      end: string;
    };
    serviceAreas: string[];
  };
  stats: {
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    totalRevenue: number;
  };
}

interface CrewGroupManagementProps {
  onGroupSelect?: (group: CrewGroup | null) => void;
  selectedGroupId?: string;
}

const GROUP_COLORS = [
  { name: 'Blue', value: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-300' },
  { name: 'Green', value: 'green', bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-300' },
  { name: 'Purple', value: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-800', borderClass: 'border-purple-300' },
  { name: 'Orange', value: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-800', borderClass: 'border-orange-300' },
  { name: 'Red', value: 'red', bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-300' },
  { name: 'Yellow', value: 'yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', borderClass: 'border-yellow-300' },
  { name: 'Indigo', value: 'indigo', bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', borderClass: 'border-indigo-300' },
  { name: 'Pink', value: 'pink', bgClass: 'bg-pink-100', textClass: 'text-pink-800', borderClass: 'border-pink-300' }
];

export default function CrewGroupManagement({ onGroupSelect, selectedGroupId }: CrewGroupManagementProps) {
  const [groups, setGroups] = useState<CrewGroup[]>([]);
  const [availableCrew, setAvailableCrew] = useState<CrewMember[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CrewGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<CrewGroup>>({
    name: '',
    description: '',
    color: 'blue',
    maxMembers: 4,
    settings: {
      autoAssign: true,
      workingHours: { start: '08:00', end: '18:00' },
      serviceAreas: []
    }
  });

  // Mock data generation
  const generateMockData = (): { groups: CrewGroup[], crew: CrewMember[] } => {
    const mockCrew: CrewMember[] = [];
    
    // Generate crew members
    for (let i = 1; i <= 25; i++) {
      mockCrew.push({
        id: `crew-${i}`,
        name: `Crew Member ${i}`,
        email: `crew${i}@fayeedautocare.com`,
        phone: `+63 9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        status: ['online', 'offline', 'busy', 'available', 'on_break'][Math.floor(Math.random() * 5)] as any,
        rating: 3 + Math.random() * 2,
        location: Math.random() > 0.3 ? {
          lat: 14.5995 + (Math.random() - 0.5) * 0.1,
          lng: 120.9842 + (Math.random() - 0.5) * 0.1,
          lastUpdate: new Date().toISOString()
        } : undefined,
        stats: {
          completedJobs: Math.floor(Math.random() * 100),
          totalAssignments: Math.floor(Math.random() * 120),
          averageRating: 3.5 + Math.random() * 1.5,
          totalWorkHours: Math.floor(Math.random() * 1000)
        },
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        role: i <= 5 ? 'leader' : i <= 10 ? 'supervisor' : 'member'
      });
    }

    const mockGroups: CrewGroup[] = [];
    const groupNames = ['Alpha Team', 'Beta Squad', 'Gamma Force', 'Delta Crew', 'Echo Unit'];
    
    for (let i = 0; i < 5; i++) {
      const groupMembers = mockCrew.slice(i * 4, (i + 1) * 4);
      const leader = groupMembers.find(m => m.role === 'leader') || groupMembers[0];
      
      mockGroups.push({
        id: `group-${i + 1}`,
        name: groupNames[i],
        description: `High-performance car wash team specialized in ${['premium detailing', 'express services', 'mobile washing', 'commercial accounts', 'luxury vehicles'][i]}`,
        color: GROUP_COLORS[i].value,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        leaderId: leader.id,
        members: groupMembers,
        maxMembers: 4,
        settings: {
          autoAssign: Math.random() > 0.5,
          workingHours: {
            start: ['07:00', '08:00', '09:00'][Math.floor(Math.random() * 3)],
            end: ['17:00', '18:00', '19:00'][Math.floor(Math.random() * 3)]
          },
          serviceAreas: [`Area ${i + 1}`, `Zone ${String.fromCharCode(65 + i)}`]
        },
        stats: {
          totalJobs: Math.floor(Math.random() * 500),
          completedJobs: Math.floor(Math.random() * 450),
          averageRating: 4 + Math.random(),
          totalRevenue: Math.floor(Math.random() * 500000)
        }
      });
    }

    const unassignedCrew = mockCrew.slice(20); // Last 5 crew members are unassigned
    
    return { groups: mockGroups, crew: unassignedCrew };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { groups: mockGroups, crew: mockCrew } = generateMockData();
        setGroups(mockGroups);
        setAvailableCrew(mockCrew);
        
        // Auto-select first group or selected group
        if (selectedGroupId) {
          const group = mockGroups.find(g => g.id === selectedGroupId);
          setSelectedGroup(group || null);
        } else if (mockGroups.length > 0) {
          setSelectedGroup(mockGroups[0]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load crew groups",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedGroupId]);

  const createGroup = async () => {
    if (!newGroup.name?.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    const group: CrewGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description || '',
      color: newGroup.color || 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [],
      maxMembers: newGroup.maxMembers || 4,
      settings: newGroup.settings || {
        autoAssign: true,
        workingHours: { start: '08:00', end: '18:00' },
        serviceAreas: []
      },
      stats: {
        totalJobs: 0,
        completedJobs: 0,
        averageRating: 0,
        totalRevenue: 0
      }
    };

    setGroups(prev => [...prev, group]);
    setIsCreateModalOpen(false);
    setNewGroup({
      name: '',
      description: '',
      color: 'blue',
      maxMembers: 4,
      settings: {
        autoAssign: true,
        workingHours: { start: '08:00', end: '18:00' },
        serviceAreas: []
      }
    });

    toast({
      title: "Success",
      description: `Group "${group.name}" created successfully`,
    });
  };

  const deleteGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Move members back to available crew
    setAvailableCrew(prev => [...prev, ...group.members]);
    setGroups(prev => prev.filter(g => g.id !== groupId));
    
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(groups.find(g => g.id !== groupId) || null);
    }

    toast({
      title: "Success",
      description: `Group "${group.name}" deleted successfully`,
    });
  };

  const addMemberToGroup = (groupId: string, memberId: string) => {
    const member = availableCrew.find(m => m.id === memberId);
    const group = groups.find(g => g.id === groupId);
    
    if (!member || !group) return;
    
    if (group.members.length >= group.maxMembers) {
      toast({
        title: "Error",
        description: `Group is full (max ${group.maxMembers} members)`,
        variant: "destructive",
      });
      return;
    }

    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, members: [...g.members, member] }
        : g
    ));
    
    setAvailableCrew(prev => prev.filter(m => m.id !== memberId));
    
    toast({
      title: "Success",
      description: `${member.name} added to ${group.name}`,
    });
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    const group = groups.find(g => g.id === groupId);
    const member = group?.members.find(m => m.id === memberId);
    
    if (!member || !group) return;

    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, members: g.members.filter(m => m.id !== memberId) }
        : g
    ));
    
    setAvailableCrew(prev => [...prev, member]);
    
    toast({
      title: "Success",
      description: `${member.name} removed from ${group.name}`,
    });
  };

  const setGroupLeader = (groupId: string, memberId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, leaderId: memberId }
        : g
    ));
    
    toast({
      title: "Success",
      description: "Group leader updated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'available': return 'bg-blue-500';
      case 'busy': return 'bg-orange-500';
      case 'on_break': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getColorClasses = (color: string) => {
    const colorConfig = GROUP_COLORS.find(c => c.value === color) || GROUP_COLORS[0];
    return colorConfig;
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crew groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-fac-orange-500" />
            Crew Group Management
          </h2>
          <p className="text-gray-600 mt-1">
            Organize crew members into efficient working teams
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Crew Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Describe the group's specialization or role"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupColor">Color Theme</Label>
                    <Select value={newGroup.color} onValueChange={(value) => setNewGroup({...newGroup, color: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUP_COLORS.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="maxMembers">Max Members</Label>
                    <Select value={String(newGroup.maxMembers)} onValueChange={(value) => setNewGroup({...newGroup, maxMembers: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                        <SelectItem value="5">5 members</SelectItem>
                        <SelectItem value="6">6 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createGroup}>
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Groups</p>
                <p className="text-xl font-bold">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-500 p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Assigned Crew</p>
                <p className="text-xl font-bold">{groups.reduce((acc, g) => acc + g.members.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-orange-500 p-2 rounded-lg">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Available</p>
                <p className="text-xl font-bold">{availableCrew.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Groups</p>
                <p className="text-xl font-bold">
                  {groups.filter(g => g.members.some(m => m.status === 'online' || m.status === 'busy')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Crew Groups ({filteredGroups.length})</h3>
          
          {filteredGroups.map((group) => {
            const colorClasses = getColorClasses(group.color);
            const leader = group.members.find(m => m.id === group.leaderId);
            const onlineMembers = group.members.filter(m => m.status === 'online' || m.status === 'available').length;
            
            return (
              <Card 
                key={group.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${colorClasses.borderClass} ${
                  selectedGroup?.id === group.id ? 'ring-2 ring-fac-orange-500' : ''
                }`}
                onClick={() => {
                  setSelectedGroup(group);
                  onGroupSelect?.(group);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{group.name}</h4>
                        <Badge className={`${colorClasses.bgClass} ${colorClasses.textClass}`}>
                          {group.members.length}/{group.maxMembers} members
                        </Badge>
                        {onlineMembers > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {onlineMembers} online
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {leader && (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            <span>Leader: {leader.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{group.stats.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{group.stats.completedJobs} jobs</span>
                        </div>
                      </div>
                      
                      {/* Member avatars */}
                      <div className="flex items-center gap-2 mt-3">
                        {group.members.slice(0, 4).map((member) => (
                          <div key={member.id} className="relative">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                        ))}
                        {group.members.length > 4 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">
                            +{group.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{group.name}"? All members will be moved back to the available crew list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGroup(group.id)} className="bg-red-500 hover:bg-red-600">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredGroups.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No groups match your search criteria.' : 'Create your first crew group to get started.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Group Details & Available Crew */}
        <div className="space-y-4">
          {selectedGroup ? (
            <>
              {/* Group Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getColorClasses(selectedGroup.color).bgClass}`}></div>
                    {selectedGroup.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Members:</span>
                      <p className="font-semibold">{selectedGroup.members.length}/{selectedGroup.maxMembers}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <p className="font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {selectedGroup.stats.averageRating.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jobs:</span>
                      <p className="font-semibold">{selectedGroup.stats.completedJobs}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue:</span>
                      <p className="font-semibold">₱{selectedGroup.stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Members:</span>
                    {selectedGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                          <span className="text-sm font-medium">{member.name}</span>
                          {member.id === selectedGroup.leaderId && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {member.id !== selectedGroup.leaderId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setGroupLeader(selectedGroup.id, member.id)}
                              title="Make leader"
                            >
                              <Crown className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMemberFromGroup(selectedGroup.id, member.id)}
                            title="Remove from group"
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Select a group to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Available Crew */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Available Crew ({availableCrew.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableCrew.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    {selectedGroup && selectedGroup.members.length < selectedGroup.maxMembers && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addMemberToGroup(selectedGroup.id, member.id)}
                        title="Add to group"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {availableCrew.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All crew members are assigned to groups
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
