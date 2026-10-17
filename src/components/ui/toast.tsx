import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export const toast = {
  show(type: ToastType, message: string, description?: string, duration = 4000) {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type, message, description, duration };
    toasts = [item, ...toasts.filter((t) => t.message !== message)].slice(0, 5);
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
      }, duration);
    }
  },
  success(message: string, description?: string, duration?: number) {
    this.show('success', message, description, duration);
  },
  error(message: string, description?: string, duration?: number) {
    this.show('error', message, description, duration);
  },
  info(message: string, description?: string, duration?: number) {
    this.show('info', message, description, duration);
  },
  warning(message: string, description?: string, duration?: number) {
    this.show('warning', message, description, duration);
  },
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: ToastListener = (updated) => setItems(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none px-4 sm:px-0"
    >
      {items.map((item) => {
        const isSuccess = item.type === 'success';
        const isError = item.type === 'error';
        const isWarning = item.type === 'warning';
        const isInfo = item.type === 'info';

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              isSuccess
                ? 'bg-white border-emerald-200/90 text-slate-800'
                : isError
                ? 'bg-white border-rose-200/90 text-slate-800'
                : isWarning
                ? 'bg-white border-amber-200/90 text-slate-800'
                : 'bg-white border-blue-200/90 text-slate-800'
            }`}
          >
            {/* Left Type Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {isInfo && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            {/* Message & Description */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold leading-snug break-words text-slate-900">
                {item.message}
              </p>
              {item.description && (
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed break-words">
                  {item.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => toast.dismiss(item.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-95"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default toast;
