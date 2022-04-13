import { Fragment, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, Table, Row, Input, Tag } from 'antd';
import Wrapper from '../../../components/Wrapper/Wrapper';
import style from '../style.module.scss';
import { useGetDetailOrderGroupEvent } from '../hooks';
import _ from 'lodash';
import moment from "moment";
import { formatMoney, getOrderStatusStyle } from '../../../helpers/index';
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from 'use-debounce';
import { PAGE_INDEX, PAGE_SIZE } from "../../../constant/info";
import PaginationComponent from '../../../components/PaginationComponent';

const OrderGroupEventDetail = () => {
    const { id } = useParams();
    const { Title } = Typography;
    const [searchText, setSearchText] = useState('');

    const [value] = useDebounce(searchText, 1000);


    const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    const [skip, setSkip] = useState(0)
    const { data: groupEventList, loading, total } = useGetDetailOrderGroupEvent({ id, searchText: _.trim(value), skip: skip, take: pageSize });

    const compareTime = (record) => {
        let now = moment(new Date(), "YYYY-MM-DD HH:mm").subtract(7, 'hours');
        let startTime = moment(_.get(record, 'start_time'), "YYYY-MM-DD HH:mm");
        let endTime = moment(_.get(record, 'end_time'), "YYYY-MM-DD HH:mm");
        if (now.isBefore(startTime)) {
            return <div className={style.waitingStatus}>Đang chờ</div>
        }

        if (now.isBetween(startTime, endTime)) {
            return <div className={style.runningStatus}>Đang chạy</div>
        }

        if (now.isAfter(endTime)) {
            return <div className={style.endStatus}>Kết thúc</div>
        }

    }

    const columns = [
        {
            title: "STT",
            align: 'center',
            render: (text, record, index) => {
                return <span className='item-center'>{(pageIndex - 1) * pageSize + index + 1}</span>;
            }
        },
        {
            title: "Trạng thái",
            align: 'center',
            render: (record) => {
                return (
                    <Tag
                        className='item-center'
                        color={getOrderStatusStyle(record?.order_group_status?.code)?.color}
                        style={{ color: getOrderStatusStyle(record?.order_group_status?.code)?.textColor }}
                        key={record?.order_group_status?.code}
                    >
                        {_.get(record, 'order_group_status.name')}
                    </Tag>
                )

            }
        },
        {
            title: "Mã mua chung",
            align: 'center',
            render: (record) => {
                return <Link to={`/order/detail/group/${_.get(record, 'id')}`}>{_.get(record, 'code', '-')}</Link>
            }
        },
        {
            title: "Thời gian tạo",
            align: 'center',
            render: (record) => {
                return moment(_.get(record, 'start_time')).format('DD/MM/YYYY HH:mm')
            }
        },
        {
            title: "Thời gian kết thúc",
            align: 'center',
            render: (record) => {
                return _.get(record, 'end_time') ? moment(_.get(record, 'end_time')).format('DD/MM/YYYY HH:mm') : '-'
            }
        },
        {
            title: 'Số đơn',
            align: 'center',
            render: (record) => {
                return _.get(record, 'current_total_order_number', '-') || "-"
            }
        },
        {
            title: 'Tổng giá trị',
            align: 'center',
            render: (record) => {
                return _.get(record, 'current_total_order_price', "-") > 0 ? formatMoney(Number(_.get(record, 'current_total_order_price'))) : "-"
            }
        },
        {
            title: 'Số người tham gia', align: 'center',
            render: (record) => {
                return _.get(record, 'current_total_participates') > 0 ? formatMoney(Number(_.get(record, 'current_total_participates', "-"))) : "-"
            }
        }
    ]

    return (
        <Fragment>
            <Title level={3}>Danh sách mua chung </Title>
            <Wrapper>
                <Row justify="end">
                    <Input prefix={<SearchOutlined className="site-form-item-icon" />} placeholder="Tìm kiếm" style={{ width: '26%', height: 38 }} value={searchText} onChange={(e) => { setSearchText(e.target.value); setSkip(0); setPageIndex(1) }} />
                </Row>

                <Row className={style.wrapperTable}>
                    <Table
                        dataSource={groupEventList}
                        rowKey="key"
                        columns={columns}
                        pagination={false}
                        loading={loading}
                        scroll={{ x: 1500 }}
                    />

                    <PaginationComponent
                        total={total || 0}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        pageSizeOptions={[10, 20, 40, 80, 120]}
                        setPageSize={setPageSize}
                        setPageIndex={(index) => {
                            setPageIndex(index);
                            setSkip(index * pageSize - pageSize)
                        }}
                        pagename='ORDER_GROUP_EVENT'
                    />
                </Row>
            </Wrapper>
        </Fragment>
    )
}

export default OrderGroupEventDetail;