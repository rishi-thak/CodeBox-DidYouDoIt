import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Assignment, Group } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Plus, Trash2, Pencil, ExternalLink, Play, FileText, Link as LinkIcon, Calendar, Search, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatsDialog } from './StatsDialog';
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "../ui/table";

interface Props {
     assignments: Assignment[];
     groups: Group[];
}

export function AssignmentManager({ assignments, groups }: Props) {
     const queryClient = useQueryClient();
     const [isOpen, setIsOpen] = useState(false);
     const [editingId, setEditingId] = useState<string | null>(null);
     const [statsId, setStatsId] = useState<string | null>(null);

     // Form State
     const [formData, setFormData] = useState<Partial<Assignment>>({
          title: '',
          description: '',
          type: 'VIDEO',
          contentUrl: '',
          groupIds: [],
          dueDate: ''
     });

     const resetForm = () => {
          setFormData({
               title: '',
               description: '',
               type: 'VIDEO',
               contentUrl: '',
               groupIds: [],
               dueDate: ''
          });
          setEditingId(null);
     };

     const handleEdit = (assignment: Assignment) => {
          setFormData(assignment);
          setEditingId(assignment.id);
          setIsOpen(true);
     };

     const createMutation = useMutation({
          mutationFn: (data: any) => api.assignments.create(data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               setIsOpen(false);
               resetForm();
          }
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string, data: any }) => api.assignments.update(id, data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['assignments'] });
               setIsOpen(false);
               resetForm();
          }
     });

     const deleteMutation = useMutation({
          mutationFn: api.assignments.delete,
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
     });

     const handleSubmit = () => {
          if (!formData.title || !formData.contentUrl) return; // Basic validation

          if (editingId) {
               updateMutation.mutate({ id: editingId, data: formData });
          } else {
               createMutation.mutate(formData);
          }
     };

     const toggleGroupSelection = (groupId: string) => {
          setFormData(prev => {
               const current = prev.groupIds || [];
               if (current.includes(groupId)) {
                    return { ...prev, groupIds: current.filter(id => id !== groupId) };
               } else {
                    return { ...prev, groupIds: [...current, groupId] };
               }
          });
     };

     const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
     const [searchQuery, setSearchQuery] = useState('');

     const toggleSelectAll = () => {
          if (selectedAssignments.length === assignments.length) {
               setSelectedAssignments([]);
          } else {
               setSelectedAssignments(assignments.map(a => a.id));
          }
     };

     const toggleSelectAssignment = (id: string) => {
          if (selectedAssignments.includes(id)) {
               setSelectedAssignments(selectedAssignments.filter(sid => sid !== id));
          } else {
               setSelectedAssignments([...selectedAssignments, id]);
          }
     };

     const filteredAssignments = assignments.filter(a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
     );

     return (
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                         <Search className="text-muted-foreground" size={18} />
                         <Input
                              placeholder="Search assignments..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full"
                         />
                    </div>
                    <div className="flex gap-2">
                         {selectedAssignments.length > 0 && (
                              <Button variant="destructive" size="sm" onClick={() => {
                                   if (window.confirm(`Delete ${selectedAssignments.length} assignments?`)) {
                                        selectedAssignments.forEach(id => deleteMutation.mutate(id));
                                        setSelectedAssignments([]);
                                   }
                              }}>
                                   <Trash2 size={16} className="mr-2" /> {deleteMutation.isPending ? 'Deleting...' : `Delete Selected (${selectedAssignments.length})`}
                              </Button>
                         )}
                         <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                              <DialogTrigger asChild>
                                   <Button className="gap-2">
                                        <Plus size={16} /> New Assignment
                                   </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xl">
                                   <DialogHeader>
                                        <DialogTitle>{editingId ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
                                   </DialogHeader>
                                   <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                             <Label htmlFor="title">Title</Label>
                                             <Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. React Hooks" />
                                        </div>
                                        <div className="grid gap-2">
                                             <Label htmlFor="desc">Description</Label>
                                             <Textarea id="desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description..." />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="grid gap-2">
                                                  <Label>Type</Label>
                                                  <Select value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })}>
                                                       <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                            <SelectItem value="VIDEO">Video</SelectItem>
                                                            <SelectItem value="PDF">PDF</SelectItem>
                                                            <SelectItem value="LINK">Link</SelectItem>
                                                            <SelectItem value="DOCUMENT">Document</SelectItem>
                                                       </SelectContent>
                                                  </Select>
                                             </div>
                                             <div className="grid gap-2">
                                                  <Label htmlFor="date">Due Date (Optional)</Label>
                                                  <Input type="date" id="date" value={formData.dueDate ? new Date(formData.dueDate!).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                             </div>
                                        </div>

                                        <div className="grid gap-2">
                                             <Label htmlFor="url">Content URL</Label>
                                             <Input id="url" value={formData.contentUrl} onChange={e => setFormData({ ...formData, contentUrl: e.target.value })} placeholder="https://..." />
                                        </div>

                                        <div className="grid gap-2">
                                             <Label className="mb-2">Assign to Groups</Label>
                                             <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                                  {groups.map(group => (
                                                       <div key={group.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                 id={`grp-${group.id}`}
                                                                 checked={(formData.groupIds || []).includes(group.id)}
                                                                 onCheckedChange={() => toggleGroupSelection(group.id)}
                                                            />
                                                            <Label htmlFor={`grp-${group.id}`} className="font-normal cursor-pointer">{group.name}</Label>
                                                       </div>
                                                  ))}
                                                  {groups.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No groups available.</p>}
                                             </div>
                                             <p className="text-xs text-muted-foreground">Leave empty to assign to everyone.</p>
                                        </div>
                                   </div>
                                   <DialogFooter>
                                        <Button onClick={() => handleSubmit()} disabled={createMutation.isPending || updateMutation.isPending}>
                                             {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Assignment')}
                                        </Button>
                                   </DialogFooter>
                              </DialogContent>
                         </Dialog>
                    </div>
               </div>

               <div className="rounded-md border">
                    <Table>
                         <TableHeader>
                              <TableRow>
                                   <TableHead className="w-[50px]">
                                        <Checkbox
                                             checked={assignments.length > 0 && selectedAssignments.length === assignments.length}
                                             onCheckedChange={toggleSelectAll}
                                        />
                                   </TableHead>
                                   <TableHead>Title</TableHead>
                                   <TableHead>Type</TableHead>
                                   <TableHead>Assigned Groups</TableHead>
                                   <TableHead>Due Date</TableHead>
                                   <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {filteredAssignments.map((assignment) => (
                                   <TableRow key={assignment.id}>
                                        <TableCell>
                                             <Checkbox
                                                  checked={selectedAssignments.includes(assignment.id)}
                                                  onCheckedChange={() => toggleSelectAssignment(assignment.id)}
                                             />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                             <div className="flex flex-col">
                                                  <span>{assignment.title}</span>
                                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{assignment.contentUrl}</span>
                                             </div>
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant="secondary" className="gap-1">
                                                  {assignment.type === 'VIDEO' && <Play size={10} />}
                                                  {assignment.type === 'PDF' && <FileText size={10} />}
                                                  {assignment.type === 'LINK' && <LinkIcon size={10} />}
                                                  {assignment.type === 'DOCUMENT' && <FileText size={10} />}
                                                  {assignment.type}
                                             </Badge>
                                        </TableCell>
                                        <TableCell>
                                             <div className="flex flex-wrap gap-1">
                                                  {assignment.groupIds && assignment.groupIds.length > 0 ? (
                                                       assignment.groupIds.map(gid => {
                                                            const g = groups.find(x => x.id === gid);
                                                            return g ? <Badge key={gid} variant="outline" className="text-[10px]">{g.name}</Badge> : null;
                                                       })
                                                  ) : (
                                                       <Badge variant="outline" className="text-[10px] text-muted-foreground">Everyone</Badge>
                                                  )}
                                             </div>
                                        </TableCell>
                                        <TableCell>
                                             {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <div className="flex justify-end gap-2">
                                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(assignment)}>
                                                       <Pencil size={16} className="text-blue-500" />
                                                  </Button>
                                                  <Button variant="ghost" size="icon" onClick={() => setStatsId(assignment.id)}>
                                                       <BarChart3 size={16} className="text-purple-500" />
                                                  </Button>
                                                  <Button variant="ghost" size="icon" onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(assignment.id) }}>
                                                       <Trash2 size={16} className="text-destructive" />
                                                  </Button>
                                             </div>
                                        </TableCell>
                                   </TableRow>
                              ))}
                              {filteredAssignments.length === 0 && (
                                   <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                             No assignments found.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               <StatsDialog
                    assignmentId={statsId}
                    open={!!statsId}
                    onOpenChange={(open) => !open && setStatsId(null)}
               />
          </div>
     );
}
