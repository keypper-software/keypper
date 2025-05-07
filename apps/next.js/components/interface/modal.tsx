import React, { FC } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { AnimatePresence, motion } from "motion/react";
import Card from "./card";

const Modal: FC<{
  children: React.ReactNode;
  title: string;
  description: string;
  onClose: () => void;
  isOpen: boolean;
}> = ({ children, title, description, onClose, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
          onClick={onClose}
        >
          <Card
            className="bg-black-001 p-6 rounded-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-2xl">{title}</h1>
              <Button variant="ghost" className="size-8" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
            <p className="text-gray-500 mt-2">{description}</p>
            <div className="mt-6">{children}</div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
