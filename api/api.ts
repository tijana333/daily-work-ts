const API_URL = "https://daily-work-backend.vercel.app/api/entries";

export type EntryInput = {
  date: string;
  hours: number;
  challenge: string;
  intensity: number | string;
  note?: string;
};

export type Entry = {
  _id: string;
  date: string;
  hours: number;
  challenge: string;
  intensity: number | string;
  note?: string;
};

type ApiResponse<T> = {
  status: number;
  data: T;
};

export async function submitEntry(
  entry: EntryInput,
): Promise<ApiResponse<Entry>> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function updateEntry(
  id: string,
  entry: EntryInput,
): Promise<ApiResponse<Entry>> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function loadEntryByDate(
  selectedDate: string,
): Promise<ApiResponse<Entry | null>> {
  const response = await fetch(`${API_URL}?date=${selectedDate}`);
  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function loadEntries(url: string): Promise<ApiResponse<Entry[]>> {
  const response = await fetch(url);
  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function updateEntry(
  id: string,
  entry: EntryInput,
): Promise<ApiResponse<any>> {
  const response = await fetch(API_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export async function loadEntryByDate(
  selectedDate: string,
): Promise<ApiResponse<any>> {
  const response = await fetch(API_URL + "?date=" + selectedDate);
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}
export async function loadEntries(url: string): Promise<ApiResponse<any>> {
  const response = await fetch(url);
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}
