import _ from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Typography, Divider, Table, Tag } from 'antd';

import style from './style.module.scss';
import { GET_NEWEST_ORDERS } from '../../graphql/schemas/order/query';
import { useQuery } from '@apollo/client';
import { formatMoney, getOrderStatusStyle } from '../../helpers';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

const { Text } = Typography;

const columns = [
  {
    title: "STT",
    key: "id",
    render: (text, record, index) => {
      return <span>{index + 1}</span>;
    },
  },

  {
    title: "Mã đơn hàng",
    dataIndex: "code",
    key: "code",
    width: "200px",
    render: (text, record) => {
      return <span>{text}</span>;
    },
  },
  {
    title: "Thời gian tạo",
    dataIndex: "created",
    key: "created",
    render: (text, record) => {
      return <p>{moment(record.created).format("DD/MM/YYYY hh:mm A")}</p>;
    },
  },
  {
    title: "Tên khách hàng",
    dataIndex: "address",
    key: "address",
    render: (text, record) => {
      return <p style={{ color: "#3167EB" }}>{text.name}</p>;
    },
  },
  {
    title: "Số điện thoại",
    dataIndex: "address",
    key: "address",
    render: (text, record) => {
      return text.phone;
    },
  },
  {
    title: "Địa chỉ giao",
    dataIndex: "address",
    key: "address",
    width: "150px",
    render: (text, record) => {
      return _.get(text, "number", '') + " " + _.get(text, "street.name", '');
    },
  },
  {
    title: "Trạng thái",
    dataIndex: "order_status",
    key: "order_status",
    render: (status, record) => {
      return (
        <Tag
          color={getOrderStatusStyle(status?.code)?.color}
          style={{ color: getOrderStatusStyle(status?.code)?.textColor }}
          key={status?.code}
        >
          {status?.name}
        </Tag>
      );
    },
  },
  {
    title: "Tổng thanh toán",
    dataIndex: "total_amount",
    key: "total_amount",
    render: (text, record) => {
      return formatMoney(text) + " đ";
    },
  },
];


const LastOder = ({ timeFilter }) => {
  const history = useHistory();
  const [orderList, setOrderList] = useState([]);

  const { data, loading } = useQuery(GET_NEWEST_ORDERS, {
    variables: {
      skip: 0,
      take: 10,
      where: {},
    },
  });

  const handleOnRowClick = (record) => {
    history.push(`/order/detail/${record.id}`);
  };

  useEffect(() => {
    if (!loading) {
      setOrderList(_.get(data, "order"));
    }
  }, [loading, data]);

  return (
    <Row className={style.styleWrapperTable}>
      <Table
        dataSource={orderList}
        rowKey="code"
        columns={columns}
        pagination={false}
        loading={loading}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              handleOnRowClick(record, rowIndex);
            },
          };
        }}
        style={{ cursor: "pointer" }}
      />
    </Row>
  )
}

LastOder.propTypes = {
  timeFilter: PropTypes.number
};

export default LastOder;
