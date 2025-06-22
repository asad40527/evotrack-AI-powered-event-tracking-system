// dashboard.js
import { chart04 } from './components/charts/chart-04';
import { chart08 } from './components/charts/chart-08';
import { chart09 } from './components/charts/chart-09';
import { chart10 } from './components/charts/chart-10';  // time chart
import { chart11 } from './components/charts/chart-11';
import { sentimentAnalysisChart } from './components/charts/sentimentChart';
import { ApiService } from './services/apiService';
import { initializeChatbot } from './components/chatbot/chatbot';

const chartInstances = {};
const dataCache = {
  device: null,
  browser: null,
  event: null,
  time: null,
  userActivity: null,
  sentiment: null
};

const chartUpdaters = {
  device: (data) => {
    if (!chartInstances.deviceChart) return;
    try {
      const newSeries = data.map(item => item.count);
      const newLabels = data.map(item => item._id || 'Unknown');
      chartInstances.deviceChart.updateSeries([{ data: newSeries }]);
      chartInstances.deviceChart.updateOptions({ xaxis: { categories: newLabels } });
    } catch (err) {
      console.error('Error updating device chart:', err);
    }
  },

  browser: (data) => {
    if (!chartInstances.browserChart) return;
    try {
      const newSeries = data.map(item => item.count);
      const newLabels = data.map(item => item._id || 'Unknown');
      chartInstances.browserChart.updateSeries(newSeries);
      chartInstances.browserChart.updateOptions({ labels: newLabels });
    } catch (err) {
      console.error('Error updating browser chart:', err);
    }
  },

  event: (data) => {
    if (!chartInstances.eventChart) return;
    try {
      const newSeries = data.map(item => item.count);
      const newLabels = data.map(item => item._id || 'Unknown');
      chartInstances.eventChart.updateSeries(newSeries);
      chartInstances.eventChart.updateOptions({ labels: newLabels });
    } catch (err) {
      console.error('Error updating event chart:', err);
    }
  },

  time: async (data) => {
    try {
      // Show loading state on time chart container
      const container = document.getElementById('timeChart');
      if (container) {
        container.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-20">Loading time chart...</div>`;
      }

      // Destroy existing chart instance if exists
      if (chartInstances.timeChart) {
        chartInstances.timeChart.destroy();
        chartInstances.timeChart = null;
      }

      // Await chart10 to render the time chart freshly with new data
      chartInstances.timeChart = await chart10();

    } catch (err) {
      console.error('Error rendering time chart:', err);
      const container = document.getElementById('timeChart');
      if (container) {
        container.innerHTML = `
          <div class="text-red-600 dark:text-red-400 text-center py-10">
            Failed to load time chart.
            <button class="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onclick="window.Dashboard.refresh()">Retry</button>
          </div>`;
      }
    }
  },

  userActivity: (data) => {
    if (!chartInstances.userActivityChart?.chart) return;
    try {
      const processed = data.map(item => ({
        x: new Date(item._id).toLocaleDateString(),
        y: item.count
      }));
      chartInstances.userActivityChart.chart.updateSeries([{ data: processed }]);
    } catch (err) {
      console.error('Error updating user activity chart:', err);
    }
  },

  sentiment: (data) => {
    if (!chartInstances.sentimentChart?.chart) return;
    try {
      const positive = data.filter(item => item.sentiment === 'POSITIVE').length;
      const negative = data.filter(item => item.sentiment === 'NEGATIVE').length;
      const neutral = data.filter(item => item.sentiment === 'NEUTRAL').length;

      chartInstances.sentimentChart.chart.updateSeries([positive, negative, neutral]);
      chartInstances.sentimentChart.chart.updateOptions({
        labels: [
          `Positive (${positive})`,
          `Negative (${negative})`,
          `Neutral (${neutral})`
        ]
      });
    } catch (err) {
      console.error('Error updating sentiment chart:', err);
    }
  }
};

