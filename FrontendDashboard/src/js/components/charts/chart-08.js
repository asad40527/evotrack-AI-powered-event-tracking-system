import ApexCharts from 'apexcharts';
import { ApiService } from '../../services/apiService';

// Utility to normalize browser names
const normalizeBrowserName = (name = '') => {
  const lowered = name.toLowerCase();

  if (lowered.includes('chrome')) return 'Chrome';
  if (lowered.includes('firefox')) return 'Firefox';
  if (lowered.includes('safari') && !lowered.includes('chrome')) return 'Safari';
  if (lowered.includes('edge')) return 'Edge';
  if (lowered.includes('opera')) return 'Opera';
  if (lowered.includes('brave')) return 'Brave';
  if (lowered.includes('ie') || lowered.includes('internet explorer')) return 'IE';

  return 'Other';
};

export async function chart08() {
  const container = document.querySelector('#browserChart');
  if (!container) {
    console.error('Chart container not found for browserChart');
    return;
  }

  container.innerHTML = '<div class="chart-loading">Loading browser data...</div>';

  try {
    const rawData = await ApiService.getBrowserCounts();

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid or empty data received from API.');
    }

    // Normalize and aggregate counts
    const browserMap = new Map();
    rawData.forEach(item => {
      if (!item || typeof item.count !== 'number') return;
      const normalized = normalizeBrowserName(item._id || '');
      browserMap.set(normalized, (browserMap.get(normalized) || 0) + item.count);
    });

    // Convert map to sorted array and limit to top 7
    const groupedData = Array.from(browserMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const seriesData = groupedData.map(item => item.count);
    const categories = groupedData.map(item => item.label);

    if (seriesData.length === 0) {
      throw new Error('No usable browser data to display.');
    }

    const options = {
      chart: {
        type: 'bar',
        height: 360,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 500,
        },
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 8,
          distributed: false,
          barHeight: '70%',
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          colors: ['#fff'],
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val) => `${val} users`,
        },
      },
      series: [{ name: 'Users', data: seriesData }],
      xaxis: {
        categories,
        title: { text: 'Users' },
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 500,
            colors: '#555',
          },
        },
      },
      colors: ['#465fff'], // Single consistent brand color
      title: {
        text: 'Top Browser Usage',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
    };

    container.innerHTML = '<div id="chart-08-render"></div>';
    const chart = new ApexCharts(document.querySelector('#chart-08-render'), options);
    await chart.render();
    return chart;

  } catch (error) {
    console.error('Error rendering browser chart:', error);
    container.innerHTML = `
      <div class="chart-error">
        <p>${error.message}</p>
        <button class="retry-btn" onclick="window.Dashboard.initialize()">Retry</button>
      </div>
    `;
    throw error;
  }
}
