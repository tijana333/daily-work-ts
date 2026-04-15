export type Entry = {
  _id: string;
  date: string;
  hours: number;
  challenge: string;
  intensity: number | string;
  note?: string;
};

export type ViewType = "month" | "all";

export interface AppState {
  selectedEntry: Entry | null;
  editingEntryId: string | null;
  intensity: number;
  currentView: ViewType;
}

export const state: AppState = {
  selectedEntry: null,
  editingEntryId: null,
  intensity: 0,
  currentView: "month",
};
