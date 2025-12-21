import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Button } from './ui/button';
import { LogOut, UserCircle, FileText, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
     const { user, logout } = useAuth();
     const location = useLocation();
     const queryClient = useQueryClient();
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

     // Proactive Prefetching
     React.useEffect(() => {
          const token = localStorage.getItem('token');
          if (user || token) {
               // Prefetch data immediately if we have a token or user
               queryClient.prefetchQuery({ queryKey: ['assignments'], queryFn: () => api.assignments.list() });
               queryClient.prefetchQuery({ queryKey: ['groups'], queryFn: () => api.groups.list() });
               queryClient.prefetchQuery({ queryKey: ['completions'], queryFn: () => api.completions.list() });

               if (user?.role === 'BOARD_ADMIN') {
                    queryClient.prefetchQuery({ queryKey: ['users'], queryFn: () => api.users.list() });
               }

          }
     }, [user, queryClient]);

     const isAuth = !!user;

     const closeMobileMenu = () => setIsMobileMenuOpen(false);

     return (
          <div className="min-h-screen flex flex-col bg-background text-foreground relative font-sans">
               <BackgroundOrbs />

               {/* Navbar - Only show if authenticated */}
               {isAuth && (
                    <nav className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                              <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-50 relative" onClick={closeMobileMenu}>
                                   <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                        <FileText size={20} />
                                   </div>
                                   DidYouDoIt?
                              </Link>

                              {/* Desktop Nav */}
                              <div className="hidden md:flex items-center gap-6">
                                   <Link
                                        to="/assignments"
                                        className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/assignments' ? 'text-primary' : 'text-muted-foreground'}`}
                                   >
                                        Assignments
                                   </Link>
                                   {/* Define isAdmin here to use in conditional rendering */}
                                   {user && ['BOARD_ADMIN', 'TECH_LEAD', 'PRODUCT_MANAGER'].includes(user.role) && (
                                        <Link
                                             to="/admin"
                                             className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                             Admin
                                        </Link>
                                   )}
                              </div>

                              <div className="hidden md:flex items-center gap-4">
                                   <div className="flex items-center gap-2 text-sm text-right">
                                        <div className="flex flex-col">
                                             <span className="font-medium leading-none">{user.fullName}</span>
                                             <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                                        </div>
                                        <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                                             <UserCircle size={20} className="text-muted-foreground" />
                                        </div>
                                   </div>

                                   <Button variant="ghost" size="icon" onClick={() => {
                                        logout();
                                        window.location.href = '/';
                                   }} title="Sign Out">
                                        <LogOut size={18} />
                                   </Button>
                              </div>

                              {/* Mobile Menu Toggle */}
                              <div className="md:hidden z-50 relative">
                                   <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                   </Button>
                              </div>
                         </div>

                         {/* Mobile Overlay Menu */}
                         <AnimatePresence>
                              {isMobileMenuOpen && (
                                   <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="fixed inset-0 bg-background/95 backdrop-blur-lg z-40 md:hidden flex flex-col pt-24 px-6 space-y-8"
                                   >
                                        <div className="flex flex-col space-y-6 text-center">
                                             <Link
                                                  to="/assignments"
                                                  onClick={closeMobileMenu}
                                                  className={`text-xl font-medium transition-colors ${location.pathname === '/assignments' ? 'text-primary' : 'text-muted-foreground'}`}
                                             >
                                                  Assignments
                                             </Link>
                                             {user && ['BOARD_ADMIN', 'TECH_LEAD', 'PRODUCT_MANAGER'].includes(user.role) && (
                                                  <Link
                                                       to="/admin"
                                                       onClick={closeMobileMenu}
                                                       className={`text-xl font-medium transition-colors ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}
                                                  >
                                                       Admin
                                                  </Link>
                                             )}
                                        </div>

                                        <div className="border-t border-border pt-8 flex flex-col items-center space-y-4">
                                             <div className="flex flex-col items-center space-y-2">
                                                  <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                                                       <UserCircle size={40} className="text-muted-foreground" />
                                                  </div>
                                                  <span className="font-semibold text-lg">{user.fullName}</span>
                                                  <span className="text-sm text-muted-foreground capitalize bg-secondary/50 px-3 py-1 rounded-full">{user.role}</span>
                                             </div>

                                             <Button
                                                  variant="destructive"
                                                  className="w-full max-w-xs mt-4 gap-2"
                                                  onClick={() => {
                                                       closeMobileMenu();
                                                       logout();
                                                       window.location.href = '/';
                                                  }}
                                             >
                                                  <LogOut size={18} /> Sign Out
                                             </Button>
                                        </div>
                                   </motion.div>
                              )}
                         </AnimatePresence>
                    </nav>
               )}

               <main className="container mx-auto px-4 py-8 flex-grow">
                    {children}
               </main>

               <Footer />
          </div>
     );
}
