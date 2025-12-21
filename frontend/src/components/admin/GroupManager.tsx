import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Group } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Plus, Trash2, Pencil, Users, X, Search, ChevronDown } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { CohortManager } from './CohortManager';
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from '../ui/use-toast';
import {
     AlertDialog,
     AlertDialogAction,
     AlertDialogCancel,
     AlertDialogContent,
     AlertDialogDescription,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogTitle,
     AlertDialogTrigger,
} from "../ui/alert-dialog";

interface Props {
     groups: Group[];
}

export function GroupManager({ groups }: Props) {
     const { user } = useAuth();
     const { toast } = useToast();
     const queryClient = useQueryClient();
     const [isOpen, setIsOpen] = useState(false);
     const [editingId, setEditingId] = useState<string | null>(null);
     const [memberSearch, setMemberSearch] = useState('');

     const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
     const [searchQuery, setSearchQuery] = useState('');
     const [showArchived, setShowArchived] = useState(false);
     const [isDetailedView, setIsDetailedView] = useState(false);

     // Form State
     const [formData, setFormData] = useState<Partial<Group>>({
          name: '',
          description: '',
          members: []
     });

     const resetForm = () => {
          setFormData({
               name: '',
               description: '',
               members: []
          });
          setEditingId(null);
          setMemberSearch('');
     };

     const handleEdit = (group: Group) => {
          setFormData(group);
          setEditingId(group.id);
          setIsOpen(true);
     };

     const createMutation = useMutation({
          mutationFn: (data: any) => api.groups.create(data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               setIsOpen(false);
               resetForm();
               toast({ title: "Success", description: "Group created successfully." });
          }
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string, data: any }) => api.groups.update(id, data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               setIsOpen(false);
               resetForm();
               toast({ title: "Success", description: "Group updated successfully." });
          }
     });

     // Helper for Archiving
     const archiveMutation = useMutation({
          mutationFn: ({ id, status }: { id: string, status: 'ACTIVE' | 'ARCHIVED' }) => api.groups.update(id, { status }),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               toast({ title: "Success", description: "Group status updated." });
          }
     });

     const deleteMutation = useMutation({
          mutationFn: api.groups.delete,
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               setSelectedGroups([]);
               toast({ title: "Success", description: "Group(s) deleted successfully." });
          }
     });

     const handleSubmit = () => {
          if (!formData.name) return;
          if (editingId) {
               updateMutation.mutate({ id: editingId, data: formData });
          } else {
               createMutation.mutate(formData);
          }
     };

     const { data: cohorts = [] } = useQuery({
          queryKey: ['cohorts'],
          queryFn: () => api.cohorts.list()
     });


     const { data: users = [] } = useQuery({
          queryKey: ['users'],
          queryFn: () => api.users.list()
     });

     const addMember = (email: string) => {
          if (!formData.members?.includes(email)) {
               setFormData(prev => ({ ...prev, members: [...(prev.members || []), email] }));
               setMemberSearch('');
          }
     };

     const removeMember = (email: string) => {
          setFormData(prev => ({ ...prev, members: (prev.members || []).filter(m => m !== email) }));
     };

     const toggleSelectAll = () => {
          if (selectedGroups.length === groups.length) {
               setSelectedGroups([]);
          } else {
               setSelectedGroups(groups.map(g => g.id));
          }
     };

     const toggleSelectGroup = (id: string) => {
          if (selectedGroups.includes(id)) {
               setSelectedGroups(selectedGroups.filter(sid => sid !== id));
          } else {
               setSelectedGroups([...selectedGroups, id]);
          }
     };

     const handleBulkStatus = async (status: 'ACTIVE' | 'ARCHIVED') => {
          if (!selectedGroups.length) return;
          try {
               await Promise.all(selectedGroups.map(id => api.groups.update(id, { status })));
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               toast({ title: "Success", description: `Updated ${selectedGroups.length} groups to ${status}` });
               setSelectedGroups([]);
          } catch (error) {
               toast({ title: "Error", description: "Failed to update groups", variant: "destructive" });
          }
     };

     const handleDeleteSelected = () => {
          if (window.confirm(`Delete ${selectedGroups.length} groups?`)) {
               selectedGroups.forEach(id => deleteMutation.mutate(id));
          }
     };

     const filteredGroups = groups.filter(g =>
          (g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               g.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (showArchived ? true : g.status !== 'ARCHIVED')
     );

     return (
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                         <Search className="text-muted-foreground" size={18} />
                         <Input
                              placeholder="Search groups..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full"
                         />
                    </div>
                    <div className="flex items-center gap-4">
                         {isDetailedView && (
                              <div className="flex items-center space-x-2">
                                   <Checkbox id="showArchived" checked={showArchived} onCheckedChange={(c) => setShowArchived(!!c)} />
                                   <Label htmlFor="showArchived">Show Archived</Label>
                              </div>
                         )}

                         <div className="flex items-center space-x-2 bg-muted/50 p-1.5 rounded-lg border">
                              <Switch
                                   checked={isDetailedView}
                                   onCheckedChange={setIsDetailedView}
                                   id="detailed-view-groups"
                              />
                              <Label htmlFor="detailed-view-groups" className="text-sm font-medium cursor-pointer">
                                   Detailed View
                              </Label>
                         </div>

                         <div className="flex gap-2">
                              {selectedGroups.length > 0 && (
                                   isDetailedView ? (
                                        <DropdownMenu>
                                             <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" size="sm">
                                                       Bulk Actions ({selectedGroups.length}) <ChevronDown className="ml-2 h-4 w-4" />
                                                  </Button>
                                             </DropdownMenuTrigger>
                                             <DropdownMenuContent align="end">
                                                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem onClick={() => handleBulkStatus('ACTIVE')}>Make Active</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleBulkStatus('ARCHIVED')}>Archive</DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem onClick={handleDeleteSelected} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                       <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                                                  </DropdownMenuItem>
                                             </DropdownMenuContent>
                                        </DropdownMenu>
                                   ) : (
                                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                                             <Trash2 size={16} className="mr-2" /> {deleteMutation.isPending ? 'Deleting...' : `Delete (${selectedGroups.length})`}
                                        </Button>
                                   )
                              )}

                              <CohortManager />

                              <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                                   <DialogTrigger asChild>
                                        <Button className="gap-2 px-4 h-9 shadow-sm">
                                             <Plus size={16} /> <span className="md:hidden">Group</span><span className="hidden md:inline">New Group</span>
                                        </Button>
                                   </DialogTrigger>
                                   <DialogContent className="max-w-xl">
                                        <DialogHeader>
                                             <DialogTitle>{editingId ? 'Edit Group' : 'Create Group'}</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                             <div className="grid gap-2">
                                                  <Label htmlFor="name">Group Name</Label>
                                                  <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Engineering Team" />
                                             </div>
                                             <div className="grid gap-2">
                                                  <Label htmlFor="desc">Description</Label>
                                                  <Textarea id="desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description..." />
                                             </div>

                                             <div className="grid gap-2">
                                                  <Label>Add Members</Label>
                                                  <div className="relative">
                                                       <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                       <Input
                                                            value={memberSearch}
                                                            onChange={e => setMemberSearch(e.target.value)}
                                                            placeholder="Search users to add..."
                                                            className="pl-8"
                                                       />
                                                  </div>

                                                  {memberSearch && (
                                                       <div className="border rounded-md max-h-40 overflow-y-auto p-1 bg-background shadow-sm">
                                                            {users
                                                                 .filter(u =>
                                                                      !formData.members?.includes(u.email) &&
                                                                      (u.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.includes(memberSearch.toLowerCase()))
                                                                 )
                                                                 .map(u => (
                                                                      <div key={u.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-sm cursor-pointer" onClick={() => addMember(u.email)}>
                                                                           <div className="flex flex-col">
                                                                                <span className="text-sm font-medium">{u.fullName}</span>
                                                                                <span className="text-xs text-muted-foreground">{u.email}</span>
                                                                           </div>
                                                                           <Button type="button" size="icon" variant="ghost" className="h-6 w-6"><Plus size={14} /></Button>
                                                                      </div>
                                                                 ))
                                                            }
                                                            {users.length > 0 && users.filter(u => !formData.members?.includes(u.email) && (u.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.includes(memberSearch.toLowerCase()))).length === 0 && (
                                                                 <p className="text-xs text-muted-foreground p-2 text-center">No matching users found.</p>
                                                            )}
                                                       </div>
                                                  )}

                                                  <Label className="mt-2">Selected Members</Label>
                                                  <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[60px] bg-muted/20">
                                                       {formData.members?.map(email => (
                                                            <Badge key={email} variant="secondary" className="pl-2 pr-1 gap-1">
                                                                 {email}
                                                                 <button onClick={() => removeMember(email)} className="hover:text-destructive"><X size={14} /></button>
                                                            </Badge>
                                                       ))}
                                                       {(!formData.members || formData.members.length === 0) && <span className="text-muted-foreground text-sm p-1">No members added.</span>}
                                                  </div>
                                             </div>

                                             <div className="grid gap-2">
                                                  <Label htmlFor="cohort">Cohort</Label>
                                                  <div className="flex gap-2 items-end">
                                                       <div className="w-full">
                                                            <Select
                                                                 value={formData.cohortId || 'none'}
                                                                 onValueChange={(val) => setFormData({ ...formData, cohortId: val === 'none' ? undefined : val })}
                                                            >
                                                                 <SelectTrigger className="w-full">
                                                                      <SelectValue placeholder="Select Cohort (Active Only)" />
                                                                 </SelectTrigger>
                                                                 <SelectContent>
                                                                      <SelectItem value="none">No Cohort</SelectItem>
                                                                      {cohorts.filter(c => c.isActive).map(c => (
                                                                           <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                                      ))}
                                                                 </SelectContent>
                                                            </Select>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                        <DialogFooter>
                                             <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                                                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Group')}
                                             </Button>
                                        </DialogFooter>
                                   </DialogContent>
                              </Dialog>
                         </div>
                    </div>
               </div>

               <div className="hidden md:block rounded-md border">
                    <Table>
                         <TableHeader>
                              <TableRow>
                                   <TableHead className="w-[50px]">
                                        <Checkbox
                                             checked={groups.length > 0 && selectedGroups.length === groups.length}
                                             onCheckedChange={toggleSelectAll}
                                        />
                                   </TableHead>
                                   <TableHead>Group Name</TableHead>
                                   <TableHead>Description</TableHead>
                                   {isDetailedView && <TableHead>Cohort</TableHead>}
                                   {isDetailedView && <TableHead>Status</TableHead>}
                                   <TableHead>Members</TableHead>
                                   <TableHead>Preview</TableHead>
                                   <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {filteredGroups.map((group) => {
                                   const cohortName = cohorts.find(c => c.id === group.cohortId)?.name;
                                   return (
                                        <TableRow key={group.id} className={group.status === 'ARCHIVED' ? 'opacity-60 bg-muted/50' : ''}>
                                             <TableCell>
                                                  <Checkbox
                                                       checked={selectedGroups.includes(group.id)}
                                                       onCheckedChange={() => toggleSelectGroup(group.id)}
                                                  />
                                             </TableCell>
                                             <TableCell className="font-medium">
                                                  {group.name}
                                             </TableCell>
                                             <TableCell>
                                                  <span className="text-muted-foreground text-sm truncate max-w-[200px] block">{group.description || '-'}</span>
                                             </TableCell>
                                             {isDetailedView && (
                                                  <TableCell>
                                                       {cohortName ? <Badge variant="outline">{cohortName}</Badge> : '-'}
                                                  </TableCell>
                                             )}
                                             {isDetailedView && (
                                                  <TableCell>
                                                       {group.status === 'ARCHIVED' ? <Badge variant="outline">Archived</Badge> : <Badge variant="default" className="bg-green-600">Active</Badge>}
                                                  </TableCell>
                                             )}
                                             <TableCell>
                                                  <Badge variant="secondary">{group.members.length} Members</Badge>
                                             </TableCell>
                                             <TableCell>
                                                  <div className="flex flex-wrap gap-1">
                                                       {group.members.slice(0, 3).map(m => (
                                                            <Badge key={m} variant="outline" className="text-[10px] font-normal">{m.split('@')[0]}</Badge>
                                                       ))}
                                                       {group.members.length > 3 && <Badge variant="outline" className="text-[10px] text-muted-foreground">+{group.members.length - 3}</Badge>}
                                                  </div>
                                             </TableCell>
                                             <TableCell className="text-right">
                                                  <div className="flex justify-end gap-2">
                                                       <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(group)}
                                                            disabled={updateMutation.isPending || archiveMutation.isPending || deleteMutation.isPending}
                                                       >
                                                            <Pencil size={16} className="text-blue-500" />
                                                       </Button>
                                                       <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                 <Button
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      title="Delete"
                                                                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                      disabled={deleteMutation.isPending}
                                                                 >
                                                                      <Trash2 size={16} />
                                                                 </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                 <AlertDialogHeader>
                                                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                      <AlertDialogDescription>
                                                                           This action cannot be undone. This will permanently delete the group
                                                                           <span className="font-bold text-foreground"> {group.name}</span>.
                                                                      </AlertDialogDescription>
                                                                 </AlertDialogHeader>
                                                                 <AlertDialogFooter>
                                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                      <AlertDialogAction
                                                                           className="bg-red-600 hover:bg-red-700"
                                                                           onClick={() => deleteMutation.mutate(group.id)}
                                                                      >
                                                                           {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                                                      </AlertDialogAction>
                                                                 </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                       </AlertDialog>
                                                  </div>
                                             </TableCell>
                                        </TableRow>
                                   );
                              })}
                              {filteredGroups.length === 0 && (
                                   <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                             No groups found.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* Mobile View - Cards */}
               <div className="md:hidden space-y-4">
                    {filteredGroups.map(group => {
                         const isSelected = selectedGroups.includes(group.id);
                         return (
                              <div key={group.id} className={`p-4 rounded-xl border bg-card transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                   <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                             <Checkbox
                                                  checked={isSelected}
                                                  onCheckedChange={() => toggleSelectGroup(group.id)}
                                             />
                                             <div>
                                                  <h3 className="font-semibold text-base">{group.name}</h3>
                                                  <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{group.members.length} Members</Badge>
                                             </div>
                                        </div>
                                        <div className="flex gap-1">
                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(group)}>
                                                  <Pencil size={16} className="text-blue-500" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (window.confirm('Delete group?')) deleteMutation.mutate(group.id) }}>
                                                  <Trash2 size={16} className="text-destructive" />
                                             </Button>
                                        </div>
                                   </div>

                                   {group.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                             {group.description}
                                        </p>
                                   )}

                                   <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Members: </span>
                                        <div className="flex flex-wrap gap-1">
                                             {group.members.length > 0 ? (
                                                  <>
                                                       {group.members.slice(0, 3).map(m => (
                                                            <Badge key={m} variant="outline" className="text-[10px] font-normal bg-muted/50 border-border/50">
                                                                 {m.split('@')[0]}
                                                            </Badge>
                                                       ))}
                                                       {group.members.length > 3 && (
                                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">+{group.members.length - 3}</Badge>
                                                       )}
                                                  </>
                                             ) : (
                                                  <span className="text-xs text-muted-foreground italic">No members yet.</span>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         )
                    })}
                    {filteredGroups.length === 0 && (
                         <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                              No groups found.
                         </div>
                    )}
               </div>
          </div>
     );
}
