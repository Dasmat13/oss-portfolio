import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Container with staggered child reveal
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Item with fade-up spring motion
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 20 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Interactive card with tilt/glow hover effect
export const MotionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.008 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`transition-colors duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Animated active tab pill
export const MotionTab: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  className?: string;
}> = ({ active, onClick, children, count, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 ${
        active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
      } ${className}`}
    >
      {active && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 rounded-xl -z-10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.5 text-[11px] font-mono rounded-full ${
            active ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// Modal animation wrapper
export const MotionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
