import React from 'react';
import { X } from 'lucide-react';

export default function ModalV3({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl border-v3 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex-between p-4 border-bottom-v3 bg-background-secondary">
          <span className="text-13 font-bold text-primary">{title}</span>
          <button onClick={onClose} className="btn-icon-v3 hover:bg-background-tertiary">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-between p-4 border-top-v3 bg-background-secondary gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
