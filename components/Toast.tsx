import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400',
      progressColor: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
      progressColor: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      progressColor: 'bg-yellow-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/50',
      iconColor: 'text-cyan-400',
      progressColor: 'bg-cyan-500',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, progressColor } = config[type];

  return (
    <div className={`fixed top-24 right-4 z-50 glass-strong ${borderColor} rounded-lg shadow-2xl animate-slide-up max-w-md w-full`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">{title}</h3>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {duration > 0 && (
        <div className="h-1 bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${progressColor} animate-progress`}
            style={{
              animation: `progress ${duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Add to globals.css
const progressAnimation = `
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress 5s linear;
}
`;
