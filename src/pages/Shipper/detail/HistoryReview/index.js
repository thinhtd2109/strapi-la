import React, { useState } from 'react'
import { Row, Typography, Col, Table, Button, Tag, Space } from 'antd'
import style from './style.module.scss';
import "./styles.scss";
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';
import _ from 'lodash';

import moment from 'moment';
import PaginationComponent from '../../../../components/PaginationComponent';
import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_SHIPPER } from '../../../../graphql/schemas/shipper/query';
import { useGetListHistoryReview, useGetListHistoryReviewExport } from '../../../../graphql/schemas/hook';
import FilterDropdown from '../OrderHistory/FilterShipperStatusDropdown';
import { exportExcelOrderReviewHistory } from '../../../../helpers';

const { Title } = Typography;

const HistoryReview = ({ shipper, to_date, from_date, id, statusHistoryList }) => {

    const [loadingExportProcess, setLoadingExportProcess] = useState(false);

    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [skip, setSkip] = useState(0);
    const [rowSelection, setRowSelection] = useState([]);
    const [filterStatus, setFilterStatus] = useState([])

    const { data, loading, total } = useGetListHistoryReview({ skip, take: pageSize, date_to: to_date, date_from: from_date, shipper, status_code: filterStatus })

    const { data: exportData, loading: loadingExport } = useGetListHistoryReviewExport({ shipper });

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
            key: "code",
            title: "Mã đơn hàng",
            align: "center",
            width: 250,
            ellipsis: true,
            render: (record) => {
                return record?.order_code || "-"
            }
        },
        {
            title: "Trạng thái đơn hàng",
            ellipsis: true,
            key: "code",
            width: 250,
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
            key: "active",
            title: "Thời gian đặt",
            width: 200,
            ellipsis: true,
            render: (record) => {
                return _.get(record, "created") ? moment(_.get(record, "created")).format('DD/MM/YYYY HH:mm') : "-";
            },
        },
        {
            title: "Thời gian giao",
            ellipsis: true,
            align: "center",
            width: 250,
            render: (text, record) => {
                return _.get(record, 'delivery_time') ? moment(_.get(record, 'delivery_time')).format('DD/MM/YYYY HH:mm') : "-";
            },
        },
        {
            title: "Mã khách hàng",
            ellipsis: true,
            key: "customer_code",
            align: "center",
            width: 250,
            render: (text, record) => {
                return record?.customer_code || "-"
            },
        },
        {
            title: "Nội dung đánh giá",
            align: 'center',
            key: "review",
            ellipsis: true,
            width: 250,
            render: (text, record) => {
                return record?.review || "-"

            },
        },
        {
            title: "Số sao đánh giá",
            key: "star",
            align: 'center',
            ellipsis: true,
            width: 200,
            render: (text, record) => {
                return record?.star || "-"
            },
        },
        {
            title: "Ghi chú từ khách hàng",
            ellipsis: true,
            key: "note",
            align: 'center',
            width: 300,
            render: (text, record) => {
                return record?.note || "-"
            },
        }
    ];



    const onSelectChange = (selectedRowKeys, selectedRows) => {
        setRowSelection(selectedRowKeys);
    };

    const exportHandle = () => {
        setLoadingExportProcess(true);
        exportExcelOrderReviewHistory(exportData).then(() => setLoadingExportProcess(false))
    }

    return (
        <Row gutter={36} className={style.statisticalPage} style={{ padding: 24 }}>
            <Col className={style.outOfArea} span={24}>
                <Row justify='space-between'>
                    <Title level={3}>Lịch sử đánh giá </Title>
                    <Space>
                        <FilterDropdown data={filterStatus} setData={setFilterStatus} dataList={statusHistoryList} />
                        <Button loading={loadingExport || loadingExportProcess} onClick={exportHandle} className={style.print}>Xuất file</Button>
                    </Space>

                </Row>

                <div style={{ marginTop: '24px' }}>
                    <Row>
                        <Table
                            // rowSelection={{
                            //     selectedRowKeys: rowSelection,
                            //     onChange: onSelectChange,
                            //     preserveSelectedRowKeys: true,
                            // }}
                            dataSource={data}
                            rowKey="id"
                            columns={columns}
                            pagination={false}
                            loading={loading}
                            scroll={{ y: 800 }}
                        />
                    </Row>

                    <PaginationComponent
                        total={total ?? 0}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        setPageSize={setPageSize}
                        pageSizeOptions={[10, 20, 40, 80, 120]}
                        setPageIndex={(index) => {
                            setPageIndex(index);
                            setSkip(index * pageSize - pageSize);
                        }}
                        pagename="HISTORY_REVIEW"
                    />
                </div>

            </Col>
        </Row>
    )
}

export default HistoryReview;