import { DownOutlined } from "@ant-design/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Col,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Menu,
  Dropdown,
  notification,
} from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import {
  GET_ORDER_DETAIL,
  GET_ORDER_GROUP_DETAIL,
  GET_ORDER_STATUS,
} from "../../../graphql/schemas/order/query";
import { formatMoney, getOrderStatusStyle, getWeekday } from "../../../helpers";
import OrderItems from "./OrderItems";
import "./styles.scss";
import * as _ from "lodash";
import moment from "moment";
import clsx from "clsx";
import { UPDATE_STATUS } from "../../../graphql/schemas/order/mutation";
const { Title, Text } = Typography;

const OrderDetailTemplate = ({ data }) => {
  const { id } = useParams();
  const history = useHistory();
  const [statusObj, setStatusObj] = useState({});

  const [getOrderStatus, { loading: loadingStatus, data: dataStatus }] =
    useLazyQuery(GET_ORDER_STATUS);
  const [updateStatus, { error }] = useMutation(UPDATE_STATUS, {
    refetchQueries: [
      {
        query: GET_ORDER_GROUP_DETAIL,
        variables: {
          where: {
            id: { _eq: id },
            deleted: { _eq: false },
          },
          order_where: {
            order_status: {
              code: { _neq: "INITIAL" },
            },
          },
        },
      },
    ],
  });

  useEffect(() => {
    if (data) {
      getOrderStatus({
        variables: {
          nextIndex: _.get(data, "order_status.index") + 1,
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
            id: data?.id,
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

  const currentOrderStatus = _.get(data, "order_status.code");

  console.log(data)

  return (
    <div className="order-detail-wrapper">
      <Row className="mb-2">
        <Col span={12}>
          <div className="flex align-center">
            <Space size={24}>
              <Title level={3} className="order-code">
                M?? ????n h??ng {_.get(data, "code")}
              </Title>

              {_.includes(["DELIVERED", "CANCELLED"], currentOrderStatus) ? (
                <Tag
                  className="tag_status lastest"
                  style={{
                    background: getOrderStatusStyle(currentOrderStatus).color,
                    color: getOrderStatusStyle(currentOrderStatus).textColor,
                  }}
                  key={1}
                >
                  <Space>{_.get(data, "order_status.name")}</Space>
                </Tag>
              ) : (
                <Dropdown overlay={menu} placement="bottomCenter" arrow>
                  <Tag
                    className="tag_status"
                    style={{
                      background: getOrderStatusStyle(currentOrderStatus).color,
                      color: getOrderStatusStyle(currentOrderStatus).textColor,
                    }}
                    key={1}
                  >
                    <Space>
                      {_.isEmpty(statusObj)
                        ? _.get(data, "order_status.name")
                        : statusObj.name}{" "}
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
                {moment(_.get(data, "created")).format("HH:mm DD/MM/YYYY")}
              </Text>
              <Button
                className="btn_history"
                onClick={() => history.push(`/order/history/${data?.id}`)}
              >
                L???ch s??? c???p nh???t
              </Button>
              <Link
                // onClick={() => history.push('/order/invoice')}
                to={{ pathname: "/order/invoice", state: { data: data } }}
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
              <Text>{_.get(data, "address.name")}</Text>
            </Col>
            <Col span={24}>
              <Text className="title__address font-16">?????a ch???: </Text>
              <Text className="text__address">
                {_.get(data, "address.number", "") +
                  " " +
                  _.get(data, "address.street.name", "") +
                  " " +
                  _.get(data, "address.ward.name", "") +
                  " " +
                  _.get(data, "address.district.name", "") +
                  " " +
                  _.get(data, "address.province.name", "")}
              </Text>
            </Col>
            <Col span={24}>
              <Text className="title__phone">??i???n tho???i: </Text>
              <Text className="text__phone">
                {_.get(data, "address.phone")}
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
              <Text className="text__address">
                Giao v??o ng??y:{" "}
                {_.get(data, "est_delivery_time") ? getWeekday(
                    moment(
                      _.get(data, "est_delivery_time"),
                      "YYYY-MM-DD[T]HH-mm"
                    ).format("MM-DD-YYYY")
                  ) +
                    " " +
                    moment(
                      _.get(data, "est_delivery_time"),
                      "YYYY-MM-DD[T]HH-mm"
                    ).format("DD/MM") : "-"}
              </Text>
            </Col>
            <Col span={24}>
              <Text className="text__address">
                ???????c giao b???i:{" "}
                {_.get(
                  data,
                  "order_items[0].productByProduct.vendorByVendor.name"
                )}{" "}
              </Text>
            </Col>
            <Col span={24}>
              <Text className="text__phone">
                Ph?? v???n chuy???n: {_.get(data, "delivery_price")}??
              </Text>
            </Col>
          </Row>
        </Col>
        <Col span={8} className="order-info">
          <Row>
            <Text className="order-info-title">H??nh th???c thanh to??n</Text>
          </Row>
          <Row className="background-header">
            <Col span={24}>
              <Text className="text__address">
                {_.get(data, "paymentMethodByPaymentMethod.name")}
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
            {_.map(_.get(data, "order_items", []), (item, index) => (
              <OrderItems key={index} data={item} />
            ))}
          </div>
          <Row>
            <Col span={4}>
              <div style={{ padding: 20 }}>
                <Text style={{ color: "#B9B9B9" }}>Ghi ch??: </Text>
                <Typography>{_.get(data, "note", "-") || "-"}</Typography>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ padding: 20 }}>
                <Text style={{ color: "#B9B9B9" }}>Th???i gian nh???n h??ng: </Text>
                <Typography>
                  {_.get(
                    data,
                    "address.deliveryTimeByDeliveryTime.name",
                    ""
                  )}
                </Typography>
              </div>
            </Col>
            {_.includes(["CANCELLED"], currentOrderStatus) ? (
              <Col span={4}>
                <div style={{ padding: 20 }}>
                  <Text style={{ color: "#B9B9B9" }}>L?? do h???y ????n: </Text>
                  <Typography>
                    {_.get(data, "order_status_record.remark", "")}
                  </Typography>
                </div>
              </Col>
            ) : (
              <Col span={4}></Col>
            )}
            <Col span={12}>
              <Row className="flex justify-end footer-table">
                <Col span={9}>
                  <div className="flex flex-column align-end justify-end w-max head-footer">
                    <Text className="lightblue"> T???m t??nh </Text>
                    <Text className="lightblue">Ph?? v???n chuy???n </Text>
                    {_.get(data, "promotionComboByPromotionCombo") && (
                      <Text className="lightblue">T???ng ????n ?????u ti??n</Text>
                    )}
                    <Text className="lightblue">Voucher </Text>
                    <Text className="lightblue">V?? Pinnow </Text>
                    <Text className="lightblue">T???ng thanh to??n </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="flex flex-column justify-end align-end body-footer w-max">
                    <Text>
                      {formatMoney(_.get(data, "amount"))}{" "}
                      <span className="underline">??</span>
                    </Text>
                    <Text>
                      {formatMoney(_.get(data, "delivery_price"))}
                      <span className="underline">??</span>
                    </Text>
                    {_.get(data, "promotionComboByPromotionCombo") && (
                      <Text style={{ color: "#77BA6A" }}>
                        {_.get(data, "promotionComboByPromotionCombo.name")}
                      </Text>
                    )}
                    <Text>
                      {Number(_.get(data, "voucher_amount")) > 0
                        ? `-${formatMoney(_.get(data, "voucher_amount"))}`
                        : 0}
                      <span className="underline">??</span>
                    </Text>
                    <Text>
                      {Number(_.get(data, "pinnow_amount")) > 0
                        ? `-${formatMoney(_.get(data, "pinnow_amount"))}`
                        : 0}
                      <span className="underline">??</span>
                    </Text>
                    <Text className="red">
                      {formatMoney(_.get(data, "total_amount"))}
                      <span className="underline">??</span>
                    </Text>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
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
  );
};

export default OrderDetailTemplate;
