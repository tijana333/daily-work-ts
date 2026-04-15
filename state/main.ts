import { loadEntries as loadEntriesApi } from "./api/api";
import { startEditingEntry, initForm } from "./features/form";
import { initTabs, switchToTab } from "./features/tabs";
import {
  showEntriesLoading,
  hideEntriesLoading,
  showEntriesError,
  renderEntries,
  initEntries,
} from "./features/entries";
import { initModal, openEntryModal } from "./features/modal";
import { initHeatmap, refreshHeatmap } from "./features/heatmap";
import { state } from "./state/state";

type Entry = {
  _id: string;
  date: string;
  hours: number;
  challenge: string;
  intensity: number | string;
  note?: string;
};

type EntriesApiData = {
  data: Entry[];
};

const API_URL = "https://daily-work-backend.vercel.app/api/entries";

const thisMonthBtn = document.getElementById(
  "this-month",
) as HTMLElement | null;
const allEntriesBtn = document.getElementById(
  "all-entries",
) as HTMLElement | null;

if (!thisMonthBtn || !allEntriesBtn) {
  throw new Error("Missing filter buttons");
}

/* ========================================
ENTRIES LOADING
Fetch and render all entries
=========================================== */
export async function loadEntries(): Promise<void> {
  showEntriesLoading();

  let url = API_URL;

  try {
    if (state.currentView === "month") {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      url = `${API_URL}?month=${month}&year=${year}`;
    }

    const result = await loadEntriesApi(url);
    const entries = (result.data as EntriesApiData).data;

    hideEntriesLoading();
    renderEntries(entries);
  } catch (_error) {
    showEntriesError();
  }
}

initEntries({
  onOpenModal(entry: Entry) {
    openEntryModal(entry);
  },
});

initModal({
  onEdit(entry: Entry) {
    switchToTab("today");
    startEditingEntry(entry);
  },

  async onDelete(entry: Entry) {
    const response = await fetch(`${API_URL}/${entry._id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    await loadEntries();
    refreshHeatmap();
  },
});

initForm({
  async onSuccess() {
    await loadEntries();
    refreshHeatmap();
  },
});

initTabs();
initHeatmap({ apiUrl: API_URL });
void loadEntries();

thisMonthBtn.addEventListener("click", function () {
  state.currentView = "month";
  thisMonthBtn.classList.add("active");
  allEntriesBtn.classList.remove("active");
  void loadEntries();
});

allEntriesBtn.addEventListener("click", function () {
  state.currentView = "all";
  allEntriesBtn.classList.add("active");
  thisMonthBtn.classList.remove("active");
  void loadEntries();
});
