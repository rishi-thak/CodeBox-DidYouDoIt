import React, { useState, useEffect } from 'react';
import { api, User, Group } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from '../ui/table';
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from '../ui/dialog';
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Search, Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

export function MemberManager() {
     const { toast } = useToast();
     const queryClient = useQueryClient();

     // State
     const [search, setSearch] = useState('');
     const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
     const [isDialogOpen, setIsDialogOpen] = useState(false);
     const [editingUser, setEditingUser] = useState<User | null>(null);

     // Form State (for both add and edit)
     const [formData, setFormData] = useState({
          full_name: '',
          email: '',
          role: 'DEVELOPER',
          groupIds: [] as string[]
     });

     // Queries
     const { data: users = [], isLoading: isLoadingUsers } = useQuery({
          queryKey: ['users'],
          queryFn: api.users.list
     });

     const { data: groups = [] } = useQuery({
          queryKey: ['groups'],
          queryFn: api.groups.list
     });

     // Mutations
     const createMutation = useMutation({
          mutationFn: api.users.create,
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               toast({ title: 'Success', description: 'User created successfully' });
               setIsDialogOpen(false);
               resetForm();
          },
          onError: (error: any) => {
               toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string, data: any }) => api.users.update(id, data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               toast({ title: 'Success', description: 'User updated successfully' });
               setIsDialogOpen(false);
               resetForm();
          },
          onError: (error: any) => {
               toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
     });

     const deleteMutation = useMutation({
          mutationFn: api.users.delete,
          onSuccess: (data) => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               toast({ title: 'Success', description: `Deleted ${data.count} users` });
               setSelectedUsers([]);
          },
          onError: (error: any) => {
               toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
     });

     // Handlers
     const resetForm = () => {
          setFormData({ full_name: '', email: '', role: 'DEVELOPER', groupIds: [] });
          setEditingUser(null);
     };

     const handleEdit = (user: User) => {
          setEditingUser(user);
          // Determine initial groups for this user
          // Note: The backend should ideally return explicit group IDs.
          // For now, matching by email/members array as per existing frontend logic,
          // unless we updated backend to return 'groups' relation properly.
          // Let's assume frontend logic first:
          const userGroupIds = groups
               .filter(g => g.members.includes(user.email))
               .map(g => g.id);

          setFormData({
               full_name: user.full_name,
               email: user.email,
               role: user.role,
               groupIds: userGroupIds
          });
          setIsDialogOpen(true);
     };

     const handleSave = () => {
          // Validation
          if (!formData.email || !formData.full_name) {
               toast({ title: "Validation Error", description: "Name and Email are required", variant: "destructive" });
               return;
          }

          const payload = {
               fullName: formData.full_name,
               email: formData.email,
               role: formData.role,
               groupIds: formData.groupIds
          };

          if (editingUser) {
               updateMutation.mutate({ id: editingUser.id, data: payload });
          } else {
               createMutation.mutate(payload);
          }
     };

     const handleDeleteSelected = () => {
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
               deleteMutation.mutate(selectedUsers);
          }
     };

     const toggleSelectAll = () => {
          if (selectedUsers.length === filteredUsers.length) {
               setSelectedUsers([]);
          } else {
               setSelectedUsers(filteredUsers.map(u => u.id));
          }
     };

     const toggleSelectUser = (id: string) => {
          if (selectedUsers.includes(id)) {
               setSelectedUsers(selectedUsers.filter(uid => uid !== id));
          } else {
               setSelectedUsers([...selectedUsers, id]);
          }
     };

     // Filter Logic
     const filteredUsers = users.filter(user =>
          user.full_name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
     );

     const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;

     return (
          <Card className="col-span-1 md:col-span-2">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                         <CardTitle>Member Management</CardTitle>
                         <CardDescription>Manage your team members and their permissions.</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                         {selectedUsers.length > 0 && (
                              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                                   <Trash2 className="mr-2 h-4 w-4" />
                                   Delete ({selectedUsers.length})
                              </Button>
                         )}
                         <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                              <DialogTrigger asChild>
                                   <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Member
                                   </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                   <DialogHeader>
                                        <DialogTitle>{editingUser ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                                        <DialogDescription>
                                             {editingUser ? 'Update user details and access.' : 'Add a new user to the system.'}
                                        </DialogDescription>
                                   </DialogHeader>
                                   <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                             <Label htmlFor="name">Full Name</Label>
                                             <Input
                                                  id="name"
                                                  value={formData.full_name}
                                                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                             />
                                        </div>
                                        <div className="grid gap-2">
                                             <Label htmlFor="email">Email Address</Label>
                                             <Input
                                                  id="email"
                                                  type="email"
                                                  value={formData.email}
                                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                             />
                                        </div>
                                        <div className="grid gap-2">
                                             <Label htmlFor="role">Role</Label>
                                             <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                                  <SelectTrigger>
                                                       <SelectValue placeholder="Select a role" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       <SelectItem value="DEVELOPER">Developer</SelectItem>
                                                       <SelectItem value="TECH_LEAD">Tech Lead</SelectItem>
                                                       <SelectItem value="PRODUCT_MANAGER">Product Manager</SelectItem>
                                                       <SelectItem value="BOARD_ADMIN">Board Admin</SelectItem>
                                                  </SelectContent>
                                             </Select>
                                        </div>
                                        <div className="grid gap-2">
                                             <Label>Assign Groups</Label>
                                             <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                                                  {groups.map((group) => (
                                                       <div key={group.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                 id={`grp-${group.id}`}
                                                                 checked={formData.groupIds.includes(group.id)}
                                                                 onCheckedChange={(checked) => {
                                                                      if (checked) {
                                                                           setFormData(prev => ({ ...prev, groupIds: [...prev.groupIds, group.id] }));
                                                                      } else {
                                                                           setFormData(prev => ({ ...prev, groupIds: prev.groupIds.filter(id => id !== group.id) }));
                                                                      }
                                                                 }}
                                                            />
                                                            <Label htmlFor={`grp-${group.id}`} className="text-sm font-normal cursor-pointer">
                                                                 {group.name}
                                                            </Label>
                                                       </div>
                                                  ))}
                                                  {groups.length === 0 && <span className="text-xs text-muted-foreground">No groups available</span>}
                                             </div>
                                        </div>
                                   </div>
                                   <DialogFooter>
                                        <Button type="submit" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                                             {createMutation.isPending || updateMutation.isPending ? (
                                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                             ) : null}
                                             Save Changes
                                        </Button>
                                   </DialogFooter>
                              </DialogContent>
                         </Dialog>
                    </div>
               </CardHeader>
               <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                         <div className="relative flex-1">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                   placeholder="Search members..."
                                   className="pl-8"
                                   value={search}
                                   onChange={(e) => setSearch(e.target.value)}
                              />
                         </div>
                    </div>

                    <div className="rounded-md border">
                         <Table>
                              <TableHeader>
                                   <TableRow>
                                        <TableHead className="w-[50px]">
                                             <Checkbox
                                                  checked={isAllSelected}
                                                  onCheckedChange={toggleSelectAll}
                                             />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Groups</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                   </TableRow>
                              </TableHeader>
                              <TableBody>
                                   {isLoadingUsers ? (
                                        <TableRow>
                                             <TableCell colSpan={6} className="text-center py-8">
                                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                             </TableCell>
                                        </TableRow>
                                   ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                             <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                  No members found
                                             </TableCell>
                                        </TableRow>
                                   ) : (
                                        filteredUsers.map((user) => {
                                             // Logic to find groups for this user (relying on group.members array from frontend)
                                             // Or if backend returns user.groups, we could use that. Let's stick to consistent logic.
                                             const userGroups = groups.filter(g => g.members?.includes(user.email)).map(g => g.name);

                                             return (
                                                  <TableRow key={user.id}>
                                                       <TableCell>
                                                            <Checkbox
                                                                 checked={selectedUsers.includes(user.id)}
                                                                 onCheckedChange={() => toggleSelectUser(user.id)}
                                                            />
                                                       </TableCell>
                                                       <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                                                       <TableCell>{user.email}</TableCell>
                                                       <TableCell>
                                                            <span className={
                                                                 `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ` +
                                                                 (user.role === 'BOARD_ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')
                                                            }>
                                                                 {user.role}
                                                            </span>
                                                       </TableCell>
                                                       <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                 {userGroups.length > 0 ? (
                                                                      userGroups.slice(0, 3).map(g => (
                                                                           <span key={g} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-foreground bg-muted">
                                                                                {g}
                                                                           </span>
                                                                      ))
                                                                 ) : (
                                                                      <span className="text-muted-foreground text-xs italic">No groups</span>
                                                                 )}
                                                                 {userGroups.length > 3 && (
                                                                      <span className="text-xs text-muted-foreground">+{userGroups.length - 3}</span>
                                                                 )}
                                                            </div>
                                                       </TableCell>
                                                       <TableCell className="text-right">
                                                            <Button
                                                                 variant="ghost"
                                                                 size="icon"
                                                                 onClick={() => handleEdit(user)}
                                                            >
                                                                 <Pencil className="h-4 w-4" />
                                                            </Button>
                                                       </TableCell>
                                                  </TableRow>
                                             );
                                        })
                                   )}
                              </TableBody>
                         </Table>
                    </div>
               </CardContent>
          </Card>
     );
}
