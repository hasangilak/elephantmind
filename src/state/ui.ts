/**
 * Ephemeral UI state (toast). Not persisted.
 */
import { create } from 'zustand';

interface UIState {
  toast: string | null;
  /** monotonically increases so repeated identical messages re-animate */
  seq: number;
  showToast(message: string): void;
  clearToast(): void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useUI = create<UIState>((set, get) => ({
  toast: null,
  seq: 0,
  showToast: (message) => {
    if (timer) clearTimeout(timer);
    set((s) => ({ toast: message, seq: s.seq + 1 }));
    timer = setTimeout(() => set({ toast: null }), 1800);
  },
  clearToast: () => {
    if (timer) clearTimeout(timer);
    set({ toast: null });
  },
}));
