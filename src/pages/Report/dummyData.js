import { Link } from 'react-router-dom';
import moment from "moment";
import _ from 'lodash';
import { formatMoney, getOrderStatusStyle } from '../../helpers';
import { Tag } from 'antd';

export const columns = [
  {
    title: "Trạng thái",
    dataIndex: "order_status",
    key: "order_status",
    align: 'center',
    render: (status, record) => {
      return (
        <>
        {!_.isEmpty(status) ? (
        <Tag
          className='item-center'
          color={getOrderStatusStyle(status?.code)?.color}
          style={{ color: getOrderStatusStyle(status?.code)?.textColor }}
          key={status?.code}
          >
          {status?.name}
        </Tag>
        ) : '-'}
       
        </>
        
      );
    },
  },
  {
    title: "Mã đơn hàng",
    dataIndex: "orderCode",
    width: 200,
    render: (text, record) => <Link to={`/order/detail/${_.get(text, "id")}`} onClick={(e) => e.stopPropagation()}>{text.code}</Link> || "-"
  },
  {
    title: "Mã sản phẩm",
    dataIndex: "productCode",
    width: 200,
    render: (text, record) => !text.isPromotion ? <Link to={`/product/detail/${_.get(text, "id")}`} onClick={(e) => e.stopPropagation()}>{text.code}</Link> || "-" : text.code
  },
 
  {
    title: "Tên sản phẩm",
    dataIndex: "productName",
    width: 220,
    render: (text) => text || "-",
  },
  {
    title: "Mã phân loại",
    width: 200,
    align: 'center',
    dataIndex: "product_sku",
    render: (text) => text || "-",
  },
  {
    title: "Phân loại",
    width: 200,
    dataIndex: "product_type",
    render: (text) => text || "-",
  },
  {
    title: "Đơn vị tính",
    dataIndex: "unit",
    align: 'center',
    width: 200,
    render: (text) => text || "-",
  },
  {
    title: "Hình thức",
    dataIndex: "package",
    align: 'center',
    width: 200,
    render: (text) => text || "-",
  },
  {
    title: "Số lượng",
    align: 'center',
    width: 200,
    dataIndex: "quantity",
    render: (text) => text || "-",
  },
  {
    title: "Đơn giá",
    width: 200,
    dataIndex: "price",
    align: 'right',
    render: (text) => formatMoney(text)  + ' đ',
  },
  {
    title: "Số tiền",
    dataIndex: "amount",
    align: 'right',
    width: 200,
    render: (text) => formatMoney(text) + ' đ',
  },
  {
    title: "Áp dụng giá lẻ/ sỉ",
    dataIndex: "apply_price",
    width: 280,
    align: 'center',
  },
  {
    title: "Mã khách hàng",
    width: 240,
    dataIndex: "customerCode",
    render: (text) => text || "-",
  },
  {
    title: "Phường",
    dataIndex: "ward",
    render: (text) => text || "-",
  },
  {
    title: "Quận",
    dataIndex: "district",
    render: (text) => text,
  },
  {
    title: "Thời gian tạo",
    width: 200,
    dataIndex: "created",
    render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
  },
  {
    title: "Hình thức thanh toán",
    dataIndex: "payment_method",
    align: 'center',
    width: 200,
    render: (text) => text || "-",
  }
];

export const columnSummary = [
  {
    title: "STT",
    dataIndex: "code",
    render: (text, record, index) => index < 10 ? `0${index}` : index
  },
  {
    title: "Mã sản phẩm",
    dataIndex: "code",
    render: (text) => text || "-"
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "name",
    render: (text) => <Link to={`/order/detail/${_.get(text, "id")}`} onClick={(e) => e.stopPropagation()}>{text}</Link> || "-",
  },
  {
    title: "Phân loại",
    dataIndex: "product_type",
    render: (text) => text || "-"
  },
  {
    title: "Đơn vị tính",
    dataIndex: "unitByUnit",
    align: 'center',
    render: (text) => text.name || "-",
  },
  {
    title: "Số lượng đặt hàng",
    dataIndex: "total_order",
    align: 'center',
    render: (text) => text.aggregate.count || 0,
  },
  {
    title: "Thời gian",
    dataIndex: "order_last_time",
    render: (record) => _.get(record[_.size(record) - 1], 'created') && moment(_.get(record[_.size(record) - 1], 'created')).format('DD/MM/YYYY hh:mm A'),
  }
]
