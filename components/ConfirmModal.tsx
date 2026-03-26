import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const colors = {
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20',
    info: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
  };

  const iconColors = {
    danger: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    info: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-6 ${iconColors[type]}`}>
            <AlertTriangle className="h-10 w-10" />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-10 max-w-xs">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${colors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
