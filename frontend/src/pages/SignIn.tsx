
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '../lib/api';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../lib/api';
import { OTPInput } from '../components/ui/otp-input';

type Step = 'EMAIL' | 'OTP';

// ... (previous imports remain, remove KeyRound/Input import for OTP section if needed)

export default function SignIn() {
     const navigate = useNavigate();
     const queryClient = useQueryClient();

     const [step, setStep] = useState<Step>('EMAIL');
     const [email, setEmail] = useState('');
     const [otp, setOtp] = useState('');
     const [rememberMe, setRememberMe] = useState(false);

     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState('');

     // Temporary state to hold backend credentials while waiting for OTP
     const [tempToken, setTempToken] = useState<string | null>(null);
     const [tempUser, setTempUser] = useState<AppUser | null>(null);

     const handleSendCode = async () => {
          setError('');

          if (!email) {
               setError('Please enter your email address.');
               return;
          }

          if (!email.toLowerCase().endsWith('.edu')) {
               setError('Please use a valid .edu email address.');
               return;
          }

          setIsLoading(true);

          try {
               // 1. Check if user is a member (by calling backend login)
               // This also gives us the backend token we'll need later
               const { user, token } = await api.auth.login(email, 'DEVELOPER');

               setTempUser(user);
               setTempToken(token);

               // 2. Send OTP via Supabase
               const { error: supabaseError } = await supabase.auth.signInWithOtp({
                    email: email,
               });

               if (supabaseError) {
                    throw new Error(supabaseError.message);
               }

               setStep('OTP');
          } catch (err: any) {
               console.error("Sign in error:", err);
               if (err.message.includes("not look like you're in our system")) {
                    setError("Membership not found. Please contact an admin.");
               } else if (err.message.includes("rate limit") || err.status === 429) {
                    setError("Please wait a minute before logging in again.");
               } else if (err.message === "Load failed") {
                    // Supabase JS often throws generic 'Load failed' on network/rate issues
                    setError("Network error or too many requests. Please wait a moment.");
               } else {
                    setError(err.message || "Failed to send verification code.");
               }
          } finally {
               setIsLoading(false);
          }
     };

     // Memoize or reference stable handlers to avoid effect loops if needed, 
     // but for this simple case direct passing is fine.

     // We need to modify handleVerifyOtp to take an optional code argument
     const handleVerifyOtp = async (codeToVerify?: string) => {
          const finalCode = codeToVerify || otp;
          setError('');

          if (!finalCode || finalCode.length < 6) {
               setError('Please enter a valid 6-digit code.');
               return;
          }

          setIsLoading(true);

          try {
               // 3. Verify OTP with Supabase
               const { error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: finalCode,
                    type: 'email',
               });

               if (verifyError) {
                    throw new Error("Invalid code. Please try again.");
               }

               // 4. Success! Save the backend token
               if (tempToken && tempUser) {
                    setAuthToken(tempToken, rememberMe);
                    queryClient.setQueryData(['auth', 'me'], tempUser);
                    navigate('/');
               } else {
                    throw new Error("Session expired. Please try again.");
               }

          } catch (err: any) {
               console.error("Verification error:", err);
               setError(err.message || "Failed to verify code.");
               setIsLoading(false); // Only set loading false on error, on success we redirect
          }
     };

     return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 selection:bg-primary/20">
               <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-2xl overflow-hidden relative"
               >
                    <div className="text-center mb-8">
                         <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                              <ArrowLeft size={16} className="mr-1" /> Back to Home
                         </Link>
                         <h2 className="text-3xl font-bold tracking-tight mb-2">
                              {step === 'EMAIL' ? 'Welcome!' : 'Check your Email'}
                         </h2>
                         <p className="text-muted-foreground">
                              {step === 'EMAIL'
                                   ? 'Sign in to access your dashboard'
                                   : `We've sent a code to ${email}`}
                         </p>
                    </div>

                    <AnimatePresence mode='wait'>
                         {step === 'EMAIL' ? (
                              <motion.div
                                   key="step-email"
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: -20 }}
                                   className="space-y-6"
                              >
                                   <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                             <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                             <Input
                                                  id="email"
                                                  type="email"
                                                  placeholder="you@university.edu"
                                                  value={email}
                                                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                                  className="pl-10 h-12 bg-background/50"
                                                  autoFocus
                                                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                                             />
                                        </div>
                                   </div>

                                   <div className="flex items-center space-x-2">
                                        <Checkbox
                                             id="remember"
                                             checked={rememberMe}
                                             onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        />
                                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                             Stay signed in for 7 days
                                        </Label>
                                   </div>

                                   {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                                   <Button
                                        className="w-full h-12 text-lg gap-2"
                                        onClick={handleSendCode}
                                        disabled={isLoading}
                                   >
                                        {isLoading ? (
                                             <>
                                                  <Loader2 className="animate-spin" size={18} /> Sending Code...
                                             </>
                                        ) : (
                                             <>
                                                  Code me in <ArrowLeft className="rotate-180" size={18} />
                                             </>
                                        )}
                                   </Button>
                              </motion.div>
                         ) : (
                              <motion.div
                                   key="step-otp"
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: 20 }}
                                   className="space-y-8 py-4"
                              >
                                   <div className="flex justify-center">
                                        <OTPInput
                                             value={otp}
                                             onChange={setOtp}
                                             onComplete={(code: string) => handleVerifyOtp(code)}
                                             disabled={isLoading}
                                        />
                                   </div>

                                   {isLoading && (
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground animate-pulse">
                                             <Loader2 className="animate-spin" size={18} /> Verifying...
                                        </div>
                                   )}

                                   {error && <p className="text-center text-sm text-destructive font-medium">{error}</p>}

                                   <div className="text-center">
                                        <button
                                             type="button"
                                             onClick={() => { setStep('EMAIL'); setOtp(''); setError(''); }}
                                             disabled={isLoading}
                                             className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                                        >
                                             Wrong email? Try again
                                        </button>
                                   </div>
                              </motion.div>
                         )}
                    </AnimatePresence>
               </motion.div>
          </div>
     );
}
