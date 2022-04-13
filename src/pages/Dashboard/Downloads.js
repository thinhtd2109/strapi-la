import React from 'react';
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '# of Blue Votes',
      data: [244000, 300333, 20555, 52224, 100087, 412344, 1000025, 1230531, 1109845, 1022521, 1024431, 1100023],
      backgroundColor: '#2C7BE5',
      borderRadius: Number.MAX_VALUE,
      borderSkipped: false,
      borderWidth: 1,
      borderColor: '#F5F5F5',
      barThickness: 20
    },
    {
      label: '# of Green Votes',
      data: [144000, 200333, 10555, 42224, 200087, 312434, 200005, 1230531, 1109845, 1022521, 1024431, 1100023],
      backgroundColor: '#D2DDEC',
      borderRadius: Number.MAX_VALUE,
      borderSkipped: false,
      borderColor: '#F5F5F5',
      barThickness: 20
    },
  ],
};

const options = {
  scales: {
    y: {
      ticks: {
        callback: function (value, index, values) {
          return index === values.length - 1 ? 'Triệu đồng' : Intl.NumberFormat().format(value);
        }
      }
    },
  }
};


const Downloads = ({ timeFilter }) => {
  return (
    <div style={{ position: "relative", margin: "auto", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default Downloads;
