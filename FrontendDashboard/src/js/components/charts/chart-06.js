import ApexCharts from 'apexcharts';

export const chart06 = () => {
  const options = {
    chart: {
      id: 'chart-six',
      type: 'line', // Change type as needed
      height: 310,
      fontFamily: 'Outfit, sans-serif'
    },
    series: [{
      name: 'Data',
      data: [30, 40, 35, 50, 49, 60] // Sample data
    }],
    // Add other ApexCharts options (colors, labels, etc.)
  };

  const chart = new ApexCharts(document.querySelector("#chartSix"), options);
  chart.render();
};