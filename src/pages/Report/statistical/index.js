import { useQuery } from "@apollo/client";
import {
  Row,
  Typography,
  Table,
  Tabs,
  Col,
  Button,
  Spin,
  DatePicker,
  Space,
  Tag,
} from "antd";
import _ from "lodash";
import moment from "moment";

import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../../components/PaginationComponent";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { GET_ALL_ORDER_STATUS } from "../../../graphql/schemas/order/query";
import {
  exportExcelReportSummary,
  getOrderStatusStyle,
  formatMoney,
} from "../../../helpers";
import { useGetListReportSummary } from "../hooks";
import style from "../style.module.scss";
import FilterDropdown from "../../../components/FilterDropdown/index";

const { Title } = Typography;

const { RangePicker } = DatePicker;

const ReportStatisticalPage = () => {
  const { data: orderStatus } = useQuery(GET_ALL_ORDER_STATUS, {});
  const pagingLocalStorage = JSON.parse(localStorage.getItem("paging"));

  const [pageIndex2, setPageIndex2] = useState(
    pagingLocalStorage?.pagename === "REPORT_PRODUCT"
      ? pagingLocalStorage?.pageIndex
      : 1
  );
  const [pageSize2, setPageSize2] = useState(
    pagingLocalStorage?.pagename === "REPORT_PRODUCT"
      ? pagingLocalStorage?.pageSize
      : 10
  );

  // const { data: dataAppConfig } = useQuery(GET_APP_CONFIG, {});

  const [filteredDate, setFilteredDate] = useState([
    moment().startOf("day"),
    moment().endOf("day"),
  ]);

  let filteredTime =
    filteredDate && (filteredDate[0] || filteredDate[1])
      ? [
        { created: { _gte: filteredDate[0] } },
        { created: { _lte: filteredDate[1] } },
      ]
      : undefined;

  const [filterByStatus, setFilterByStatus] = useState([]);

  let variablesProductReport = {
    where: {
      status:
        _.size(filterByStatus) !== 0 ? { _in: filterByStatus } : undefined,
      _and: filteredTime,
      order_status: {
        // code: {
        //     _neq: "WAIT_PAYMENT"
        // }
        code: { _nin: ["WAIT_PAYMENT", "PAYMENT_FAILED"] },
      },
      deleted: { _eq: false },
    },
  };

  const { data: reportSummaryInitial, loading: loadingSalesListSummary } =
    useGetListReportSummary(variablesProductReport);

  const filterData = [
    {
      group: { code: "STATUS", name: " Trạng thái đơn hàng" },
      filterList: orderStatus?.order_status,
    },
  ];

  const handleFilterOrder = (value) => {
    if (value?.group === "STATUS") {
      window.localStorage.setItem(
        "orderStatus",
        JSON.stringify(value?.checkedValue)
      );
      setFilterByStatus(value?.checkedValue);
    }
    setPageIndex2(1);
  };
  const columnSummary = [
    {
      title: "STT",
      width: 80,
      ellipsis: true,
      render: (text, record, index) => {
        return (
          <span className="item-center">
            {(pageIndex2 - 1) * pageSize2 + index + 1}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "order_last_time",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (record) => {
        return (
          <>
            {!_.isEmpty(record) ? (
              <Tag
                className="item-center"
                color={
                  getOrderStatusStyle(record[0]?.orderByOrder.order_status.code)
                    ?.color
                }
                style={{
                  color: getOrderStatusStyle(
                    record[0]?.orderByOrder.order_status.code
                  )?.textColor,
                  width: '95%'
                }}
                key={record[0]?.orderByOrder.order_status.code}
              >
                {record[0]?.orderByOrder.order_status.name}
              </Tag>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Mã sản phẩm",
      ellipsis: true,
      width: 200,
      render: (record) => record.productByProduct.code || "-",
    },
    {
      title: "Tên sản phẩm",
      ellipsis: true,
      width: 260,
      render: (text) =>
        (
          <Link
            to={`/product/detail/${text.productByProduct.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {text.productByProduct.name}
          </Link>
        ) || "-",
    },
    {
      title: "Phân loại",
      width: 260,
      ellipsis: true,
      render: (text) => text.name || "-",
    },
    {
      title: "Mã phân loại",
      align: "center",
      width: 260,
      ellipsis: true,
      render: (text) => text?.order_last_time[0]?.product_sku?.sku || "-",
    },

    {
      title: "Đơn vị tính",
      align: "center",
      width: 260,
      ellipsis: true,
      render: (text) => text.productByProduct.unitByUnit.name || "-",
    },
    {
      title: "Số lượng đặt hàng",
      align: "center",
      width: 260,
      ellipsis: true,
      render: (text) => text.total_order.aggregate.count || 0,
    },
    {
      title: "Thời gian",
      ellipsis: true,
      width: 260,
      dataIndex: "order_last_time",
      render: (record) =>
        moment(record[record.length - 1].orderByOrder.created).format(
          "DD/MM/YYYY HH:mm"
        ) || "-",
    },
  ];
  // if (loadingSalesListSummary)
  //   return (
  //     <div className="wapperLoading">
  //       <Spin tip="Đang tải dữ liệu..." />
  //     </div>
  //   );
  return (
    <Fragment>
      <Title level={3}>Báo cáo thống kê mặt hàng và số lượng</Title>

      <Wrapper>
        <Row justify="space-between">
          <Col span={6}>
            <RangePicker
              format="DD/MM/YYYY HH:mm"
              onChange={(v) => setFilteredDate(v)}
              value={filteredDate}
              style={{ borderRadius: 6, height: 38 }}
              showTime
            />
          </Col>

          <Col span={5}>
            <FilterDropdown
              filterItems={filterData}
              filterByStatus={filterByStatus}
              title="Lọc đơn hàng"
              onChange={handleFilterOrder}
            />
          </Col>
          <Col span={10}></Col>
          <Col span={2}>
            <Button
              className={style.print}
              onClick={() =>
                exportExcelReportSummary(
                  _.get(reportSummaryInitial, "product_type") || [],
                  _.size(filteredDate) > 0
                    ? filteredDate[0]
                    : moment().startOf("day"),
                  _.size(filteredDate) > 0
                    ? filteredDate[1]
                    : moment().endOf("day")
                )
              }
            >
              Xuất file
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={_.slice(
            _.get(reportSummaryInitial, "product_type") || [],
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
          total={_.size(_.get(reportSummaryInitial, "product_type"))}
          pageSize={pageSize2}
          pageIndex={pageIndex2}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize2}
          setPageIndex={setPageIndex2}
          pagename="REPORT_ORDER"
        />
      </Wrapper>
    </Fragment>
  );
};

export default ReportStatisticalPage;
