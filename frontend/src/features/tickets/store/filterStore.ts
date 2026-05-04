import { create } from 'zustand';
import type { TicketFilters } from '../../../types';

interface FilterStore {
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: {} }),
}));
