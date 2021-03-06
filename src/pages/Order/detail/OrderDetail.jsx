import { DownOutlined } from "@ant-design/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Col,
  Dropdown,
  Menu,
  notification,
  Rate,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import clsx from "clsx";
import * as _ from "lodash";
import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { ReactComponent as ArrowBack } from "../../../assets/icons/ArrowBack.svg";
import WarningModal from "../../../components/Modal/WarningModal";
import slugs from "../../../constant/slugs";
import { GET_LIST_BOOTHS_FILTER } from "../../../graphql/schemas/booths/query";
import {
  UPDATE_BOOTH,
  UPDATE_STATUS,
} from "../../../graphql/schemas/order/mutation";
import {
  GET_ORDER_DETAIL,
  GET_ORDER_STATUS,
} from "../../../graphql/schemas/order/query";
import { formatMoney, getOrderStatusStyle, getWeekday } from "../../../helpers";
import OrderItems from "./OrderItems";
import "./styles.scss";

const { Title, Text } = Typography;

const OrderDetail = ({ selectOrderId }) => {
  const { id } = useParams();
  const history = useHistory();
  const { Option } = Select;
  const [selectedBooth, setSelectedBooth] = useState("");
  const [isOtherBooth, setIsOtherBooth] = useState(false);
  const [statusObj, setStatusObj] = useState({});
  const [reviewOrder, setReviewOrder] = useState({});
  const [reviewShipper, setReviewShipper] = useState({});
  const { data: booths } = useQuery(GET_LIST_BOOTHS_FILTER, {});
  const [allocateOrderBooth, { loadingBooth }] = useMutation(UPDATE_BOOTH, {
    refetchQueries: [
      {
        query: GET_ORDER_DETAIL,
        variables: {
          orderId: selectOrderId ? selectOrderId : id,
        },
      },
    ],
  });
  const { loading, data } = useQuery(GET_ORDER_DETAIL, {
    variables: {
      orderId: selectOrderId ? selectOrderId : id,
    },
  });

  console.log(data);

  const [getOrderStatus, { loading: loadingStatus, data: dataStatus }] =
    useLazyQuery(GET_ORDER_STATUS);
  const [updateStatus, { error }] = useMutation(UPDATE_STATUS, {
    refetchQueries: [
      {
        query: GET_ORDER_DETAIL,
        variables: {
          orderId: selectOrderId ? selectOrderId : id,
        },
      },
    ],
  });

  const onBoothSelected = (booth) => {
    setSelectedBooth(booth);
    setIsOtherBooth(true);
  };

  //update booth
  const updateBooth = () => {
    allocateOrderBooth({
      variables: {
        order: id,
        booth: selectedBooth,
      },
    })
      .then((res) => {
        notification["success"]({
          message: "Th??nh c??ng",
          description: "Chuy???n ?????i kho h??ng th??nh c??ng",
        });
        setIsOtherBooth(false);
      })
      .catch((err) => {
        notification["error"]({
          message: "Th???t b???i",
          description: _.get(err, "message", "Chuy???n ?????i kho h??ng th???t b???i"),
        });
      });
  };

  useEffect(() => {
    if (data) {
      let reviewOrderFilter = _.filter(
        data.order[0].rating_reviews,
        (item) => item.rating_review_type.code === "SERVICE"
      );
      let reviewShipperFilter = _.filter(
        data.order[0].rating_reviews,
        (item) => item.rating_review_type.code === "SHIPPER"
      );
      if (_.size(reviewOrderFilter) > 0) {
        setReviewOrder(reviewOrderFilter[0]);
      }
      if (_.size(reviewShipperFilter) > 0) {
        setReviewShipper(reviewShipperFilter[0]);
      }
      getOrderStatus({
        variables: {
          nextIndex: _.get(data, "order[0].order_status.index") + 1,
        },
      });
    }
  }, [data]);

  const handleMenuClick = (e) => {
    setStatusObj(JSON.parse(e.key));
  };

  const handleUpdateStatus = () => {
    try {
      updateStatus({
        variables: {
          data: {
            id: id,
            status: statusObj.id,
          },
        },
      })
        .then(() => {
          setStatusObj({});
          notification["success"]({
            message: "Th??nh c??ng",
            description: "Chuy???n ?????i tr???ng th??i th??nh c??ng",
          });
        })
        .catch((err) => {
          notification["error"]({
            message: "Th???t b???i",
            description: _.get(
              err,
              "message",
              "Chuy???n ?????i tr???ng th??i th???t b???i"
            ),
          });
        });
    } catch (err) {
      notification["error"]({
        message: "Th???t b???i",
        description: _.get(err, "message", "Chuy???n ?????i tr???ng th??i th???t b???i"),
      });
    }
  };

  const menu = (
    <Fragment>
      {loadingStatus ? (
        <div className="wapperLoading">
          <Spin tip="??ang t???i d??? li???u..." />
        </div>
      ) : (
        <Menu onSelect={handleMenuClick}>
          {_.map(_.get(dataStatus, "order_status"), (item, index) => {
            return (
              <Menu.Item
                key={JSON.stringify({ id: item.id, name: item.name })}
                defaultValue={item}
              >
                <a target="_blank" rel="noopener noreferrer">
                  {_.get(item, "name")}
                </a>
              </Menu.Item>
            );
          })}
        </Menu>
      )}
    </Fragment>
  );

  if (loading) {
    return (
      <div className="wapperLoading">
        <Spin tip="??ang t???i d??? li???u..." />
      </div>
    );
  }
  const currentOrderStatus = _.get(data, "order[0].order_status.code");

  return (
    <Fragment>
      <WarningModal
        visible={isOtherBooth}
        title="Th??ng b??o"
        content="B???n mu???n thay ?????i kho h??ng l??u ?????ng kh??c?"
        onBack={() => setIsOtherBooth(false)}
        onSubmit={updateBooth}
        loading={loadingBooth}
      />
      <div className="order-detail-wrapper">
        <Row className="mb-2">
          <Col span={12}>
            <div className="flex align-center">
              <Space size={24}>
                <div className="order_detail_title">
                  <ArrowBack
                    onClick={() => history.push(slugs.order)}
                    style={{ marginRight: 12, cursor: "pointer" }}
                  />
                  <Title level={3} className="order-code">
                    M?? ????n h??ng {_.get(data, "order[0].code")}
                  </Title>
                </div>

                {_.includes(["DELIVERED", "CANCELLED"], currentOrderStatus) ? (
                  <Tag
                    className="tag_status lastest"
                    style={{
                      background: getOrderStatusStyle(currentOrderStatus).color,
                      color: getOrderStatusStyle(currentOrderStatus).textColor,
                    }}
                    key={1}
                  >
                    <Space>{_.get(data, "order[0].order_status.name")}</Space>
                  </Tag>
                ) : (
                  <Dropdown overlay={menu} placement="bottomCenter" arrow>
                    <Tag
                      className="tag_status"
                      style={{
                        background:
                          getOrderStatusStyle(currentOrderStatus).color,
                        color:
                          getOrderStatusStyle(currentOrderStatus).textColor,
                      }}
                      key={1}
                    >
                      <Space>
                        {_.isEmpty(statusObj)
                          ? _.get(data, "order[0].order_status.name")
                          : _.get(statusObj, "name")}{" "}
                        <DownOutlined />
                      </Space>
                    </Tag>
                  </Dropdown>
                )}
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex align-center justify-end">
              <Space size={24}>
                <Text>Ng??y ?????t h??ng:</Text>
                <Text>
                  {moment(
                    moment.utc(_.get(data, "order[0].created")),
                    "YYYY-MM-DD[T]HH-mm"
                  )
                    .local()
                    .format("HH:mm DD/MM/YYYY")}
                </Text>
                <Button
                  className="btn_history"
                  onClick={() => history.push(`/order/history/${id}`)}
                >
                  L???ch s??? c???p nh???t
                </Button>
                <Link
                  // onClick={() => history.push('/order/invoice')}
                  to={{
                    pathname: "/order/invoice",
                    state: { data: _.get(data, "order[0]") },
                  }}
                  className="btn_history"
                  style={{
                    background: "#77BA6A",
                    whiteSpace: "nowrap",
                    height: 32,
                  }}
                >
                  In h??a ????n
                </Link>
              </Space>
            </div>
          </Col>
        </Row>

        <Row gutter={16} className="mb-3 mt-5">
          <Col span={8} className="order-info">
            <Row>
              <Text className="order-info-title">?????a ch??? ng?????i nh???n</Text>
            </Row>
            <Row className="background-header">
              <Col span={24}>
                <Text className="title__address font-16">H??? v?? T??n: </Text>
                <Text>{_.get(data, "order[0].address.name")}</Text>
              </Col>
              <Col span={24}>
                <Text className="title__address font-16">?????a ch???: </Text>
                <Text className="text__address">
                  {_.get(data, "order[0].address.number", "") +
                    " " +
                    _.get(data, "order[0].address.street.name", "") +
                    " " +
                    _.get(data, "order[0].address.ward.name", "") +
                    " " +
                    _.get(data, "order[0].address.district.name", "") +
                    " " +
                    _.get(data, "order[0].address.province.name", "")}
                </Text>
              </Col>
              <Col span={24}>
                <Text className="title__phone">??i???n tho???i: </Text>
                <Text className="text__phone">
                  {_.get(data, "order[0].address.phone")}
                </Text>
              </Col>
            </Row>
          </Col>
          <Col span={8} className="order-info">
            <Row>
              <Text className="order-info-title">H??nh th???c giao h??ng</Text>
            </Row>
            <Row className="background-header">
              <Col span={24}>
                <Text className="title__address font-16">
                  Th???i gian giao h??ng:{" "}
                </Text>
                <Text className="text__address">
                  {_.get(data, "order[0].est_delivery_time")
                    ? getWeekday(
                        moment(
                          _.get(data, "order[0].est_delivery_time"),
                          "YYYY-MM-DD[T]HH-mm"
                        ).format("MM-DD-YYYY")
                      ) +
                      " " +
                      moment(
                        _.get(data, "order[0].est_delivery_time"),
                        "YYYY-MM-DD[T]HH-mm"
                      ).format("DD/MM")
                    : "-"}
                </Text>
              </Col>
              <Col span={24}>
                <Row>
                  <Col>
                    <Text className="title__address font-16">
                      Kho h??ng l??u ?????ng:{" "}
                    </Text>
                  </Col>
                  <Col span={10}>
                    <Select
                      style={{ width: "95%", margin: "0px 10px 0px 10px" }}
                      showSearch
                      placeholder=""
                      optionFilterProp="children"
                      onChange={onBoothSelected}
                      defaultValue={_.get(
                        data,
                        "order[0].order_booths[0].boothByBooth.code",
                        ""
                      )}
                      //onSearch={onBoothSearchChange}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {_.map(booths?.results ?? [], (item, key) => {
                        return (
                          <Option key={key} value={item.id}>
                            {item.code}
                          </Option>
                        );
                      })}
                    </Select>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Text className="title__address font-16">
                  Th??ng tin shipper:{" "}
                </Text>
                <Text className="text__address">
                  {_.get(
                    data,
                    "order[0].shipments[0].shipperByShipper.code",
                    ""
                  )}
                </Text>
              </Col>
              <Col span={24}>
                <Text className="title__address font-16">Lo???i ????n h??ng: </Text>
                <Text className="text__address">
                  {_.get(data, "order[0].order_type.name", "")}
                </Text>
              </Col>
              {/* <Col span={24}>
                            <Text className="title__address font-16">???????c giao b???i: </Text>
                            <Text className="text__address" >{_.get(data, 'order[0].order_items[0].productByProduct.vendorByVendor.name')} </Text>
                        </Col>
                        <Col span={24}>
                            <Text className="title__address font-16">Ph?? v???n chuy???n: </Text>
                            <Text className="text__phone">
                                {_.get(data, 'order[0].delivery_price')}??
                            </Text>
                        </Col> */}
            </Row>
          </Col>
          <Col span={8} className="order-info">
            <Row>
              <Text className="order-info-title">H??nh th???c thanh to??n</Text>
            </Row>
            <Row className="background-header">
              <Col span={24}>
                <Text className="text__address">
                  {_.get(
                    data,
                    "order[0].paymentMethodByPaymentMethod.name",
                    ""
                  )}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <div className="background-table">
            <Row className="table-styling table-thread">
              <Col span={9}>
                <Text className="title-table" strong={true}>
                  S???n ph???m
                </Text>
              </Col>
              <Col span={3}>
                <Text className="title-table" strong={true}>
                  Gi??
                </Text>
              </Col>
              <Col span={2}>
                <Text className="title-table" strong={true}>
                  S??? l?????ng
                </Text>
              </Col>
              <Col span={2}>
                <Text className="title-table" strong={true}>
                  ????n v???
                </Text>
              </Col>
              <Col span={2}>
                <Text className="title-table" strong={true}>
                  %
                </Text>
              </Col>
              <Col span={3}>
                <Text className="title-table" strong={true}>
                  Gi???m gi??
                </Text>
              </Col>
              <Col span={3}>
                <div className="flex justify-end">
                  <Text className="title-table" strong={true}>
                    T???m t??nh
                  </Text>
                </div>
              </Col>
            </Row>
            <div
              className="w-max"
              style={{ borderBottom: "1px solid lightgray" }}
            >
              {_.map(_.get(data, "order[0].order_items", []), (item, index) => (
                <Fragment key={index}>
                  <OrderItems data={item} />
                </Fragment>
              ))}
            </div>
            <Row>
              <Col span={8}>
                <Row>
                  <Col span={12}>
                    <div style={{ padding: 20 }}>
                      <Text style={{ color: "#B9B9B9" }}>Ghi ch??: </Text>
                      <Typography>
                        {_.get(data, "order[0].note", "-") || "-"}
                      </Typography>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: 20 }}>
                      {_.get(data, "order[0].order_type.code") !== "NOW" && (
                        <>
                          <Text style={{ color: "#B9B9B9" }}>
                            Th???i gian nh???n h??ng:{" "}
                          </Text>
                          <Typography>
                            {_.get(
                              data,
                              "order[0].address.deliveryTimeByDeliveryTime.name",
                              ""
                            )}
                          </Typography>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <div
                    style={{
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Text style={{ color: "#B9B9B9" }}>V??? tr??: </Text>
                    {_.get(
                      data,
                      "order[0].shipments[0].shipment_status_record.latitude"
                    ) ? (
                      <a
                        target="_blank"
                        href={`https://www.google.com/maps/search/${_.get(
                          data,
                          "order[0].shipments[0].shipment_status_record.latitude"
                        )},+${_.get(
                          data,
                          "order[0].shipments[0].shipment_status_record.longitude"
                        )}`}
                      >
                        {`https://www.google.com/maps/search/${_.get(
                          data,
                          "order[0].shipments[0].shipment_status_record.latitude"
                        )},+${_.get(
                          data,
                          "order[0].shipments[0].shipment_status_record.longitude"
                        )}`}
                      </a>
                    ) : (
                      <div>-</div>
                    )}
                  </div>
                </Row>
              </Col>

              {_.includes(["CANCELLED"], currentOrderStatus) ? (
                <Col span={4}>
                  <div style={{ padding: 20 }}>
                    <Text style={{ color: "#B9B9B9" }}>L?? do h???y ????n: </Text>
                    <Typography>
                      {_.get(data, "order[0].order_status_record.remark", "")}
                    </Typography>
                  </div>
                </Col>
              ) : (
                <Col span={4}></Col>
              )}
              <Col span={12}>
                <Row className="flex justify-end footer-table">
                  <Col span={7}>
                    <div className="flex flex-column align-end justify-end w-max head-footer">
                      <Text className="lightblue">T???m t??nh</Text>
                      <Text className="lightblue">Ph?? v???n chuy???n</Text>
                      {_.get(
                        data,
                        "order[0].promotionComboByPromotionCombo"
                      ) && <Text className="lightblue">T???ng ????n ?????u ti??n</Text>}
                      <Text className="lightblue">Voucher</Text>
                      <Text className="lightblue">V?? Pinnow</Text>
                      <Text className="lightblue">T???ng thanh to??n</Text>
                    </div>
                  </Col>
                  <Col span={5}>
                    <div className="flex flex-column justify-end align-end body-footer w-max">
                      <Text>
                        {`${formatMoney(_.get(data, "order[0].amount", 0))}`}
                        <span className="underline">??</span>
                      </Text>
                      <Text>
                        {formatMoney(_.get(data, "order[0].delivery_price", 0))}
                        <span className="underline">??</span>
                      </Text>
                      {_.get(
                        data,
                        "order[0].promotionComboByPromotionCombo"
                      ) && (
                        <Text style={{ color: "#77BA6A" }}>
                          {_.get(
                            data,
                            "order[0].promotionComboByPromotionCombo.name",
                            "-"
                          )}
                        </Text>
                      )}
                      <Text>
                        {Number(_.get(data, "order[0].voucher_amount")) > 0
                          ? `-${formatMoney(
                              _.get(data, "order[0].voucher_amount")
                            )}`
                          : 0}
                        <span className="underline">??</span>
                      </Text>
                      <Text>
                        {Number(_.get(data, "order[0].pinnow_amount")) > 0
                          ? `-${formatMoney(
                              _.get(data, "order[0].pinnow_amount")
                            )}`
                          : 0}
                        <span className="underline">??</span>
                      </Text>
                      <Text className="red">
                        {formatMoney(_.get(data, "order[0].total_amount", 0))}
                        <span className="underline">??</span>
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Row>

        <Row gutter={16} className="mb-3 mt-5">
          <Col span={12} className="order-info">
            <Row className="background-header">
              <Col span={24}>
                <Text>????nh gi?? ????n h??ng</Text>
              </Col>
              {reviewOrder.star && (
                <Fragment>
                  <Col span={24}>
                    <Rate allowHalf defaultValue={reviewOrder.star} />
                  </Col>
                  <Col span={24}>
                    <Text className="title__phone">{reviewOrder.review}</Text>
                  </Col>
                </Fragment>
              )}
            </Row>
          </Col>
          <Col span={12} className="order-info">
            <Row className="background-header">
              <Col span={24}>
                <Text>????nh gi?? shipper</Text>
              </Col>
              {reviewShipper.star && (
                <Fragment>
                  <Col span={24}>
                    <Rate allowHalf defaultValue={reviewShipper.star} />
                  </Col>
                  <Col span={24}>
                    <Text className="title__phone">{reviewShipper.review}</Text>
                  </Col>
                </Fragment>
              )}
            </Row>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div className="w-max flex justify-end">
              <Button
                className={clsx(
                  _.isEmpty(statusObj) && "disableBtn",
                  !_.isEmpty(statusObj) && "confirmBtn"
                )}
                disabled={_.isEmpty(statusObj)}
                onClick={handleUpdateStatus}
              >
                X??c nh???n
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default OrderDetail;
