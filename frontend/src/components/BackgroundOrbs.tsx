import { motion } from 'framer-motion';

export function BackgroundOrbs() {
     return (
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
               <motion.div
                    animate={{
                         x: [0, 100, 0],
                         y: [0, -50, 0],
                         scale: [1, 1.2, 1],
                    }}
                    transition={{
                         duration: 5,
                         repeat: Infinity,
                         ease: "linear"
                    }}
                    style={{ willChange: "transform" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[80px]"
               />
               <motion.div
                    animate={{
                         x: [0, -100, 0],
                         y: [0, 50, 0],
                         scale: [1, 1.3, 1],
                    }}
                    transition={{
                         duration: 6,
                         repeat: Infinity,
                         ease: "linear"
                    }}
                    style={{ willChange: "transform" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[80px]"
               />
               <div className="absolute top-[20%] left-[50%] w-[300px] h-[300px] bg-secondary/30 rounded-full blur-[80px]" />
          </div>
     );
}
