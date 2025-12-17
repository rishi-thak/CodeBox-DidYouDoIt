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
import { Plus, Trash2, Pencil, ExternalLink, Play, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
     assignments: Assignment[];
     groups: Group[];
}

export function AssignmentManager({ assignments, groups }: Props) {
     const queryClient = useQueryClient();
     const [isOpen, setIsOpen] = useState(false);
     const [editingId, setEditingId] = useState<string | null>(null);

     // Form State
     const [formData, setFormData] = useState<Partial<Assignment>>({
          title: '',
          description: '',
          type: 'VIDEO',
          content_url: '',
          assigned_groups: [],
          due_date: ''
     });

     const resetForm = () => {
          setFormData({
               title: '',
               description: '',
               type: 'VIDEO',
               content_url: '',
               assigned_groups: [],
               due_date: ''
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
          if (!formData.title || !formData.content_url) return; // Basic validation

          if (editingId) {
               updateMutation.mutate({ id: editingId, data: formData });
          } else {
               createMutation.mutate(formData);
          }
     };

     const toggleGroupSelection = (groupId: string) => {
          setFormData(prev => {
               const current = prev.assigned_groups || [];
               if (current.includes(groupId)) {
                    return { ...prev, assigned_groups: current.filter(id => id !== groupId) };
               } else {
                    return { ...prev, assigned_groups: [...current, groupId] };
               }
          });
     };

     return (
          <div className="space-y-6">
               <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Manage Assignments</h2>
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
                                                       <SelectItem value="link">Link</SelectItem>
                                                  </SelectContent>
                                             </Select>
                                        </div>
                                        <div className="grid gap-2">
                                             <Label htmlFor="date">Due Date (Optional)</Label>
                                             <Input type="date" id="date" value={formData.due_date ? new Date(formData.due_date!).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                                        </div>
                                   </div>

                                   <div className="grid gap-2">
                                        <Label htmlFor="url">Content URL</Label>
                                        <Input id="url" value={formData.content_url} onChange={e => setFormData({ ...formData, content_url: e.target.value })} placeholder="https://..." />
                                   </div>

                                   <div className="grid gap-2">
                                        <Label className="mb-2">Assign to Groups</Label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                             {groups.map(group => (
                                                  <div key={group.id} className="flex items-center space-x-2">
                                                       <Checkbox
                                                            id={`grp-${group.id}`}
                                                            checked={(formData.assigned_groups || []).includes(group.id)}
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
                                   <Button onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create Assignment'}</Button>
                              </DialogFooter>
                         </DialogContent>
                    </Dialog>
               </div>

               <div className="grid gap-4">
                    {assignments.map((assignment, i) => (
                         <motion.div key={assignment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                              <Card className="flex items-center p-4 justify-between group hover:border-primary/50 transition-colors">
                                   <div className="flex items-center gap-4">
                                        <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                                             {assignment.type === 'VIDEO' ? <Play size={20} /> : assignment.type === 'PDF' ? <FileText size={20} /> : <LinkIcon size={20} />}
                                        </div>
                                        <div>
                                             <h3 className="font-semibold">{assignment.title}</h3>
                                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                  <span className="capitalize">{assignment.type}</span>
                                                  {assignment.due_date && (
                                                       <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                       </>
                                                  )}
                                             </div>
                                             <div className="flex gap-1 mt-1">
                                                  {assignment.assigned_groups?.map(gid => {
                                                       const g = groups.find(x => x.id === gid);
                                                       return g ? <Badge key={gid} variant="outline" className="text-[10px] py-0 h-4">{g.name}</Badge> : null;
                                                  })}
                                                  {(!assignment.assigned_groups || assignment.assigned_groups.length === 0) && <Badge variant="secondary" className="text-[10px] py-0 h-4">Everyone</Badge>}
                                             </div>
                                        </div>
                                   </div>

                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" asChild>
                                             <a href={assignment.content_url} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(assignment)}>
                                             <Pencil size={16} className="text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(assignment.id) }}>
                                             <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                   </div>
                              </Card>
                         </motion.div>
                    ))}
               </div>
          </div>
     );
}
