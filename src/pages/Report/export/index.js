import { useLazyQuery, useQuery } from "@apollo/client";
import {
  Row,
  Typography,
  Table,
  Tabs,
  Col,
  Button,
  Spin,
  DatePicker,
  notification,
  Space,
  Tooltip,
} from "antd";
import _ from "lodash";
import moment from "moment";

import React, { useEffect, useState, Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../../components/PaginationComponent";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { formatMoney, exportExcelReportExport, exportExcelReportExportAll } from "../../../helpers";
import { useGetListReportExport } from "../hooks";
import style from "../style.module.scss";
import ExportReportFilter from "../../../components/FilterDropdown/ExportReportFilter";
import { EXPORT_REPORT, PAGE_INDEX, PAGE_SIZE } from "../../../constant/info";
import { GET_LIST_REPORT_EXPORT } from "../../../graphql/schemas/report/query";

const { Title } = Typography;

const { RangePicker } = DatePicker;

const ReportExportPage = () => {
  const [filteredDate, setFilteredDate] = useState([
    moment().startOf("day"),
    moment().endOf("day"),
  ]);
  const [filterBooth, setFilterBooth] = useState("");
  const [filterByProductStatus, setFilterByProductStatus] = useState([]);
  const [filterByCategory, setFilterByCategory] = useState([]);
  const [filterByOrderStatus, setFilterByOrderStatus] = useState([]);
  const [whereObj, setWhereObj] = useState({});
  const [groupData, setGroupData] = useState([]);

  const [loadingExportFile, setLoadingExportFile] = useState(false);

  const {
    data: reportExportInitial,
    loading: loadingExport,
    refetch,
  } = useGetListReportExport({ where: whereObj });

  const pagingLocalStorage = JSON.parse(localStorage.getItem("paging"));

  const [pageIndex, setPageIndex] = useState(
    pagingLocalStorage?.pagename === "REPORT_EXPORT"
      ? pagingLocalStorage?.pageIndex
      : 1
  );
  const [pageSize, setPageSize] = useState(
    pagingLocalStorage?.pagename === "REPORT_EXPORT"
      ? pagingLocalStorage?.pageSize
      : 10
  );

  const handleExportFile = () => {
    if (!_.isEmpty(_.get(reportExportInitial, "order_item"))) {
      setLoadingExportFile(true);
      let districtList = _.unionBy(
        _.map(
          reportExportInitial?.order_item ?? [],
          (item) => item?.orderByOrder?.addressByAddress?.districtByDistrict
        ),
        "id"
      );
      let itemsGroup = _.groupBy(
        reportExportInitial?.order_item,
        (item) =>
          `"${item?.product} + ${item?.type} + ${item?.package} + ${item?.sale_price}+ ${item?.sku}+ ${item?.orderByOrder?.addressByAddress?.districtByDistrict?.id}"`
      );
      let result = _.map(itemsGroup, (item) => {
        return {
          ...item[0],
          total: _.sumBy(item, "quantity", 0),
        };
      });
      exportExcelReportExport(
        result,
        _.size(filteredDate) > 0
          ? filteredDate[0]
          : moment().startOf("day"),
        _.size(filteredDate) > 0
          ? filteredDate[1]
          : moment().endOf("day"),
        districtList
      ).then(() => setLoadingExportFile(false));
    } else {
      notification["warning"]({
        message: "Thông báo",
        description: "Không có dữ liệu.",
      });
    }
  };

  useEffect(() => {
    if (reportExportInitial) {
      let itemsGroup = _.groupBy(
        reportExportInitial?.order_item,
        (item) =>
          `"${item?.product} + ${item?.type} + ${item?.package} + ${item?.sale_price}+ ${item?.sku}+ ${item?.orderByOrder?.addressByAddress?.districtByDistrict?.id}"`
      );
      let result = _.map(itemsGroup, (item) => {
        return {
          item: item,
          total: _.sumBy(item, "quantity", 0),
        };
      });
      setGroupData(result);
    }
  }, [reportExportInitial]);

  const exportExcelAllExport = (data) => {
    let itemsGroup = _.groupBy(
      data?.order_item,
      (item) =>
        `"${item?.product} + ${item?.type} + ${item?.package} + ${item?.sale_price}+ ${item?.sku}+ ${item?.orderByOrder?.addressByAddress?.districtByDistrict?.id}"`
    );
    let result = _.map(itemsGroup, (item) => {
      return {
        ...item[0],
        total: _.sumBy(item, "quantity", 0),
      };
    });
    exportExcelReportExportAll(result);
  }

  useEffect(() => {
    let newObj = { ...whereObj };
    if (_.size(filteredDate) > 0) {
      newObj = _.assign(newObj, {
        _and: [
          {
            created: {
              _gte: filteredDate[0].format(),
            },
          },
          {
            created: {
              _lte: filteredDate[1].format(),
            },
          },
        ],
      });
    } else {
      delete newObj._and;
    }
    if (_.size(filterByProductStatus) > 0) {
      if (_.size(filterByCategory) > 0) {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByProductStatus,
            },
            category: {
              _in: filterByCategory,
            },
          },
        });
      } else {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByProductStatus,
            },
          },
        });
      }
    }

    if (_.size(filterByCategory) > 0) {
      if (_.size(filterByProductStatus) > 0) {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByProductStatus,
            },
            category: {
              _in: filterByCategory,
            },
          },
        });
      } else {
        newObj = _.assign(newObj, {
          productByProduct: {
            category: {
              _in: filterByCategory,
            },
          },
        });
      }
    } else {
      newObj = _.assign(newObj, {
        productByProduct: {

        },
      });
    }
    if (_.size(filterByOrderStatus) > 0) {
      newObj = _.assign(newObj, {
        orderByOrder: {
          order_status: {
            id: {
              _in: filterByOrderStatus,
            },
          },
        },
      });
    }

    setWhereObj(newObj);
    refetch({
      where: newObj,
    });
  }, [
    filteredDate,
    filterByProductStatus,
    filterByOrderStatus,
    filterByCategory,
    filterBooth,
    refetch,
  ]);

  const handleFilterOrder = (value) => {
    if (value?.group === "ORDER_STATUS") {
      // window.localStorage.setItem('orderStatus', JSON.stringify(value?.checkedValue))
      setFilterByOrderStatus(value?.checkedValue);
    }
    if (value?.group === "PRODUCT_STATUS") {
      setFilterByProductStatus(value.checkedValue);
    }
    if (value?.group === "CATEGORY") {
      setFilterByCategory(value.checkedValue);
    }
    setPageIndex(1);
  };

  const columnSummary = [
    {
      title: "STT",
      width: 90,
      align: "center",
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
      title: "Tên sản phẩm",
      width: 300,
      ellipsis: true,
      render: (record) =>
        (
          <Tooltip title={record.item[0]?.productByProduct?.name}>
            <Link
              to={`/product/detail/${record.item[0]?.productByProduct?.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              {record.item[0]?.productByProduct?.name}
            </Link>
          </Tooltip>

        ) || "-",
    },
    {
      title: "Phân loại",
      width: 200,
      ellipsis: true,
      dataIndex: "product_type",
      render: (text, record) => record?.item[0]?.product_type?.name ?? "-",
    },
    {
      title: "Mã phân loại",
      dataIndex: "product_sku",
      width: 200,
      ellipsis: true,
      align: "center",
      render: (text, record) => (
        <div>{_.get(record, "item[0].product_sku.sku", "-")}</div>
      ),
    },
    {
      title: "Danh mục sản phẩm",
      width: 250,
      ellipsis: true,
      dataIndex: "productByProduct",
      render: (text, record) => {
        return (
          <div>
            {_.get(
              record,
              "item[0].productByProduct.categoryByCategory.name",
              "-"
            )}
          </div>
        );
      },
    },
    {
      title: "Mã sản phẩm",
      width: 200,
      ellipsis: true,
      render: (record) => record.item[0]?.productByProduct?.code || "-",
    },
    {
      title: "Đơn vị",
      dataIndex: "productByProduct",
      width: 200,
      ellipsis: true,
      align: "center",
      render: (text, record) => (
        <div>
          {_.get(record, "item[0].productByProduct.unitByUnit.name", "-")}
        </div>
      ),
    },
    {
      title: "Số lượng đã đặt theo CT (theo bill)",
      width: 400,
      ellipsis: true,
      dataIndex: "sale_count",
      align: "center",
      render: (text, record) => record.total ?? "-",
    },
    {
      title: "Thực xuất",
      width: 200,
      ellipsis: true,
      dataIndex: "order_last_time",
      render: (record) => "-",
    },
    {
      title: "Đơn giá",
      width: 200,
      ellipsis: true,
      dataIndex: "sale_price",
      render: (text, record) => (
        <div>{formatMoney(record.item[0]?.sale_price)} đ</div>
      ),
    },
    {
      title: "Thành tiền",
      width: 200,
      ellipsis: true,
      render: (record) => (
        <div>{formatMoney(record?.total * record.item[0]?.sale_price)} đ</div>
      ),
    },
    {
      title: "Quận",
      width: 200,
      ellipsis: true,
      render: (record) => (
        <div>
          {
            record.item[0]?.orderByOrder?.addressByAddress?.districtByDistrict
              ?.name
          }
        </div>
      ),
    },
  ];

  return (
    <Fragment>
      <Title level={3}>Báo cáo xuất kho</Title>

      <Wrapper>
        <Row justify="space-between">
          <Col span={12}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <RangePicker
                  format="DD/MM/YYYY HH:mm"
                  onChange={(v) => setFilteredDate(v)}
                  value={filteredDate}
                  style={{ borderRadius: 6, height: 38 }}
                  showTime
                />
              </Col>
              <Col span={12}>
                <ExportReportFilter
                  filterByOrderStatus={filterByOrderStatus}
                  filterByProductStatus={filterByProductStatus}
                  filterByCategory={filterByCategory}
                  filterByDate={filteredDate}
                  onChange={handleFilterOrder}
                  onBoothChange={(booth) => setFilterBooth(booth)}
                  onDateChange={(date) => setFilteredDate(date)}
                  type={EXPORT_REPORT}
                />
              </Col>

            </Row>

          </Col>


          <Col span={12}>
            <Row justify="end">
              <Space>
                {/* <Button
                  className={style.print}
                  onClick={() => exportExcelAllExport(reportExportInitial)}
                  loading={loadingExportFile}
                >
                  Xuất tổng
                </Button> */}
                <Button
                  className={style.print}
                  onClick={handleExportFile}
                  loading={loadingExportFile}
                //onClick={() => exportExcelReportExport(_.get(reportExportInitial, 'order_item', []), _.size(filteredDate) > 0 ? filteredDate[0] : moment().startOf('day'), _.size(filteredDate) > 0 ? filteredDate[1] : moment().endOf('day'))}
                >
                  Xuất file
                </Button>

              </Space>


            </Row>

          </Col>
        </Row>
        <Row className={style.wrapperTable}>
          <Table
            scroll={{ x: 1200 }}
            dataSource={_.slice(
              groupData || [],
              pageSize * (pageIndex - 1),
              pageSize * pageIndex
            )}
            rowKey="key"
            columns={columnSummary}
            pagination={false}
            loading={loadingExport}
          />
        </Row>

        <PaginationComponent
          total={_.size(groupData)}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={setPageIndex}
          pagename="REPORT_EXPORT"
        />
      </Wrapper>
    </Fragment>
  );
};

export default ReportExportPage;
