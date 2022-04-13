import React, { Fragment, useEffect, useState } from 'react';
import {
    DownOutlined, UpOutlined,
} from '@ant-design/icons';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
    Button, Col, Row, Space, Spin, Tag, Typography, Menu, Dropdown, notification,
    Table, Switch, Avatar
} from 'antd';
import { useParams } from 'react-router';
import { Link, useHistory } from 'react-router-dom';
import { GET_ALL_ORDER_GROUP_STATUS, GET_ORDER_GROUP_DETAIL } from '../../../graphql/schemas/order/query';
import { getOrderStatusStyle } from '../../../helpers';
import './styles.scss';
import * as _ from "lodash";
import moment from 'moment';
import clsx from 'clsx';
import { UPDATE_GROUP_STATUS, UPDATE_STATUS } from '../../../graphql/schemas/order/mutation';

import Wrapper from '../../../components/Wrapper/Wrapper';
import OrderDetail from './OrderDetail';
import OrderDetailTemplate from './OrderDetailTemplate';

const { Title, Text } = Typography;

const columns = [
    {
        key: 'key', title: 'STT', dataIndex: "key",
        render: (text) => <span className='item-center'>{text + 1}</span>
    },
    {
        key: "avatar", title: "Avatar", dataIndex: "avatar", align: 'center',
        render: (text, record) => _.get(record, 'account.medium.url') ? <img src={process.env.REACT_APP_S3_GATEWAY + _.get(record, 'account.medium.url')} className='customer-avatar' alt={_.get(record, 'account.medium.name')} /> : <Avatar size="default" className="avatar">
            {_.toArray(_.get(record, "account.full_name"))[0]}
        </Avatar>
    },
    {
        title: 'Tên khách hàng', dataIndex: 'account', key: 'full_name',
        render: (text) => (
            <Link to={`/customer/detail/${_.get(text, "id")}`}>
                {_.get(text, 'full_name')}
            </Link>
        )
    },
    { title: 'Mã đơn hàng', dataIndex: 'code', key: 'code' },
    {
        title: 'Số điện thoại', dataIndex: 'account', key: 'phone',
        render: (text) => _.replace(_.get(text, 'phone'), '+84', '0')
    },
    {
        title: 'Địa chỉ giao hàng', dataIndex: 'address', key: 'address',
        render: (text) => (_.get(text, "number") + " " + _.get(text, "street.name", ''))
    },
    {
        title: 'Thời gian tạo', dataIndex: 'created', key: 'created',
        render: (text) => moment(text).format("DD/MM/YYYY HH:mm")
    },
    {
        title: 'Trạng thái', dataIndex: 'order_status', key: 'order_status',
        render: (text) => (
            <Tag
                className='item-center'
                color={getOrderStatusStyle(text?.code)?.color}
                style={{ color: getOrderStatusStyle(text?.code)?.textColor }}
                key={text?.code}
            >
                {text?.name}
            </Tag>
        )
    }
];

const ExpandableButton = (props) => {
    const { expanded, onExpand, record } = props;
    if (expanded)
        return <Button className="btn_history btn_detail1" onClick={e => onExpand(record, e)}>Thu gọn <UpOutlined /></Button>
    else
        return <Button className="btn_history btn_detail1" onClick={e => onExpand(record, e)}>Chi tiết <DownOutlined /></Button>
};

