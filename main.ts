import { loadEntries as loadEntriesApi } from "./api/api";
import { initForm, startEditingEntry } from "./features/form";
import {
  showEntriesLoading,
  hideEntriesLoading,
  showEntriesError,
  renderEntries,
  initEntries,
} from "./features/entries";
import { initTabs, switchToTab } from "./features/tabs";
import { initModal, openEntryModal } from "./features/modal";
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
  success: boolean;
  data: Entry[];
  count: number;
};

const API_URL = "https://daily-work-backend.vercel.app/api/entries";

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
    const responseData = result.data as EntriesApiData;
    const entries = responseData.data;

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
  },
});

initForm({
  async onSuccess() {
    await loadEntries();
    switchToTab("entries");
  },
});

initTabs();
void loadEntries();
