import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Assignments() {
     const { user } = useAuth();
     const queryClient = useQueryClient();
     const [search, setSearch] = useState('');
     const [typeFilter, setTypeFilter] = useState('all');
     const [statusFilter, setStatusFilter] = useState('all');
     const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

     const { data: assignments = [] } = useQuery({
          queryKey: ['assignments'],
          queryFn: api.assignments.list
     });

     const { data: groups = [] } = useQuery({
          queryKey: ['groups'],
          queryFn: api.groups.list
     });

     const { data: completions = [] } = useQuery({
          queryKey: ['completions'],
          queryFn: api.completions.list
     });

     const toggleMutation = useMutation({
          mutationFn: ({ assignmentId, userEmail }: { assignmentId: string, userEmail: string }) =>
               api.completions.toggle(assignmentId, userEmail),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['completions'] });
          }
     });

     // Filter Logic
     const visibleAssignments = assignments.filter(assignment => {
          // 1. Group Visibility
          // User groups logic
          if (!user) return false;

          // Get IDs of groups the user is in
          const userGroupIds = groups
               .filter(g => g.members.includes(user.email))
               .map(g => g.id);

          // Assignment Logic
          const isAssigned =
               !assignment.groupIds ||
               assignment.groupIds.length === 0 ||
               assignment.groupIds.some(gid => userGroupIds.includes(gid));

          if (!isAssigned) return false;

          // 2. Search
          if (search) {
               const q = search.toLowerCase();
               if (!assignment.title.toLowerCase().includes(q) && !assignment.description.toLowerCase().includes(q)) {
                    return false;
               }
          }

          // 3. Type Filter
          if (typeFilter !== 'all' && assignment.type !== typeFilter) return false;

          // 4. Status Filter
          const isCompleted = completions.some(c => c.assignmentId === assignment.id && c.userEmail === user.email);
          if (statusFilter === 'done' && !isCompleted) return false;
          if (statusFilter === 'pending' && isCompleted) return false;

          return true;
     });

     // Calculate Progress
     // User logic: "Progress Bar: Shows X of Y completed". Usually this means of ALL assigned tasks, not just filtered ones.
     // Let's re-calculate "Base" assignments for progress.

     const baseAssignments = assignments.filter(assignment => {
          if (!user) return false;
          const userGroupIds = groups.filter(g => g.members.includes(user.email)).map(g => g.id);
          return !assignment.groupIds || assignment.groupIds.length === 0 || assignment.groupIds.some(gid => userGroupIds.includes(gid));
     });

     const completedCount = baseAssignments.filter(a =>
          completions.some(c => c.assignmentId === a.id && c.userEmail === user?.email)
     ).length;

     const totalCount = baseAssignments.length;
     const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

     return (
          <div className="space-y-8">
               {/* Header & Progress */}
               <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
                    <div className="bg-card border border-border/50 p-4 rounded-xl">
                         <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Overall Progress</span>
                              <span className="font-medium">{Math.round(progress)}% ({completedCount}/{totalCount})</span>
                         </div>
                         <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                   className="h-full bg-primary"
                                   initial={{ width: 0 }}
                                   animate={{ width: `${progress}%` }}
                                   transition={{ duration: 1, ease: "easeOut" }}
                              />
                         </div>
                    </div>
               </div>

               {/* Filters Toolbar */}
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 bg-background/95 backdrop-blur-sm py-4 border-b border-border/50 -mx-4 px-4 md:mx-0 md:px-0 md:border-none md:bg-transparent md:backdrop-filter-none md:static">
                    <div className="relative w-full md:w-96">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                         <Input
                              placeholder="Search assignments..."
                              className="pl-9"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                         />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                         <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-auto">
                              <TabsList>
                                   <TabsTrigger value="all">All</TabsTrigger>
                                   <TabsTrigger value="video">Videos</TabsTrigger>
                                   <TabsTrigger value="pdf">PDFs</TabsTrigger>
                                   <TabsTrigger value="link">Links</TabsTrigger>
                              </TabsList>
                         </Tabs>

                         <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                              <TabsList>
                                   <TabsTrigger value="all">All</TabsTrigger>
                                   <TabsTrigger value="pending">Pending</TabsTrigger>
                                   <TabsTrigger value="done">Done</TabsTrigger>
                              </TabsList>
                         </Tabs>

                         <div className="flex gap-1 border rounded-md p-1 bg-muted ml-auto">
                              <Button
                                   variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                   size="icon"
                                   className="h-8 w-8"
                                   onClick={() => setViewMode('grid')}
                              >
                                   <LayoutGrid size={16} />
                              </Button>
                              <Button
                                   variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                   size="icon"
                                   className="h-8 w-8"
                                   onClick={() => setViewMode('list')}
                              >
                                   <List size={16} />
                              </Button>
                         </div>
                    </div>
               </div>

               {/* Grid/List */}
               <motion.div layout className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                         ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                         : "grid-cols-1 max-w-4xl mx-auto"
               )}>
                    <AnimatePresence>
                         {visibleAssignments.map((assignment, index) => {
                              const isCompleted = completions.some(c => c.assignmentId === assignment.id && c.userEmail === user?.email);
                              return (
                                   <AssignmentCard
                                        key={assignment.id}
                                        index={index}
                                        assignment={assignment}
                                        isCompleted={isCompleted}
                                        onToggleComplete={() => user && toggleMutation.mutate({ assignmentId: assignment.id, userEmail: user.email })}
                                   />
                              );
                         })}
                    </AnimatePresence>
               </motion.div>

               {visibleAssignments.length === 0 && (
                    <div className="text-center py-20">
                         <p className="text-muted-foreground text-lg">No assignments found matching your filters.</p>
                         <Button variant="link" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}>Clear Filters</Button>
                    </div>
               )}
          </div>
     );
}
