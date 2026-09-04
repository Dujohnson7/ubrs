import { useState, useCallback, useEffect, useRef } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let globalState: Toast[] = [];
let listeners: Set<() => void> = new Set();

const generateId = () => Math.random().toString(36).substring(2, 9);

function notify() {
  listeners.forEach((listener) => listener());
}

export function useToastStore() {
  const [, forceUpdate] = useState({});
  const listenerRef = useRef(() => forceUpdate({}));

  useEffect(() => {
    listeners.add(listenerRef.current);
    return () => {
      listeners.delete(listenerRef.current);
    };
  }, []);

  return {
    toasts: globalState,
    addToast: useCallback((type: ToastType, message: string, duration = 5000) => {
      const id = generateId();
      globalState = [...globalState, { id, type, message, duration }];
      notify();

      if (duration > 0) {
        setTimeout(() => {
          globalState = globalState.filter((toast) => toast.id !== id);
          notify();
        }, duration);
      }
    }, []),
    removeToast: useCallback((id: string) => {
      globalState = globalState.filter((toast) => toast.id !== id);
      notify();
    }, []),
    clearToasts: useCallback(() => {
      globalState = [];
      notify();
    }, []),
  };
}

export const toast = {
  success: (message: string, duration = 5000) => {
    const id = generateId();
    globalState = [...globalState, { id, type: "success" as ToastType, message, duration }];
    notify();
    if (duration && duration > 0) {
      setTimeout(() => {
        globalState = globalState.filter((toast) => toast.id !== id);
        notify();
      }, duration);
    }
  },
  error: (message: string, duration = 5000) => {
    const id = generateId();
    globalState = [...globalState, { id, type: "error" as ToastType, message, duration }];
    notify();
    if (duration && duration > 0) {
      setTimeout(() => {
        globalState = globalState.filter((toast) => toast.id !== id);
        notify();
      }, duration);
    }
  },
  info: (message: string, duration = 5000) => {
    const id = generateId();
    globalState = [...globalState, { id, type: "info" as ToastType, message, duration }];
    notify();
    if (duration && duration > 0) {
      setTimeout(() => {
        globalState = globalState.filter((toast) => toast.id !== id);
        notify();
      }, duration);
    }
  },
  warning: (message: string, duration = 5000) => {
    const id = generateId();
    globalState = [...globalState, { id, type: "warning" as ToastType, message, duration }];
    notify();
    if (duration && duration > 0) {
      setTimeout(() => {
        globalState = globalState.filter((toast) => toast.id !== id);
        notify();
      }, duration);
    }
  },
};
