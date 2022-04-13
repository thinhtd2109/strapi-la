import React, { useState } from 'react'
import { Row, Typography, Col, Table, Spin } from 'antd'
import style from './style.module.scss';
import clsx from 'clsx';
import { useGetShipperOutOfArea, useGetShipperStatistical } from '../../hooks';
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';

import _ from 'lodash';

import moment from 'moment';
import PaginationComponent from '../../../../components/PaginationComponent';
import { LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;



const OutOfArea = ({ shipper, to_date, from_date }) => {

    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [skip, setSkip] = useState(0);

    const columns = [
        {
            key: "id",
            title: "STT",
            width: 70,
            ellipsis: true,
            render: (text, record, index) => {
                return (
                    <span className="item-center">
                        {(pageIndex - 1) * pageSize + index + 1}
                    </span>
                );
            },
        },
        {
            key: "day",
            title: "Ngày",
            width: 200,
            ellipsis: true,
            align: 'center',
            render: (record) => _.get(record, "created") ? moment(_.get(record, "created")).format("DD/MM/YYYY") : "-"
        },
        {
            key: "time",
            title: "Thời gian",
            width: 200,
            ellipsis: true,
            align: 'center',
            render: (record) => moment(_.get(record, "created")).format('HH:mm') ?? "-"
        },
        {
            key: "place",
            title: "Vị trí",
            ellipsis: true,
            render: (record) => (record.latitude && record.longitude) ? <a target={"_blank"} href={`https://www.google.com/maps/search/${record.latitude},+${record.longitude}`}>{`https://www.google.com/maps/search/${record.latitude},+${record.longitude}`}</a> : "-"
        },
    ];

    const { data: outOfAreaList, total, loading } = useGetShipperOutOfArea({ id: shipper, to_date, from_date, skip, take: pageSize });

    return (
        <Row gutter={36} className={style.statisticalPage} style={{ padding: 24 }}>
            <Col className={style.outOfArea} span={24}>
                <Row>
                    <Title level={3}>Danh sách ra khỏi khu vực </Title>
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
                                scroll={{ x: 1300 }}
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

export default OutOfArea;