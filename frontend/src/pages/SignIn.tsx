import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignIn() {
     const { login } = useAuth();

     const [email, setEmail] = useState('');
     const [error, setError] = useState('');

     const handleLogin = async (role: string) => {
          console.log("Handle Login clicked with role:", role);
          console.log("Current email:", email);
          setError('');

          if (!email) {
               console.log("Validation failed: No email");
               setError('Please enter your email address.');
               return;
          }

          // More robust email regex validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               console.log("Validation failed: Invalid format");
               setError('Please enter a valid email address.');
               return;
          }

          // Optional: Keep .edu check if strictly required, but usually basic email check is enough for generic "validity"
          if (!email.toLowerCase().endsWith('.edu')) {
               console.log("Validation failed: Not .edu");
               setError('Please use a valid .edu email address.');
               return;
          }

          try {
               console.log("Attempting to call login API...");
               const result = await login({ email, role });
               console.log("Login API success", result);
          } catch (err) {
               console.error("Login failed exception", err);
               setError('Failed to sign in. Please try again soon.');
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
                                   onClick={() => handleLogin('DEVELOPER')} // Pass default, backend/route handles redirect
                              >
                                   <User size={18} /> Sign In
                              </Button>
                         </div>
                    </div>
               </motion.div>
          </div>
     );
}
