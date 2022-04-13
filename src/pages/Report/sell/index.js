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
  Tooltip,
} from "antd";
import _ from "lodash";
import moment from "moment";

import React, { useEffect, useState, Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../../components/PaginationComponent";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { GET_APP_CONFIG } from "../../../graphql/schemas/order/query";
import {
  handleReportSalesList,
  exportExcelReport,
  getOrderStatusStyle,
  formatMoney,
} from "../../../helpers";
import { useGetListReportSales } from "../hooks";
import style from "../style.module.scss";
import ExportReportFilter from "../../../components/FilterDropdown/ExportReportFilter";
import { SELL_REPORT } from "../../../constant/info";

const { Title } = Typography;

const { RangePicker } = DatePicker;

const ReportSellPage = () => {
  const [filterByOrderStatus, setFilterByOrderStatus] = useState([]);
  const [filterBooth, setFilterBooth] = useState("");

  const pagingLocalStorage = JSON.parse(localStorage.getItem("paging"));

  const [pageIndex, setPageIndex] = useState(
    pagingLocalStorage?.pagename === "REPORT_ORDER"
      ? pagingLocalStorage?.pageIndex
      : 1
  );
  const [pageSize, setPageSize] = useState(
    pagingLocalStorage?.pagename === "REPORT_ORDER"
      ? pagingLocalStorage?.pageSize
      : 10
  );

  const { data: dataAppConfig } = useQuery(GET_APP_CONFIG, {});

  const [reportSalesList, setReportSalesList] = useState([]);

  const [filteredDate, setFilteredDate] = useState([
    moment().startOf("day"),
    moment().endOf("day"),
  ]);
  // let filteredTime = (filteredDate && (filteredDate[0] || filteredDate[1])) ? [{ created: { _gte: filteredDate[0] } }, { created: { _lte: filteredDate[1] } }] : undefined;

  const [variableReport, setVariableReport] = useState({
    where: {
      _and:
        filteredDate && (filteredDate[0] || filteredDate[1])
          ? [
            { created: { _gte: filteredDate[0] } },
            { created: { _lte: filteredDate[1] } },
          ]
          : undefined,
      order_status: {
        // code: {
        //     _neq: "WAIT_PAYMENT"
        // }
        code: { _nin: ["INITIAL", "WAIT_PAYMENT", "PAYMENT_FAILED"] },
      },
      status:
        _.size(filterByOrderStatus) !== 0
          ? { _in: filterByOrderStatus }
          : undefined,
      deleted: { _eq: false },
    },
  });

  const { data: reportSalesListInitial, loading: loadingSalesList } =
    useGetListReportSales(variableReport);

  useEffect(() => {
    if (reportSalesListInitial) {
      const isWallet = _.find(
        _.get(dataAppConfig, "appconfig"),
        (element) => element.key === "VISIBLE_WALLET"
      );
      const dataList = handleReportSalesList(
        _.get(reportSalesListInitial, "order"),
        isWallet
      );
      setReportSalesList(dataList);
    }
  }, [reportSalesListInitial]);

  // useEffect(() => {
  //   if (filterBooth) {
  //     setVariableReport({
  //       ...variableReport,
  //       orderBoothWhere: {
  //         deleted: { _eq: false },
  //         boothByBooth: { code: { _like: `%${filterBooth}%` } },
  //       },
  //     });
  //   }
  // }, [filterBooth]);

  useEffect(() => {
    let filterBoothVariables = !_.isEmpty(filterBooth) ? {
      order_booths: {
        boothByBooth: {
          id: {
            _eq: filterBooth
          }
        },
      }
    } : undefined;
    const orderBoothWhere = !_.isEmpty(filterBooth) ? {
      orderBoothWhere: {
        deleted: {
          _eq: false
        },
        booth: {
          _eq: filterBooth
        }
      }
    } : undefined
    setVariableReport({
      ...variableReport,
      ...orderBoothWhere,
      where: {
        ...filterBoothVariables,

        _and:
          filteredDate && (filteredDate[0] || filteredDate[1])
            ? [
              { created: { _gte: filteredDate[0] } },
              { created: { _lte: filteredDate[1] } },
            ]
            : undefined,
        order_status: {
          // code: {
          //     _neq: "WAIT_PAYMENT"
          // }
          code: { _nin: ["WAIT_PAYMENT", "PAYMENT_FAILED"] },
        },
        status:
          _.size(filterByOrderStatus) !== 0
            ? { _in: filterByOrderStatus }
            : undefined,
        deleted: { _eq: false },
      },
    });
  }, [filteredDate, filterByOrderStatus, filterBooth]);

  const handleFilterOrder = (value) => {
    if (value?.group === "ORDER_STATUS") {
      // window.localStorage.setItem('orderStatus', JSON.stringify(value?.checkedValue))
      setFilterByOrderStatus(value?.checkedValue);
    }
    setPageIndex(1);
  };

  const checkingMoney = (record) => {
    return <div>{formatMoney(record?.quantity * record?.price)} đ</div>;
  };

  const columns = [
    {
      title: "STT",
      width: 90,
      ellipsis: true,
      render: (text, record, index) => {
        return (
          <span className="item-center">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      key: "order_status",
      width: 200,
      ellipsis: true,
      align: "center",
      render: (status, record) => {
        return (
          <>
            {!_.isEmpty(status) ? (
              <Tag
                className="item-center"
                color={getOrderStatusStyle(status?.code)?.color}
                style={{ color: getOrderStatusStyle(status?.code)?.textColor }}
                key={status?.code}
              >
                {status?.name}
              </Tag>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      width: 200,
      ellipsis: true,
      render: (text, record) =>
        (
          <Link
            to={`/order/detail/${_.get(text, "id")}`}
            onClick={(e) => e.stopPropagation()}
          >
            {text.code}
          </Link>
        ) || "-",
    },
    {
      title: "Loại đơn hàng",
      dataIndex: "order_type",
      width: 220,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      width: 220,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip> || "-",
    },
    {
      title: "Mã phân loại",
      width: 200,
      ellipsis: true,
      align: "center",
      dataIndex: "product_sku",
      render: (text) => text || "-",
    },
    {
      title: "Phân loại",
      width: 200,
      ellipsis: true,
      render: (record) => record.product_type || "-",
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      width: 200,
      ellipsis: true,
      render: (text, record) =>
        !text.isPromotion
          ? (
            <Link
              to={`/product/detail/${_.get(text, "id")}`}
              onClick={(e) => e.stopPropagation()}
            >
              {text.code}
            </Link>
          ) || "-"
          : text.code,
    },

    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Hình thức",
      dataIndex: "package",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Số lượng",
      align: "center",
      width: 200,
      ellipsis: true,
      dataIndex: "quantity",
      render: (text) => text || "-",
    },
    {
      title: "Đơn giá",
      width: 200,
      ellipsis: true,
      dataIndex: "price",
      align: "right",
      render: (text) => formatMoney(text) + " đ",
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      align: "right",
      width: 200,
      ellipsis: true,
      render: (text, record) => checkingMoney(record),
    },
    {
      title: "Áp dụng giá lẻ/ sỉ",
      dataIndex: "apply_price",
      width: 280,
      ellipsis: true,
      align: "center",
    },
    {
      title: "Mã khách hàng",
      width: 240,
      ellipsis: true,
      dataIndex: "customerCode",
      render: (text) => text || "-",
    },
    {
      title: "Phường",
      dataIndex: "ward",
      width: 250,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Quận",
      dataIndex: "district",
      width: 250,
      ellipsis: true,
      render: (text) => text,
    },
    {
      title: "Thời gian tạo",
      width: 200,
      ellipsis: true,
      dataIndex: "created",
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "payment_method",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Thời gian hoàn thành",
      dataIndex: "time_complete",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm") || "-",
    },
    {
      title: "Kho hàng lưu động",
      dataIndex: "booths",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) => (
        <>
          {_.get(text, "code") !== "-" ? (
            <Link to={`/booths/detail/${_.get(text, "id")}`}>
              {_.get(text, "code")}
            </Link>
          ) : (
            "-"
          )}
        </>
      ),
    },
    {
      title: "Shipper",
      dataIndex: "shipper",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) =>
        (
          <>
            {_.get(text, "code") === "-" ? (
              "-"
            ) : (
              <Link to={`/shipper/edit/${_.get(text, "id")}`}>
                {_.get(text, "code")}
              </Link>
            )}
          </>
        ) || "-",
    },
  ];

  // useEffect(() => {
  //     if (window.localStorage.getItem('orderStatus')) {
  //         setFilterByStatus(JSON.parse(window.localStorage.getItem('orderStatus')));
  //     }
  // }, [reportSalesListInitial, loadingSalesList]);

  // if (loadingSalesList)
  //   return (
  //     <div className="wapperLoading">
  //       <Spin tip="Đang tải dữ liệu..." />
  //     </div>
  //   );

  return (
    <Fragment>
      <Title level={3}>Báo cáo bán hàng </Title>

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
            <ExportReportFilter
              setPageIndex={setPageIndex}
              filterByOrderStatus={filterByOrderStatus}
              onChange={handleFilterOrder}
              onBoothChange={(booth) => setFilterBooth(booth)}
              type={SELL_REPORT}
            />
          </Col>
          <Col span={10}></Col>
          <Col span={2}>
            <Button
              className={style.print}
              onClick={() =>
                exportExcelReport(
                  reportSalesList,
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
            reportSalesList || [],
            pageSize * (pageIndex - 1),
            pageSize * pageIndex
          )}
          rowKey="key"
          columns={columns}
          pagination={false}
          loading={loadingSalesList}
          scroll={{ x: 1500 }}
        />
        <PaginationComponent
          total={_.size(reportSalesList)}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={setPageIndex}
          pagename="REPORT_SELL"
        />
      </Wrapper>
    </Fragment>
  );
};

export default ReportSellPage;
