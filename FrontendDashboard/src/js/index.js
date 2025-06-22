import "jsvectormap/dist/jsvectormap.min.css";
import "flatpickr/dist/flatpickr.min.css";
import "dropzone/dist/dropzone.css";
import "../css/style.css";
import 'apexcharts/dist/apexcharts.css'; 

import Alpine from "alpinejs";
import persist from "@alpinejs/persist";
import flatpickr from "flatpickr";
import Dropzone from "dropzone";

import chart01 from "./components/charts/chart-01";
import chart02 from "./components/charts/chart-02";
import chart03 from "./components/charts/chart-03";
import { chart04 } from "./components/charts/chart-04";
import { chart05 } from "./components/charts/chart-05";
import { chart06 } from "./components/charts/chart-06";
import { chart07 } from "./components/charts/chart-07";
import { chart08 } from "./components/charts/chart-08";
import { chart09 } from "./components/charts/chart-09";
import { chart10 } from "./components/charts/chart-10";
import { chart11 } from "./components/charts/chart-11";
// import { initializeChatbot } from "./components/chatbot/chatbot";
import { sentimentAnalysisChart } from "./components/charts/sentimentChart";
import map01 from "./components/map-01";
import "./components/calendar-init.js";
import "./components/image-resize";
import { initializeDashboard } from "./dashbord"; // Import the dashboard initialization

Alpine.plugin(persist);
window.Alpine = Alpine;
Alpine.start();

// Init flatpickr
flatpickr(".datepicker", {
  mode: "range",
  static: true,
  monthSelectorType: "static",
  dateFormat: "M j, Y",
  defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
  prevArrow:
    '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.25 6L9 12.25L15.25 18.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  nextArrow:
    '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 19L15 12.75L8.75 6.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  onReady: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace("to", "-");
    const customClass = instance.element.getAttribute("data-class");
    instance.calendarContainer.classList.add(customClass);
  },
  onChange: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace("to", "-");
  },
});

// Init Dropzone
const dropzoneArea = document.querySelectorAll("#demo-upload");

if (dropzoneArea.length) {
  let myDropzone = new Dropzone("#demo-upload", { url: "/file/post" });
}

// Document Loaded - Consolidated event listener
document.addEventListener("DOMContentLoaded", () => {
  // Initialize individual charts
  chart01();
  chart02();
  chart03();
  chart04();  // Already included, so this will handle the device chart initialization as well
  chart05();
  chart06();
  chart07();
  chart08();
  chart09();
  chart10();
  chart11();
  initializeChatbot(); 
  sentimentAnalysisChart();
  map01();
  
  // Initialize the dashboard
  initializeDashboard().catch(error => {
    console.error('Dashboard initialization failed:', error);
  });

  // Get the current year
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // For Copy functionality
  const copyInput = document.getElementById("copy-input");
  if (copyInput) {
    const copyButton = document.getElementById("copy-button");
    const copyText = document.getElementById("copy-text");
    const websiteInput = document.getElementById("website-input");

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(websiteInput.value).then(() => {
        copyText.textContent = "Copied";
        setTimeout(() => {
          copyText.textContent = "Copy";
        }, 2000);
      });
    });
  }

  // Search functionality
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  function focusSearchInput() {
    searchInput.focus();
  }

  searchButton.addEventListener("click", focusSearchInput);

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      focusSearchInput();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "/" && document.activeElement !== searchInput) {
      event.preventDefault();
      focusSearchInput();
    }
  });
});
