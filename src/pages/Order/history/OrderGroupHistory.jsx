import React, { Fragment, useEffect, useState } from 'react';
import { Divider, Typography, Col, Row, Avatar, Spin } from 'antd';
import './styles.scss';
import _ from 'lodash';
import clsx from 'clsx';
import { useLazyQuery, useQuery } from '@apollo/client';
import Wrapper from '../../../components/Wrapper/Wrapper';
import { useParams } from 'react-router';
import moment from 'moment';
import { GET_ORDER_GROUP_HISTORY, GET_ORDER_HISTORY } from '../../../graphql/schemas/order/query';


function OrderGroupHistory(props) {
    const { id } = useParams();
    const { loading, data } = useQuery(GET_ORDER_GROUP_HISTORY, {
        variables: {
            id: id
        }
    });

    const [getOrderHistory, { loading: loadingHistory, data: orderHistory }] = useLazyQuery(GET_ORDER_HISTORY);
    const [orderId, setOrderId] = useState(null);
    const { Text, Title } = Typography;

    useEffect(() => {
        if (_.size(_.get(data, 'order_group.orders')) > 0) {
            setOrderId(_.get(data, 'order_group.orders[0].id'))
        }
    }, [data]);

    useEffect(() => {
        if (orderId) {
            getOrderHistory({
                variables: {
                    id: orderId
                }
            })
        }
    }, [orderId]);

    const getOrderGroupStatus = (status) => {
        let result = null;
        switch (status) {
            case 'INITIAL':
                result = <Col span={12}>
                    <ul className="progressbar">
                        <li className="complete">Chờ xác nhận</li>
                    </ul>
                </Col>
                break;
            case 'VERIFIED':
                result = <Col span={12}>
                    <ul className="progressbar">
                        <li className="complete">Chờ xác nhận</li>
                        <li className="complete">Xác nhận đơn hàng</li>
                    </ul>
                </Col>
                break;
            case 'DONE':
                result = <Col span={12}>
                    <ul className="progressbar">
                        <li className="complete">Chờ xác nhận</li>
                        <li className="complete">Xác nhận đơn hàng</li>
                        <li className="complete">Đã hoàn thành</li>
                    </ul>
                </Col>
                break;
            case 'CANCELLED':
                <Col span={12}>
                    <ul className="progressbar">
                        <li className="complete">Chờ xác nhận</li>
                        <li className="complete">Xác nhận đơn hàng</li>
                        <li className="active cancel">Đã hủy</li>
                    </ul>
                </Col>
                break;
            default:
                result = <Col span={12}>
                    <ul className="progressbar">
                        <li className="complete">Chờ xác nhận</li>
                    </ul>
                </Col>
                break;
        }
        return result;
    }

    if (loading) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>

    return (
        <Fragment>
            <div className="order_history">
                <Wrapper>
                    <Row>
                        <Col span={12}>
                            <Title level={3}>Lịch sử mua chung {_.get(data, 'order_group.code')}</Title>
                        </Col>
                        {getOrderGroupStatus(_.get(data, 'order_group.order_group_status.code'))}
                    </Row>

                    <Divider style={{ marginBottom: 0 }} />
                    <Row>
                        <Col span={8}>

                            <div style={{ borderRight: '1px solid rgba(0, 0, 0, 0.06)', height: '100%', marginRight: 50 }}>
                                <br />
                                {_.map(_.get(data, 'order_group.orders'), (item, index) => {
                                    return <div className="flex align-center mt-2" key={index}>
                                        {_.get(item, 'account.medium.url') ?
                                            <Avatar size="large" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'account.medium.url')}></Avatar> :
                                            _.get(item, 'account.full_name') ?
                                                <Avatar style={{ width: 40, height: 40, fontSize: 18 }} size="small" className="avatar">{_.toArray(_.get(item, 'account.full_name'))[0]}</Avatar> :
                                                <Avatar style={{ width: 40, height: 40, fontSize: 18 }} size="large" className="avatar">A</Avatar>}
                                        <div className="flex flex-column ml-1">
                                            <Text strong>{_.get(item, 'account.full_name')}</Text>
                                            <Text className="orderLink" onClick={() => { setOrderId(item?.id) }}>Mã đơn hàng: {_.get(item, 'code')}</Text>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </Col>
                        <Col span={16}>
                            <br />
                            {
                                loadingHistory && <div><Spin tip="Đang tải dữ liệu..." /></div>

                            }
                            {_.map(_.get(orderHistory, 'histories', []), (item, index) => {
                                return <div className={clsx(index === 0 ? "stepActive" : "stepHidden")} key={index}>
                                    <div className="mgBottom">
                                        <Text strong>Tên: {_.get(item, 'account.full_name')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Email: {_.get(item, 'account.email')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Thời gian: {moment(_.get(item, 'created')).format('HH:mm DD/MM/YYYY')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Mã đơn hàng: {_.get(orderHistory, 'order.code')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Trạng thái: <Text className="done">{_.get(item, 'order_status.name')}</Text></Text>
                                    </div>
                                </div>
                            })}

                        </Col>
                    </Row>

                </Wrapper>

            </div>

        </Fragment>
    );
}

export default OrderGroupHistory;