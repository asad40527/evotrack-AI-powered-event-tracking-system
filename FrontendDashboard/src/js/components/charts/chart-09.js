import ApexCharts from 'apexcharts';
import { ApiService } from '../../services/apiService';

export async function chart09() {
  const container = document.querySelector('#eventChart');
  if (!container) {
    console.error('Chart container not found for eventChart');
    return;
  }

  // Show loading state
  container.innerHTML = '<div class="chart-loading">Loading event data...</div>';

  try {
    const rawData = await ApiService.getEventCounts();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('No event data available.');
    }

    const labelMap = new Map();
    rawData.forEach(item => {
      if (!item || typeof item.count !== 'number') return;
      const label = (item._id || 'Unknown').slice(0, 20).trim();
      labelMap.set(label, (labelMap.get(label) || 0) + item.count);
    });

    const eventData = Array.from(labelMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12); // Top 12 event types

    const labels = eventData.map(item => item.label);
    const series = eventData.map(item => item.count);

    if (series.length === 0) {
      throw new Error('No usable data to display for events.');
    }

    const chartOptions = {
      series: [
        {
          name: 'Events',
          data: series,
        },
      ],
      colors: ['#465fff'],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'bar',
        height: 180,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '39%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 4,
        colors: ['transparent'],
      },
      xaxis: {
        categories: labels,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            fontSize: '12px',
            colors: '#333',
          },
        },
      },
      yaxis: {
        title: false,
        labels: {
          style: {
            fontSize: '12px',
            colors: '#666',
          },
        },
      },
      grid: {
        yaxis: {
          lines: {
            show: true,
          },
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          formatter: function (val) {
            return `${val} events`;
          },
        },
      },
      legend: {
        show: false,
      },
    };

    container.innerHTML = '<div id="chart-09-render"></div>';
    const chart = new ApexCharts(document.querySelector('#chart-09-render'), chartOptions);
    await chart.render();
    return chart;

  } catch (error) {
    console.error('Error in chart09:', error);
    container.innerHTML = `
      <div class="chart-error">
        <p>${error.message}</p>
        <button class="retry-btn" onclick="window.Dashboard.initialize()">Retry</button>
      </div>
    `;
    throw error;
  }
}
