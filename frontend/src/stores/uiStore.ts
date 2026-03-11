import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeProjectId: string | null;
  toggleSidebar: () => void;
  setActiveProject: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeProjectId: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActiveProject: (id) => set({ activeProjectId: id }),
}));