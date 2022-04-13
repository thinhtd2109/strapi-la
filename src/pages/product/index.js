import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row, Spin, Typography } from "antd";
import clsx from "clsx";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import CardProduct from "../../components/CardProduct";
import FilterDropdown from "../../components/FilterDropdown";
import PaginationComponent from "../../components/PaginationComponent";
import SearchContent from "../../components/SearchContent";
import Wrapper from "../../components/Wrapper/Wrapper";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import {
  useGetCategories,
  useGetProductList,
  useGetProductStatus,
} from "../../graphql/schemas/hook";
import style from "./style.module.scss";

const Product = () => {
  const history = useHistory();
  const [title, setTitle] = useState("Tất cả sản phẩm");

  const [searchContent, setSearchContent] = useState("");

  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);

  const [filterStatus, setFilterStatus] = useState([]);
  const [filterType, setFilterType] = useState([]);

  const { data, total, loading, error, refetch } = useGetProductList({
    where: { deleted: { _eq: false } },
    skip: skip,
    take: pageSize,
    filterStatus,
    filterType,
    searchContent
  });

  const {
    data: productStatus,
    loading: loadingStatus,
    error: errorStatus,
  } = useGetProductStatus();

  const { data: categoryList, loading: loadingCategory } = useGetCategories();

  const handleCreateProduct = () => {
    history.push("/product/create");
  };

  const filterData = [
    {
      group: { code: "STATUS", name: "Trạng thái sản phẩm" },
      filterList: productStatus,
    },
    {
      group: { code: "TYPE", name: "Loại sản phẩm" },
      filterList: categoryList,
    },
  ];

  const handleFilterProduct = (value) => {
    setSkip(0);
    setPageIndex(PAGE_INDEX);
    if (value?.group === "STATUS") {
      setFilterStatus(value.checkedValue);
    }
    if (value?.group === "TYPE") {
      setFilterType(value.checkedValue);
    }
  };


  return (
    <Fragment>

      <Row justify="space-between" className={style.titleRow}>
        <Typography.Title level={3}>Danh sách sản phẩm</Typography.Title>
        <Button
          className={style.stylePrimary}
          icon={<PlusOutlined />}
          onClick={handleCreateProduct}
        >
          Tạo sản phẩm
        </Button>
      </Row>

      <Wrapper>
        <Row>
          <Typography.Title level={5} className={style.styleHeader}>
            {title}
          </Typography.Title>
        </Row>

        {/* <Row className={style.styleInRow}>
          <Col xs={6}>
            <FilterDropdown
              filterItems={filterData}
              onChange={handleFilterProduct}
              title="Lọc sản phẩm"
            />
          </Col>
          <Col>
            <SearchContent
              searchContent={searchContent}
              setSearchContent={setSearchContent}
            />
          </Col>
        </Row> */}

        <Row gutter={[32, 24]} className={style.styleGroupFilter}>

          <Col
            xs={{ span: 24 }}
            sm={{ span: 12 }}
            lg={{ span: 8 }}
            xl={{ span: 6 }}
          >
            <FilterDropdown
              className={clsx("filter-dropdown custom-filter")}
              filterItems={filterData}
              onChange={handleFilterProduct}
              filterByStatus={filterStatus}
              filterByType={filterType}
              title="Lọc sản phẩm"
            />
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 12 }}
            lg={{ span: 8 }}
            xl={{ span: 6 }}
          >
            <SearchContent
              searchContent={searchContent}
              setSearchContent={setSearchContent}
            />
          </Col>
        </Row>
        {
          loading ? (
            <div className={style.wapperLoading}>
              <Spin tip="Đang tải dữ liệu..." />
            </div>
          ) : (
            <>
              <Row gutter={[32, 24]}>
                {_.map(data, (item, key) => {
                  // if (key < pageSize * pageIndex && key >= pageSize * (pageIndex - 1))
                  return (
                    <Col
                      key={key}
                      xs={{ span: 24 }}
                      sm={{ span: 12 }}
                      lg={{ span: 8 }}
                      xl={{ span: 6 }}
                    >
                      <CardProduct product={item} />
                    </Col>
                  );
                })}
              </Row>
            </>
          )
        }
        <PaginationComponent
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={(index) => {
            setPageIndex(index);
            setSkip(index * pageSize - pageSize)
          }}
          pagename='PRODUCT'
        />
      </Wrapper>
    </Fragment>
  );
};

Product.propTypes = {
  data: PropTypes.array,
};

export default Product;
