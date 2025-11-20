import { useEffect } from 'react';
import GlassCard from './ui/GlassCard';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <GlassCard
        className="w-[90%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 animate-scale-in bg-background/95 border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="flex gap-3 justify-end px-8 py-5 border-t border-white/10 bg-white/5">
            {footer}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Modal;
