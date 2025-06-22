// components/charts/chartRenderer.js
import { chartConfigs } from './chartConfigs';
import { ApiService } from '../../services/apiService';
import ApexCharts from 'apexcharts';

export class ChartRenderer {
  static chartInstances = {};

  static async renderAll() {
    try {
      this.destroyAllCharts();
      
      const [deviceData, browserData, eventData, timeData] = await Promise.all([
        ApiService.getDeviceCounts(),
        ApiService.getBrowserCounts(),
        ApiService.getEventCounts(),
        ApiService.getTimeDistribution()
      ]);

      if (document.querySelector(chartConfigs.deviceChart.selector)) {
        this.renderChart('deviceChart', deviceData);
      }
      if (document.querySelector(chartConfigs.browserChart.selector)) {
        this.renderChart('browserChart', browserData);
      }
      if (document.querySelector(chartConfigs.eventChart.selector)) {
        this.renderChart('eventChart', eventData);
      }
      if (document.querySelector(chartConfigs.timeChart.selector)) {
        this.renderChart('timeChart', timeData);
      }

    } catch (error) {
      console.error('Error rendering charts:', error);
      this.showGlobalError();
    }
  }

  static showGlobalError() {
    const errorContainer = document.getElementById('chartErrorContainer');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="chart-error">
          <p>Failed to load some chart data. <button onclick="ChartRenderer.renderAll()">Retry</button></p>
        </div>
      `;
    }
  }

  static destroyAllCharts() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.chartInstances = {};
  }

  static renderChart(chartId, chartData) {
    try {
      const config = chartConfigs[chartId];
      if (!config) {
        console.warn(`No config found for ${chartId}`);
        return;
      }

      // Prepare series data
      const seriesData = chartData.map(item => ({
        x: item._id || 'Unknown',
        y: item.count
      }));

      // Create chart options
      const options = {
        ...config.options,
        series: [{
          name: config.options.title.text,
          data: seriesData
        }]
      };

      // Destroy existing chart if present
      if (this.chartInstances[chartId]) {
        this.chartInstances[chartId].destroy();
      }

      // Create new chart instance
      this.chartInstances[chartId] = new ApexCharts(
        document.querySelector(config.selector),
        options
      );

      this.chartInstances[chartId].render();

    } catch (error) {
      console.error(`Error rendering ${chartId}:`, error);
      this.showChartError(chartId, 'Failed to render chart');
    }
  }

  static init() {
    if (document.readyState === 'complete') {
      this.renderAll();
    } else {
      window.addEventListener('load', () => this.renderAll());
    }
  }
}

// Auto-initialize
ChartRenderer.init();