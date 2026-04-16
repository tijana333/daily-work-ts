import { state } from "../state/state";
type Entry = {
  _id: string;
  date: string;
  hours: number;
  intensity: number | string;
  challenge: string;
  note?: string;
};

type InitModalOptions = {
  onEdit?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void | Promise<void>;
};

const entryDetailsModal = document.getElementById(
  "entry-details-modal",
) as HTMLElement | null;
const closeEntryModalButton = document.getElementById(
  "close-entry-modal",
) as HTMLButtonElement | null;
const deleteEntryButton = document.getElementById(
  "delete-entry-btn",
) as HTMLButtonElement | null;
const modalDate = document.getElementById(
  "modal-date",
) as HTMLInputElement | null;
const modalHours = document.getElementById(
  "modal-hours",
) as HTMLInputElement | null;
const modalIntensity = document.getElementById("modal-intensity") HTMLInputElement | null;
const modalChallenge = document.getElementById("modal-challenge") HTMLInputElement | null ;
const modalNote = document.getElementById("modal-note") as HTMLTextAreaElement | null;
const editBtn = document.getElementById("edit-entry-btn")as HTMLButtonElement | null;
const deleteConfirmModal = document.getElementById("delete-confirm-modal") as HTMLElement | null;
const cancelDeleteBtn = document.getElementById("cancel-delete-btn")as HTMLButtonElement | null;
const confirmDeleteBtn = document.getElementById("confirm-delete-btn")as HTMLButtonElement | null;


if (
    !entryDetailsModal ||
    !closeEntryModalButton ||
    !deteleEntryButton ||
    !modalDate ||
    !modalHours ||
    !modalIntensity ||
    !modalChallenge ||
    !modalNote ||
    !editBtn ||
    !deteleConfirmModal ||
    !cancelDeleteBtn ||
    !confirmDeleteBtn 
) {
    throw new Error ("Missing required modal DOM elements")
}

let onEditHandler: ((entry:Entry) => void) | null= null;
let onDeleteHandler: ((entry: Entry) => void | Promise <void>) | null = null;

export function openEntryModal(entry:Entry):void {
  state.selectedEntry = entry;

  modalDate.value = entry.date;
  modalHours.value = entry.hours;
  modalIntensity.value = entry.intensity;
  modalChallenge.value = entry.challenge;
  modalNote.value = entry.note || "";

  entryDetailsModal.style.display = "flex";
}

export function closeEntryModal() :void {
  entryDetailsModal.style.display = "none";
  state.selectedEntry = null;
}

export function initModal({ onEdit, onDelete } :InitModalOptions): void  {
  onEditHandler = onEdit ?? null;
  onDeleteHandler = onDelete ?? null;

  closeEntryModalButton.addEventListener("click", function () {
    closeEntryModal();
  });

  editBtn.addEventListener("click", function () {
    if (!state.selectedEntry) return;

    if (onEditHandler) {
      onEditHandler(state.selectedEntry);
    }

    closeEntryModal();
  });

  deleteEntryButton.addEventListener("click", function () {
    if (!state.selectedEntry) return;

    deleteConfirmModal.style.display = "flex";
  });

  cancelDeleteBtn.addEventListener("click", function () {
    deleteConfirmModal.style.display = "none";
  });

  confirmDeleteBtn.addEventListener("click", async function () {
    if (!state.selectedEntry) return;

    try {
      if (onDeleteHandler) {
        await onDeleteHandler(state.selectedEntry);
      }

      deleteConfirmModal.style.display = "none";
      closeEntryModal();
    } catch (error) {
      alert("Failed to delete entry.");
    }
  });
}
