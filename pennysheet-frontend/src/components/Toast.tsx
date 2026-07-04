import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

export type ToastType = "success" | "warning" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const STYLES: Record<ToastType, { container: string; icon: string }> = {
  success: { container: "border-l-4 border-green-500 bg-green-50", icon: "text-green-500" },
  warning: { container: "border-l-4 border-amber-500 bg-amber-50", icon: "text-amber-500" },
  error: { container: "border-l-4 border-red-500 bg-red-50", icon: "text-red-500" }
};

/**
 * Render the icon for toast message.
 */
function ToastIcon({ type, className }: { type: ToastType; className: string }) {
  if (type === "success") return <CheckCircleIcon className={className} />;
  if (type === "warning") return <ExclamationTriangleIcon className={className} />;
  return <XCircleIcon className={className} />;
}

/**
 * Provider for toast notifications. Wraps the app to
 * enable notifications via the {@link useToast} hook.
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      const id = nextId.current++;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Component to show toast on the top left of the screen.
 */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const style = STYLES[toast.type];

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-white shadow-lg border border-gray-200 p-4 transition-all duration-300 ease-in-out min-w-80 max-w-sm ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${style.container}`}
    >
      <ToastIcon type={toast.type} className={`size-5 shrink-0 ${style.icon}`} />
      <span className="text-sm text-gray-700 flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  );
}

/**
 * Hook to show toast notifications. Must be used within a ToastProvider.
 *
 * @returns An object with a `showToast` function.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
