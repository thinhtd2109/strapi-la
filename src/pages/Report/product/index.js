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

import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../../components/PaginationComponent";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { formatMoney, exportExcelReportProduct } from "../../../helpers";
import { useGetListReportProduct } from "../hooks";
import style from "../style.module.scss";
import FilterDropdown from "../../../components/FilterDropdown/index";
import {
  useGetCategories,
  useGetProductStatus,
} from "../../../graphql/schemas/hook";

const { Title } = Typography;

const { RangePicker } = DatePicker;

const ReportProductPage = () => {
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

  const {
    data: productStatus,
    loading: loadingStatus,
    error: errorStatus,
  } = useGetProductStatus();

  const { data: categoryList, loading: loadingCategory } = useGetCategories();
  const [searchTime, setSearchTime] = useState({
    startDate: undefined,
    endDate: undefined,
  });

  const [filteredDate, setFilteredDate] = useState([]);

  const [filterByStatus, setFilterByStatus] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [whereObj, setWhereObj] = useState({
    deleted: {
      _eq: false,
    },
  });

  let variablesExport = {
    where: whereObj,
    argDate: {
      datefrom: _.size(filteredDate) > 0 ? filteredDate[0].format() : null,
      dateto: _.size(filteredDate) > 0 ? filteredDate[1].format() : null,
      status_ids:
        _.size(filterByStatus) === 0 ? null : _.map(filterByStatus).join(","),
      cate_ids: _.size(filterType) === 0 ? null : _.map(filterType).join(","),
    },
  };

  const {
    data: reportProductInitial,
    loading: loadingExport,
    refetch,
  } = useGetListReportProduct(variablesExport);

  const filterData = [
    {
      group: { code: "STATUS", name: "Trạng thái sản phẩm" },
      filterList: productStatus,
    },
    {
      group: { code: "TYPE", name: "Danh mục sản phẩm" },
      filterList: categoryList,
    },
  ];
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
    if (_.size(filterByStatus) > 0) {
      if (_.size(filterType) > 0) {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByStatus,
            },
            category: {
              _in: filterType,
            },
          },
        });
      } else {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByStatus,
            },
          },
        });
      }
    }

    if (_.size(filterType) > 0) {
      if (_.size(filterByStatus) > 0) {
        newObj = _.assign(newObj, {
          productByProduct: {
            status: {
              _in: filterByStatus,
            },
            category: {
              _in: filterType,
            },
          },
        });
      } else {
        newObj = _.assign(newObj, {
          productByProduct: {
            category: {
              _in: filterType,
            },
          },
        });
      }
    }
    refetch({
      where: newObj,
      argDate: {
        datefrom: _.size(filteredDate) > 0 ? filteredDate[0].format() : null,
        dateto: _.size(filteredDate) > 0 ? filteredDate[1].format() : null,
        status_ids:
          _.size(filterByStatus) === 0 ? null : _.map(filterByStatus).join(","),
        cate_ids: _.size(filterType) === 0 ? null : _.map(filterType).join(","),
      },
    });
  }, [filteredDate, filterType, filterByStatus, refetch]);

  const handleFilterOrder = (value) => {
    if (value?.group === "STATUS") {
      // window.localStorage.setItem('orderStatus', JSON.stringify(value?.checkedValue))
      setFilterByStatus(value?.checkedValue);
    }
    if (value?.group === "TYPE") {
      setFilterType(value.checkedValue);
    }
    setPageIndex2(1);
  };
  const columnSummary = [
    {
      title: "STT",
      render: (text, record, index) => {
        return (
          <span className="item-center">
            {(pageIndex2 - 1) * pageSize2 + index + 1}
          </span>
        );
      },
    },
    {
      title: "Trạng thái sản phẩm",
      dataIndex: "productByProduct",
      render: (text, record) => {
        return <div>{_.get(text, "product_status.name", "-")}</div>;
      },
    },
    {
      title: "Mã sản phẩm",
      render: (record) => record.productByProduct.code || "-",
    },
    {
      title: "Tên sản phẩm",
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
      title: "Mã phân loại",
      dataIndex: "product_sku",
      align: "center",
      render: (text) => <div>{_.get(text, "sku", "-")}</div>,
    },
    {
      title: "Phân loại",
      dataIndex: "product_type",
      render: (text) => <div>{_.get(text, "name", "-")}</div>,
    },
    {
      title: "Đơn vị",
      dataIndex: "productByProduct",
      align: "center",
      render: (text) => <div>{_.get(text, "unitByUnit.name", "-")}</div>,
    },
    {
      title: "Giá lẻ",
      dataIndex: "price",
      align: "center",
      render: (text) => formatMoney(text) + " đ",
    },
    {
      title: "Giá sỉ",
      dataIndex: "wholesale_price",
      align: "center",
      render: (text) => formatMoney(text) + " đ",
    },
  ];
  // if (loadingExport) return <div className="wapperLoading">< Spin tip="Đang tải dữ liệu..." /></div>
  return (
    <Fragment>
      <Title level={3}>Báo cáo sản phẩm</Title>

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
              filterByType={filterType}
              title="Lọc đơn hàng"
              onChange={handleFilterOrder}
            />
          </Col>
          <Col span={10}></Col>
          <Col span={2}>
            <Button
              className={style.print}
              onClick={() =>
                exportExcelReportProduct(
                  _.get(reportProductInitial, "product_pricing", []),
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
            _.get(reportProductInitial, "product_pricing", []),
            pageSize2 * (pageIndex2 - 1),
            pageSize2 * pageIndex2
          )}
          rowKey="key"
          columns={columnSummary}
          pagination={false}
          loading={loadingExport}
          scroll={{ x: 1500 }}
        />
        <PaginationComponent
          total={_.size(_.get(reportProductInitial, "product_pricing", []))}
          pageSize={pageSize2}
          pageIndex={pageIndex2}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize2}
          setPageIndex={setPageIndex2}
          pagename="REPORT_PRODUCT"
        />
      </Wrapper>
    </Fragment>
  );
};

export default ReportProductPage;
