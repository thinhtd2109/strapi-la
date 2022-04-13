import React, { Fragment } from 'react';
import { Divider, Spin, Typography } from 'antd';
import './styles.scss';
import _ from 'lodash';
import clsx from 'clsx';
import Wrapper from '../../../components/Wrapper/Wrapper';
import { useQuery } from '@apollo/client';
import { GET_ORDER_HISTORY } from '../../../graphql/schemas/order/query';
import { useParams } from 'react-router';
import moment from 'moment';

function OrderHistory(props) {
    const { id } = useParams();
    const { loading, data } = useQuery(GET_ORDER_HISTORY, {
        variables: {
            id: id
        }
    });
    const { Text, Title } = Typography;

    if (loading) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return (
        <Fragment>
            <Title level={3}>Lịch sử đơn hàng {_.get(data, 'order.code')}</Title>
            <Wrapper>
                {/* <Title level={3}>Trạng thái giao hàng {moment(_.get(data, 'order.created'), 'YYYY-MM-DD[T]HH-mm').format('HH:mm DD/MM/YYYY')}</Title> */}
                <Title level={3}>Trạng thái giao hàng {moment(_.get(data, 'order.created')).format('HH:mm DD/MM/YYYY')}</Title>
                <Divider />
                {
                    _.map(_.get(data, 'histories'), (item, index) => {
                        return <Fragment key={index} >
                            <div className="order_history">
                                <div className={clsx(index === 0 ? "stepActive" : "stepHidden")}>
                                    <div className="mgBottom">
                                        <Text strong>Tên: {_.get(item,'account.full_name')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Email: {_.get(item,'account.email')}</Text>
                                    </div>
                                    <div>
                                        {/* <Text type="secondary">Thời gian: {moment(item.created, 'YYYY-MM-DD[T]HH-mm').format('HH:mm DD/MM/YYYY')}</Text> */}
                                        <Text type="secondary">Thời gian: {moment(_.get(item,'created')).format('HH:mm DD/MM/YYYY')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Mã đơn hàng: {_.get(data, 'order.code')}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Trạng thái: <Text className={clsx(_.get(item,'order_status.code') === 'DELIVERED' && 'done', _.get(item,'order_status.code') === 'AWAITING_PICKUP' && 'waiting', _.get(item,'order_status.code') === 'DELIVERING' && 'process', _.get(item,'order_status.code') === 'SUBMITTED' && 'accept')}>{_.get(item,'order_status.name')}</Text></Text>
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    })
                }
            </Wrapper>

        </Fragment  >
    );
}

export default OrderHistory;
