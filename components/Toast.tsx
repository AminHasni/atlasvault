import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000); // Auto dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-slate-800 border-emerald-500/50 text-emerald-400';
      case 'error':
        return 'bg-slate-800 border-rose-500/50 text-rose-400';
      case 'info':
        return 'bg-slate-800 border-indigo-500/50 text-indigo-400';
      default:
        return 'bg-slate-800 border-slate-600 text-slate-200';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-xl shadow-black/20 transition-all animate-in slide-in-from-right-full duration-300 ${getStyles()}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium text-slate-200">{toast.message}</div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};