import { create } from "zustand";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  msg: string;
}

interface ToastStore {
  items: Toast[];
  push: (kind: ToastKind, msg: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastStore>()((set) => ({
  items: [],
  push(kind, msg) {
    const id = nextId++;
    set((s) => ({ items: [...s.items, { id, kind, msg }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 5000);
  },
  dismiss(id) {
    set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (msg: string) => useToasts.getState().push("success", msg),
  error: (msg: string) => useToasts.getState().push("error", msg),
  info: (msg: string) => useToasts.getState().push("info", msg),
};

const KIND_STYLE: Record<ToastKind, string> = {
  success: "border-success/50 bg-success/15 text-success",
  error: "border-destructive/50 bg-destructive/15 text-destructive",
  info: "border-info/50 bg-info/15 text-info",
};

export function Toaster() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);
  if (!items.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto cursor-pointer rounded-lg border px-4 py-3 text-left text-sm shadow-lg backdrop-blur",
            KIND_STYLE[t.kind],
          )}
        >
          {t.msg}
        </button>
      ))}
    </div>
  );
}
