// components/charts/chart-05.js
import ApexCharts from 'apexcharts';

export const chart05 = () => {
    const chartOptions = {
      series: [
        {
          name: "Growth",
          data: [30, 40, 35, 50, 49, 60]
        },
        {
          name: "Target",
          data: [20, 30, 40, 50, 60, 70]
        }
      ],
      colors: ["#465FFF", "#36BFFA"],
      chart: {
        id: 'area-chart',
        height: 310,
        type: "area",
        toolbar: {
          show: false
        },
        fontFamily: "Outfit, sans-serif"
      },
      title: {
        text: "Growth Metrics",
        align: "left",
        style: {
          fontSize: "16px",
          fontWeight: 600,
          fontFamily: "Outfit, sans-serif",
          color: "#101828"
        }
      },
      stroke: {
        curve: "smooth",
        width: 2
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      },
      xaxis: {
        categories: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
        labels: {
          style: {
            colors: "#98A2B3",
            fontFamily: "Outfit, sans-serif"
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: "#98A2B3",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      grid: {
        borderColor: "#E4E7EC",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false
          }
        }
      }
    };
  
    const chartSelector = document.querySelector("#chartFive");
  
    if (chartSelector) {
      const chart = new ApexCharts(chartSelector, chartOptions);
      chart.render();
    }
  };