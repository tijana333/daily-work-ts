interface Entry {
  _id: string;
  date: string;
  hours: number;
  challenge: string;
  intensity: number | string;
}

type InitEntriesOptions = {
  onOpenModal?: (entry: Entry) => void;
};

const entriesList = document.getElementById("entries-list");
const entriesLoading = document.getElementById("entries-loading");
const emptyStateMessage = document.getElementById("empty-state-message");

if (!entriesList || !entriesLoading || !emptyStateMessage) {
  throw new Error("Missing required DOM elements");
}

let renderedEntries: Entry[] = [];

// SHOW ENTRIES
export function showEntriesLoading(): void {
  entriesLoading.style.display = "flex";
  entriesList.style.display = "none";
  emptyStateMessage.style.display = "none";
}
// HIDE ENTRIES
export function hideEntriesLoading(): void {
  entriesLoading.style.display = "none";
}
// ENTRIES ERROR
export function showEntriesError(): void {
  entriesLoading.style.display = "none";
  entriesList.style.display = "block";
  entriesList.textContent = "Something went wrong!";
}
//RENDER ENTRIES
export function renderEntries(entries: Entry[]): void {
  if (entries.length === 0) {
    emptyStateMessage.style.display = "block";
    entriesList.style.display = "none";
  } else {
    emptyStateMessage.style.display = "none";
    entriesList.style.display = "flex";
  }
  renderedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  entriesList.innerHTML = renderedEntries
    .map((entry) => {
      const date = new Date(entry.date);
      const day = date.getDate();
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      return `
    <div class="entry-card" data-id="${entry._id}">
      
      <div class="entry-date">
        <span class="day">${day}</span>
        <span class="month">${monthYear}</span>
      </div>

      <div class="entry-content">
        <div class="hours">${entry.hours} hours</div>
        <div class="challenge">${entry.challenge}</div>
      </div>

      <div class="entry-intensity">
        ${entry.intensity}
      </div>

    </div>
  `;
    })
    .join("");
}
// INIT ENTRIES
export function initEntries({ onOpenModal }: initEntriesOptions): void {
  entriesList.addEventListener("click", function (event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const card = target.closest(".entry-card");
    if (!card) return;

    const entryId = card.getAttribute("data-id");
    if (!entryId) return;

    const entry = renderedEntries.find((item) => {
      return item._id === entryId;
    });

    if (!entry) return;

    if (onOpenModal) {
      onOpenModal(entry);
    }
  });
}