async function loadComponent(containerId, htmlPath) {
  try {
    const response = await fetch(htmlPath);
    if (!response.ok) throw new Error(`HTTP ${response.status} loading ${htmlPath}`);
    const html = await response.text();
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);

    // Append loading placeholder in container for each chart partial (optional)
    container.innerHTML += `<div id="${htmlPath.split('/').pop().replace('.html', '')}Loading" class="text-center py-10 text-gray-500 dark:text-gray-400">Loading...</div>`;
    container.innerHTML += html;
    return true;
  } catch (error) {
    console.error(`Error loading ${containerId}:`, error);
    return false;
  }
}

function updateRefreshTime() {
  const now = new Date();
  document.querySelectorAll('.refresh-time').forEach(el => {
    el.textContent = now.toLocaleTimeString();
  });
}

async function refreshData() {
  try {
    const [
      deviceData,
      browserData,
      eventData,
      timeData,
      userActivityData,
      sentimentData
    ] = await Promise.all([
      ApiService.getDeviceCounts(),
      ApiService.getBrowserCounts(),
      ApiService.getEventCounts(),
      ApiService.getTimeDistribution(),
      ApiService.getUserActivity(),
      ApiService.getSentimentData()
    ]);

    if (deviceData && JSON.stringify(deviceData) !== JSON.stringify(dataCache.device)) {
      chartUpdaters.device(deviceData);
      dataCache.device = deviceData;
    }

    if (browserData && JSON.stringify(browserData) !== JSON.stringify(dataCache.browser)) {
      chartUpdaters.browser(browserData);
      dataCache.browser = browserData;
    }

    if (eventData && JSON.stringify(eventData) !== JSON.stringify(dataCache.event)) {
      chartUpdaters.event(eventData);
      dataCache.event = eventData;
    }

    if (timeData && JSON.stringify(timeData) !== JSON.stringify(dataCache.time)) {
      await chartUpdaters.time(timeData);
      dataCache.time = timeData;
    }

    if (userActivityData && JSON.stringify(userActivityData) !== JSON.stringify(dataCache.userActivity)) {
      chartUpdaters.userActivity(userActivityData);
      dataCache.userActivity = userActivityData;
    }

    if (sentimentData && JSON.stringify(sentimentData) !== JSON.stringify(dataCache.sentiment)) {
      chartUpdaters.sentiment(sentimentData);
      dataCache.sentiment = sentimentData;
    }

    updateRefreshTime();
  } catch (error) {
    console.error('Refresh failed:', error);
  }
}

function setupAutoRefresh() {
  refreshData();
  const intervalId = setInterval(refreshData, 300000); // 5 minutes refresh
  return () => {
    clearInterval(intervalId);
    Object.values(chartInstances).forEach(instance => {
      if (instance?.chart) instance.chart.destroy();
    });
  };
}

export async function initializeDashboard() {
  try {
    const containerId = 'dashboard-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    const chartComponents = [
      { name: 'chart04', path: './partials/chart/chart-04.html' },
      { name: 'chart08', path: './partials/chart/chart-08.html' },
      { name: 'chart09', path: './partials/chart/chart-09.html' },
      { name: 'chart10', path: './partials/chart/chart-10.html' },  // time chart container
      { name: 'chart11', path: './partials/chart/chart-11.html' },
      { name: 'sentimentChart', path: './partials/chart/sentimentChart.html' }
    ];

    // Load all partials
    await Promise.all(chartComponents.map(c => loadComponent(containerId, c.path)));

    // Initialize charts
    chartInstances.deviceChart = await chart04();
    chartInstances.browserChart = await chart08();
    chartInstances.eventChart = await chart09();
    chartInstances.timeChart = await chart10();   // time chart initialize here
    chartInstances.userActivityChart = await chart11();
    chartInstances.sentimentChart = await sentimentAnalysisChart();

    initializeChatbot();

    return setupAutoRefresh();

  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    const container = document.getElementById('dashboard-container');
    if (container) {
      container.innerHTML = `
        <div class="p-4 rounded-lg bg-red-50 border border-red-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Initialization Error</h3>
              <div class="mt-1 text-sm text-red-700">${error.message}</div>
              <div class="mt-4">
                <button onclick="window.Dashboard.initialize()" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return () => {};
  }
}

window.Dashboard = {
  initialize: initializeDashboard,
  charts: chartInstances,
  refresh: refreshData
};

document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard().catch(console.error);
});
