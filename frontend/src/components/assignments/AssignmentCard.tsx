import React, { useMemo } from 'react';
import { Assignment } from '../../lib/api';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Play, FileText, Link as LinkIcon, ExternalLink, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface AssignmentCardProps {
     assignment: Assignment;
     isCompleted: boolean;
     onToggleComplete: () => void;
     isToggling?: boolean;
     index: number;
}

export function AssignmentCard({ assignment, isCompleted, onToggleComplete, isToggling, index }: AssignmentCardProps) {
     const typeIcons = {
          VIDEO: Play,
          PDF: FileText,
          DOCUMENT: FileText,
          LINK: LinkIcon,
     }[assignment.type];

     const TypeIcon = typeIcons || FileText; // Fallback

     const thumbnail = useMemo(() => {
          if (assignment.type === 'VIDEO' && assignment.contentUrl) {
               const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/;
               const match = assignment.contentUrl.match(regex);
               const videoId = match ? match[1] : null;
               if (videoId) {
                    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
               }
          }
          return assignment.thumbnailUrl;
     }, [assignment.contentUrl, assignment.type, assignment.thumbnailUrl]);

     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
          >
               <Card className={cn(
                    "group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50",
                    isCompleted ? "opacity-75" : "opacity-100"
               )}>
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                         {thumbnail ? (
                              <img
                                   src={thumbnail}
                                   alt={assignment.title}
                                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                         ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                                   <TypeIcon size={48} className="text-muted-foreground/50" />
                              </div>
                         )}

                         <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                              {assignment.type === 'VIDEO' && (
                                   <div className="rounded-full bg-primary/90 p-3 text-primary-foreground shadow-lg transform scale-0 transition-transform duration-300 group-hover:scale-100">
                                        <Play fill="currentColor" className="ml-0.5" />
                                   </div>
                              )}
                              <a
                                   href={assignment.contentUrl}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="absolute inset-0"
                              >
                                   <span className="sr-only">View Content</span>
                              </a>
                         </div>

                         <div className="absolute top-2 left-2 flex gap-2">
                              <Badge variant="secondary" className="backdrop-blur-md bg-black/50 hover:bg-black/70 capitalize flex gap-1">
                                   <TypeIcon size={12} />
                                   {assignment.type}
                              </Badge>
                         </div>
                    </div>

                    <div className="p-5">
                         <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                   <h3 className={cn("font-semibold text-lg leading-tight mb-1", isCompleted && "line-through text-muted-foreground")}>
                                        {assignment.title}
                                   </h3>
                                   <p className="text-sm text-muted-foreground line-clamp-2">
                                        {assignment.description}
                                   </p>
                              </div>
                              <button
                                   onClick={onToggleComplete}
                                   disabled={isToggling}
                                   className={cn(
                                        "flex-shrink-0 transition-colors",
                                        isCompleted ? "text-primary" : "text-muted-foreground hover:text-foreground",
                                        isToggling && "opacity-50 cursor-not-allowed"
                                   )}
                              >
                                   {isToggling ? (
                                        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                   ) : (
                                        isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />
                                   )}
                              </button>
                         </div>

                         <div className="flex items-center justify-between mt-4">
                              {assignment.dueDate && (
                                   <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar size={14} />
                                        <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                   </div>
                              )}

                              {!assignment.dueDate && <div />} {/* Spacer */}

                              <a
                                   href={assignment.contentUrl}
                                   target="_blank"
                                   rel="noreferrer"
                                   className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 gap-1.5")}
                              >
                                   Open <ExternalLink size={12} />
                              </a>
                         </div>
                    </div>
               </Card>
          </motion.div>
     );
}
