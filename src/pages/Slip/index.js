import {
    Row,
    Space,
    Table,
    Tag,
    Typography,
    Button,
    Col
} from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import PaginationComponent from "../../components/PaginationComponent";
import Wrapper from "../../components/Wrapper/Wrapper";
import styles from "./styles.module.scss";
import { PAGE_INDEX, PAGE_SIZE } from '../../constant/info';
import { useGetListBoothOrder } from "./hooks";
import { exportBoothOrder } from '../../helpers/index';
import { PlusOutlined } from '@ant-design/icons';

import clsx from "clsx";
import SearchContent from '../../components/SearchContent';
import Filter from "./details/components/Filter";
import moment from "moment";
import { useHistory } from "react-router-dom";
import slugs from "../../constant/slugs";

const { Title } = Typography;

const SlipList = () => {
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);
    const [searchContent, setSearchContent] = useState("");
    const [filterParams, setFilterParams] = useState({
        type: [],
        dateTime: [moment().startOf('day'), moment().endOf('day')],
        status: []
    });

    const history = useHistory();

    const { data: boothOrderList, loading: loadingList, total } = useGetListBoothOrder({ searchContent, filterParams, pageSize, skip });
    const { data: boothOrderListExport } = useGetListBoothOrder({ searchContent, filterParams, pageSize: 1e9, skip: 0 });

    const columns = [
        {
            key: "STT", title: "STT",
            ellipsis: true,
            width: 150,
            align: "center",
            render: (text, record, index) => {
                return <div><span className='item-center'>{((pageIndex - 1) * pageSize + index + 1) < 10 ? `0${(pageIndex - 1) * pageSize + index + 1}` : (pageIndex - 1) * pageSize + index + 1}</span></div>;
            },
        },
        {
            key: "status", title: "Trạng thái",
            ellipsis: true,
            width: 200,
            align: "center",
            render: (record, index) => {
                let backgroundColor;
                let color;
                let text = "-"
                if (_.get(record, 'booth_order_status.code') === "INITIAL") {
                    backgroundColor = "#FFE7C5";
                    color = "#FCB040";
                    text = "Yêu cầu";
                }

                if (_.get(record, 'booth_order_status.code') === "DONE") {
                    backgroundColor = "#D0FFD6";
                    color = "#00B517";
                    text = "Hoàn thành"
                }

                if (_.get(record, 'booth_order_status.code') === "CANCEL") {
                    backgroundColor = "#FFD9D9";
                    color = "#EF4036";
                    text = "Hủy"
                }

                return <div><Tag style={{ backgroundColor, color, border: 'none', width: '95%' }}>{text}</Tag></div>
            },
        },
        {
            key: "time", title: "Thời gian",
            ellipsis: true,
            width: 200,
            align: "center",
            render: (record, index) => {
                return <div>{moment(_.get(record, 'order_time')).format('DD/MM/YYYY HH:mm')}</div>
            },
        },
        {
            key: "booth", title: "Mã số kho hàng lưu động - Biển số",
            ellipsis: true,
            width: 400,
            align: "center",
            render: (text, record, index) => {
                let showText = '-';

                if (_.get(record, "boothByBooth.code")) {
                    showText = _.get(record, "boothByBooth.code", "");
                }

                if (_.get(record, "boothByBooth.name")) {
                    showText = _.get(record, "boothByBooth.name");
                }
                if (_.get(record, "boothByBooth.code") && _.get(record, 'boothByBooth.name')) {
                    showText = `${_.get(record, "boothByBooth.code", "")} - ${_.get(record, 'boothByBooth.name', "")}`;
                }
                return (<div>
                    {showText}
                </div>)
            },
        },
        {
            key: "phone", title: "SĐT tài xế kho hàng lưu động",
            ellipsis: true,
            width: 350,
            align: "center",
            render: (text, record, index) => {
                return <div>{_.join(_.map(_.get(record, 'boothByBooth.booth_accounts'), item => _.replace(_.get(item, 'accountByAccount.phone'), '+84', '0')), ', ')}</div>
            },
        },
        {
            key: "type", title: "Loại",
            ellipsis: true,
            width: 150,
            align: "center",
            render: (text, record, index) => {
                return <div>{record?.type === "IN" ? "Nhập" : "Xuất"}</div>;
            },
        },
        {
            key: "code", title: "Mã phiếu",
            ellipsis: true,
            width: 200,
            align: "center",
            render: (text, record, index) => {
                return <div>{record.code}</div>
            },
        },
    ];

    const exportFile = () => {
        setLoadingExport(true);
        exportBoothOrder(boothOrderListExport).then(() => setLoadingExport(false));
    }

    const onChangeFilter = (type, value) => {
        if (type === "TYPE") {
            setFilterParams((prev) => ({ ...prev, type: value }));
        }

        if (type === "STATUS") {
            setFilterParams((prev) => ({ ...prev, status: value }));
        }
        if (type === "TIME") {
            setFilterParams((prev) => ({ ...prev, dateTime: value }));
        }
        // if (pageSize > total) {
        //     setPageSize(total);
        // }
        setSkip(0);
        setPageSize(PAGE_SIZE);
        setPageIndex(PAGE_INDEX);
    }

    return (
        <div className={styles.orderBoothContainer}>
            <Row justify="space-between">
                <Title level={3}>Phiếu nhập</Title>
                <div>
                    <Space>
                        <Button onClick={() => history.push(slugs.slipCreate)} className={clsx(styles.button, styles.createButton)} icon={<PlusOutlined />}>Tạo mới phiếu nhập </Button>
                    </Space>
                </div>
            </Row>
            <Wrapper>
                <Row justify="space-between" className="mb-3">
                    <Col span={12}>
                        <Row gutter={[6, 6]}>
                            <Col span={12}>
                                <SearchContent
                                    width={"100%"}
                                    searchContent={searchContent}
                                    setSearchContent={setSearchContent}
                                />
                            </Col>
                            <Col span={12}>
                                <Filter filterData={filterParams} onChange={onChangeFilter} />
                            </Col>
                        </Row>
                    </Col>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={exportFile} loading={loadingExport} className={clsx(styles.button, styles.exportButton)}>Xuất file</Button>
                    </Col>

                </Row>
                <Row className={styles.wrapperTable}>
                    <Table
                        dataSource={boothOrderList}
                        rowKey="id"
                        columns={columns}
                        pagination={false}
                        loading={loadingList || loading}
                        onRow={(record) => {
                            return {
                                style: {
                                    cursor: 'pointer'
                                },
                                onClick: (event) => {
                                    localStorage.setItem('boothId', record.boothByBooth.id);
                                    return history.push({
                                        pathname: `/slip/detail/${record?.code}`,
                                        state: { boothId: record.boothByBooth.id }
                                    });
                                }
                            }
                        }}
                    />
                </Row>

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
                    pagename='slip'
                />
            </Wrapper>
        </div>

    );
};

export default SlipList;
