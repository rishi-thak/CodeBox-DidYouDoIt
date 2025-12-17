import { FaDiscord, FaInstagram, FaLinkedin } from "react-icons/fa";
import { CgMail } from "react-icons/cg";
import React from "react";

const Footer = () => {
     // Cast icons to any to avoid React 19 type conflicts
     const Instagram = FaInstagram as any;
     const Discord = FaDiscord as any;
     const Linkedin = FaLinkedin as any;
     const Mail = CgMail as any;

     return (
          <footer className="bg-black border-t border-white/10 py-8 mt-auto">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                         <p className="text-sm text-gray-500">
                              Made with ♥️ for Cal Poly students by Cal Poly students
                         </p>
                         <div className="flex space-x-4">
                              <a
                                   href="https://instagram.com/codeboxorg"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-gray-500 hover:text-white transition-colors">
                                   <Instagram size={20} />
                              </a>
                              <a
                                   href="https://discord.gg/etH8DFQQwk"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-gray-500 hover:text-white transition-colors">
                                   <Discord size={20} />
                              </a>
                              <a
                                   href="https://www.linkedin.com/company/codeboxorg"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-gray-500 hover:text-white transition-colors">
                                   <Linkedin size={20} />
                              </a>
                              <a
                                   href="mailto:codebox@calpoly.edu"
                                   className="text-gray-500 hover:text-white transition-colors mt-[-0.5px]">
                                   <Mail size={22} />
                              </a>
                         </div>
                    </div>
               </div>
          </footer>
     );
};

export default Footer;
