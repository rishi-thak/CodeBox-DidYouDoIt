import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { StatsOverview } from '../components/admin/StatsOverview';
import { AssignmentManager } from '../components/admin/AssignmentManager';
import { GroupManager } from '../components/admin/GroupManager';

export default function Admin() {
     const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: api.assignments.list });
     const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: api.groups.list });
     const { data: completions = [] } = useQuery({ queryKey: ['completions'], queryFn: api.completions.list });
     const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: api.users.list }); // Added users endpoint to mock api late, need to check if I did

     // I actually didn't add users.list to the api object in Step 54 explicitly in the type definition, 
     // but I added the implementation at the bottom of the object.
     // Wait, looking at Step 54 output... Yes: users: { list: ... }. So it should work.

     const stats = useMemo(() => ({
          totalAssignments: assignments.length,
          totalGroups: groups.length,
          totalCompletions: completions.length,
          activeUsers: users.length
     }), [assignments, groups, completions, users]);

     return (
          <div className="space-y-8">
               <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

               <StatsOverview stats={stats} />

               <Tabs defaultValue="assignments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                         <TabsTrigger value="assignments">Assignments</TabsTrigger>
                         <TabsTrigger value="groups">Groups</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assignments" className="mt-6">
                         <AssignmentManager assignments={assignments} groups={groups} />
                    </TabsContent>
                    <TabsContent value="groups" className="mt-6">
                         <GroupManager groups={groups} />
                    </TabsContent>
               </Tabs>
          </div>
     );
}
