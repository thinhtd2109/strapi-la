import { Col, Image, Row, Space, Typography, Tag } from "antd";

import _ from "lodash";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { formatMoney, getOrderStatusStyle } from "../../../helpers";

const OrderItem = ({ data }) => {
  const { Text } = Typography;

  if (!data) return null;

  const tagStyle = getOrderStatusStyle(data.order_status.code);

  return (
    <div className="order-item">
      <Row className="table-styling body-table">
        <Col span={7}>
          <div className="flex align-center h-max">
            <Space size={12}>
              <Image
                className="product_image"
                width={120}
                src={
                  process.env.REACT_APP_S3_GATEWAY +
                  _.get(data.order_items[0], "productByProduct.photo.url")
                }
                alt="product_image"
              />
              <div className="flex flex-column">
                <Text strong={true} className="item-name">
                  {_.get(data, "order_items[0].productByProduct.name")}
                </Text>
                <Text>
                  <Text>
                    {/* {_.get(data, "productByProduct.vendorByVendor.name")} */}
                    <span style={{ color: "#748CAD" }}>
                      {" "}
                      {formatMoney(
                        _.get(data, "order_items[0].productByProduct.price")
                      )}{" "}
                      đ
                    </span>
                  </Text>
                </Text>
                <Text>
                  <span style={{ color: "#748CAD" }}>Mã sản phẩm: </span>
                  {_.get(data, "order_items[0].productByProduct.code")}
                </Text>
              </div>
            </Space>
          </div>
        </Col>
        <Col span={3}>
          <div className="flex align-center h-max">
            <Space direction="vertical" size={24}>
              <Text className="item-title">Mã đơn hàng</Text>
              <Text className="item-text">{_.get(data, "code")}</Text>
            </Space>
          </div>
        </Col>
        <Col span={4}>
          <div className="flex align-center h-max">
            <Space direction="vertical" size={24}>
              <Text className="item-title">Trạng thái</Text>
              <Tag
                color={tagStyle.color}
                style={{ color: tagStyle.textColor }}
                className="item-tag"
              >
                {_.get(data, "order_status.name")}
              </Tag>
            </Space>
          </div>
        </Col>
        <Col span={2}>
          <div className="flex align-center h-max">
            <Space direction="vertical" size={24}>
              <Text className="item-title">Ngày mua</Text>
              <Text className="item-text">
                {moment(_.get(data, "created")).format("DD/MM/YYYY")}
              </Text>
            </Space>
          </div>
        </Col>
        <Col span={2}>
          <div className="flex align-center h-max justify-center">
            <Space
              direction="vertical"
              size={24}
              style={{ textAlign: "center" }}
            >
              <Text className="item-title">Số lượng</Text>
              <Text className="item-text">
                {" "}
                {_.get(data, "order_items[0].quantity")}
              </Text>
            </Space>
          </div>
        </Col>
        <Col span={3}>
          <div className="flex align-center h-max">
            <Space direction="vertical" size={24}>
              <Text className="item-title">Tổng thanh toán</Text>
              <Text className="item-text">
                {" "}
                {formatMoney(_.get(data, "total_amount"))} đ
              </Text>
            </Space>
          </div>
        </Col>
        <Col span={3}>
          <div className="flex align-center justify-end w-max h-max">
            <Link
              to={`/order/detail/${_.get(data, "id")}`}
              className="detail-btn"
            >
              Xem chi tiết
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OrderItem;
