import React from 'react';
import SlideInButton from '../components/ui/SlideInButton';
import { useAuth } from '../hooks/useAuth';
import { FileText, Play, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
export default function Home() {
     useAuth(); // Just to load auth context if needed, though we don't access user here directly

     return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative z-10">
               <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-3xl mx-auto space-y-8"
               >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
                         <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                         </span>
                         Reimagined for the modern student
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                         Assignments, managed.<br />
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
                              Potential, unlocked.
                         </span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                         Focus on the work, not the logistics. A centralized hub for tracking every assignment, video, and resource.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                         <SlideInButton
                              link="/signin"
                              variant="large"
                              buttonText="Sign In"
                              useGradient={true}
                              gradientFrom="#16a34a"
                              gradientTo="#15803d"
                              hoverGradientFrom="#15803d"
                              defaultTextColor="#ffffff"
                              hoverTextColor="#ffffff"
                              iconName="ArrowRight"
                         />
                         <SlideInButton
                              link="https://codeboxorg.com"
                              variant="large"
                              buttonText="Learn More"
                              defaultBackgroundColor="transparent"
                              hoverBackgroundColor="#ffffff"
                              defaultTextColor="#ffffff"
                              hoverTextColor="#000000"
                              borderColor="#ffffff"
                              hoverBorderColor="#ffffff"
                              iconName="ExternalLink"
                              newTab={true}
                         />
                    </div>

                    <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
                         {[
                              { icon: Play, title: "Video Lessons", desc: "Seamless tracking for every video tutorial." },
                              { icon: FileText, title: "Documents", desc: "Centralize every guide, spec, and PDF." },
                              { icon: LinkIcon, title: "Resources", desc: "Curated links for easier access to materials." }
                         ].map((item, i) => (
                              <motion.div
                                   key={i}
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.2 + (i * 0.1) }}
                                   className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                              >
                                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <item.icon size={24} />
                                   </div>
                                   <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                   <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </motion.div>
                         ))}
                    </div>
               </motion.div>

               {/* Floating decorative elements */}
               <FloatingIcon icon={Play} className="top-[20%] left-[15%]" delay={0} />
               <FloatingIcon icon={FileText} className="top-[30%] right-[15%]" delay={2} />
               <FloatingIcon icon={LinkIcon} className="bottom-[20%] left-[20%]" delay={4} />
          </div>
     );
}

function FloatingIcon({ icon: Icon, className, delay }: { icon: any, className: string, delay: number }) {
     return (
          <motion.div
               animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
               }}
               transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeInOut"
               }}
               style={{ willChange: "transform" }}
               className={`absolute hidden lg:flex w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center text-muted-foreground opacity-50 ${className}`}
          >
               <Icon size={32} />
          </motion.div>
     )
}
