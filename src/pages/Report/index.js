import { useQuery } from "@apollo/client";
import { Row, Typography, Table, Tabs, Button, Spin, DatePicker, Space, Tag } from "antd";
import _ from "lodash";
import moment from "moment";

import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../components/PaginationComponent";
import Wrapper from "../../components/Wrapper/Wrapper";
import { GET_APP_CONFIG, GET_ALL_ORDER_STATUS } from "../../graphql/schemas/order/query";
import { handleReportSalesList, exportExcelReport, exportExcelReportSummary, getOrderStatusStyle } from "../../helpers";
import { columns } from "./dummyData";
import { useGetListReportSales, useGetListReportSummary } from "./hooks";
import style from "./style.module.scss";
import FilterDropdown from '../../components/FilterDropdown/index';

const { Title } = Typography;
const { TabPane } = Tabs;

const { RangePicker } = DatePicker;

const Report = () => {

  const { data: orderStatus } = useQuery(GET_ALL_ORDER_STATUS, {})
  const pagingLocalStorage = JSON.parse(localStorage.getItem('paging'));

  const [pageIndex, setPageIndex] = useState(pagingLocalStorage?.pagename === "REPORT_ORDER" ? pagingLocalStorage?.pageIndex : 1);
  const [pageSize, setPageSize] = useState(pagingLocalStorage?.pagename === "REPORT_ORDER" ? pagingLocalStorage?.pageSize : 20);

  const [pageIndex2, setPageIndex2] = useState(pagingLocalStorage?.pagename === "REPORT_PRODUCT" ? pagingLocalStorage?.pageIndex : 1);
  const [pageSize2, setPageSize2] = useState(pagingLocalStorage?.pagename === "REPORT_PRODUCT" ? pagingLocalStorage?.pageSize : 20);

  const { data: dataAppConfig } = useQuery(GET_APP_CONFIG, {});



  const [reportSalesList, setReportSalesList] = useState([]);
  const [position, setPosition] = useState(window.localStorage.getItem('activeReportKey') || "1");

  const [filteredDate, setFilteredDate] = useState([moment().startOf('day'), moment().endOf('day')]);

  let filteredTime = (filteredDate && (filteredDate[0] || filteredDate[1])) ? [{ created: { _gte: filteredDate[0] } }, { created: { _lte: filteredDate[1] } }] : undefined

  const [filterByStatus, setFilterByStatus] = useState([]);

  let variablesSaleReport = {
    where: {
      _and: filteredTime,
      order_status: {
        // code: {
        //   _neq: "WAIT_PAYMENT"
        // }
        code: { _nin: ["WAIT_PAYMENT", "PAYMENT_FAILED"] }

      },
      status: _.size(filterByStatus) !== 0 ? { _in: filterByStatus } : undefined,
      deleted: { _eq: false }
    },
  }

  let variablesProductReport = {
    where: {
      status: _.size(filterByStatus) !== 0 ? { _in: filterByStatus } : undefined,
      _and: filteredTime,
      order_status: {
        // code: {
        //   _neq: "WAIT_PAYMENT"
        // }
        code: { _nin: ["WAIT_PAYMENT", "PAYMENT_FAILED"] }
      },
      deleted: { _eq: false }
    }
  }

  const { data: reportSalesListInitial, loading: loadingSalesList } = useGetListReportSales(variablesSaleReport);
  const { data: reportSummaryInitial, loading: loadingSalesListSummary } = useGetListReportSummary(variablesProductReport);

  useEffect(() => {
    if (reportSalesListInitial) {
      const isWallet = _.find(_.get(dataAppConfig, 'appconfig'), (element) => element.key === "VISIBLE_WALLET");
      const dataList = handleReportSalesList(_.get(reportSalesListInitial, 'order'), isWallet);
      setReportSalesList(dataList);
    }
  }, [reportSalesListInitial]);

  const onChangeTab = (key) => {
    window.localStorage.setItem('activeReportKey', key);
    setPosition(key);
  }

  const exportExcel = (key) => {
    if (key === 1) {
      exportExcelReport(reportSalesList);
    }
    else {
      exportExcelReportSummary(_.get(reportSummaryInitial, 'product_type') || []);
    }
  };

  const filterData = [
    {
      group: { code: "STATUS", name: " Trạng thái đơn hàng" },
      filterList: orderStatus?.order_status,
    },
  ];

  const columnSummary = [
    {
      title: "STT",
      render: (text, record, index) => {
        return <span className='item-center'>{(pageIndex2 - 1) * pageSize2 + index + 1}</span>;
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "order_last_time",
      align: 'center',
      render: (record) => {
        return (
          <>
            {!_.isEmpty(record) ? (
              <Tag
                className='item-center'
                color={getOrderStatusStyle(record[0]?.orderByOrder.order_status.code)?.color}
                style={{ color: getOrderStatusStyle(record[0]?.orderByOrder.order_status.code)?.textColor }}
                key={record[0]?.orderByOrder.order_status.code}
              >
                {record[0]?.orderByOrder.order_status.name}
              </Tag>
            ) : '-'}


          </>

        );
      },
    },
    {
      title: "Mã sản phẩm",
      render: (record) => record.productByProduct.code || "-"
    },
    {
      title: "Tên sản phẩm",
      render: (text) => <Link to={`/product/detail/${text.productByProduct.id}`} onClick={(e) => e.stopPropagation()}>{text.productByProduct.name}</Link> || "-",
    },
    {
      title: "Mã phân loại",
      align: 'center',
      render: (text) => text?.order_last_time[0]?.product_sku?.sku || "-"
    },
    {
      title: "Phân loại",
      render: (text) => text.name || "-"
    },
    {
      title: "Đơn vị tính",
      align: 'center',
      render: (text) => text.productByProduct.unitByUnit.name || "-",
    },
    {
      title: "Số lượng đặt hàng",
      align: 'center',
      render: (text) => text.total_order.aggregate.count || 0,
    },
    {
      title: "Thời gian",
      dataIndex: "order_last_time",
      render: (record) => moment(record[record.length - 1].orderByOrder.created).format('DD/MM/YYYY HH:mm') || "-",
    }
  ];


  const handleFilterOrder = (value) => {
    if (value?.group === "STATUS") {
      window.localStorage.setItem('orderStatus', JSON.stringify(value?.checkedValue))
      setFilterByStatus(value?.checkedValue);
    }
    setPageIndex(1);
    setPageIndex2(2)
  };

  // return (
  //   <div className={style.wapperLoading}>
  //     <Title>Coming soon!</Title>
  //   </div>
  // );

  useEffect(() => {
    if (window.localStorage.getItem('orderStatus')) {
      setFilterByStatus(JSON.parse(window.localStorage.getItem('orderStatus')));
    }
  }, [reportSalesListInitial, loadingSalesList]);

  const returnedComponentFilter = () => {
    return (
      <div style={{ width: 860, display: 'flex' }}>
        <RangePicker format="DD/MM/YYYY HH:mm" onChange={(v) => setFilteredDate(v)} value={filteredDate} style={{ borderRadius: 6, height: 38 }} showTime />
        <Space size={14}>
          {position === "1" && (
            <Button
              className={style.print}
              onClick={() => exportExcelReport(reportSalesList, _.size(filteredDate) > 0 ? filteredDate[0] : moment().startOf('day'), _.size(filteredDate) > 0 ? filteredDate[1] : moment().endOf('day'))}
            >
              Tải file
            </Button>
          )}
          {position === "2" && (
            <Button
              className={style.print}
              onClick={() => exportExcelReportSummary(_.get(reportSummaryInitial, 'product_type') || [], _.size(filteredDate) > 0 ? filteredDate[0] : moment().startOf('day'), _.size(filteredDate) > 0 ? filteredDate[1] : moment().endOf('day'))}
            >
              Tải file
            </Button>
          )}
          <div style={{ width: 260 }}>
            <FilterDropdown
              filterItems={filterData}
              filterByStatus={filterByStatus}
              title="Lọc đơn hàng"
              onChange={handleFilterOrder}
            />
          </div>
        </Space>
      </div>
    )
  }

  return (
    <>
      <Title level={3}>Thông tin báo cáo </Title>

      <Wrapper>
        <Tabs defaultActiveKey={position} onChange={onChangeTab} tabBarExtraContent={returnedComponentFilter()}>
          <TabPane tab="Báo cáo bán hàng" key="1">
            <Row className={style.wrapperTable}>
              <Table
                dataSource={_.slice(
                  reportSalesList || [],
                  pageSize * (pageIndex - 1),
                  pageSize * pageIndex
                )}
                rowKey="key"
                columns={columns}
                pagination={false}
                loading={loadingSalesList}
                scroll={{ x: 2500 }}
              />
              <PaginationComponent
                total={_.size(reportSalesList)}
                pageSize={pageSize}
                pageIndex={pageIndex}
                pageSizeOptions={[10, 20, 40, 80, 120]}
                setPageSize={setPageSize}
                setPageIndex={setPageIndex}
              />
            </Row>
          </TabPane>
          <TabPane tab="Báo cáo thống kê mặt hàng và số lượng" key="2">
            <Row className={style.wrapperTable}>
              <Table
                dataSource={_.slice(
                  _.get(reportSummaryInitial, 'product_type') || [],
                  pageSize2 * (pageIndex2 - 1),
                  pageSize2 * pageIndex2
                )}
                rowKey="key"
                columns={columnSummary}
                pagination={false}
                loading={loadingSalesListSummary}
                scroll={{ x: 1500 }}
              />
              <PaginationComponent
                total={_.size(_.get(reportSummaryInitial, 'product_type'))}
                pageSize={pageSize2}
                pageIndex={pageIndex2}
                pageSizeOptions={[10, 20, 40, 80, 120]}
                setPageSize={setPageSize2}
                setPageIndex={setPageIndex2}
                pagename='REPORT_ORDER'
              />
            </Row>
          </TabPane>
        </Tabs>
      </Wrapper>
    </>
  );

};

export default Report;
