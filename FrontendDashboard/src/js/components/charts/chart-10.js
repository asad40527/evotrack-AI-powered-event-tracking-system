import ApexCharts from 'apexcharts';
import { ApiService } from '../../services/apiService';

export async function chart10() {
  const container = document.querySelector('#timeChart');
  if (!container) {
    console.error('Chart container not found for timeChart');
    return;
  }

  container.innerHTML = '<div class="chart-loading">Loading time data...</div>';

  try {
    const rawData = await ApiService.getTimeDistribution();
    console.log('Raw Data:', rawData);

    // Step 1: Aggregate by Month (e.g., Jan, Feb)
    const monthlyDataMap = new Map();

    rawData.forEach(item => {
      if (!item._id || typeof item.totalTimeSpent !== 'number') return;
      const date = new Date(item._id);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g., "Feb 2025"

      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, item.totalTimeSpent);
      } else {
        monthlyDataMap.set(monthKey, monthlyDataMap.get(monthKey) + item.totalTimeSpent);
      }
    });

    const sortedMonthly = Array.from(monthlyDataMap.entries())
      .map(([month, totalTimeSpent]) => ({
        month,
        totalTimeSpent: +(totalTimeSpent / 3600).toFixed(2) // Convert to hours
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month)); // Ensure order

    const labels = sortedMonthly.map(item => item.month);
    const series = sortedMonthly.map(item => item.totalTimeSpent);

    if (labels.length === 0 || series.length === 0) {
      throw new Error('No monthly time data to display.');
    }

    // Step 2: Chart options
    const options = {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeOutCubic',
          speed: 1000,
        },
      },
      series: [{
        name: 'Time Spent (hrs)',
        data: series,
      }],
      title: {
        text: 'User Time Spent by Month',
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#465fff'], // Updated to consistent color
      },
      markers: {
        size: 5,
        colors: ['#465fff'], // Updated to consistent color
        strokeColors: '#fff',
        strokeWidth: 2,
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500,
            colors: '#555',
          },
        },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        title: {
          text: 'Time Spent (hrs)',
          style: { fontSize: '14px', fontWeight: 600 },
        },
        labels: {
          formatter: val => `${val.toFixed(1)}h`,
          style: { fontSize: '12px', colors: '#666' },
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: val => `${val.toFixed(2)} hours`,
        },
      },
      grid: {
        borderColor: '#eaeaea',
        strokeDashArray: 4,
      },
    };

    container.innerHTML = '<div id="chart-10-render"></div>';
    const chart = new ApexCharts(document.querySelector('#chart-10-render'), options);
    await chart.render();
    return chart;

  } catch (error) {
    console.error('Error in chart10:', error);
    container.innerHTML = `
      <div class="chart-error">
        <p>${error.message}</p>
        <button class="retry-btn" onclick="window.Dashboard.initialize()">Retry</button>
      </div>
    `;
    throw error;
  }
}
