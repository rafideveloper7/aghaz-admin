'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, variant = 'danger' }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
                  variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  <FiAlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-sm text-gray-500 text-center">{message}</p>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
