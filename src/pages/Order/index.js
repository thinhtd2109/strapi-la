import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  Col,
  Row,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  notification,
} from "antd";
import clsx from "clsx";
import _ from "lodash";
import moment from "moment";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FilterDropdown from "../../components/FilterDropdown";
import PaginationComponent from "../../components/PaginationComponent";
import SearchContent from "../../components/SearchContent";
import Wrapper from "../../components/Wrapper/Wrapper";
import {
  GET_ALL_ORDER_STATUS,
  GET_ORDER_LIST,
} from "../../graphql/schemas/order/query";
import { exportAllExport, exportExcel, formatMoney, getOrderStatusStyle } from "../../helpers";
import "./order.scss";

import ChangeStatusOrders from "../../components/Modal/ChangeStatusOrders";
import { UPDATE_LIST_ORDER_STATUS } from "../../graphql/schemas/order/mutation";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import { useGetListOrderSelect } from "./hooks";

const checkUpdateStatus = (list) => {
  const statusSelected = _.chain(list)
    .groupBy("order_status.code")
    .map((value, key) => ({ key: key, data: value }))
    .value();
  return _.size(statusSelected);
};

const OrderList = () => {
  const { data: orderStatus } = useQuery(GET_ALL_ORDER_STATUS, {});

  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);
  const [orderList, setOrderList] = useState([]);
  const [rowSelection, setRowSelection] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [nextStatus, setNextStatus] = useState(null);

  const [filterByStatus, setFilterByStatus] = useState([]);
  const [filterByTime, setFilterByTime] = useState([]);

  const [filterDistrict, setFilterDistrict] = useState();
  const [filterWard, setFilterWard] = useState(
    JSON.parse(localStorage.getItem("filterWard")) || []
  );
  const [filterProvince, setFilterProvince] = useState();
  const [searchContent, setSearchContent] = useState("");
  const [wardList, setWardList] = useState([]);

  const [searchTime, setSearchTime] = useState({
    startDate: undefined,
    endDate: undefined,
  });

  const conditionTime = (date, isStart) => {
    if (_.isEmpty(date) && !_.isDate(date)) {
      return undefined;
    }
    if (isStart) {
      return moment(date).startOf("day");
    }

    return moment(date);
  };

  let districtFiltered = window.localStorage.getItem("selectedDistrictId")
    ? { _in: window.localStorage.getItem("selectedDistrictId") }
    : filterDistrict?.length !== 0
      ? { _in: filterDistrict }
      : undefined;

  let filteredTime =
    searchTime.startDate || searchTime.endDate
      ? [
        { created: { _gte: conditionTime(searchTime.startDate, true) } },
        { created: { _lte: conditionTime(searchTime.endDate, false) } },
      ]
      : undefined;

  let filterWards = !_.isEmpty(filterWard)
    ? { _in: _.map(filterWard, (item) => item.id) }
    : undefined;

  let filteredProvince = !_.isEmpty(filterProvince)
    ? { _eq: filterProvince }
    : undefined;
  const { loading, data, refetch } = useQuery(GET_ORDER_LIST, {
    variables: {
      skip: skip,
      take: pageSize,
      where: {
        status: {
          _in: filterByStatus?.length !== 0 ? filterByStatus : undefined,
        },
        _and: filteredTime,
        _or: [
          { code: { _ilike: `%${searchContent}%` } },
          {
            order_booths: {
              boothByBooth: {
                code: {
                  _ilike: `%${searchContent}%`
                }
              }
            }
          },
          {
            shipments: {
              shipperByShipper: {
                code: {
                  _ilike: `%${searchContent}%`
                }
              }
            }
          },
          {
            addressByAddress: {
              _or: [
                {
                  name: {
                    _ilike: `%${searchContent}%`,
                  },
                },
                {
                  phone: {
                    _ilike: `%${searchContent}%`,
                  },
                },
              ],
            },
          },
        ],
        addressByAddress: {
          province: filteredProvince,
          district: districtFiltered,
          ward: filterWards,
        },
        order_status: {
          code: { _nin: ["INITIAL", "WAIT_PAYMENT", "PAYMENT_FAILED"] },
        },
        order_type: {
          code: {
            _neq: "OFFLINE"
          }
        },
        deleted: { _eq: false },
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const { loading: loadingExportAll, data: dataListAll } = useQuery(GET_ORDER_LIST, {
    variables: {
      skip: 0,
      take: 1e9,
      where: {
        status: {
          _in: filterByStatus?.length !== 0 ? filterByStatus : undefined,
        },
        _and: filteredTime,
        _or: [
          { code: { _ilike: `%${searchContent}%` } },
          {
            order_booths: {
              boothByBooth: {
                code: {
                  _ilike: `%${searchContent}%`
                }
              }
            }
          },
          {
            shipments: {
              shipperByShipper: {
                code: {
                  _ilike: `%${searchContent}%`
                }
              }
            }
          },
          {
            addressByAddress: {
              _or: [
                {
                  name: {
                    _ilike: `%${searchContent}%`,
                  },
                },
                {
                  phone: {
                    _ilike: `%${searchContent}%`,
                  },
                },
              ],
            },
          },
        ],
        addressByAddress: {
          province: filteredProvince,
          district: districtFiltered,
          ward: filterWards,
        },
        order_status: {
          code: { _nin: ["INITIAL", "WAIT_PAYMENT", "PAYMENT_FAILED"] },
        },
        order_type: {
          code: {
            _neq: "OFFLINE"
          }
        },
        deleted: { _eq: false },
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: selectionOrderData, refetch: refetchOrderSelect, loading: loadingSelectionData } = useGetListOrderSelect(rowSelection);

  const [getAll, { data: dataExport, loading: loadingExport }] =
    useLazyQuery(GET_ORDER_LIST);
  const handleExportFile = () => {
    if (_.isEmpty(selectedOrders)) {
      getAll({
        variables: {
          skip: 0,
          take: 1000000,
          where: {
            status: {
              _in: filterByStatus?.length !== 0 ? filterByStatus : undefined,
            },
            _and: filteredTime,
            _or: [
              { code: { _ilike: `%${searchContent}%` } },
              {
                addressByAddress: {
                  _or: [
                    {
                      name: {
                        _ilike: `%${searchContent}%`,
                      },
                    },
                    {
                      phone: {
                        _ilike: `%${searchContent}%`,
                      },
                    },
                  ],
                },
              },
            ],
            addressByAddress: {
              district: districtFiltered,
              ward: filterWards,
            },
            order_status: {
              code: { _nin: ["INITIAL", "WAIT_PAYMENT", "PAYMENT_FAILED"] },
            },
            order_type: {
              code: {
                _neq: "OFFLINE",
              },
            },
            deleted: { _eq: false },
          },
        },
      });
    } else {
      let dataExport = { order: selectedOrders };
      const listDistrict = _.unionBy(
        _.map(_.get(dataExport, "order", []), (item) => {
          return {
            id: item?.address?.district?.id,
            name: item?.address?.district?.name,
          };
        }),
        "id"
      );
      const listWard = _.unionBy(
        _.map(_.get(dataExport, "order", []), (item) => {
          return {
            id: item?.address?.ward?.id,
            name: item?.address?.ward?.name,
          };
        }),
        "id"
      );
      if (_.size(listDistrict) <= 1) {
        exportExcel([], listWard, dataExport);
      } else {
        exportExcel(listDistrict, listWard, dataExport, true);
      }
    }
  };

  useMemo(() => {
    if (dataExport) {
      const listDistrict = _.unionBy(
        _.map(_.get(dataExport, "order", []), (item) => {
          return {
            id: item?.address?.district?.id,
            name: item?.address?.district?.name,
          };
        }),
        "id"
      );
      const listWard = _.unionBy(
        _.map(_.get(dataExport, "order", []), (item) => {
          return {
            id: item?.address?.ward?.id,
            name: item?.address?.ward?.name,
          };
        }),
        "id"
      );
      if (_.size(listDistrict) <= 1) {
        exportExcel([], listWard, dataExport);
      } else {
        exportExcel(listDistrict, listWard, dataExport, true);
      }
    }
  }, [dataExport]);

  let columns = [
    {
      title: "STT",
      width: 70,
      ellipsis: true,
      align: "center",
      key: "id",
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
      align: "center",
      render: (status, record) => {
        return (
          <Tag
            className="item-center"
            color={getOrderStatusStyle(status?.code)?.color}
            style={{ color: getOrderStatusStyle(status?.code)?.textColor, width: '100%' }}
            key={status?.code}
          >
            {status?.name}
          </Tag>
        );
      },
    },
    {
      title: "M?? ????n h??ng",
      dataIndex: "code",
      ellipsis: true,
      key: "code",
      width: 200,
      render: (text, record) => {
        return (
          <Link
            to={`/order/detail/${_.get(record, "id")}`}
            onClick={(e) => e.stopPropagation()}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: "Kho h??ng l??u ?????ng",
      dataIndex: "order_booths",
      ellipsis: true,
      key: "order_booths",
      width: 250,
      render: (text, record) => {
        return _.map(text, (item, index) => {
          return (
            <Fragment>
              <Link
                key={index}
                to={`/booths/detail/${_.get(item, "boothByBooth.id")}`}
                onClick={(e) => e.stopPropagation()}
              >
                {_.get(item, "boothByBooth.code", "")}
              </Link>
              ,
            </Fragment>
          );
        });
      },
    },
    {
      title: "Shipper",
      dataIndex: "shipments",
      ellipsis: true,
      key: "shipments",
      width: 200,
      render: (text, record) => {
        return _.map(text, (item, index) => {
          return (
            <Link
              key={index}
              to={`/shipper/edit/${_.get(item, "shipperByShipper.id")}`}
              onClick={(e) => e.stopPropagation()}
            >
              {_.get(item, "shipperByShipper.code", "")}
            </Link>
          );
        });
      },
    },
    {
      title: "M?? mua chung",
      dataIndex: "",
      key: "share_code",
      ellipsis: true,
      width: 200,
      render: (text, record) => {
        return (
          <Link to={`/order/detail/group/${_.get(text, "order_group.id")}`}>
            {_.get(text, "order_group.code")}
          </Link>
        );
      },
    },
    {
      title: "Th???i gian t???o",
      dataIndex: "created",
      ellipsis: true,
      key: "created",
      width: 250,
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY hh:mm A")}</p>;
      },
    },
    {
      title: "T??n kh??ch h??ng",
      dataIndex: "address",
      ellipsis: true,
      key: "name",
      width: 200,
      render: (text, record) => {
        return (
          <Link
            to={`/customer/detail/${_.get(record, "account.id")}`}
            onClick={(e) => e.stopPropagation()}
          >
            {text.name}
          </Link>
        );
      },
    },
    {
      title: "S??? ??i???n tho???i",
      dataIndex: "address",
      ellipsis: true,
      key: "phone",
      width: 180,
      render: (text) => {
        return _.replace(text?.phone, "+84", "0");
      },
    },
    {
      title: "Th???i gian nh???n h??ng",
      dataIndex: "address",
      ellipsis: true,
      key: "phone",
      width: 300,
      render: (text) => {
        return <div>{text?.deliveryTimeByDeliveryTime?.name}</div>;
      },
    },
    {
      title: "?????a ch??? giao",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      width: 250,
      render: (text, record) => {
        return _.get(text, "number") + " " + _.get(text, "street.name", "");
      },
    },
    {
      title: "Khu v???c",
      dataIndex: "address",
      ellipsis: true,
      key: "area",
      width: 200,
      render: (text) => {
        const res = _.join(
          _.pull(
            [
              _.trim(_.get(text, "ward.name")),
              _.trim(_.get(text, "district.name")),
            ],
            "",
            null
          ),
          ", "
        );
        return res;
      },
    },
    {
      title: "T???ng thanh to??n",
      dataIndex: "total_amount",
      key: "total_amount",
      ellipsis: true,
      width: 200,

      render: (text, record) => {
        return formatMoney(text) + " ??";
      },
    },
    {
      title: "S??? l?????t in",
      dataIndex: "print_count",
      key: "print_count",
      ellipsis: true,
      width: 200,
      render: (text, record) => {
        return record.print_count;
      },
    },
    {
      title: "H??nh th???c thanh to??n",
      dataIndex: "paymentMethodByPaymentMethod",
      key: "paymentMethodByPaymentMethod",
      ellipsis: true,
      width: 250,
      render: (text, record) => {
        return <div>{text?.name}</div>;
      },
    },
  ];

  const [updateListOrderStatus] = useMutation(UPDATE_LIST_ORDER_STATUS);

  const onSelectChange = (selectedRowKeys) => {
    setRowSelection(selectedRowKeys);
  };

  const handleChangeStatusOrders = () => {

    updateListOrderStatus({
      variables: {
        data: {
          ids: _.map(selectionOrderData, (order) => _.get(order, "id")),
          status: nextStatus,
        },
      },
    })
      .then(() => {
        setRowSelection([]);
        refetch();
        notification["success"]({
          message: "Th??nh c??ng",
          description: "Chuy???n ?????i tr???ng th??i th??nh c??ng!",
        })

      })
      .catch((error) => {
        notification["error"]({
          message: "Th???t b???i",
          description: _.get(
            error,
            "errors[0].message",
            "Chuy???n ?????i tr???ng th??i th???t b???i!"
          ),
        });
      });
    setRowSelection([]);
    // window?.location?.reload(true);
  };

  const { Title } = Typography;

  useEffect(() => {
    if (!loading) {
      setOrderList(_.get(data, "order"));
    }
    if (window.localStorage.getItem("orderStatus")) {
      setFilterByStatus(JSON.parse(window.localStorage.getItem("orderStatus")));
    }
  }, [loading, data]);

  useEffect(() => {
    if (localStorage.getItem("selectedDistrictId")) {
      setFilterDistrict(localStorage.getItem("selectedDistrictId"));
    }
  }, []);


  const filterData = [
    {
      group: { code: "TIME", name: " Th???i gian ?????t h??ng" },
      filterList: [],
    },
    {
      group: { code: "STATUS", name: " Tr???ng th??i ????n h??ng" },
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
    if (value?.group === "TIME") {
      setFilterByTime(value?.checkedValue);
    }
    setSkip(0);
    setPageIndex(PAGE_INDEX);
  };

  const isDisablePrint = _.isEmpty(_.get(data, "order")); // _.isEmpty(filterDistrict) || _.isEmpty(_.get(data, 'order'));

  return (
    <div className="order-page">
      <Title level={3}>Danh s??ch ????n h??ng</Title>
      {openModal && (
        <ChangeStatusOrders
          visible={openModal}
          onCancel={setOpenModal}
          isUpdate={checkUpdateStatus(selectionOrderData) === 1 ? true : false}
          onConfirm={handleChangeStatusOrders}
          currentStatus={
            checkUpdateStatus(selectionOrderData) === 1 &&
            _.get(_.head(selectionOrderData), "order_status")
          }
          setNextStatus={setNextStatus}
        />
      )}
      <Wrapper>
        <Row>
          <Col span={12} className="flex">
            <Title level={5} className="header">
              T???t c??? ????n h??ng
            </Title>
          </Col>
          <Col span={12} className="flex align-center justify-end">
            <Space size={24}>
              <Button
                onClick={() => setOpenModal(true)}
                className={clsx(
                  "btn_bg_secondary change-status",
                  (_.isEmpty(rowSelection) || loadingSelectionData) && "disable"
                )}
              >
                ?????i tr???ng th??i
              </Button>
              <Button
                loading={loadingExport}
                onClick={() => handleExportFile()} //exportExcel(filterWard, wardList, data)}
                className={clsx(
                  "btn_bg_secondary style-button",
                  isDisablePrint && "disable",
                  "disabled-link"
                )}
              >
                In v???n ????n
              </Button>
              {/* <Button
                loading={loadingExportAll}

                onClick={() => exportAllExport(_.get(dataListAll, "order", []))} //exportExcel(filterWard, wardList, data)}
                className={clsx(
                  "btn_bg_secondary style-button",
                  isDisablePrint && "disable",
                  "disabled-link"
                )}
              >
                Xu???t t???ng
              </Button> */}
              <Link
                to={
                  !isDisablePrint && {
                    pathname: "/order/invoices",
                    state: {
                      orders:
                        _.isArray(selectedOrders) && _.size(selectedOrders) > 0
                          ? selectedOrders
                          : _.get(data, "order"),
                    },
                  }
                }
                className={clsx(
                  "btn_bg_secondary",
                  isDisablePrint && "disable"
                )}
              >
                In h??a ????n
              </Link>
            </Space>
          </Col>
        </Row>

        <Row gutter={[32, 24]} className="mb-3 mt-3">
          <Col
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            lg={{ span: 8 }}
            xl={{ span: 8 }}
          >
            <FilterDropdown filterItems={filterData}
              onChange={handleFilterOrder}
              title="L???c ????n h??ng"
              isFilterArea={true}
              filterWard={filterWard}
              filterDistrict={filterDistrict}
              //setFilterCity={setFilterCity}
              filterProvince={filterProvince}
              setFilterDistrict={setFilterDistrict}
              setFilterWard={setFilterWard}
              setFilterProvince={setFilterProvince}
              setWardList={setWardList}
              wardList={wardList}
              setRowSelection={setRowSelection}
              setSearchTime={(value) => {
                setSearchTime(value);
                setSkip(0);
                setPageIndex(PAGE_INDEX);
              }}
              searchTime={searchTime}
              filterByStatus={filterByStatus}
              // pageSize={pageSize}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
              pagename="ORDER" />

          </Col>
          <Col>
            {/* <Input
              style={{ width: 343, height: 38 }}
              placeholder="T??m ki???m..."
              prefix={<SearchOutlined className="site-form-item-icon" />}
            /> */}
            <SearchContent
              searchContent={searchContent}
              setSearchContent={setSearchContent}
            />
          </Col>
        </Row>

        <Row>
          <Table
            rowSelection={{
              selectedRowKeys: rowSelection,
              onChange: onSelectChange,
              preserveSelectedRowKeys: true,
            }}
            dataSource={_.get(data, "order", [])}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading || loadingSelectionData}
            scroll={{ x: 1200 }}
          />
        </Row>

        <PaginationComponent
          total={_.get(data, "total.aggregate.count", 0)}
          pageSize={pageSize}
          pageIndex={pageIndex}
          setPageSize={setPageSize}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageIndex={(index) => {
            setPageIndex(index);
            setSkip(index * pageSize - pageSize);
          }}
          pagename="ORDER"
        />
      </Wrapper>
    </div>
  );
};

export default OrderList;
