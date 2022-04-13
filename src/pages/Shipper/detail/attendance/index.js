import { Row, Table, Typography, Col, Radio } from 'antd'
import _ from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { PAGE_INDEX, PAGE_SIZE } from '../../../../constant/info';
import { useGetListAttendance, useGetShipperStatusRecord } from '../../hooks';
import PaginationComponent from '../../../../components/PaginationComponent';

const { Title } = Typography;

const Attendance = ({ shipper, to_date, from_date }) => {

    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    const [pageSize2, setPageSize2] = useState(PAGE_SIZE);
    const [pageIndex2, setPageIndex2] = useState(PAGE_INDEX);

    const columns = [
        {
            key: "STT",
            title: "STT",
            ellipsis: true,
            width: 30,
            render: (text, record, index) => {
                return ((pageIndex - 1) * pageSize + index + 1) < 10 ? `0${((pageIndex - 1) * pageSize + index + 1)}` : ((pageIndex - 1) * pageSize + index + 1)
            }
        },
        {
            key: "day",
            title: "Ngày",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => _.get(record, "check_in") ? moment(_.get(record, "check_in")).format("DD/MM/YYYY") : "-"
        },
        {
            key: "time_in",
            title: "Thời gian vào",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => _.get(record, "check_in") ? moment(_.get(record, "check_in")).format('HH:mm') : "-"
        },
        {
            key: "time_out",
            title: "Thời gian ra",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => _.get(record, "check_out") ? moment(_.get(record, "check_out")).format("HH:mm") : "-"
        },
    ];


    const columnsStopTable = [
        {
            key: "STT",
            title: "STT",
            ellipsis: true,
            width: 30,
            render: (text, record, index) => {
                return ((pageIndex2 - 1) * pageSize2 + index + 1) < 10 ? `0${((pageIndex2 - 1) * pageSize2 + index + 1)}` : ((pageIndex2 - 1) * pageSize2 + index + 1)
            }
        },
        {
            key: "date",
            title: "Ngày",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => <div>{record?.date}</div>
        },
        {
            key: "start_time",
            title: "Thời gian mở",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => <div>{record?.start_time}</div>
        },
        {
            key: "end_time",
            title: "Thời gian đóng",
            ellipsis: true,
            width: 70,
            align: 'center',
            render: (record) => <div>{record?.end_time}</div>
        },
        // {
        //     key: "active",
        //     title: "Trạng thái",
        //     align: 'center',
        //     width: 200,
        //     ellipsis: true,
        //     render: (record) => {
        //         let className;
        //         if (record?.shipper_status?.code === "READY") {
        //             className = "radio-active";
        //         }

        //         if (record?.shipper_status?.code === "STOP") {
        //             className = "radio-unactive";
        //         }
        //         return (
        //             <>
        //                 <div
        //                 >
        //                     <Radio
        //                         checked={true}
        //                         className={className}
        //                     />
        //                 </div>
        //             </>
        //         )
        //     }
        // },

    ]
    const [skip, setSkip] = useState(0);
    const [skip2, setSkip2] = useState(0);

    const { data, count, loading } = useGetListAttendance({ shipper, to_date, from_date, skip, take: pageSize });
    const { data: dataShipperStatus, count: countShipperStatus, loading: loadingShipperStatus } = useGetShipperStatusRecord({ shipper, to_date, from_date, skip: skip2, take: pageSize2 });
    return (
        <Row style={{ paddingLeft: 40 }}>
            <Col span={24}><Title level={3}>Lịch sử điểm danh</Title></Col>
            <Col span={20}>
                <Table
                    style={{ width: '60%', border: '1px solid lightgray' }}
                    dataSource={data}
                    rowKey="id"
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 500 }}
                    loading={loading}
                />
                <div style={{ width: '60%' }}>
                    <PaginationComponent
                        total={count ?? 0}
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
            </Col>
            <Col span={24}><Title level={3}>Lịch sử tạm nghỉ</Title></Col>
            <Col span={20}>
                <Table
                    style={{ width: '60%', border: '1px solid lightgray' }}
                    dataSource={dataShipperStatus}
                    rowKey="id"
                    columns={columnsStopTable}
                    pagination={false}
                    scroll={{ x: 500 }}
                    loading={loadingShipperStatus}
                />
                <div style={{ width: '60%' }}>
                    <PaginationComponent
                        total={countShipperStatus}
                        pageSize={pageSize2}
                        pageIndex={pageIndex2}
                        pageSizeOptions={[10, 20, 40, 80, 120]}
                        setPageSize={setPageSize2}
                        setPageIndex={(index) => {
                            setPageIndex2(index);
                            setSkip2(index * pageSize2 - pageSize2);
                        }}
                        pagename="stop_table"
                    />
                </div>

            </Col>
        </Row>
    )
}

export default Attendance