// components/charts/chart-04.js
import ApexCharts from 'apexcharts';
import { ApiService } from '../../services/apiService';

export async function chart04() {
  const container = document.getElementById('chart-04');
  if (!container) {
    console.error('Chart container not found');
    return; // Don't proceed if the container doesn't exist
  }

  // Show loading state
  container.innerHTML = '<div class="chart-loading">Loading device data...</div>';

  try {
    const data = await ApiService.getDeviceCounts();
    
    // Debug: Log the raw data to ensure it’s in the correct format
    console.log('Received data:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format from API');
    }

    // Check that data has the properties we expect
    const seriesData = data.map(item => item.count);
    const categories = data.map(item => item._id || 'Unknown');

    if (seriesData.length === 0 || categories.length === 0) {
      throw new Error('No valid data for chart rendering');
    }

    const options = {
      chart: {
        type: 'bar', // Change chart type to 'bar'
        height: 350,
        animations: {
          enabled: true
        }
      },
      series: [{
        name: 'Device Count',
        data: seriesData // Ensure 'data' is populated
      }],
      xaxis: {
        categories: categories // Ensure 'categories' are populated
      },
      title: {
        text: 'Device Distribution',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      legend: {
        position: 'top'
      },
      // responsive: [{
      //   breakpoint: 480,
      //   options: {
      //     chart: {
      //       width: '100%'
      //     },
      //     legend: {
      //       position: 'bottom'
      //     }
      //   }
      // }]
    };

    // Clear container before rendering the chart
    container.innerHTML = '<div id="chart-04-render"></div>';
    
    // Create and render the bar chart
    const chart = new ApexCharts(
      document.querySelector('#chart-04-render'), 
      options
    );
    
    await chart.render();
    return chart;

  } catch (error) {
    console.error('Error in chart04:', error);
    container.innerHTML = `
      <div class="chart-error">
        <p>${error.message}</p>
        <button class="retry-btn" onclick="window.Dashboard.initialize()">Retry</button>
      </div>
    `;
    throw error; // Re-throw for dashboard.js to handle
  }
}
