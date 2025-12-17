import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Button } from './ui/button';
import { LogOut, UserCircle, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
// Dropdown removed for MVP simplicity
// Note: I haven't implemented DropdownMenu yet, I might need to if I use it.
// I will stick to a simple button for logout or just a button.
// User said "User info display with name and role... Sign out button".

// I need DropdownMenu for mobile menu and potentially user menu.
// Let's implement DropdownMenu quickly or just use conditional rendering.
// For now, I'll just use a row of buttons for desktop.

import Footer from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
     const { user, logout } = useAuth();
     const location = useLocation();

     const isAuth = !!user;

     return (
          <div className="min-h-screen flex flex-col bg-background text-foreground relative font-sans">
               <BackgroundOrbs />

               {/* Navbar - Only show if authenticated */}
               {isAuth && (
                    <nav className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                              <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                                   <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                        <FileText size={20} />
                                   </div>
                                   DidYouDoIt?
                              </Link>

                              <div className="hidden md:flex items-center gap-6">
                                   <Link
                                        to="/assignments"
                                        className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/assignments' ? 'text-primary' : 'text-muted-foreground'}`}
                                   >
                                        Assignments
                                   </Link>
                                   {/* Define isAdmin here to use in conditional rendering */}
                                   {user && user.role === 'BOARD_ADMIN' && (
                                        <Link
                                             to="/admin"
                                             className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                             Admin
                                        </Link>
                                   )}
                              </div>

                              <div className="flex items-center gap-4">
                                   <div className="hidden md:flex items-center gap-2 text-sm text-right">
                                        <div className="flex flex-col">
                                             <span className="font-medium leading-none">{user.full_name}</span>
                                             <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                                        </div>
                                        <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                                             <UserCircle size={20} className="text-muted-foreground" />
                                        </div>
                                   </div>

                                   <Button variant="ghost" size="icon" onClick={() => logout()} title="Sign Out">
                                        <LogOut size={18} />
                                   </Button>
                              </div>
                         </div>
                    </nav>
               )}

               <main className="container mx-auto px-4 py-8 flex-grow">
                    {children}
               </main>

               <Footer />
          </div>
     );
}
