import {
    Row,
    Typography,
    Table,
    Col,
    Button,
    DatePicker,
    Select,
    Radio,
    Tooltip,
} from "antd";
import _ from "lodash";
import moment from "moment";

import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../../../components/PaginationComponent";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { useGetListReportShipper, useGetListShipperAll } from "../hooks";
import style from "../style.module.scss";
import { PAGE_INDEX, PAGE_SIZE } from "../../../constant/info";
import { useGetListStatusShipper } from "../../../graphql/schemas/hook";
import { exportExcelReportShipper } from "../../../helpers";
// import data from './data.json';

const { Title } = Typography;

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportShipper = () => {

    const [pageIndex2, setPageIndex2] = useState(PAGE_INDEX);
    const [pageSize2, setPageSize2] = useState(PAGE_SIZE);
    const [loadingExport, setLoadingExport] = useState(false);
    const [skip, setSkip] = useState(0);

    const [shipperStatus, setShipperStatus] = useState();

    const [filteredDate, setFilteredDate] = useState([
        moment().startOf('day'),
        moment().endOf('day'),
    ]);

    const { data: statusList } = useGetListStatusShipper();

    const { data, loading, total } = useGetListReportShipper({ from_date: moment(_.isArray(filteredDate) && filteredDate[0]), to_date: moment(_.isArray(filteredDate) && filteredDate[1]), take: pageSize2, skip, shipper_status: shipperStatus })

    const { data: dataListAll } = useGetListShipperAll();


    const exportExcel = () => {
        setLoadingExport(true);

        exportExcelReportShipper(dataListAll)
        setLoadingExport(false)
    }

    const columns = [
        {
            title: "STT",
            ellipsis: true,
            width: 100,
            render: (text, record, index) => {
                return ((pageIndex2 - 1) * pageSize2 + index + 1) < 10 ? `0${((pageIndex2 - 1) * pageSize2 + index + 1)}` : ((pageIndex2 - 1) * pageSize2 + index + 1)
            },
        },
        {
            title: "Hoạt động",
            align: "center",
            ellipsis: true,
            width: 250,
            render: (record) => {
                let className;
                if (record?.shipper?.shipper_status?.code === "READY") {
                    className = "radio-active";
                }

                if (record?.shipper?.shipper_status?.code === "BLOCKED") {
                    className = "radio-unactive";
                }

                if (record?.shipper?.shipper_status?.code === "STOP") {
                    className = "radio-stopactive";
                }
                return (
                    <>
                        <div
                            style={{ width: "100%", cursor: "pointer" }}
                        >
                            <Radio
                                checked={true}
                                className={className}
                            />
                        </div>
                    </>
                )
            }
        },
        {
            title: "Mã shipper",
            ellipsis: true,
            width: 250,
            render: (record) => record?.shipper?.code || "-",
        },
        {
            title: "Tên shipper",
            ellipsis: true,
            width: 250,
            render: (record) => record?.shipper?.full_name || "-",
        },
        {
            title: "Biển số xe",
            ellipsis: true,
            width: 250,
            render: (record) => record?.shipper?.license_plate || "-"
        },
        {
            title: "Số điện thoại",
            ellipsis: true,
            width: 250,
            render: (record) => record?.shipper?.phone || "-",
        },
        {
            title: "Thời gian làm việc",
            align: "center",
            width: 250,
            ellipsis: true,
            render: (record) => {
                let from = _.split(_.get(record, "shipper.shipper_work_shifts[0].shift_time_from"), ":");
                let to = _.split(_.get(record, "shipper.shipper_work_shifts[0].shift_time_to"), ":");

                return `${from[0]}:${from[1]} - ${to[0]}:${to[1]}`
            },
        },

        {
            title: "Ngày",
            width: 250,
            align: "center",
            ellipsis: true,
            render: (record) => moment(record.created).format('DD/MM/YYYY') || "-",
        },
        {
            title: "Chấm công giờ vào",
            align: "center",
            width: 250,
            ellipsis: true,
            render: (record) => moment(record.check_in).format('HH:mm') || "-",
        },
        {
            title: "Chấm công giờ ra",

            width: 250,
            align: "center",
            ellipsis: true,
            render: (record) => record.check_out ? moment(record.check_out).format('HH:mm') : "-"

        },
        {
            title: "Đánh giá",
            align: 'center',
            width: 250,
            ellipsis: true,
            render: (text, record) => {
                return _.get(record, 'shipper.rating_reviews_aggregate.aggregate.avg.star')
            },
        },
        {
            title: "Kho hàng lưu động",
            ellipsis: true,
            width: 250,
            render: (text, record) => {
                let listBooth = _.map(_.get(record, "shipper.booth_shippers"), (item) =>
                    <Link to={`/booths/detail/${item.boothByBooth.id}`}>{_.get(item, "boothByBooth.code")}</Link>
                )
                listBooth = listBooth.length > 0 && listBooth.reduce((prev, curr) => [prev, ', ', curr])
                return (
                    <Tooltip title={listBooth}>
                        <div
                            className={style.booth_incharse}
                        >
                            {listBooth || "-"}
                        </div>
                    </Tooltip>

                );

            },
        },
    ];

    return (
        <Fragment>
            <Title level={3}>Báo cáo chấm công shipper</Title>
            <Wrapper>
                <Row justify="space-between">
                    <Col span={3}>
                        <Select allowClear onChange={(v) => setShipperStatus(v)} value={shipperStatus} size="large" style={{ width: '100%' }} className="customSelect" placeholder="Chọn hoạt động">
                            {
                                _.map(statusList, item => {
                                    return <Option key={item.id} value={item.id}>{item.name}</Option>

                                })
                            }
                        </Select>
                    </Col>
                    <Col span={6}>
                        <RangePicker
                            format="DD/MM/YYYY HH:mm"
                            onChange={(v) => setFilteredDate(v)}
                            value={filteredDate}
                            size="large"
                            style={{ borderRadius: 6 }}
                            showTime
                        />
                    </Col>
                    <Col span={12}></Col>
                    <Col span={2}>
                        <Button
                            loading={loadingExport}
                            onClick={exportExcel}
                            className={style.print}
                        >
                            Xuất file
                        </Button>
                    </Col>
                </Row>
                <Table
                    dataSource={data}
                    rowKey="id"
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    scroll={{ x: 1500 }}
                />
                <PaginationComponent
                    total={total ?? 0}
                    pageSize={pageSize2}
                    pageIndex={pageIndex2}
                    pageSizeOptions={[10, 20, 40, 80, 120]}
                    setPageSize={setPageSize2}
                    setPageIndex={(index) => {
                        setPageIndex2(index);
                        setSkip(index * pageSize2 - pageSize2);
                    }}
                    pagename="REPORT_SHIPPER"
                />
            </Wrapper>
        </Fragment>
    );
};

export default ReportShipper;
