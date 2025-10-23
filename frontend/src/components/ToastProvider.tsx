import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";
type Pos =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

type Toast = {
  id: string;
  type: ToastType;
  text: string;
  position: Pos;
};

type ToastContextApi = {
  showToast: (opts: {
    type?: ToastType;
    text: string;
    ttl?: number;
    position?: Pos;
  }) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({
      type = "info",
      text,
      ttl = 3500,
      position = "top-right",
    }: {
      type?: ToastType;
      text: string;
      ttl?: number;
      position?: Pos;
    }) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
      const t: Toast = { id, type, text, position };
      setToasts((s) => [t, ...s]);

      // auto remove
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), ttl);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  // map position -> wrapper class (Tailwind)
  const positionMap: Record<Pos, string> = {
    "top-right": "fixed top-6 right-6 z-50 flex flex-col gap-3 items-end",
    "top-center": "fixed top-6 left-1/2 z-50 -translate-x-1/2 flex flex-col gap-3 items-center",
    "top-left": "fixed top-6 left-6 z-50 flex flex-col gap-3 items-start",
    "bottom-right": "fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end",
    "bottom-center": "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex flex-col gap-3 items-center",
    "bottom-left": "fixed bottom-6 left-6 z-50 flex flex-col gap-3 items-start",
  };

  // group toasts by position
  const grouped = toasts.reduce((acc: Record<Pos, Toast[]>, t) => {
    (acc[t.position] ||= []).push(t);
    return acc;
  }, {
    "top-right": [],
    "top-center": [],
    "top-left": [],
    "bottom-right": [],
    "bottom-center": [],
    "bottom-left": [],
  } as Record<Pos, Toast[]>);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* render one container per position */}
      {Object.keys(positionMap).map((posKey) => {
        const pos = posKey as Pos;
        const items = grouped[pos] || [];
        if (!items.length) return null;
        return (
          <div key={pos} className={positionMap[pos]} aria-live="polite">
            {items.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
            ))}
          </div>
        );
      })}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const bg =
    toast.type === "success" 
      ? "bg-gray-600"  //emerald
      : toast.type === "error" 
      ? "bg-rose-600" 
      : "bg-sky-600";

  return (
    <div
      role="status"
      className={`${bg} text-white px-4 py-2 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {toast.type === "success" ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 01.083 1.32l-.083.094L8.707 15.793a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.086l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : toast.type === "error" ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.366-.446.957-.59 1.466-.36l.105.06 6 3.5A1 1 0 0116 7.5v7a1 1 0 01-1.447.894L10 13.618l-4.553 2.776A1 1 0 014 16.5v-9a1 1 0 01.257-.7l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v3l-8 5-8-5V5z" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium">{toast.text}</div>
        </div>

        <button onClick={onDismiss} className="ml-3 rounded p-1 hover:bg-white/10">
          <svg className="h-4 w-4 opacity-90" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
