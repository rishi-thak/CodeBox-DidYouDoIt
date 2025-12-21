import React, { useState } from 'react';
import { api, User } from '../../lib/api';
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
import { Search, Loader2, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

export function MemberManager() {
     const { toast } = useToast();
     const queryClient = useQueryClient();
     const { user } = useAuth();

     // State
     const [search, setSearch] = useState('');
     const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
     const [isDialogOpen, setIsDialogOpen] = useState(false);
     const [editingUser, setEditingUser] = useState<User | null>(null);

     // Mass Add Mode
     const [isMassMode, setIsMassMode] = useState(false);
     const [massFormData, setMassFormData] = useState<Array<{ fullName: string, email: string, role: string, groupIds: string[] }>>([]);

     // Form State (for both add and edit)
     const initialFormState = {
          fullName: '',
          email: '',
          role: 'DEVELOPER',
          groupIds: [] as string[]
     };
     const [formData, setFormData] = useState(initialFormState);

     // Queries
     const { data: users = [], isLoading: isLoadingUsers } = useQuery({
          queryKey: ['users'],
          queryFn: () => api.users.list()
     });

     const { data: groups = [] } = useQuery({
          queryKey: ['groups'],
          queryFn: () => api.groups.list()
     });

     // Mutations
     const createMutation = useMutation({
          mutationFn: api.users.create,
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               // Don't close/reset here if reusing logic, wait for loop
          },
          onError: () => toast({ title: "Error", description: "Failed to add member", variant: "destructive" })
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string; data: any }) => api.users.update(id, data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               setIsDialogOpen(false);
               resetForm();
               toast({ title: "Success", description: "Member updated successfully." });
          },
          onError: () => toast({ title: "Error", description: "Failed to update member", variant: "destructive" })
     });

     const deleteMutation = useMutation({
          mutationFn: api.users.delete,
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] });
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               setSelectedUsers([]);
               toast({ title: "Success", description: "Members deleted successfully." });
          },
          onError: () => toast({ title: "Error", description: "Failed to delete members", variant: "destructive" })
     });

     const resetForm = () => {
          setFormData(initialFormState);
          setEditingUser(null);
          setIsMassMode(false);
          setMassFormData([]);
     };

     const handleEdit = (user: User) => {
          setEditingUser(user);
          // ...
          const userGroupIds = groups
               .filter(g => g.members.includes(user.email))
               .map(g => g.id);

          setFormData({
               fullName: user.fullName,
               email: user.email,
               role: user.role,
               groupIds: userGroupIds
          });
          setIsDialogOpen(true);
     };

     // Transition to Mass Mode
     const handleAddAnother = () => {
          // If we are currently in single mode, take current input and move to mass data
          if (!isMassMode) {
               setIsMassMode(true);
               // Add current input + one new empty row
               setMassFormData([
                    { ...formData },
                    { ...initialFormState }
               ]);
          } else {
               // Already in mass mode, just add another row
               setMassFormData(prev => [...prev, { ...initialFormState }]);
          }
     };

     const updateMassRow = (index: number, field: string, value: any) => {
          const newData = [...massFormData];
          newData[index] = { ...newData[index], [field]: value };
          setMassFormData(newData);
     };

     const removeMassRow = (index: number) => {
          const newData = massFormData.filter((_, i) => i !== index);
          setMassFormData(newData);
          if (newData.length === 0) {
               // if all removed, maybe go back to single mode or keep empty one?
               // Let's keep empty one
               setMassFormData([{ ...initialFormState }]);
          }
     };

     const handleSave = async () => {
          if (editingUser) {
               // Edit Logic
               if (!formData.email || !formData.fullName) {
                    toast({ title: "Validation Error", description: "Name and Email are required", variant: "destructive" });
                    return;
               }
               const payload = {
                    fullName: formData.fullName,
                    email: formData.email,
                    role: formData.role,
                    groupIds: formData.groupIds
               };
               updateMutation.mutate({ id: editingUser.id, data: payload });
               return;
          }

          if (isMassMode) {
               // Bulk Create Logic
               const validRows = massFormData.filter(r => r.fullName && r.email);
               if (validRows.length === 0) {
                    toast({ title: "Validation Error", description: "Please enter at least one valid member.", variant: "destructive" });
                    return;
               }

               try {
                    // Create all sequentially or parallel
                    // Using Promise.all for speed
                    // We need to handle them one by one to show progress or just all at once?
                    // Let's do parallel
                    await Promise.all(validRows.map(row => api.users.create(row)));

                    queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
                    queryClient.invalidateQueries({ queryKey: ['groups', user?.email] });
                    queryClient.invalidateQueries({ queryKey: ['assignments', user?.email] });

                    setIsDialogOpen(false);
                    resetForm();
                    toast({ title: "Success", description: `Added ${validRows.length} members successfully.` });
               } catch (error) {
                    console.error(error);
                    toast({ title: "Error", description: "Failed to add some members. Please check inputs.", variant: "destructive" });
               }

          } else {
               // Single Create Logic
               if (!formData.email || !formData.fullName) {
                    toast({ title: "Validation Error", description: "Name and Email are required", variant: "destructive" });
                    return;
               }
               const payload = {
                    fullName: formData.fullName,
                    email: formData.email,
                    role: formData.role,
                    groupIds: formData.groupIds
               };

               // Manually triggering recreate of mutation logic here to close dialog properly
               // Or I can use createMutation.mutateAsync
               try {
                    await api.users.create(payload);
                    queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
                    queryClient.invalidateQueries({ queryKey: ['groups', user?.email] });
                    queryClient.invalidateQueries({ queryKey: ['assignments', user?.email] });
                    setIsDialogOpen(false);
                    resetForm();
                    toast({ title: "Success", description: "Member added successfully." });
               } catch (e) {
                    toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
               }
          }
     };

     const handleDeleteSelected = () => {
          console.log("Deleting users:", selectedUsers);
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
               deleteMutation.mutate(selectedUsers);
          }
     };

     const toggleSelectAll = (checked: boolean) => {
          if (checked) {
               setSelectedUsers(filteredUsers.map(u => u.id));
          } else {
               setSelectedUsers([]);
          }
     };

     const toggleSelectUser = (userId: string) => {
          setSelectedUsers(prev =>
               prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
          );
     };

     // Filter Logic
     const filteredUsers = React.useMemo(() => users.filter(user =>
          (user.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(search.toLowerCase())
     ), [users, search]);

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
                                   <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Member
                                   </Button>
                              </DialogTrigger>
                              <DialogContent className={isMassMode ? "max-w-4xl" : "sm:max-w-[425px]"}>
                                   <DialogHeader>
                                        <DialogTitle>{editingUser ? 'Edit Member' : (isMassMode ? 'Batch Add Members' : 'Add New Member')}</DialogTitle>
                                        <DialogDescription>
                                             {editingUser ? 'Update user details and access.' : 'Add new users to the system.'}
                                        </DialogDescription>
                                   </DialogHeader>

                                   {!isMassMode ? (
                                        // SINGLE MODE
                                        <div className="grid gap-4 py-4">
                                             <div className="grid gap-2">
                                                  <Label htmlFor="name">Full Name</Label>
                                                  <Input
                                                       id="name"
                                                       value={formData.fullName}
                                                       onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                       placeholder="e.g. John Doe"
                                                  />
                                             </div>
                                             <div className="grid gap-2">
                                                  <Label htmlFor="email">Email Address</Label>
                                                  <Input
                                                       id="email"
                                                       type="email"
                                                       value={formData.email}
                                                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                       placeholder="john@example.com"
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
                                   ) : (
                                        // MASS MODE
                                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
                                             <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                                                  <div className="col-span-3">Full Name</div>
                                                  <div className="col-span-4">Email</div>
                                                  <div className="col-span-3">Role</div>
                                                  {/* Groups suppressed in horizontal view for simplicity, OR we can add multi-select popover later. For now, let's assume default NO groups or we add a simple count */}
                                                  {/* Actually, user didn't explicitly ask for groups column, but it's part of member data. */}
                                                  {/* Let's skip groups in mass mode for MVP horizontal layout to fit inputs */}
                                                  <div className="col-span-2"></div>
                                             </div>
                                             {massFormData.map((row, index) => (
                                                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                                       <div className="col-span-3">
                                                            <Input
                                                                 placeholder="Name"
                                                                 value={row.fullName}
                                                                 onChange={e => updateMassRow(index, 'fullName', e.target.value)}
                                                            />
                                                       </div>
                                                       <div className="col-span-4">
                                                            <Input
                                                                 placeholder="Email"
                                                                 value={row.email}
                                                                 onChange={e => updateMassRow(index, 'email', e.target.value)}
                                                            />
                                                       </div>
                                                       <div className="col-span-3">
                                                            <Select value={row.role} onValueChange={(val) => updateMassRow(index, 'role', val)}>
                                                                 <SelectTrigger>
                                                                      <SelectValue placeholder="Role" />
                                                                 </SelectTrigger>
                                                                 <SelectContent>
                                                                      <SelectItem value="DEVELOPER">Developer</SelectItem>
                                                                      <SelectItem value="TECH_LEAD">Tech Lead</SelectItem>
                                                                      <SelectItem value="PRODUCT_MANAGER">Product Manager</SelectItem>
                                                                      <SelectItem value="BOARD_ADMIN">Board Admin</SelectItem>
                                                                 </SelectContent>
                                                            </Select>
                                                       </div>
                                                       <div className="col-span-2 flex items-center justify-end">
                                                            <Button variant="ghost" size="icon" onClick={() => removeMassRow(index)} tabIndex={-1}>
                                                                 <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                            </Button>
                                                       </div>
                                                  </div>
                                             ))}

                                        </div>
                                   )}

                                   <div className="flex items-center justify-between w-full mt-6 pt-2 border-t">
                                        <Button
                                             type="button"
                                             variant="secondary"
                                             onClick={handleAddAnother}
                                             className={editingUser ? "hidden" : ""}
                                        >
                                             <Plus className="mr-2 h-4 w-4" />
                                             {isMassMode ? "Add Row" : "Add Another"}
                                        </Button>

                                        <Button
                                             onClick={() => handleSave()}
                                             disabled={createMutation.isPending || updateMutation.isPending}
                                        >
                                             {createMutation.isPending || updateMutation.isPending ? (
                                                  <>
                                                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                       Saving...
                                                  </>
                                             ) : (
                                                  isMassMode ? `Save All (${massFormData.filter(r => r.fullName).length})` : "Save Changes"
                                             )}
                                        </Button>
                                   </div>
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

                    {/* Desktop View - Table */}
                    <div className="hidden md:block rounded-md border">
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
                                             const userGroups = groups.filter(g => g.members?.includes(user.email)).map(g => g.name);

                                             return (
                                                  <TableRow key={user.id}>
                                                       <TableCell>
                                                            <Checkbox
                                                                 checked={selectedUsers.includes(user.id)}
                                                                 onCheckedChange={() => toggleSelectUser(user.id)}
                                                            />
                                                       </TableCell>
                                                       <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
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

                    {/* Mobile View - Card List */}
                    <div className="md:hidden space-y-4">
                         {isLoadingUsers ? (
                              <div className="text-center py-8">
                                   <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                              </div>
                         ) : filteredUsers.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                   No members found
                              </div>
                         ) : (
                              filteredUsers.map((user) => {
                                   const userGroups = groups.filter(g => g.members?.includes(user.email)).map(g => g.name);
                                   const isSelected = selectedUsers.includes(user.id);

                                   return (
                                        <div key={user.id} className={`p-4 rounded-xl border bg-card transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                             <div className="flex items-start justify-between mb-3">
                                                  <div className="flex items-center gap-3">
                                                       <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleSelectUser(user.id)}
                                                       />
                                                       <div className="flex flex-col">
                                                            <span className="font-semibold text-base">{user.fullName || 'N/A'}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                       </div>
                                                  </div>
                                                  <Button
                                                       variant="ghost"
                                                       size="icon"
                                                       className="h-8 w-8"
                                                       onClick={() => handleEdit(user)}
                                                  >
                                                       <Pencil className="h-4 w-4" />
                                                  </Button>
                                             </div>

                                             <div className="pl-7 space-y-3">
                                                  <div className="flex items-center gap-2">
                                                       <span className={
                                                            `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ` +
                                                            (user.role === 'BOARD_ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground')
                                                       }>
                                                            {user.role}
                                                       </span>
                                                  </div>

                                                  <div>
                                                       <span className="text-xs text-muted-foreground block mb-1">Groups</span>
                                                       <div className="flex flex-wrap gap-1">
                                                            {userGroups.length > 0 ? (
                                                                 userGroups.map(g => (
                                                                      <span key={g} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-muted/50">
                                                                           {g}
                                                                      </span>
                                                                 ))
                                                            ) : (
                                                                 <span className="text-muted-foreground text-xs italic">No groups assigned</span>
                                                            )}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   );
                              })
                         )}
                    </div>
               </CardContent>
          </Card>
     );
}
