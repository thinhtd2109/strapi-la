import React, { useState } from 'react'
import { Row, Typography, Col, Table, Tag, Radio, Space, Button, Tooltip } from 'antd'
import style from './style.module.scss';
import "./styles.scss";
import clsx from 'clsx';
import { useGetListOrderHistory, useGetListOrderHistoryExport, useGetShipperStatistical, useGetListStatusHistory } from '../../hooks';
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';
import _ from 'lodash';

import moment from 'moment';
import PaginationComponent from '../../../../components/PaginationComponent';

import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_SHIPPER } from '../../../../graphql/schemas/shipper/query';
import FilterDropdown from './FilterShipperStatusDropdown';
import { exportExcelOrderHistory } from '../../../../helpers';

const { Title, Text } = Typography;

const OrderHistory = ({ shipper, to_date, from_date, id, statusHistoryList }) => {
    const [filterByStatus, setFilterByStatus] = useState([]);
    const [orderList, setOrderList] = useState([]);



    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [skip, setSkip] = useState(0);
    const [filterStatus, setFilterStatus] = useState([]);

    const conditionTime = (date, isStart) => {
        if (_.isEmpty(date) && !_.isDate(date)) {
            return undefined;
        }
        if (isStart) {
            return moment(date).startOf("day");
        }

        return moment(date);
    };

    let filteredTime =
        from_date || to_date
            ? [
                { created: { _gte: conditionTime(from_date, true) } },
                { created: { _lte: conditionTime(to_date, false) } },
            ]
            : undefined;


    const { data: orderHistoryList, loading: loadingOrderHistory, total } = useGetListOrderHistory({ skip, take: pageSize, from_date, to_date, shipper, shipperWarningStatus: filterStatus });

    const { data: exportData } = useGetListOrderHistoryExport({ shipper });

    const { data, loading } = useGetShipperStatistical({ id: shipper, to_date, from_date });

    //Columns
    let columns = [
        {
            title: "STT",
            width: 70,
            ellipsis: true,
            align: "center",
            key: "id",
            render: (text, record, index) => {
                return ((pageIndex - 1) * pageSize + index + 1) < 10 ? `0${((pageIndex - 1) * pageSize + index + 1)}` : ((pageIndex - 1) * pageSize + index + 1)
            },
        },
        {
            title: "M?? ????n h??ng",
            ellipsis: true,
            key: "code",
            width: 200,
            render: (text, record) => {
                return (
                    <Link
                        to={`/order/detail/${_.get(record, "orderByOrder.id", "-")}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {_.get(record, "orderByOrder.code", "-") || "-"}
                    </Link>
                );
            },
        },
        {
            key: "active",
            title: "Tr???ng th??i",
            width: 300,
            ellipsis: true,
            render: (record) => {
                let color;
                let backgroundColor;
                if (_.get(record, "shipperWarningStatus.code") === "DELAY_DELIVERY") {
                    backgroundColor = "#FFD9D9";
                    color = "#FA3434";
                }

                if (_.get(record, "shipperWarningStatus.code") === "COMPLETE") {
                    backgroundColor = "#D0FFD6";
                    color = "#00B517";
                }
                if (_.get(record, "shipperWarningStatus.code") === "CANCELLED") {
                    backgroundColor = "#FFD9D9";
                    color = "#FA3434";
                }
                if (_.get(record, "shipperWarningStatus.code") === "DELAY_GG_EST") {
                    backgroundColor = "#FFE7C5";
                    color = "#FCB040";
                }

                return <Tag style={{ color, backgroundColor, borderRadius: 12, border: 'none', width: '95%', textAlign: 'center' }}>{_.get(record, "shipperWarningStatus.name")}</Tag>
            },
        },
        {
            title: "Ng??y ?????t h??ng",
            ellipsis: true,
            key: "created",
            align: "center",
            width: 250,
            render: (text, record) => {
                return <p>{moment(record?.orderByOrder?.created).format("DD/MM/YYYY hh:mm A")}</p>;
            },
        },
        {
            title: "Ng??y ho??n th??nh",
            ellipsis: true,
            key: "order_status_record",
            align: "center",
            width: 250,
            render: (text, record) => {
                return <p>{moment(record?.orderByOrder.order_status_record?.created).format("DD/MM/YYYY hh:mm A")}</p>;
            },
        },
        {
            title: "?????a ch??? giao h??ng",
            key: "address",
            align: "center",
            ellipsis: true,
            width: 350,
            render: (text, record) => {
                const title = _.join(
                    _.pull(
                        [
                            _.get(record, "orderByOrder.addressByAddress.street.name", ""),
                            _.get(record, "orderByOrder.addressByAddress.ward.name", ""),
                            _.get(record, "orderByOrder.addressByAddress.district.name", ""),
                            _.get(record, "orderByOrder.addressByAddress.province.name", ""),
                        ],
                        "",
                        null
                    ),
                    ", "
                )
                return (
                    <Tooltip title={title}>
                        <div className={style.booth_incharse}>
                            {title}
                            {/* <a target="_blank" href={`https://www.google.com/maps/search/${record?.orderByOrder?.addressByAddress?.latitude},+${record?.orderByOrder?.addressByAddress?.longitude}`}>{`https://www.google.com/maps/search/${record?.shimentByShipment?.shipment_status_record.latitude},+${record?.shimentByShipment?.shipment_status_record.longitude}`}</a> */}
                        </div>
                    </Tooltip>
                )

            },
        },
        {
            title: "V??? tr?? ho??n th??nh",
            key: "share_code",
            ellipsis: true,
            width: 350,
            render: (text, record) => {
                return <div className={style.booth_incharse}>
                    {
                        (record?.shimentByShipment?.shipment_status_record?.latitude || record?.shimentByShipment?.shipment_status_record?.longitude) ? (
                            <a target="_blank" href={`https://www.google.com/maps/search/${record?.shimentByShipment?.shipment_status_record?.latitude},+${record?.shimentByShipment?.shipment_status_record?.longitude}`}>{`https://www.google.com/maps/search/${record?.shimentByShipment?.shipment_status_record.latitude},+${record?.shimentByShipment?.shipment_status_record.longitude}`}</a>
                        ) : "-"
                    }

                </div>

            },
        },
        {
            title: "S??? l???n x??? l??",
            dataIndex: "address",
            ellipsis: true,
            key: "name",
            align: "center",
            width: 200,
            render: (text, record) => {
                return _.get(record, 'total_call_warning', 0)
            },
        },
        {
            title: "Lo???i ????n",
            ellipsis: true,
            align: "center",

            key: "order_type",
            width: 180,
            render: (text, record) => {
                return <div>{_.get(record, "orderByOrder.order_type.name")}</div>
            },
        },
    ];

    return (
        <Row gutter={36} className={style.statisticalPage} style={{ padding: 24 }}>
            <Col span={24}>
                <Title level={3}>T???ng ????n h??ng: {_.get(data, 'total_shipment_complete.aggregate.count', 0) + _.get(data, 'total_shipment_cancel.aggregate.count', 0)}</Title>
                <Row style={{ padding: 24 }}>
                    <Col span={5}>
                        <Row>
                            <Col span={12}>
                                <Text className={style.leftText}>Th??nh c??ng: </Text>
                            </Col>
                            <Col span={12}>
                                <Text className={style.rightText}>{_.get(data, 'total_shipment_complete.aggregate.count', 0)} </Text>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 12 }}>
                            <Text style={{ color: '#B9B9B9' }}>????ng gi??? + Tr??? ????n + Ch???m ????n</Text>
                        </Row>
                    </Col>
                    <Col span={5}>
                        <Row>
                            <Col span={12}>
                                <Text className={style.leftText}>Hu???: </Text>
                            </Col>
                            <Col span={12}>
                                <Text className={style.rightText}>{_.get(data, 'total_shipment_cancel.aggregate.count', 0)} </Text>
                            </Col>
                        </Row>
                    </Col>
                    {/* <Col span={5}>
                        <Row>
                            <Col span={12}>
                                <Text className={style.leftText}>Tr??? ????n: </Text>
                            </Col>
                            <Col span={12}>
                                <Text className={style.rightText}>{_.get(data, 'total_delay_delivery.aggregate.count', 0)} </Text>
                            </Col>
                        </Row>
                    </Col> */}
                </Row>
                <Row className={clsx(style.rowContainer)}></Row>
            </Col>
            <Col span={24}>
                <Title level={3}>????n vi ph???m: {_.get(data, 'total_delay_gg_est.aggregate.count', 0) + _.get(data, 'total_delay_delivery.aggregate.count', 0) + _.get(data, 'total_shipment_reject.aggregate.count', 0)}</Title>
                <Row style={{ padding: 24 }}>
                    <Col span={2}>
                        <Text className={style.leftText}>Tr??? ????n: </Text>
                    </Col>
                    <Col span={3}>
                        <Text className={style.rightText}>{_.get(data, 'total_delay_delivery.aggregate.count', 0)} </Text>
                    </Col>
                    <Col span={2}>
                        <Text className={style.leftText}>Ch???m ????n: </Text>
                    </Col>
                    <Col span={3}>
                        <Text className={style.rightText}>{_.get(data, 'total_delay_gg_est.aggregate.count', 0)} </Text>
                    </Col>
                    <Col span={3}>
                        <Text className={style.leftText}>T??? ch???i ????n: </Text>
                    </Col>
                    <Col span={3}>
                        <Text className={style.rightText}>{_.get(data, 'total_shipment_reject.aggregate.count', 0)} </Text>
                    </Col>
                </Row>
            </Col>

            <Col className={style.outOfArea} span={24}>
                <Row justify='space-between'>
                    <Title level={3}>Danh s??ch l???ch s??? ????n h??ng </Title>
                    <Row>
                        <Space>
                            <FilterDropdown data={filterStatus} setData={setFilterStatus} dataList={statusHistoryList} />
                            <Button onClick={() => exportExcelOrderHistory(exportData)} className={style.print}>Xu???t file</Button>
                        </Space>
                    </Row>
                </Row>

                <div style={{ marginTop: '24px' }}>
                    <Row>
                        <Table
                            // rowSelection={{
                            //     selectedRowKeys: rowSelection,
                            //     onChange: onSelectChange,
                            //     preserveSelectedRowKeys: true,
                            // }}
                            dataSource={orderHistoryList ?? []}
                            rowKey="id"
                            columns={columns}
                            pagination={false}
                            loading={loadingOrderHistory}
                            scroll={{ y: 800 }}
                        />
                    </Row>

                    <PaginationComponent
                        total={total}
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
                </div>

            </Col>
        </Row>
    )
}

export default OrderHistory;