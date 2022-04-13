import _ from 'lodash';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useQuery } from "@apollo/client";
import { Spin } from 'antd';

import { dataStatistical } from '../../constant/dummyData';
import { GET_DASHBOARD_CHART } from '../../graphql/schemas/dashboard/query';
import { timer, getFullData } from '../../helpers';

const databaseStatistical = (tableData) => {
  return {
    labels: _.map(tableData, item => _.get(item,'period_name')),
    datasets: [
      {
        label: `Tổng doanh thu`,
        data: _.map(tableData, item => _.get(item,'total_amount')),
        backgroundColor: '#2C7BE5',
        borderRadius: Number.MAX_VALUE,
        borderSkipped: false,
        borderWidth: 1,
        borderColor: '#F5F5F5',
        barThickness: 20
      }
    ],
  }
};

const options = {
  plugins: {
    legend: {
      position: 'bottom'
    }
  },

  scales: {
    y: {
      ticks: {
        callback: function (value, index, values) {
          return index === values.length - 1 ? 'Đồng' : Intl.NumberFormat().format(value);
        }
      }
    },
  },
};

const Statistical = ({ timeFilter }) => {
  const getTimer = timer(timeFilter);
  const { loading, data, refetch } = useQuery(GET_DASHBOARD_CHART, {
    variables: {
      type: _.get(getTimer,'type'),
      from: _.get(getTimer,'dateFrom'),
      to: _.get(getTimer,'dateTo')
    },
  });
  
  if(loading) {
    return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
  }
  
  const tableData = getFullData({timeFilter:timeFilter, data: _.get(data, 'result')});

  return (
    <div style={{ position: "relative", margin: "auto", width: "100%" }}>
      <Bar data={() => databaseStatistical(tableData)} options={options} />
    </div>
  )
}

export default Statistical;
