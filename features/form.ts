import {
  submitEntry as submitEntryApi,
  updateEntry as updateEntryApi,
} from "../api/api";

import { state } from "../state/state";

import {
  validateDate,
  validateHours,
  validateChallenge,
} from "../utils/validators";

type EntryInput = {
  date: string;
  hours: number;
  intensity: number | string;
  challenge: string;
  note?: string;
};

type Entry = EntryInput & {
  _id: string;
};

type InitFormOptions = {
  onSuccess?: () => void | Promise<void>;
};

const form = document.getElementById("entry-form") as HTMLFormElement | null;
const dateElement = document.getElementById("date") as HTMLInputElement | null;
const hoursElement = document.getElementById(
  "number",
) as HTMLInputElement | null;
const challengeElement = document.getElementById(
  "text",
) as HTMLInputElement | null;
const noteElement = document.getElementById(
  "note",
) as HTMLTextAreaElement | null;

const successMsg = document.getElementById(
  "success-message",
) as HTMLElement | null;
const serverError = document.getElementById(
  "server-error",
) as HTMLElement | null;

const dateError = document.getElementById("date-error") as HTMLElement | null;
const hoursError = document.getElementById("hours-error") as HTMLElement | null;
const challengeError = document.getElementById(
  "challenge-error",
) as HTMLElement | null;

const buttons = document.querySelectorAll<HTMLElement>(".intensity-button");
if (
  !form ||
  !dateElement ||
  !hoursElement ||
  !challengeElement ||
  !noteElement ||
  !successMsg ||
  !serverError ||
  !dateError ||
  !hoursError ||
  !challengeError
) {
  throw new Error("Missing required form DOM elements");
}

const submitBtn = form.querySelector(
  'button[type="submit"]',
) as HTMLButtonElement | null;

if (!submitBtn) {
  throw new Error("Missing submit button");
}

const submitBtnText = submitBtn.querySelector("span") as HTMLSpanElement | null;

if (!submitBtnText) {
  throw new Error("Missing submit button text span");
}

let messageTimer: number | undefined;
const todayDate = new Date().toISOString().substring(0, 10);
const originalSubmitButtonText = submitBtnText.textContent ?? "Save Entry";
let onSuccessHandler: (() => void | Promise<void>) | null = null;
//TIMER

function showTimedMessage(element: HTMLElement, message: string): void {
  if (messageTimer) {
    window.clearTimeout(messageTimer);
  }
  successMsg.style.display = "none";
  serverError.style.display = "none";

  element.textContent = message;
  element.style.display = "block";

  messageTimer = window.setTimeout(function () {
    element.style.display = "none";
  }, 5000);
}
// SET LOADING
function setLoading(isLoading: boolean): void {
  if (isLoading) {
    submitBtnText.textContent = "Saving...";
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
  } else {
    submitBtnText.textContent = originalSubmitButtonText;
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
}
async function updateEntry(id: string, entry: EntryInput): Promise<void> {
  setLoading(true);

  try {
    const result = await updateEntryApi(id, entry);

    if (result.status === 200) {
      showTimedMessage(successMsg, "Entry updated successfully!");

      if (onSuccessHandler) {
        await onSuccessHandler();
      }
    } else {
      showTimedMessage(serverError, "Update failed!");
    }
  } catch (error) {
    showTimedMessage(serverError, "Update failed!");
  } finally {
    setLoading(false);
  }
}

// SUBMIT ENTRY
async function submitEntry(entry: EntryInput): Promise<void> {
  setLoading(true);

  try {
    const result = await submitEntryApi(entry);

    if (result.status === 409) {
      showTimedMessage(serverError, "Entry for this date already exists");
      return;
    }

    if (result.status === 201) {
      form.reset();
      dateElement.value = todayDate;
      state.editingEntryId = null;
      submitBtnText.textContent = "Save Entry";
      state.intensity = 1;

      buttons.forEach(function (button) {
        const numberSpan = button.querySelector(".tab-number");
        const spanValue = numberSpan?.textContent;
        button.classList.remove("active");

        if (spanValue === "1") {
          button.classList.add("active");
        }
      });

      showTimedMessage(successMsg, "Entry created successfully!");

      if (onSuccessHandler) {
        await onSuccessHandler();
      }
    } else {
      showTimedMessage(serverError, "Please check your input and try again.");
    }
  } catch (error) {
    showTimedMessage(serverError, "Failed to save entry.");
  } finally {
    setLoading(false);
  }
}
// START EDITING ENTRY
export function startEditingEntry(entry: Entry): void {
  state.editingEntryId = entry._id;
  submitBtnText.textContent = "Update Entry";

  dateElement.value = entry.date;
  hoursElement.value = String(entry.hours);
  challengeElement.value = entry.challenge;
  noteElement.value = entry.note || "";
  state.intensity = entry.intensity;

  buttons.forEach(function (intensityButton) {
    intensityButton.classList.remove("active");
    const numberSpan = intensityButton.querySelector(".tab-number");

    if (numberSpan.textContent == entry.intensity) {
      intensityButton.classList.add("active");
    }
  });
}
dateElement.addEventListener("change", function () {
  validateDate(dateElement, dateError, todayDate);
});
hoursElement.addEventListener("input", function () {
  validateHours(hoursElement, hoursError);
});

challengeElement.addEventListener("input", function () {
  validateChallenge(challengeElement, challengeError);
});
// FORM SUBMISSION
form.addEventListener("submit", function (event: SubmitEvent) {
  event.preventDefault();
  let hasErrors = false;

  const isValidHours = validateHours(hoursElement, hoursError);

  if (!isValidHours) {
    hasErrors = true;
  }
  const isValidChallenge = validateChallenge(challengeElement, challengeError);
  if (!isValidChallenge) {
    hasErrors = true;
  }
  const isValidDate = validateDate(dateElement, dateError, todayDate);
  if (!isValidDate) {
    hasErrors = true;
  }
  const noteError = document.getElementById("note-error") as HTMLElement | null;
  const noteValue = noteElement.value.trim();

  noteError.textContent = "";
  noteError.classList.remove("show");
  noteElement.classList.remove("error");

  if (noteValue !== "" && noteValue.length > 500) {
    noteError.textContent = "Maximum 500 characters";
    noteError.classList.add("show");
    noteElement.classList.add("error");
    hasErrors = true;
  }
  if (hasErrors) {
    return;
  }
  const entry: EntryInput = {
    date: dateElement.value,
    hours: Number(hoursElement.value),
    intensity: state.intensity || 1,
    challenge: challengeElement.value.trim(),
    note: noteValue,
  };
  if (state.editingEntryId) {
    void updateEntry(state.editingEntryId, entry);
  } else {
    void submitEntry(entry);
  }
});
// INTENSITY BUTTON
buttons.forEach(function (button) {
  const numberSpan = button.querySelector(".tab-number");
  const spanValue = numberSpan?.textContent;
  if (spanValue === "1") {
    button.classList.add("active");
  }
});

buttons.forEach(function (button) {
  button.addEventListener("click", function (element) {
    buttons.forEach(function (btn) {
      btn.classList.remove("active");
    });
    button.classList.add("active");
    const numberSpan = button.querySelector(".tab-number");
    const buttonValue = numberSpan?.textContent;
    state.intensity = Number(buttonValue) || 1;
  });
});
// INIT FORM
export function initForm({ onSuccess }: InitFormOptions = {}): void {
  onSuccessHandler = onSuccess ?? null;
  dateElement.value = todayDate;
  dateElement.max = todayDate;
}