const GroupOrderDetail = () => {

    const { id } = useParams();
    const history = useHistory();
    const [statusObj, setStatusObj] = useState({});
    const { loading, data } = useQuery(GET_ORDER_GROUP_DETAIL,
        {
            variables: {
                where: {
                    id: { _eq: id },
                    deleted: { _eq: false },
                },
                order_where: {
                    order_status: {
                        code: { _neq: "INITIAL" }
                    }
                }
            }
        }
    )
    const { loading: loadingStatus, data: allStatus } = useQuery(GET_ALL_ORDER_GROUP_STATUS);

    const [updateStatus] = useMutation(UPDATE_GROUP_STATUS, {
        refetchQueries: [{
            query: GET_ORDER_GROUP_DETAIL, variables: {
                where: {
                    id: { _eq: id },
                    deleted: { _eq: false },
                },
                order_where: {
                    order_status: {
                        code: { _neq: "INITIAL" }
                    }
                }
            }
        }],
    })

    const DropdownOrderStatus = ({ loading, status, handleMenuClick }) => {
        if (loading) return <Spin tip="Đang tải dữ liệu..." />;
        let dataStatus = [{ id: null, name: "" }];

        switch (status) {
            case 'SUBMITTED':
                dataStatus = _.filter(_.get(allStatus, 'order_group_status'), function (obj) { return _.includes(['VERIFIED', 'CANCELLED'], obj?.code) });
                break;
            case 'VERIFIED':
                dataStatus = _.filter(_.get(allStatus, 'order_group_status'), function (obj) { return obj.code === 'CANCELLED' });
                break;
            default:
                break;
        }

        return (
            <Menu onSelect={handleMenuClick}>
                {
                    _.map(dataStatus, (item, index) => (
                        <Menu.Item
                            key={JSON.stringify({ id: item.id, name: item.name })}
                            defaultValue={item}
                        >
                            {_.get(item, 'name')}
                        </Menu.Item>
                    ))
                }
            </Menu>
        )
    };

    const handleMenuClick = (e) => {
        setStatusObj(JSON.parse(e.key));
    };

    const handleUpdateStatus = () => {
        try {
            updateStatus({
                variables: {
                    data: {
                        id: id,
                        status: statusObj.id
                    }
                }
            }).then(() => {
                setStatusObj({});
                notification['success']({
                    message: "Thành công",
                    description: "Chuyển đổi trạng thái mua chung thành công"
                })
            }).catch(error => {
                notification['error']({
                    message: "Thất bại",
                    description: _.get(error, 'errors[0].message', "Chuyển đổi trạng thái mua chung thất bại")
                })
            })
        } catch (error) {
            notification['error']({
                message: "Thất bại",
                description: _.get(error, 'errors[0].message', "Chuyển đổi trạng thái mua chung thất bại")
            })
        }
    };

    if (loading) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>

    return (
        <div className="order-detail-wrapper">
            <Row className="mb-2">
                <Col span={12}>
                    <div className="flex align-center">
                        <Space size={24}>
                            <Title level={3} className="order-code">Mã mua chung {_.get(data, 'order_group[0].code')}</Title>
                            {
                                _.includes(['INITIAL', 'DONE', 'CANCELLED', 'EXPIRED'], _.get(data, 'order_group[0].order_group_status.code')) ? (
                                    <Tag className="tag_status view_only"
                                        style={{
                                            background: getOrderStatusStyle(_.get(data, 'order_group[0].order_group_status.code')).color,
                                            color: getOrderStatusStyle(_.get(data, 'order_group[0].order_group_status.code')).textColor
                                        }}
                                        key={1}
                                    >
                                        <Space>{_.get(data, 'order_group[0].order_group_status.name')}</Space>
                                    </Tag>
                                )
                                    :
                                    (
                                        <Dropdown overlay={<DropdownOrderStatus loading={loadingStatus} status={_.get(data, 'order_group[0].order_group_status.code')} handleMenuClick={handleMenuClick} />} placement="bottomCenter" arrow>
                                            <Tag className="tag_status"
                                                style={{
                                                    background: getOrderStatusStyle(_.get(data, 'order_group[0].order_group_status.code')).color,
                                                    color: getOrderStatusStyle(_.get(data, 'order_group[0].order_group_status.code')).textColor
                                                }}
                                                key={1}
                                            >
                                                <Space>{_.isEmpty(statusObj) ? _.get(data, 'order_group[0].order_group_status.name') : statusObj.name} <DownOutlined /></Space>
                                            </Tag>
                                        </Dropdown>
                                    )
                            }
                        </Space>
                    </div>
                </Col>

                <Col span={12}>
                    <div className="flex align-center justify-end">
                        <Space size={24}>
                            <Text>Ngày đặt hàng:</Text>
                            <Text>{moment(_.get(data, 'order_group[0].created')).add(7, 'h').format('HH:mm DD/MM/YYYY')}</Text>
                            <Button
                                className="btn_history"
                                onClick={() => history.push(`/order/history/group/${id}`)}
                            >Lịch sử cập nhật</Button>
                            <Link
                                to={{ pathname: '/order/invoices', state: { orders: _.get(data, 'order_group[0].orders') } }}
                                className="btn_history"
                                style={{ background: '#77BA6A', whiteSpace: 'nowrap', height: 32 }}
                            >In hóa đơn</Link>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Wrapper>
                <Row className='wrapper-table'>
                    <Table
                        dataSource={_.map(_.get(data, 'order_group[0].orders'), (item, key) => { return ({ ...item, key: key, description: <OrderDetailTemplate key={key} data={item} /> }) })}
                        columns={columns}
                        pagination={false}
                        expandable={{
                            expandedRowRender: record => record.description,
                            expandIcon: (props) => ExpandableButton(props),
                            expandIconColumnIndex: 8,
                            columnWidth: 170,
                        }}
                    />
                </Row>
            </Wrapper>
            {/* <Row>
                <Col span={24}>
                    <div className="w-max flex justify-end">
                        <Button
                            className={clsx(_.isEmpty(statusObj) && "disableBtn", !_.isEmpty(statusObj) && "confirmBtn")}
                            disabled={_.isEmpty(statusObj)}
                            onClick={handleUpdateStatus}
                        >Xác nhận</Button>
                    </div>
                </Col>
            </Row> */}
        </div>
    )
}

GroupOrderDetail.propTypes = {

}

export default GroupOrderDetail;
