import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface Props {
     assignmentId: string | null;
     open: boolean;
     onOpenChange: (open: boolean) => void;
}

export function StatsDialog({ assignmentId, open, onOpenChange }: Props) {
     const [searchQuery, setSearchQuery] = useState('');

     const { data: stats, isLoading } = useQuery({
          queryKey: ['assignmentStats', assignmentId],
          queryFn: () => api.assignments.getStats(assignmentId!),
          enabled: !!assignmentId && open,
     });

     const filteredDetails = stats?.details.filter(d =>
          d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.email.toLowerCase().includes(searchQuery.toLowerCase())
     );

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                         <DialogTitle>Assignment Stats: {stats?.assignmentTitle}</DialogTitle>
                         <DialogDescription>View completion metrics and details for this assignment.</DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                         <div className="py-8 text-center text-muted-foreground">Loading stats...</div>
                    ) : stats ? (
                         <div className="space-y-6">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                   <div className="p-4 border rounded-lg bg-secondary/10">
                                        <div className="text-2xl font-bold">{stats.totalAssigned}</div>
                                        <div className="text-sm text-muted-foreground">Assigned</div>
                                   </div>
                                   <div className="p-4 border rounded-lg bg-green-500/10">
                                        <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}</div>
                                        <div className="text-sm text-muted-foreground">Completed</div>
                                   </div>
                                   <div className="p-4 border rounded-lg bg-blue-500/10">
                                        <div className="text-2xl font-bold text-blue-600">{stats.completionRate.toFixed(1)}%</div>
                                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                                   </div>
                              </div>

                              <div className="flex items-center gap-2">
                                   <Search className="text-muted-foreground" size={18} />
                                   <Input
                                        placeholder="Search user..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                   />
                              </div>

                              <div className="border rounded-md">
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>User</TableHead>
                                                  <TableHead>Email</TableHead>
                                                  <TableHead>Status</TableHead>
                                                  <TableHead>Completed At</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {filteredDetails?.map(user => (
                                                  <TableRow key={user.userId}>
                                                       <TableCell className="font-medium">{user.fullName}</TableCell>
                                                       <TableCell>{user.email}</TableCell>
                                                       <TableCell>
                                                            <Badge variant={user.status === 'COMPLETED' ? 'default' : 'secondary'} className={user.status === 'COMPLETED' ? 'bg-green-600' : ''}>
                                                                 {user.status}
                                                            </Badge>
                                                       </TableCell>
                                                       <TableCell>
                                                            {user.completedAt ? new Date(user.completedAt).toLocaleString() : '-'}
                                                       </TableCell>
                                                  </TableRow>
                                             ))}
                                             {filteredDetails?.length === 0 && (
                                                  <TableRow>
                                                       <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No users found.</TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>
                              </div>
                         </div>
                    ) : (
                         <div className="text-center text-destructive">Failed to load stats.</div>
                    )}
               </DialogContent>
          </Dialog>
     );
}
