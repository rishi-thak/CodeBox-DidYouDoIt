import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SignIn() {
     const { login } = useAuth();

     const [email, setEmail] = useState('');
     const [error, setError] = useState('');

     const handleLogin = async (role: 'admin' | 'user') => {
          setError('');

          if (!email) {
               setError('Please enter your email address.');
               return;
          }

          if (!email.toLowerCase().endsWith('.edu')) {
               setError('Please use a valid .edu email address.');
               return;
          }

          try {
               await login({ email, role });
               // Navigation is handled by App.tsx redirect based on user state, 
               // but we can also imperatively push if needed, but App.tsx has <Navigate /> rules.
               // However, App.tsx redirects might take a render cycle. 
               // Let's rely on the user state change triggering the redirect in App.tsx
          } catch (err) {
               setError('Failed to sign in. Please try again.');
          }
     };

     return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
               <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-2xl shadow-2xl"
               >
                    <div className="text-center">
                         <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                              <ArrowLeft size={16} className="mr-1" /> Back to Home
                         </Link>
                         <h2 className="text-3xl font-bold tracking-tight mb-2">Sign In</h2>
                         <p className="text-muted-foreground">Enter your .edu email to continue</p>
                    </div>

                    <div className="space-y-4">
                         <div className="space-y-2">
                              <Input
                                   type="email"
                                   placeholder="you@university.edu"
                                   value={email}
                                   onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                   className="h-12 bg-background/50"
                                   autoFocus
                              />
                              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                         </div>

                         <div className="space-y-3 pt-4">
                              <Button
                                   className="w-full h-12 text-lg gap-2"
                                   onClick={() => handleLogin('user')}
                              >
                                   <User size={18} /> Student / Developer Access
                              </Button>

                              <div className="relative">
                                   <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-muted"></span>
                                   </div>
                                   <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                                   </div>
                              </div>

                              <Button
                                   variant="outline"
                                   className="w-full h-12 gap-2"
                                   onClick={() => handleLogin('admin')}
                              >
                                   <Shield size={18} /> Admin Access
                              </Button>
                         </div>
                    </div>
               </motion.div>
          </div>
     );
}
