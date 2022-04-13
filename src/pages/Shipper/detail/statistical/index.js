import React, { useState } from 'react'
import { Row, Typography, Col, Table } from 'antd';
import style from './style.module.scss';
import clsx from 'clsx';
import { useGetShipperOutOfArea, useGetShipperStatistical } from '../../hooks';
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';

import _ from 'lodash';

import moment from 'moment';
import PaginationComponent from '../../../../components/PaginationComponent';

const { Title, Text } = Typography;

const columns = [
    {
        key: "day",
        title: "Ngày",
        align: 'center',
        render: (record) => _.get(record, "created") ? moment(_.get(record, "created")).format("DD/MM/YYYY") : "-"
    },
    {
        key: "time",
        title: "Thời gian",
        align: 'center',
        render: (record) => moment(_.get(record, "created")).format('HH:mm') ?? "-"
    },
    {
        key: "place",
        title: "Vị trí",
        align: 'center',
        render: (record) => (record.latitude && record.longitude) && <a target="_blank" href={`https://www.google.com/maps/search/${record.latitude},+${record.longitude}`}>https://www.google.com/maps/search/{record.latitude},+{record.longitude}</a>
    },
]

const Statistical = ({ shipper, to_date, from_date }) => {

    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [skip, setSkip] = useState(0);

    const { data } = useGetShipperStatistical({ id: shipper, to_date, from_date });
    const { data: outOfAreaList, total, loading } = useGetShipperOutOfArea({ id: shipper, to_date, from_date, skip, take: pageSize })

    return (
        <Row gutter={36} className={style.statisticalPage} style={{ padding: 24 }}>
            <Col span={12}>
                <Title className={style.title}>Tổng đơn hàng: {_.get(data, 'total_shipment.aggregate.count', 0)}</Title>
                <div className={style.result}>
                    <Row>
                        <Col span={9}>
                            <Text className={style.leftText}>Thành công: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_shipment_complete.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                    <Row className={clsx(style.rowContainer)}>
                        <Col span={9}>
                            <Text className={style.leftText}>Huỷ: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_shipment_cancel.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                    <Row className={clsx(style.rowContainer)}>
                        <Col span={9}>
                            <Text className={style.leftText}>Trễ đơn: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_delay_delivery.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                </div>
            </Col>
            <Col span={12}>
                <Title className={style.title}>Vi phạm: {_.get(data, 'total_delay_gg_est.aggregate.count', 0) + _.get(data, 'total_delay_delivery.aggregate.count', 0) + _.get(data, 'total_out_of_area.aggregate.count', 0)}</Title>
                <div className={style.result}>
                    <Row>
                        <Col span={9}>
                            <Text className={style.leftText}>Trễ đơn: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_delay_delivery.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                    <Row className={clsx(style.rowContainer)}>
                        <Col span={9}>
                            <Text className={style.leftText}>Chậm đơn: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_delay_gg_est.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                    <Row className={clsx(style.rowContainer)}>
                        <Col span={9}>
                            <Text className={style.leftText}>Ra khỏi khu vực: </Text>
                        </Col>
                        <Col span={12}>
                            <Text className={style.rightText}>{_.get(data, 'total_out_of_area.aggregate.count', 0)} </Text>
                        </Col>
                    </Row>
                </div>
            </Col>
            <Col className={style.outOfArea} span={24}>
                <Row>
                    <Text className={style.titleOutOfArea}>Danh sách ra khỏi khu vực: </Text>
                </Row>
                <Row>
                    <Row>
                        <div style={{ width: '100%', marginTop: '24px' }}>
                            <Table
                                style={{ width: '100%', border: '1px solid lightgray' }}
                                dataSource={outOfAreaList}
                                rowKey="id"
                                columns={columns}
                                pagination={false}
                                scroll={{ x: 1000 }}
                                loading={loading}
                            />
                            <PaginationComponent
                                total={total}
                                pageSize={pageSize}
                                pageIndex={pageIndex}
                                pageSizeOptions={[10, 20, 40, 80, 120]}
                                setPageSize={setPageSize}
                                setPageIndex={(index) => {
                                    setPageIndex(index);
                                    setSkip(index * pageSize - pageSize);
                                }}
                                pagename="attendance"
                            />
                        </div>
                    </Row>

                </Row>
            </Col>
        </Row>
    )
}

export default Statistical