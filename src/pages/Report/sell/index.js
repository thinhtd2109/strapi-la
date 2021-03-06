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
    return <div>{formatMoney(record?.quantity * record?.price)} ??</div>;
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
      title: "Tr???ng th??i",
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
      title: "M?? ????n h??ng",
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
      title: "Lo???i ????n h??ng",
      dataIndex: "order_type",
      width: 220,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "T??n s???n ph???m",
      dataIndex: "productName",
      width: 220,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip> || "-",
    },
    {
      title: "M?? ph??n lo???i",
      width: 200,
      ellipsis: true,
      align: "center",
      dataIndex: "product_sku",
      render: (text) => text || "-",
    },
    {
      title: "Ph??n lo???i",
      width: 200,
      ellipsis: true,
      render: (record) => record.product_type || "-",
    },
    {
      title: "M?? s???n ph???m",
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
      title: "????n v??? t??nh",
      dataIndex: "unit",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "H??nh th???c",
      dataIndex: "package",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "S??? l?????ng",
      align: "center",
      width: 200,
      ellipsis: true,
      dataIndex: "quantity",
      render: (text) => text || "-",
    },
    {
      title: "????n gi??",
      width: 200,
      ellipsis: true,
      dataIndex: "price",
      align: "right",
      render: (text) => formatMoney(text) + " ??",
    },
    {
      title: "Th??nh ti???n",
      dataIndex: "amount",
      align: "right",
      width: 200,
      ellipsis: true,
      render: (text, record) => checkingMoney(record),
    },
    {
      title: "??p d???ng gi?? l???/ s???",
      dataIndex: "apply_price",
      width: 280,
      ellipsis: true,
      align: "center",
    },
    {
      title: "M?? kh??ch h??ng",
      width: 240,
      ellipsis: true,
      dataIndex: "customerCode",
      render: (text) => text || "-",
    },
    {
      title: "Ph?????ng",
      dataIndex: "ward",
      width: 250,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Qu???n",
      dataIndex: "district",
      width: 250,
      ellipsis: true,
      render: (text) => text,
    },
    {
      title: "Th???i gian t???o",
      width: 200,
      ellipsis: true,
      dataIndex: "created",
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "H??nh th???c thanh to??n",
      dataIndex: "payment_method",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Th???i gian ho??n th??nh",
      dataIndex: "time_complete",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm") || "-",
    },
    {
      title: "Kho h??ng l??u ?????ng",
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
  //       <Spin tip="??ang t???i d??? li???u..." />
  //     </div>
  //   );

  return (
    <Fragment>
      <Title level={3}>B??o c??o b??n h??ng </Title>

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
              Xu???t file
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
