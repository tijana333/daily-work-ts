type Entry = {
  _id?: string;
  date: string;
  hours: number;
  intensity: number;
  challenge?: string;
  note?: string;
};

type InitHeatmapOptions = {
  apiUrl: string;
};

type HeatmapApiResponse = {
  success?: boolean;
  data?: Entry[];
  count?: number;
};

type HeatmapDayElement = HTMLDivElement & {
  entryData?: Entry;
};

let refreshHeatmapData: (() => void) | null = null;

export function initHeatmap({ apiUrl }: InitHeatmapOptions): void {
  const currentMonthElement = document.getElementById(
    "current-month",
  ) as HTMLElement | null;
  const previousMonthButton = document.getElementById(
    "prev-month",
  ) as HTMLButtonElement | null;
  const nextMonthButton = document.getElementById(
    "next-month",
  ) as HTMLButtonElement | null;
  const monthCarousel = document.getElementById(
    "month-carousel",
  ) as HTMLElement | null;

  const grid = document.querySelector(".heatmap-grid") as HTMLElement | null;
  const emptyState = document.querySelector(
    ".heatmap-empty-state",
  ) as HTMLElement | null;
  const tooltip = document.querySelector(
    ".heatmap-tooltip",
  ) as HTMLElement | null;
  const heatmapContainer = document.querySelector(
    ".heatmap-container",
  ) as HTMLElement | null;
  const totalHours = document.getElementById(
    "total-hours",
  ) as HTMLElement | null;
  const daysLogged = document.getElementById(
    "days-logged",
  ) as HTMLElement | null;
  const avgIntensity = document.getElementById(
    "avg-intensity",
  ) as HTMLElement | null;

  if (
    !currentMonthElement ||
    !previousMonthButton ||
    !nextMonthButton ||
    !monthCarousel ||
    !grid ||
    !emptyState ||
    !tooltip ||
    !heatmapContainer ||
    !totalHours ||
    !daysLogged ||
    !avgIntensity
  ) {
    throw new Error("Missing required heatmap DOM elements");
  }

  let activeMonth = new Date();
  let startX = 0;
  let endX = 0;
  let startY = 0;
  let endY = 0;
  // RENDER MONTH
  function renderMonth(): void {
    const monthText = activeMonth.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
    });
    currentMonthElement.textContent = monthText;
  }
  // RENDER HEATMAP
  function renderHeatmap(): void {
    grid.innerHTML = "";

    const month = activeMonth.getMonth();
    const year = activeMonth.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    emptyState.style.display = "none";
    grid.style.display = "grid";

    for (let i = 1; i <= daysInMonth; i++) {
      const newDiv = document.createElement("div") as HeatmapDayElement;
      newDiv.classList.add("heatmap-day");

      newDiv.addEventListener("mouseenter", function () {
        if (!newDiv.entryData) return;

        const entry = newDiv.entryData;

        tooltip.textContent =
          "Date: " +
          entry.date +
          " | Hours: " +
          entry.hours +
          " | Intensity: " +
          entry.intensity;

        const rect = newDiv.getBoundingClientRect();
        const containerRect = heatmapContainer.getBoundingClientRect();

        tooltip.style.left =
          rect.left - containerRect.left + rect.width / 2 + "px";
        tooltip.style.top =
          rect.top - containerRect.top + rect.height + 12 + "px";
        tooltip.style.display = "block";
      });

      newDiv.addEventListener("mouseleave", function () {
        tooltip.style.display = "none";
      });

      grid.appendChild(newDiv);
    }
  }
  // LOAD HEATMAP DATA
  async function loadHeatmapData(): Promise<void> {
    const month = activeMonth.getMonth();
    const year = activeMonth.getFullYear();

    try {
      const response = await fetch(
        apiUrl + "?month=" + (month + 1) + "&year=" + year,
      );

      if (!response.ok) {
        emptyState.style.display = "block";
        grid.style.display = "none";
        totalHours.textContent = "0";
        daysLogged.textContent = "0";
        avgIntensity.textContent = "0.0";
        return;
      }

      const data = (await response.json()) as HeatmapApiResponse;
      const entries = data.data || [];

      if (entries.length > 0) {
        grid.style.display = "grid";
        emptyState.style.display = "none";

        entries.forEach(function (entry) {
          const day = new Date(entry.date).getDate();
          const daySquare = grid.children[day - 1] as
            | HeatmapDayElement
            | undefined;

          if (!daySquare) return;

          daySquare.classList.add("level-" + entry.intensity);
          daySquare.entryData = entry;
        });
      } else {
        emptyState.style.display = "block";
        grid.style.display = "none";
      }

      let totalHoursSum = 0;
      let totalIntensity = 0;

      entries.forEach(function (entry) {
        totalHoursSum += entry.hours;
        totalIntensity += entry.intensity;
      });

      const daysLoggedCount = entries.length;
      const averageIntensity =
        entries.length > 0 ? totalIntensity / daysLoggedCount : 0;

      totalHours.textContent = String(totalHoursSum);
      daysLogged.textContent = String(daysLoggedCount);
      avgIntensity.textContent = averageIntensity.toFixed(1);
    } catch (error) {
      emptyState.style.display = "block";
      grid.style.display = "none";
      totalHours.textContent = "0";
      daysLogged.textContent = "0";
      avgIntensity.textContent = "0.0";
      console.error("Failed to load heatmap data:", error);
    }
    refreshHeatmapData = updateHeatmapMonth;
  }
  // UPDATE HEATMAP MONTH
  function updateHeatmapMonth(): void {
    renderMonth();
    renderHeatmap();
    void loadHeatmapData();
  }

  previousMonthButton.addEventListener("click", function () {
    activeMonth = new Date(
      activeMonth.getFullYear(),
      activeMonth.getMonth() - 1,
      1,
    );
    updateHeatmapMonth();
  });

  nextMonthButton.addEventListener("click", function () {
    activeMonth = new Date(
      activeMonth.getFullYear(),
      activeMonth.getMonth() + 1,
      1,
    );
    updateHeatmapMonth();
  });

  monthCarousel.addEventListener("touchstart", function (event: TouchEvent) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  });

  monthCarousel.addEventListener("touchend", function (event: TouchEvent) {
    endX = event.changedTouches[0].clientX;
    endY = event.changedTouches[0].clientY;

    const deltaX = endX - startX;
    const swipeThreshold = 50;

    if (Math.abs(deltaX) < swipeThreshold) return;

    if (deltaX < 0) {
      activeMonth = new Date(
        activeMonth.getFullYear(),
        activeMonth.getMonth() + 1,
        1,
      );
      updateHeatmapMonth();
    }

    if (deltaX > 0) {
      activeMonth = new Date(
        activeMonth.getFullYear(),
        activeMonth.getMonth() - 1,
        1,
      );
      updateHeatmapMonth();
    }
  });

  updateHeatmapMonth();
}
export function refreshHeatmap() {
  if (refreshHeatmapData) {
    refreshHeatmapData();
  }
}
