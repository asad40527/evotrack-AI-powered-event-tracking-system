import { ApiService } from '../../services/apiService';
import ApexCharts from 'apexcharts';

export async function chart11() {
  const container = document.querySelector('#userActivityChart');
  if (!container) {
    console.error('Chart container not found for userActivityChart');
    return;
  }

  // Show loading state
  container.innerHTML = '<div class="chart-loading">Loading user activity data...</div>';

  let chart = null;
  const REFRESH_INTERVAL = 30000; // 30 seconds
  const MAX_POINTS = 12; // Show fewer data points for less crowding

  async function fetchData() {
    try {
      // Use ApiService to get user activity data
      const result = await ApiService.getUserActivity();
      const rawData = result?.data;

      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('No user activity data available.');
      }

      const processed = rawData.length > MAX_POINTS
        ? rawData.filter((_, i) => i % Math.floor(rawData.length / MAX_POINTS) === 0)
        : rawData;

      const dataPoints = processed.map(item => ({
        date: new Date(item._id).toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        }).replace(' ', '-'), // e.g., Jan-2025
        count: item.count
      }));

      return {
        labels: dataPoints.map(d => d.date),
        series: dataPoints.map(d => d.count)
      };

    } catch (error) {
      console.error('Error fetching user activity data:', error);
      throw error;
    }
  }

  async function renderChart() {
    try {
      const { labels, series } = await fetchData();

      const options = {
        chart: {
          type: 'line', // Line chart for a cleaner look
          height: 350,
          zoom: { enabled: true },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1000
          },
          toolbar: { show: false }
        },
        series: [{
          name: 'Active Users',
          data: series
        }],
        xaxis: {
          categories: labels,
          labels: {
            rotate: 0, // Keep text straight
            style: {
              fontSize: '12px',
              colors: '#666',
              fontStyle: 'normal',
              fontFamily: 'inherit'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '12px',
              colors: '#666'
            },
            formatter: val => Number.isInteger(val) ? val : ''
          },
          tickAmount: 6
        },
        colors: ['#465fff'], // Custom brand color
        dataLabels: {
          enabled: false
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} users`
          },
          theme: 'light'
        },
        title: {
          text: 'User Activity Over Time',
          align: 'center',
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333'
          }
        },
        legend: {
          show: false
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4
        }
      };

      container.innerHTML = '<div id="chart-11-render"></div>';

      if (chart) {
        chart.destroy();
      }

      chart = new ApexCharts(document.querySelector('#chart-11-render'), options);
      await chart.render();

      // Update refresh time display
      const refreshTime = new Date().toLocaleString();
      const refreshElem = document.querySelector('.refresh-time');
      if (refreshElem) refreshElem.textContent = refreshTime;

    } catch (error) {
      console.error('Error rendering user activity chart:', error);
      container.innerHTML = `
        <div class="chart-error">
          <p>${error.message}</p>
          <button class="retry-btn" onclick="window.Dashboard?.initialize?.()">Retry</button>
        </div>
      `;
    }
  }

  // Initial render
  await renderChart();

  // Auto-refresh every 30 seconds
  const intervalId = setInterval(() => {
    renderChart();
  }, REFRESH_INTERVAL);

  return { chart, intervalId };
}
