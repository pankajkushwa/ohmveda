import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface ToastMessage {
  text: string;
  type: 'info' | 'error' | 'success';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          onClick={onClose}
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-sm font-semibold cursor-pointer max-w-md ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/30 text-red-300'
              : 'bg-blue-950/90 border-blue-500/30 text-blue-300'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />}
          {toast.type === 'error' && <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />}
          {toast.type === 'info' && <AlertTriangle className="w-5 h-5 shrink-0 text-blue-400" />}
          <span className="leading-snug">{toast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
