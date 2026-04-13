type Entry = {
  id: string;
  note?: string;
};

type ViewType = "month" | "all";

interface AppState {
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
