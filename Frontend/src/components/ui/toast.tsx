"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle } from "lucide-react";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
};

type ToastContextType = {
  toast: (opts: Omit<ToastType, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = (opts: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...opts, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastCard({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-full rounded-xl border p-4 shadow-sm bg-white border-border text-foreground transition-all duration-300 animate-in slide-in-from-bottom-2",
        toast.variant === "success" && "border-success/20 bg-success/[0.02]",
        toast.variant === "error" && "border-error/20 bg-error/[0.02]"
      )}
    >
      {toast.variant === "success" && (
        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
      )}
      {toast.variant === "error" && (
        <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
      )}
      <div className="flex-1 flex flex-col gap-0.5">
        {toast.title && (
          <h4 className="text-sm font-bold text-foreground leading-tight">
            {toast.title}
          </h4>
        )}
        {toast.description && (
          <p className="text-xs text-muted-foreground leading-normal">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
