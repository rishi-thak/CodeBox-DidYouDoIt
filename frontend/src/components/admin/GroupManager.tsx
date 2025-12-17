import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Group } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Plus, Trash2, Pencil, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
     groups: Group[];
}

export function GroupManager({ groups }: Props) {
     const queryClient = useQueryClient();
     const [isOpen, setIsOpen] = useState(false);
     const [editingId, setEditingId] = useState<string | null>(null);
     const [memberInput, setMemberInput] = useState('');

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
          setMemberInput('');
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
          }
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string, data: any }) => api.groups.update(id, data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['groups'] });
               setIsOpen(false);
               resetForm();
          }
     });

     const deleteMutation = useMutation({
          mutationFn: api.groups.delete,
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
     });

     const handleSubmit = () => {
          if (!formData.name) return;
          if (editingId) {
               updateMutation.mutate({ id: editingId, data: formData });
          } else {
               createMutation.mutate(formData);
          }
     };

     const addMember = () => {
          if (memberInput && !formData.members?.includes(memberInput)) {
               setFormData(prev => ({ ...prev, members: [...(prev.members || []), memberInput] }));
               setMemberInput('');
          }
     };

     const removeMember = (email: string) => {
          setFormData(prev => ({ ...prev, members: (prev.members || []).filter(m => m !== email) }));
     };

     return (
          <div className="space-y-6">
               <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Manage Groups</h2>
                    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                         <DialogTrigger asChild>
                              <Button className="gap-2">
                                   <Plus size={16} /> New Group
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
                                        <Label>Members</Label>
                                        <div className="flex gap-2">
                                             <Input
                                                  value={memberInput}
                                                  onChange={e => setMemberInput(e.target.value)}
                                                  placeholder="user@example.com"
                                                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())}
                                             />
                                             <Button type="button" variant="outline" onClick={addMember}><Plus size={16} /></Button>
                                        </div>
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
                              </div>
                              <DialogFooter>
                                   <Button onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create Group'}</Button>
                              </DialogFooter>
                         </DialogContent>
                    </Dialog>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group, i) => (
                         <motion.div key={group.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                              <Card className="p-0 overflow-hidden group hover:border-primary/50 transition-colors h-full flex flex-col">
                                   <div className="p-6 pb-2 flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                             <div className="flex items-center gap-2">
                                                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                       <Users size={20} />
                                                  </div>
                                                  <h3 className="font-semibold text-lg">{group.name}</h3>
                                             </div>
                                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(group)}>
                                                       <Pencil size={14} className="text-blue-500" />
                                                  </Button>
                                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (window.confirm('Delete group?')) deleteMutation.mutate(group.id) }}>
                                                       <Trash2 size={14} className="text-destructive" />
                                                  </Button>
                                             </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">{group.description || "No description."}</p>

                                        <div>
                                             <Label className="text-xs text-muted-foreground mb-2 block">MEMBERS ({group.members.length})</Label>
                                             <div className="flex flex-wrap gap-1">
                                                  {group.members.slice(0, 5).map(m => (
                                                       <Badge key={m} variant="outline" className="text-[10px] font-normal">{m.split('@')[0]}</Badge>
                                                  ))}
                                                  {group.members.length > 5 && <Badge variant="outline" className="text-[10px] text-muted-foreground">+{group.members.length - 5} more</Badge>}
                                             </div>
                                        </div>
                                   </div>
                              </Card>
                         </motion.div>
                    ))}
               </div>
          </div>
     );
}
