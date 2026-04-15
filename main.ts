import { loadEntries as loadEntriesApi } from "./api/api";
import { initForm } from "./features/form";
import {
  showEntriesLoading,
  hideEntriesLoading,
  showEntriesError,
  renderEntries,
  initEntries,
} from "./features/entries";
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
    const entries = (result.data as EntriesApiData).data;

    hideEntriesLoading();
    renderEntries(entries);
  } catch (_error) {
    showEntriesError();
  }
}

initEntries({
  onOpenModal(entry: Entry) {
    console.log("Clicked entry:", entry);
  },
});

initForm({
  async onSuccess() {
    await loadEntries();
  },
});

void loadEntries();
