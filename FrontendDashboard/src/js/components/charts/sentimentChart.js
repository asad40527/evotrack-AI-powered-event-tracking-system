import { ApiService } from '../../services/apiService';
import ApexCharts from 'apexcharts';

export async function sentimentAnalysisChart() {
  const container = document.querySelector('#sentimentChart');
  if (!container) {
    console.error('Sentiment chart container not found');
    return;
  }

  // Loading skeleton UI
  container.innerHTML = `
    <div class="flex items-center justify-center p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
      <div class="animate-pulse flex space-x-4 w-full max-w-md">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  let chart = null;
  const REFRESH_INTERVAL = 30000; // 30 seconds

  async function fetchData() {
    try {
      const result = await ApiService.getSentimentData();
      if (!result?.success) throw new Error(result?.error || 'Failed to fetch sentiment data');

      const sentimentData = result.data;
      const positiveCount = sentimentData.filter(item => item.sentiment === 'POSITIVE').length;
      const negativeCount = sentimentData.filter(item => item.sentiment === 'NEGATIVE').length;
      const neutralCount = sentimentData.filter(item => item.sentiment === 'NEUTRAL').length;

      return {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      };
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      throw error;
    }
  }

  async function renderChart() {
    try {
      const { positive, negative, neutral } = await fetchData();
      const total = positive + negative + neutral;

      container.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-900">
          <div id="sentiment-chart-render" class="min-h-[350px]"></div>
          <div class="text-xs text-gray-500 text-right mt-2 dark:text-gray-400">
            Last updated: ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `;

      const options = {
        chart: {
          type: 'donut',
          height: 350,
          animations: { enabled: true, easing: 'easeinout', speed: 800 },
          toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false }},
          fontFamily: 'Inter, sans-serif',
          foreColor: '#6B7280'
        },
        series: [positive, negative, neutral],
        labels: [
          `Positive (${positive})`,
          `Negative (${negative})`,
          `Neutral (${neutral})`
        ],
        colors: ['#10B981', '#EF4444', '#F59E0B'],
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val.toFixed(1)}%`,
          style: { fontSize: '12px', fontWeight: '600', colors: ['#1F2937'] }
        },
        legend: {
          position: 'right',
          horizontalAlign: 'center',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          markers: { width: 12, height: 12, strokeWidth: 0, radius: 12, offsetX: -4 },
          itemMargin: { horizontal: 8, vertical: 4 }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: { show: true, label: 'Total Responses', color: '#6B7280', fontSize: '14px', fontWeight: '500' },
                value: { fontSize: '24px', fontWeight: '700', color: '#111827' }
              }
            }
          }
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: (value, { seriesIndex }) => {
              const percentages = total ? [
                (positive / total) * 100,
                (negative / total) * 100,
                (neutral / total) * 100
              ] : [0, 0, 0];
              return `${value} responses (${percentages[seriesIndex].toFixed(1)}%)`;
            }
          },
          style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' }
        },
        title: {
          text: 'Sentiment Analysis',
          align: 'center',
          margin: 12,
          style: { fontSize: '16px', fontWeight: '600', color: '#111827', fontFamily: 'Inter, sans-serif' }
        }
      };

      if (chart) {
        chart.destroy();
      }

      chart = new ApexCharts(document.querySelector('#sentiment-chart-render'), options);
      await chart.render();

    } catch (error) {
      console.error('Error rendering sentiment chart:', error);
      container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-900">
          <div class="text-center py-4">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1 dark:text-gray-300">Failed to load data</h3>
            <p class="text-sm text-gray-500 mb-4 dark:text-gray-400">${error.message}</p>
            <button onclick="sentimentAnalysisChart()" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }

  setupFormListener();

  await renderChart();

  const intervalId = setInterval(() => {
    renderChart();
  }, REFRESH_INTERVAL);

  return { chart, intervalId };
}

function setupFormListener() {
  const form = document.getElementById('sentiment-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const textInput = document.getElementById('text-input');
    const resultElement = document.getElementById('sentiment-result');
    const submitBtn = form.querySelector('button[type="submit"]');

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Analyzing...
    `;

    try {
      const text = textInput.value.trim();
      if (!text) throw new Error('Please enter some text');

      // Clear previous results before analyzing
      resultElement.innerHTML = '';

      const result = await ApiService.analyzeSentiment(text);

      if (result.success) {
        const dataEntry = result.data?.[0]?.[0];
        if (dataEntry && dataEntry.label && typeof dataEntry.score === 'number') {
          const label = dataEntry.label.toUpperCase();
          const score = dataEntry.score;

          const sentimentClass = {
            POSITIVE: 'bg-green-100 text-green-800 border-green-200',
            NEGATIVE: 'bg-red-100 text-red-800 border-red-200',
            NEUTRAL: 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }[label] || 'bg-gray-100 text-gray-800 border-gray-200';

          resultElement.innerHTML = `
            <div class="p-4 rounded-lg border ${sentimentClass}">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  ${
                    label === 'POSITIVE' ? `
                      <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    ` : label === 'NEGATIVE' ? `
                      <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    ` : `
                      <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                      </svg>
                    `
                  }
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium">${label} sentiment</h3>
                  <div class="mt-1 text-sm">
                    Confidence: <span class="font-semibold">${(score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          `;

          // Refresh chart after new analysis
          sentimentAnalysisChart();
        } else {
          resultElement.innerHTML = `<p class="text-yellow-600">Sentiment analysis did not return valid results.</p>`;
        }
      } else {
        resultElement.innerHTML = `<p class="text-yellow-600">Sentiment analysis failed.</p>`;
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      resultElement.innerHTML = `
        <div class="p-4 rounded-lg bg-red-50 border border-red-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-1 text-sm text-red-700">${error.message}</div>
            </div>
          </div>
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}
