import { create } from 'zustand';

/**
 * Global UI state for lead dialogs, so any button on the site can open
 * "Enquire", "Book a site visit" or "Request a call-back" with context.
 */
export const useUiStore = create((set) => ({
  dialog: null, // 'enquiry' | 'site-visit' | 'callback' | null
  context: {}, // { residence?: string, source?: string }
  openDialog: (dialog, context = {}) => set({ dialog, context }),
  closeDialog: () => set({ dialog: null }),
}));
