// components/charts/chartConfigs.js
export const chartConfigs = {
  deviceChart: {
    type: 'donut',
    selector: '#deviceChart',
    series: [],
    options: {
      chart: {
        type: 'donut',
        height: 350
      },
      title: {
        text: 'Device Distribution',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  },
  browserChart: {
    type: 'pie',
    selector: '#browserChart',
    series: [],
    options: {
      chart: {
        type: 'pie',
        height: 350
      },
      title: {
        text: 'Browser Usage',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      colors: ['#E74C3C', '#2ECC71', '#3498DB', '#9B59B6', '#F1C40F'],
      legend: {
        position: 'right'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  },
  eventChart: {
    type: 'donut',
    selector: '#eventChart',
    series: [],
    options: {
      chart: {
        type: 'donut',
        height: 350
      },
      title: {
        text: 'Event Types',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      colors: ['#1ABC9C', '#3498DB', '#9B59B6', '#F1C40F', '#E67E22'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  },
  timeChart: {
    type: 'bar',
    selector: '#timeChart',
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      title: {
        text: 'Time Distribution',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      colors: ['#36A2EB'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: 'category'
      },
      yaxis: {
        tickAmount: 5,
        labels: {
          formatter: function(val) {
            return Math.floor(val);
          }
        }
      }
    }
  }
};