// components/charts/chartConfigs.js
import ApexCharts from 'apexcharts';

export const chart07 = () => {
  const chartOptions = {
    deviceChart: {
      type: 'donut',
      label: 'Devices',
      series: [],
      options: {
        chart: {
          type: 'donut',
          height: 350,
          id: 'chartSevenDevices',
        },
        colors: [
          '#465fff', '#6c7eff', '#879aff', '#a3b5ff', '#becfff', '#d9e5ff'
        ],
        title: {
          text: 'Device Distribution',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
          },
          margin: 20,
        },
        labels: [],
        dataLabels: {
          enabled: false,
        },
        fill: {
          opacity: 0.7,
        },
        stroke: {
          width: 1,
          colors: undefined,
        },
        legend: {
          position: 'bottom',
          markers: {
            shape: 'circle',
            radius: 5,
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Devices',
                  color: '#465fff',
                },
              },
            },
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: '100%',
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      },
    },

    browserChart: {
      type: 'pie',
      label: 'Browsers',
      series: [],
      options: {
        chart: {
          type: 'pie',
          height: 350,
          id: 'chartSevenBrowsers',
        },
        colors: [
          '#465fff', '#6c7eff', '#879aff', '#a3b5ff', '#becfff'
        ],
        title: {
          text: 'Browser Usage',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
          },
          margin: 20,
        },
        labels: [],
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return Math.round(val) + '%';
          },
          dropShadow: {
            enabled: false,
          },
        },
        fill: {
          opacity: 0.7,
        },
        stroke: {
          width: 1,
          colors: undefined,
        },
        legend: {
          position: 'right',
          markers: {
            shape: 'circle',
            radius: 5,
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5,
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                width: '100%',
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      },
    },
  };

  return chartOptions;
};
