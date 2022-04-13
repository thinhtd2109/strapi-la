import { useQuery } from "@apollo/client";
import { Row, Table, Typography } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import PaginationComponent from "../../components/PaginationComponent";
import SearchContent from "../../components/SearchContent";
import Wrapper from "../../components/Wrapper/Wrapper";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import { GET_CUSTOMER_LIST } from "../../graphql/schemas/customer/query";
import "./customer.scss";
import { useGetListCustomer } from "./hook";

const { Title } = Typography;

const Customer = () => {
  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);

  const [searchContent, setSearchContent] = useState("");

  const { data, loading, refetch } = useGetListCustomer({ skip, pageSize, searchContent })

  // const pagingLocalStorage = JSON.parse(localStorage.getItem('paging'));

  // const [pageIndex, setPageIndex] = useState(pagingLocalStorage?.pagename === "CUSTOMER" ? pagingLocalStorage?.pageIndex : 1);
  // const [pageSize, setPageSize] = useState(pagingLocalStorage?.pagename === "CUSTOMER" ? pagingLocalStorage?.pageSize : 20);



  const columns = [
    {
      key: "id", title: "STT",
      ellipsis: true,
      width: 100,
      align: "center",
      render: (text, record, index) => {
        return <span className='item-center'>{(pageIndex - 1) * pageSize + index + 1}</span>;
      },
    },
    {
      key: "full_name",
      ellipsis: true,
      width: 250,
      title: "Tên khách hàng", dataIndex: "full_name",
      render: (text, record) => (
        <Link to={`/customer/detail/${_.get(record, "id")}`}>{text || 'Khách hàng'}</Link>
      )
    },
    {
      key: "code", title: "Mã khách hàng", dataIndex: "code", ellipsis: true,
      width: 250,
    },
    {
      key: "account_referral", title: "Người giới thiệu", dataIndex: "account_referral",
      ellipsis: true,
      width: 250,
      render: (text) => text && (
        <Link
          to={`/customer/detail/${_.get(text, 'id')}`}
          onClick={(e) => e.stopPropagation()}
        >
          {_.get(text, 'code')}
        </Link>
      )
    },
    {
      key: "pinnow_e_Wallet", title: "Ví Pinnow", dataIndex: "pinnow_e_Wallet", align: 'center', ellipsis: true,
      width: 250,
      render: (text, record) => Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(_.sumBy(text, 'amount'))
    },
    {
      key: "phone", title: "Số điện thoại", ellipsis: true,
      width: 250, dataIndex: "phone", render: (text) => _.replace(text, '+84', '0')
    },
    {
      key: "created", title: "Thời gian tạo", dataIndex: "created", ellipsis: true,
      width: 250,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY HH:mm")}</p>;
      },
    },
    {
      key: "orders_aggregate", title: "Số lượng đơn hàng", dataIndex: "orders_aggregate", align: "center", width: 250,
      ellipsis: true,
      width: 250,
      render: (text) => {
        return _.get(text, "aggregate.count");
      },
    },
  ];

  const history = useHistory();

  useEffect(() => {
    // refetch({
    //   where: {
    //   },
    // });
  }, [refetch, searchContent]);

  return (
    <div className="customer-page">
      <Title level={3}>Danh sách khách hàng</Title>
      <Wrapper>
        <Row className="mb-3">
          <SearchContent
            searchContent={searchContent}
            setSearchContent={setSearchContent}
          />
        </Row>

        <Row className='wrapper-table'>
          <Table
            dataSource={_.get(data, 'customers')}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
          />
        </Row>

        <PaginationComponent
          total={_.get(data, 'total.aggregate.count', 0)}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={(index) => {
            setPageIndex(index);
            setSkip(index * pageSize - pageSize);
          }}
          pagename='CUSTOMER'
        />
      </Wrapper>
    </div>
  );
};

export default Customer;
