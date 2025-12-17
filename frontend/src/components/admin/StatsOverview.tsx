import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
     stats: {
          totalAssignments: number;
          totalGroups: number;
          totalCompletions: number;
          activeUsers: number;
     }
}

export function StatsOverview({ stats }: Props) {
     const items = [
          { title: "Total Assignments", value: stats.totalAssignments, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Active Groups", value: stats.totalGroups, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Completions", value: stats.totalCompletions, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Active Users", value: stats.activeUsers, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
     ];

     return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {items.map((item, i) => (
                    <motion.div
                         key={i}
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: i * 0.1 }}
                    >
                         <Card className="relative overflow-hidden border-border/50">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <CardTitle className="text-sm font-medium">
                                        {item.title}
                                   </CardTitle>
                                   <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                        <item.icon className="h-4 w-4" />
                                   </div>
                              </CardHeader>
                              <CardContent>
                                   <div className="text-2xl font-bold">{item.value}</div>
                              </CardContent>
                              {/* Decorative blob */}
                              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${item.bg.replace('/10', '/30')}`} />
                         </Card>
                    </motion.div>
               ))}
          </div>
     );
}
