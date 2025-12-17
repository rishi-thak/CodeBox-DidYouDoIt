import React, { useState, useEffect } from 'react';
import { api, User, Group } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '../ui/use-toast';

export function MemberManager() {
     const [users, setUsers] = useState<User[]>([]); // Need to implement api.users.list
     const [groups, setGroups] = useState<Group[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const { toast } = useToast();

     // Mock implementation until backend endpoint exists
     // Ideally we fetch a list of all users from backend
     // Since api.users.list is empty placeholder in frontend, we might need to add it or skip for now.
     // Let's assume we can fetch it.

     // Actually, checking backend controller... we didn't add a UserController "list users" endpoint.
     // I should add that first. 
     // But since I can't edit backend and frontend simultaneously in one step easily if I want to be safe,
     // let's put a placeholder UI here that says "Coming Soon" or tries to fetch and fails gracefully?
     // User requested "Master Member Page".

     // I will write this component assuming the endpoint exists, then I will go add the endpoint.

     // Use useCallback to make loadData stable for useEffect dependency
     const loadData = React.useCallback(async () => {
          setIsLoading(true);
          try {
               const [usersData, groupsData] = await Promise.all([
                    api.users.list(),
                    api.groups.list()
               ]);
               setUsers(usersData);
               setGroups(groupsData);
          } catch (error) {
               console.error("Failed to load members", error);
               toast({ title: "Error", description: "Could not load members", variant: "destructive" });
          } finally {
               setIsLoading(false);
          }
     }, [toast]);

     useEffect(() => {
          loadData();
     }, [loadData]);

     return (
          <Card className="col-span-1 md:col-span-2">
               <CardHeader>
                    <CardTitle>Master Member List</CardTitle>
                    <CardDescription>View and manage all members, their roles, and group assignments.</CardDescription>
               </CardHeader>
               <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                         <div className="relative flex-1">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Search members..." className="pl-8" />
                         </div>
                    </div>

                    <div className="rounded-md border">
                         <Table>
                              <TableHeader>
                                   <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Groups</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                   </TableRow>
                              </TableHeader>
                              <TableBody>
                                   {isLoading ? (
                                        <TableRow>
                                             <TableCell colSpan={5} className="text-center py-8">
                                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                             </TableCell>
                                        </TableRow>
                                   ) : users.length === 0 ? (
                                        <TableRow>
                                             <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                  No members found
                                             </TableCell>
                                        </TableRow>
                                   ) : (
                                        users.map((user) => {
                                             const userGroups = groups.filter(g => g.members?.includes(user.email)).map(g => g.name);

                                             return (
                                                  <TableRow key={user.id}>
                                                       <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                                                       <TableCell>{user.email}</TableCell>
                                                       <TableCell>
                                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                                 {user.role}
                                                            </span>
                                                       </TableCell>
                                                       <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                 {userGroups.length > 0 ? (
                                                                      userGroups.map(g => (
                                                                           <span key={g} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-foreground">
                                                                                {g}
                                                                           </span>
                                                                      ))
                                                                 ) : (
                                                                      <span className="text-muted-foreground text-xs text-italic">No groups</span>
                                                                 )}
                                                            </div>
                                                       </TableCell>
                                                       <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm">Edit</Button>
                                                       </TableCell>
                                                  </TableRow>
                                             );
                                        })
                                   )}
                              </TableBody>
                         </Table>
                    </div>
               </CardContent>
          </Card>
     );
}
