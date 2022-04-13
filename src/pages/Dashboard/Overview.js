import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_SUMMARY } from '../../graphql/schemas/dashboard/query';
import { Row, Col, Typography,Spin } from 'antd';
import clsx from 'clsx';
import style from "./style.module.scss";
import { formatMoney, timer } from '../../helpers';
import { ReactComponent as CURRENCY } from '../../assets/icons/currency.svg';
import { ReactComponent as SHOPPING } from '../../assets/icons/shopping.svg';
import { ReactComponent as HANDBAG } from '../../assets/icons/hand-bag.svg';

const { Title, Text } = Typography;

const Overview = ({timeFilter}) => {
    const getTimer = timer(timeFilter);
    const { loading, data, refetch } = useQuery(GET_DASHBOARD_SUMMARY, {
        variables: {
            "dateFrom": _.get(getTimer,'dateFrom'),
            "dateTo": _.get(getTimer,'dateTo')
        },
    });

    if(loading) {
        return <div className="wapperLoading">< Spin tip="Đang tải dữ liệu..." /></div>
    }

    return (
        <Row gutter={[32,32]}>
            <Col xs={{ span: 24 }} sm={{ span: 8 }} xl={{ span: 7 }} xxl={{ span: 5 }}>
                <div className={style.styleOverview}>
                    <div>
                        <CURRENCY className={clsx(style.styleIcon, style.currencyItem)} />
                    </div>
                    <div>
                        <Text className={style.overviewTitle}>Tổng doanh số</Text>
                        <Title level={5}>{`${formatMoney(_.get(data, 'revenue.aggregate.sum.total_amount',0)||0)} đ`}</Title>
                    </div>
                </div>
            </Col>

            <Col xs={{ span: 24 }} sm={{ span: 8 }} xl={{ span: 7 }} xxl={{ span: 5 }}>
                <div className={style.styleOverview}>
                    <div>
                        <SHOPPING className={clsx(style.styleIcon, style.shoppingItem)} />
                    </div>
                    <div>
                        <Text className={style.overviewTitle}>Tổng đơn hàng</Text>
                        <Title level={5}>{formatMoney(_.get(data, 'order_count.aggregate.count', 0))}</Title>
                    </div>
                </div>
            </Col>

            <Col xs={{ span: 24 }} sm={{ span: 8 }} xl={{ span: 7 }} xxl={{ span: 5 }}>
                <div className={style.styleOverview}>
                    <div>
                        <HANDBAG className={clsx(style.styleIcon, style.handbagItem)} />
                    </div>
                    <div>
                        <Text className={style.overviewTitle}>Tổng sản phẩm</Text>
                        <Title level={5}>{formatMoney(_.get(data, 'product_count.aggregate.count', 0))}</Title>
                    </div>
                </div>
            </Col>
        </Row>
    )
}

Overview.propTypes = {
    timeFilter: PropTypes.object,
};

export default Overview;
