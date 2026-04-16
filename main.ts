import { loadEntries as loadEntriesApi } from "./api/api";
import { initForm } from "./features/form";
import {
  showEntriesLoading,
  hideEntriesLoading,
  showEntriesError,
  renderEntries,
  initEntries,
} from "./features/entries";
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
  data: Entry[];
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
    console.log("API RESULT:", result);

    const entries = (result.data as EntriesApiData).data;
    console.log("ENTRIES FOR RENDER:", entries);

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
    console.log("EDIT ENTRY:", entry);
  },

  async onDelete(entry: Entry) {
    console.log("DELETE ENTRY:", entry);

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
  },
});

void loadEntries();
