import React, { Fragment, useEffect, useState } from "react";
import {
  Row,
  Col,
  Space,
  Typography,
  Image,
  Input,
  Button,
  Table,
  Form,
  Spin,
} from "antd";
import * as _ from "lodash";
import "./style.scss";
import FilterDropdown from "../../../../components/FilterDropdown";
import clsx from "clsx";
import { useGetCategories } from "../../../../graphql/schemas/hook";
import SearchContent from "../../../../components/SearchContent";
import { useQuery } from "@apollo/client";
import { GET_PRODUCT_PRICINGS } from "../../../../graphql/schemas/promotion/query";
import PaginationComponent from "../../../../components/PaginationComponent";
import { formatMoney } from "../../../../helpers";

const ProductItemAdd = ({ onCancel, onComplete }) => {
  const { data: categoryList, loading: loadingCategory } = useGetCategories();
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useQuery(GET_PRODUCT_PRICINGS, {
    variables: {
      where: {
        deleted: { _eq: false },
        productByProduct: {
          categoryByCategory: {
            code: {
              _eq: "VEGA_JUICE",
            },
          },
          deleted: { _eq: false },
        },
      },
    },
  });

  const [rowSelection, setRowSelection] = useState([]);
  const pagingLocalStorage = JSON.parse(localStorage.getItem("paging"));

  const [pageIndex, setPageIndex] = useState(
    pagingLocalStorage?.pagename === "PRODUCT"
      ? pagingLocalStorage?.pageIndex
      : 1
  );
  const [pageSize, setPageSize] = useState(
    pagingLocalStorage?.pagename === "PRODUCT"
      ? pagingLocalStorage?.pageSize
      : 20
  );

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchContent, setSearchContent] = useState("");
  const { Title, Text } = Typography;

  //Columns
  const columns = [
    {
      title: "Chọn tất cả",
      dataIndex: "id",
      key: "id",
      width: "39%",
      render: (_, record) => {
        return (
          <div className="flex align-center h-max">
            <Space size={12}>
              <Image
                className="productImage"
                src={
                  process.env.REACT_APP_S3_GATEWAY +
                  record?.productByProduct?.photo?.url
                }
                alt="product_image"
              />
              <div className="flex flex-column">
                <Text style={{ fontSize: "18px" }}>
                  {record?.productByProduct?.name}
                </Text>
                <Text>
                  Giá:{" "}
                  <Text className="red">{formatMoney(record?.price)} đ</Text>
                </Text>
                <Text>Mã sản phẩm: {record?.productByProduct.code}</Text>
              </div>
            </Space>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "status",
      key: "status",
      width: "50%",
      render: (_, record) => {
        return (
          <div className="titleWrapper">
            <div className="align-center titleProduct">
              <Text>Trạng thái sản phẩm</Text>
            </div>
            <div className="subTitle align-center">
              <Text>{record?.productByProduct?.product_status?.name}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "category",
      key: "category",
      width: "30%",
      render: (_, record) => {
        return (
          <div className="titleWrapper">
            <div className="align-center titleProduct">
              <Text>Phân loại</Text>
            </div>
            <div className="subTitle">
              <Text>{record?.product_type?.name}</Text>
            </div>
          </div>
        );
      },
    },
  ];

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setRowSelection(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const handleComplete = () => {
    onComplete(selectedRows);
  };

  useEffect(() => {
    refetch({
      where: {
        productByProduct: {
          name: { _ilike: `%${searchContent}%` },
          categoryByCategory: {
            code: {
              _eq: "VEGA_JUICE",
            },
          },
          deleted: { _eq: false },
        },
        deleted: { _eq: false },
      },
    });
  }, [refetch, searchContent]);

  if (loading)
    return (
      <div className="wapperLoading">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <Fragment>
      <Title level={3}>Thêm danh sách sản phẩm</Title>
      <div className="createFlash">
        <div className="headerWrapper" style={{ paddingBottom: "10px" }}>
          <Row justify="space-between">
            <Col span={4}>
              <SearchContent
                searchContent={searchContent}
                setSearchContent={setSearchContent}
              />
            </Col>
            {/* <Col
                            span={4}
                        >
                            <FilterDropdown
                                className={clsx("filter-dropdown custom-filter")}
                                filterItems={filterData}
                                onChange={handleFilterProduct}
                                filterByType={filterType}
                                title="Danh mục sản phẩm"
                                flashSale={true}
                            />
                        </Col> */}
          </Row>
        </div>

        <div>
          <Table
            rowSelection={{
              selectedRowKeys: rowSelection,
              onChange: onSelectChange,
              preserveSelectedRowKeys: true,
            }}
            dataSource={_.slice(
              products?.result,
              pageSize * (pageIndex - 1),
              pageSize * pageIndex
            )}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
          />
          <PaginationComponent
            total={_.size(products?.result)}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageSizeOptions={[10, 20, 40, 80, 120]}
            setPageSize={setPageSize}
            setPageIndex={setPageIndex}
            pagename="PRODUCT"
          />
        </div>
      </div>
      <Row>
        <div className="w-max flex justify-end mt-3 custom-button">
          <Space size={24}>
            <Button
              htmlType="button"
              onClick={() => {
                onCancel(true);
              }}
              className="btn_reset__product_create"
            >
              Hủy
            </Button>
            <Button
              htmlType="submit"
              className="btn__btn-create__product"
              onClick={handleComplete}
            >
              Xác nhận
            </Button>
          </Space>
        </div>
      </Row>
    </Fragment>
  );
};

export default ProductItemAdd;
