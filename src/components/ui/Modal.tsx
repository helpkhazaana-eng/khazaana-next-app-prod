'use client';

import { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

type ModalVariant = 'success' | 'warning' | 'error' | 'info' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ModalVariant, { icon: React.ReactNode; iconBg: string; buttonBg: string }> = {
  success: {
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-100',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
  },
  error: {
    icon: <AlertCircle className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-100',
    buttonBg: 'bg-red-600 hover:bg-red-700',
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
  confirm: {
    icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
    iconBg: 'bg-orange-100',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const isConfirmMode = variant === 'confirm' || onConfirm;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}

        {/* Icon */}
        <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className="text-slate-500 text-center text-sm mb-6">
            {message}
          </p>
        )}

        {/* Custom content */}
        {children && <div className="mb-6">{children}</div>}

        {/* Buttons */}
        <div className={`flex gap-3 ${isConfirmMode ? 'justify-center' : 'justify-center'}`}>
          {isConfirmMode && (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onClose();
              }
            }}
            disabled={loading}
            className={`px-6 py-2.5 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 ${styles.buttonBg}`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
