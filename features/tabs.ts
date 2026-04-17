import { loadEntries } from "../main";

export function initTabs():void {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t)=>t.classList.remove("active")); 
      tab.classList.add("active");

      const content = document.querySelectorAll(".tab-content");
      content.forEach((c) => c.classList.remove("active"));

      const name = (tab as HTMLElement).dataset.tab;
      if (!name) return;

      const id = name + "-section";
      if (name === "entries") {
        loadEntries();
      }
      const section= document.getElementById(id);
      if (section) {
        section.classList.add("active")
      }
    });
});
}


export function switchToTab(name:string):void {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t) => t.classList.remove("active"));

  const targetTab = document.querySelector(`[data-tab="${name}"]`) 
  as HTMLElement | null;

  if(targetTab){
  targetTab.classList.add("active");
  }

  const content = document.querySelectorAll(".tab-content");
  content.forEach((c) => c.classList.remove("active"));
   const section= document.getElementById(name + "-section");
   if (section){
    section.classList.add("active");
   }
}
