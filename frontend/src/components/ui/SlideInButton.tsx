import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, ExternalLink, Users, Mail, Rocket } from "lucide-react";

// Icon mapping - you can extend this with more icons
const iconMap = {
     ArrowRight: ArrowRight,
     ChevronRight: ChevronRight,
     ExternalLink: ExternalLink,
     Users: Users,
     Mail: Mail,
     Rocket: Rocket,
};

export interface SlideInButtonProps {
     variant?: "large" | "medium" | "small";
     buttonText?: string;
     defaultTextColor?: string;
     hoverTextColor?: string;
     defaultBackgroundColor?: string;
     hoverBackgroundColor?: string;
     iconName?: keyof typeof iconMap;
     link?: string;
     newTab?: boolean;
     smoothScroll?: boolean;
     onClick?: () => void;
     className?: string;
     borderColor?: string;
     hoverBorderColor?: string;
     useGradient?: boolean;
     gradientFrom?: string;
     gradientTo?: string;
     hoverGradientFrom?: string;
}

const SlideInButton: React.FC<SlideInButtonProps> = ({
     variant = "large",
     buttonText = "Get Started",
     defaultTextColor = "#000000",
     hoverTextColor = "#ffffff",
     defaultBackgroundColor = "#ffffff",
     hoverBackgroundColor = "#0055ff",
     iconName = "ArrowRight",
     link,
     newTab = false,
     smoothScroll = true,
     onClick,
     className = "",
     borderColor,
     hoverBorderColor,
     useGradient = false,
     gradientFrom = "#16a34a",
     gradientTo = "#15803d",
     hoverGradientFrom = "#15803d",
}) => {
     const [isHovered, setIsHovered] = useState(false);
     const [showBackgroundFill, setShowBackgroundFill] = useState(false);
     const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
     const buttonRef = useRef<HTMLDivElement>(null);
     const timeoutRef = useRef<NodeJS.Timeout | null>(null);

     const IconComponent = iconMap[iconName] || ArrowRight;

     // Variant-specific styles
     const variantStyles = {
          large: {
               padding: "14px 26px",
               iconSize: 19,
               fontSize: "16px",
               borderRadius: "39px",
          },
          medium: {
               padding: "10px 22px",
               iconSize: 17,
               fontSize: "14px",
               borderRadius: "35px",
          },
          small: {
               padding: "5px 18px",
               iconSize: 15,
               fontSize: "12px",
               borderRadius: "30px",
          },
     };

     const currentVariant = variantStyles[variant];

     // Adjust padding when border is present to maintain consistent button size
     const adjustedPadding = borderColor
          ? currentVariant.padding.split(' ').map((p) => {
               const numValue = parseInt(p.replace('px', ''));
               return `${numValue - 1}px`;
          }).join(' ')
          : currentVariant.padding;

     // Cleanup timeout on unmount
     useEffect(() => {
          return () => {
               if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
               }
          };
     }, []);

     const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
          if (buttonRef.current) {
               const rect = buttonRef.current.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const y = e.clientY - rect.top;
               setMousePos({ x, y });
          }
          setIsHovered(true);

          // Clear any existing timeout
          if (timeoutRef.current) {
               clearTimeout(timeoutRef.current);
          }

          // Delay background fill to allow circle animation to be visible
          timeoutRef.current = setTimeout(() => {
               setShowBackgroundFill(true);
          }, 200);
     };

     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
          if (buttonRef.current && isHovered) {
               const rect = buttonRef.current.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const y = e.clientY - rect.top;
               setMousePos({ x, y });
          }
     };

     const handleMouseLeave = () => {
          // Clear the timeout to prevent background fill if user leaves quickly
          if (timeoutRef.current) {
               clearTimeout(timeoutRef.current);
               timeoutRef.current = null;
          }

          setIsHovered(false);
          setShowBackgroundFill(false);
     };

     const buttonContent = (
          <motion.div
               ref={buttonRef}
               className="relative cursor-pointer flex items-center justify-center w-fit overflow-hidden"
               style={{
                    padding: adjustedPadding,
                    borderRadius: currentVariant.borderRadius,
                    background: useGradient
                         ? showBackgroundFill
                              ? hoverGradientFrom  // Use solid color for final hover state
                              : `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`
                         : showBackgroundFill
                              ? hoverBackgroundColor
                              : defaultBackgroundColor,
                    minWidth: "fit-content",
                    width: "fit-content",
                    boxSizing: "border-box",
                    border: borderColor ? `1px solid ${isHovered && hoverBorderColor ? hoverBorderColor : borderColor}` : 'none',
               }}
               onMouseEnter={handleMouseEnter}
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
               onClick={onClick}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}>
               {/* Background fill animation - Circle that expands from cursor position */}
               <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                         background: useGradient
                              ? hoverGradientFrom  // Use solid color instead of gradient for hover
                              : hoverBackgroundColor,
                         width: "8px",
                         height: "8px",
                         left: mousePos.x,
                         top: mousePos.y,
                         x: "-50%",
                         y: "-50%",
                    }}
                    initial={{ scale: 0 }}
                    animate={{
                         scale: isHovered ? 20 : 0,
                    }}
                    transition={{
                         type: "spring",
                         stiffness: 300,
                         damping: 20,
                         bounce: 0.1,
                         duration: 0.5,
                    }}
               />

               {/* Text content */}
               <motion.span
                    className="z-10 font-medium select-none"
                    style={{
                         color: isHovered ? hoverTextColor : defaultTextColor,
                         fontSize: currentVariant.fontSize,
                         fontWeight: "600",
                         letterSpacing: "-0.02em",
                    }}
                    animate={{
                         x: isHovered ? -8 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    {buttonText}
               </motion.span>

               {/* Icon - slides in from right with no space when hidden */}
               <motion.div
                    className="relative z-10 flex items-center justify-center overflow-hidden"
                    style={{
                         color: isHovered ? hoverTextColor : defaultTextColor,
                         height: currentVariant.iconSize,
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                         width: isHovered ? currentVariant.iconSize : 0,
                         opacity: isHovered ? 1 : 0,
                    }}
                    transition={{
                         type: "spring",
                         stiffness: 400,
                         damping: 25,
                    }}>
                    <motion.div
                         initial={{ x: 16 }}
                         animate={{
                              x: isHovered ? 0 : 16,
                         }}
                         transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              delay: isHovered ? 0.1 : 0,
                         }}>
                         <IconComponent
                              size={currentVariant.iconSize}
                              strokeWidth={2.5}
                         />
                    </motion.div>
               </motion.div>
          </motion.div>
     );

     // If link is provided, wrap with Next.js Link
     if (link) {
          if (link.startsWith("http") || newTab) {
               return (
                    <a
                         href={link}
                         target={newTab ? "_blank" : "_self"}
                         rel={newTab ? "noopener noreferrer" : undefined}
                         className={`inline-block no-underline ${className}`}>
                         {buttonContent}
                    </a>
               );
          }

          return (
               <Link
                    to={link}
                    className={`inline-block no-underline ${className}`}>
                    {buttonContent}
               </Link>
          );
     }

     // Return button without link wrapper
     return <div className={`inline-block ${className}`}>{buttonContent}</div>;
};

export default SlideInButton;
