import React, { useState, useEffect } from 'react'
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';
import { Row, Table, Tag } from 'antd'
import _ from 'lodash';
import Wrapper from '../../../Shipper/detail/components/WrapperCusom';
import PaginationComponent from '../../../../components/PaginationComponent';
import styles from './styles.module.scss';
import { useGetListBoothOrderGetAll } from '../../hooks';
import { dataOrderBoothHandler } from '../../../../helpers/index';


const HistorySlip = ({ id }) => {
  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [dataList, setDataList] = useState([]);

  const columns = [
    {
      key: "STT", title: "STT",
      ellipsis: true,
      width: 150,
      align: "center",
      render: (text, record, index) => {
        return <span className='item-center'>{((pageIndex - 1) * pageSize + index + 1) < 10 ? `0${(pageIndex - 1) * pageSize + index + 1}` : (pageIndex - 1) * pageSize + index + 1}</span>;
      },
    },
    {
      key: "status", title: "Trạng thái",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (record, index) => {
        let backgroundColor;
        let color;
        let text = "-"
        if (_.get(record, 'status') === "INITIAL") {
          backgroundColor = "#FFE7C5";
          color = "#FCB040";
          text = "Yêu cầu";
        }

        if (_.get(record, 'status') === "DONE") {
          backgroundColor = "#D0FFD6";
          color = "#00B517";
          text = "Đã nhập"
        }

        return <Tag style={{ backgroundColor, color, border: 'none', width: '95%' }}>{text}</Tag>
      },
    },
    {
      key: "time", title: "Thời gian",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (record, index) => {
        return record.time
      },
    },
    {
      key: "booth", title: "Mã số kho hàng lưu động - Biển số",
      ellipsis: true,
      width: 400,
      align: "center",
      render: (text, record, index) => {
        return record.booth;
      },
    },
    {
      key: "phone", title: "SĐT tài xế kho hàng lưu động",
      ellipsis: true,
      width: 350,
      align: "center",
      render: (text, record, index) => {
        return record.phone;
      },
    },
    {
      key: "productType", title: "Loại",
      ellipsis: true,
      width: 150,
      align: "center",
      render: (text, record, index) => {
        return record.type;
      },
    },
    {
      key: "code", title: "Mã phiếu",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (text, record, index) => {
        return record.code;
      },
    },
    {
      key: "productCode", title: "Mã sản phẩm",
      ellipsis: true,
      width: 300,
      align: "center",
      render: (text, record, index) => {
        return record.productCode;
      },
    },
    {
      key: "productName", title: "Tên sản phẩm",
      ellipsis: true,
      width: 300,
      align: "center",
      render: (text, record, index) => {
        return record.productName;
      },
    },
    {
      key: "productType", title: "Phân loại",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (text, record, index) => {
        return record.productType;
      },
    },
    {
      key: "package",
      title: "Hình thức",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (text, record, index) => {
        return record.package;
      },
    },
    {
      key: "unit", title: "Đơn vị",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (text, record, index) => {
        return record.unit;
      },
    },
    {
      key: "quantity", title: "Số lượng",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (text, record, index) => {
        return record.quantity;
      },
    },

  ];

  const { data: boothOrderList } = useGetListBoothOrderGetAll({ boothId: id });

  useEffect(() => {
    dataOrderBoothHandler(boothOrderList).then((results) => {
      setDataList(results);
    })
  }, [boothOrderList])

  return (
    <Wrapper>
      <Row className={styles.wrapperTable}>
        <Table
          dataSource={_.slice(
            dataList || [],
            pageSize * (pageIndex - 1),
            pageSize * pageIndex
          )}
          rowKey="id"
          columns={columns}
          pagination={false}
          scroll={{ x: 1500 }}
        //loading={loading}
        />
      </Row>

      <PaginationComponent
        total={_.size(dataList)}
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageSizeOptions={[10, 20, 40, 80, 120]}
        setPageSize={setPageSize}
        setPageIndex={setPageIndex}
        pagename='history_slip'
      />
    </Wrapper>
  )
}

export default HistorySlip