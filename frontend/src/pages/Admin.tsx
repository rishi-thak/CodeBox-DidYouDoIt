import React from 'react';
import { motion } from 'framer-motion';
import { StatsOverview } from '../components/admin/StatsOverview';
import { AssignmentManager } from '../components/admin/AssignmentManager';
import { GroupManager } from '../components/admin/GroupManager';
import { MemberManager } from '../components/admin/MemberManager';
import { useAuth } from '../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Admin() {
     const { user } = useAuth();

     const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: api.assignments.list });
     const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: api.groups.list });

     const stats = {
          totalAssignments: assignments?.length || 0,
          totalGroups: groups?.length || 0,
          totalCompletions: 0,
          activeUsers: groups?.reduce((acc: number, g: any) => acc + (g.members?.length || 0), 0) || 0
     };

     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="container mx-auto px-4 py-8 space-y-8"
          >
               <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                         Welcome back, {user?.fullName}. Here's what's happening today.
                    </p>
               </div>

               <StatsOverview stats={stats} />

               <Tabs defaultValue="assignments" className="space-y-4">
                    <TabsList>
                         <TabsTrigger value="assignments">Assignments</TabsTrigger>
                         {user?.role === 'BOARD_ADMIN' && (
                              <>
                                   <TabsTrigger value="groups">Groups</TabsTrigger>
                                   <TabsTrigger value="members">Members</TabsTrigger>
                              </>
                         )}
                    </TabsList>
                    <TabsContent value="assignments" className="space-y-4">
                         <AssignmentManager assignments={assignments} groups={groups} />
                    </TabsContent>
                    {user?.role === 'BOARD_ADMIN' && (
                         <>
                              <TabsContent value="groups" className="space-y-4">
                                   <GroupManager groups={groups} />
                              </TabsContent>
                              <TabsContent value="members" className="space-y-4">
                                   <MemberManager />
                              </TabsContent>
                         </>
                    )}
               </Tabs>
          </motion.div>
     );
}
