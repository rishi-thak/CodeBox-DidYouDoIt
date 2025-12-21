import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Cohort } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Plus, Trash2, Pencil, Users, Archive, RotateCcw, Settings } from 'lucide-react';
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "../ui/table";
import { Switch } from '../ui/switch';
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
} from "../ui/alert-dialog"

export function CohortManager() {
     const queryClient = useQueryClient();
     const [isOpen, setIsOpen] = useState(false);
     const [newCohortName, setNewCohortName] = useState('');
     const [showArchived, setShowArchived] = useState(false);

     const { data: cohorts = [] } = useQuery({
          queryKey: ['cohorts'],
          queryFn: () => api.cohorts.list()
     });

     const createMutation = useMutation({
          mutationFn: (name: string) => api.cohorts.create({ name, isActive: true }),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['cohorts'] });
               setNewCohortName('');
          }
     });

     const updateMutation = useMutation({
          mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => api.cohorts.update(id, { isActive }),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['cohorts'] });
          }
     });

     const deleteMutation = useMutation({
          mutationFn: (id: string) => api.cohorts.delete(id),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['cohorts'] });
          },
          onError: (error: Error) => {
               alert(error.message);
          }
     });

     const filteredCohorts = cohorts.filter(c => showArchived ? true : c.isActive);

     return (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                         <Settings size={16} /> Manage Cohorts
                    </Button>
               </DialogTrigger>
               <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                         <DialogTitle>Cohort Manager</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                         {/* Create New */}
                         <div className="flex gap-2 items-end border-b pb-4">
                              <div className="grid gap-2 w-full">
                                   <Label htmlFor="new-cohort">New Cohort Name</Label>
                                   <Input
                                        id="new-cohort"
                                        placeholder="e.g. CB26-27"
                                        value={newCohortName}
                                        onChange={e => setNewCohortName(e.target.value)}
                                   />
                              </div>
                              <Button
                                   onClick={() => {
                                        if (newCohortName) createMutation.mutate(newCohortName);
                                   }}
                                   disabled={createMutation.isPending || !newCohortName}
                              >
                                   <Plus size={16} className="mr-2" /> Create
                              </Button>
                         </div>

                         {/* List */}
                         <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                   <h3 className="text-sm font-medium">Existing Cohorts</h3>
                                   <div className="flex items-center space-x-2">
                                        <Switch
                                             id="show-archived-cohorts"
                                             checked={showArchived}
                                             onCheckedChange={setShowArchived}
                                        />
                                        <Label htmlFor="show-archived-cohorts">Show Archived</Label>
                                   </div>
                              </div>

                              <div className="rounded-md border">
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Name</TableHead>
                                                  <TableHead>Status</TableHead>
                                                  <TableHead className="text-right">Actions</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {filteredCohorts.map((cohort) => (
                                                  <TableRow key={cohort.id} className={!cohort.isActive ? 'opacity-60 bg-muted/50' : ''}>
                                                       <TableCell className="font-medium">
                                                            {cohort.name}
                                                       </TableCell>
                                                       <TableCell>
                                                            {cohort.isActive ?
                                                                 <Badge className="bg-green-600">Active</Badge> :
                                                                 <Badge variant="outline">Archived</Badge>
                                                            }
                                                       </TableCell>
                                                       <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                 {cohort.isActive ? (
                                                                      <Button
                                                                           variant="ghost"
                                                                           size="sm"
                                                                           onClick={() => updateMutation.mutate({ id: cohort.id, isActive: false })}
                                                                           title="Archive"
                                                                           disabled={updateMutation.isPending}
                                                                      >
                                                                           <Archive size={16} className="text-orange-500" />
                                                                      </Button>
                                                                 ) : (
                                                                      <Button
                                                                           variant="ghost"
                                                                           size="sm"
                                                                           onClick={() => updateMutation.mutate({ id: cohort.id, isActive: true })}
                                                                           title="Restore"
                                                                           disabled={updateMutation.isPending}
                                                                      >
                                                                           <RotateCcw size={16} className="text-green-500" />
                                                                      </Button>
                                                                 )}
                                                                 <AlertDialog>
                                                                      <AlertDialogTrigger asChild>
                                                                           <Button
                                                                                variant="ghost"
                                                                                size="sm"
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
                                                                                     This action cannot be undone. This will permanently delete the cohort
                                                                                     <span className="font-bold text-foreground"> {cohort.name}</span>.
                                                                                </AlertDialogDescription>
                                                                           </AlertDialogHeader>
                                                                           <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                     className="bg-red-600 hover:bg-red-700"
                                                                                     onClick={() => deleteMutation.mutate(cohort.id)}
                                                                                >
                                                                                     {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                                                                </AlertDialogAction>
                                                                           </AlertDialogFooter>
                                                                      </AlertDialogContent>
                                                                 </AlertDialog>
                                                            </div>
                                                       </TableCell>
                                                  </TableRow>
                                             ))}
                                             {filteredCohorts.length === 0 && (
                                                  <TableRow>
                                                       <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                            No cohorts found.
                                                       </TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>
                              </div>
                         </div>
                    </div>
               </DialogContent>
          </Dialog>
     );
}
