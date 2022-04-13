import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

const dataPie = {
  labels: ['Người dùng mới', 'Người dùng cũ'],
  datasets: [
    {
      label: '#Người dùng mới',
      data: [12, 19],
      borderWidth: 1,
      backgroundColor: '#FA3434'
    },
    {
      label: '#Người dùng cũ',
      data: [12, 19],
      borderWidth: 1,
      backgroundColor: '#FCB040'
    },
  ],
};

const EndUser = ({timeFilter}) => {
  return (
    <div style={{ position: "relative", margin: "auto", width: "100%" }}>
      <Doughnut data={dataPie} />
    </div>
  )
}

EndUser.propTypes = {

};

export default EndUser;
