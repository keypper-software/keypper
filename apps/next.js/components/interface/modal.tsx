import React, { FC, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { AnimatePresence, motion } from "motion/react";
import Card from "./card";

const Modal: FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
  isOpen: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}> = ({ 
  children, 
  title, 
  description, 
  onClose, 
  isOpen,
  size = "md"
}) => {

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
   
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="flex min-h-full  items-center justify-center pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full ${sizeClasses[size]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative overflow-hidden bg-black border border-white/5  rounded-xl">
      
                <div className="absolute inset-0  opacity-50 bg-gradient-to-br from-green-900/5 to-accent/5"></div>
                
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800/50 text-gray-400 hover:text-white z-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <X size={18} />
                  <span className="sr-only">Close</span>
                </Button>
                
                <div className="relative pb-2">
                  <h3 className="text-xl font-medium text-white mb-1">{title}</h3>
                  {description && (
                    <p className="text-xs text-gray-400 mb-3">{description}</p>
                  )}
                  
                  </div>

                <div className="relative">
                  {children}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;