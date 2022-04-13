import { Avatar, Col, Image, Input, Row, Space, Typography } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { Fragment } from "react";
import { useParams, useHistory } from "react-router";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { useGetCustomerDetail } from "../hook";
import OrderItem from "./OrderItem";
import { ReactComponent as ArrowBack } from '../../../assets/icons/ArrowBack.svg';
import "./style.scss";
import slugs from "../../../constant/slugs";

const { Title, Text } = Typography;

const CustomerDetail = () => {
  const { id: customerId } = useParams();

  const history = useHistory();

  const { data, loading, error, refetch } = useGetCustomerDetail(customerId);

  if (loading) return null;

  return (
    <div className="customer-detail-wrapper">
      <Row>
        <Col>
          <div className="detail_customer_title">
            <ArrowBack onClick={() => history.push(slugs.customer)} style={{ marginRight: 12, cursor: 'pointer' }} /><Title level={3}>Chi tiết khách hàng</Title>
          </div>

        </Col>
      </Row>
      <Wrapper>
        <Row>
          <Col xs={4}>
            {_.get(data, "avatar.url") ? (
              <Avatar
                className="avatar"
                src={
                  process.env.REACT_APP_S3_GATEWAY + _.get(data, "avatar.url")
                }
                alt="avatar"
              />
            ) : _.get(data, "full_name") ? (
              <Avatar size="large" className="avatar">
                {_.toArray(_.get(data, "full_name"))[0]}
              </Avatar>
            ) : (
              <Avatar size="large" className="avatar">
                A
              </Avatar>
            )}
          </Col>
          <Col xs={16}>
            <Space direction="vertical" size={54} style={{ width: "100%" }}>
              <Row>
                <Text className="customer-name ml-2">
                  {_.get(data, "full_name")}{" "}
                </Text>
              </Row>
              <Space direction="vertical" size={34} style={{ width: "100%" }}>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Khách hàng</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={_.get(data, "full_name")}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Mã khách hàng</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={_.get(data, "code")}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Số điện thoại</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={_.get(data, "phone")}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Số lượng đơn hàng</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={_.size(_.get(data, "orders"))}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Thời gian tạo tài khoản</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={moment(_.get(data, "created")).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Người giới thiệu</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      disabled
                      className="input"
                      defaultValue={_.get(data, "account_referral.code")}
                    />
                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={8}>
                    <Text className="input-label">Ví Pinnow</Text>
                  </Col>
                  <Col xs={16}>
                    <Input
                      className="input"
                      disabled
                      defaultValue={Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(_.sumBy(_.get(data, "pinnow_e_Wallet"), 'amount'))}
                    />
                  </Col>
                </Row>
              </Space>
            </Space>
          </Col>
        </Row>
      </Wrapper>
      <div style={{ height: 32 }}></div>
      <Wrapper>
        <Row className="table-header">
          <Col>
            <Text>Thông tin đơn hàng</Text>
          </Col>
        </Row>
        {
          _.isEmpty(_.get(data, "orders")) ? (
            <div>Chưa có đơn hàng nào</div>
          )
            :
            (
              _.map(_.get(data, "orders"), (item, index) => (
                <Fragment key={index}>
                  <OrderItem data={item} />
                </Fragment>
              ))
            )
        }

      </Wrapper>
    </div>
  );
};

export default CustomerDetail;
