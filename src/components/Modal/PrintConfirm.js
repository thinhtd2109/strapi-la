import * as _ from "lodash";
import React, { Fragment, useState, useEffect } from 'react';
import { Button, Modal, Typography, Space, Dropdown, Menu, Spin } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ReactComponent as Print } from '../../assets/icons/print-primary.svg';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_ALL_ORDER_STATUS, GET_ORDER_STATUS } from '../../graphql/schemas/order/query';

import "./styles.scss";
import { PRINT_ORDER_UPDATE_COUNT } from "../../graphql/schemas/order/mutation";
import { user } from "../../constant/user";
import { useIncrementCountPrint } from "../../pages/Order/hooks";



function PrintConfirm({ visible, enableChangeStatus, onConfirm, onCancel, currentStatus, setNextStatus, orders }) {

    const { Title } = Typography;
    const [open, setOpen] = useState(visible);
    const [isError, setIsError] = useState(false);
    const [statusObj, setStatusObj] = useState(currentStatus);
    const [getOrderStatus, { loading: loadingStatus, data: dataStatus }] = useLazyQuery(GET_ORDER_STATUS);
    const { data: allStatus } = useQuery(GET_ALL_ORDER_STATUS, {});

    const incrementPrintCount = useIncrementCountPrint();

    const handleConfirm = async () => {
        if (enableChangeStatus && _.isEqual(statusObj, currentStatus)) {
            setIsError(true);
        } else {
            onConfirm()
            incrementPrintCount({
                variables: {
                    ids: _.map(orders, order => _.get(order, 'id')),
                    printBy: user.getValue('id')
                }
            });
        }
      
    };

    const handleCancel = () => {
        setOpen(false);
        onCancel(false)
    };

    const handleMenuClick = (e) => {
        setIsError(false);
        const value = JSON.parse(e.key);
        setStatusObj(value);
        setNextStatus(_.get(value, 'id'));
    };

    const DropdownOrderStatus = ({ status, handleMenuClick }) => {
        let dataStatus = [{ id: null, name: "" }];

        switch (status) {
            case 'SUBMITTED':
                dataStatus = _.filter(_.get(allStatus, 'order_status'), function (obj) { return obj.code == 'AWAITING_PICKUP' });
                break;
            case 'AWAITING_PICKUP':
                dataStatus = _.filter(_.get(allStatus, 'order_status'), function (obj) { return obj.code === 'DELIVERING' });
                break;

            case 'DELIVERING':
                dataStatus = _.filter(_.get(allStatus, 'order_status'), function (obj) { return obj.code === 'DELIVERED' });
                break;

            case 'DELIVERED':

                break;

            case 'CANCELLED':

                break;


            default:
                break;
        }
        return (
            <Menu className='dropdown-next-status' onSelect={handleMenuClick}>
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

    useEffect(() => {
        setOpen(visible);
        if (enableChangeStatus) {
            getOrderStatus({
                variables: {
                    nextIndex: _.get(currentStatus, 'id') + 1
                }
            })
        };
    }, [visible]);

    return (
        <div>
            <Fragment>
                <Modal
                    className="modal-wrapper print"
                    centered
                    width={600}
                    visible={open}
                    footer={[]}
                    onCancel
                    title={<Print width="100px" height="90px" />}
                    closable={false}
                    footer={false}
                >
                    <Title className='title' level={3}>In hóa đơn</Title>
                    <div className='description'>Bạn muốn in toàn bộ hóa đơn, vui lòng xác nhận bên dưới</div>

                    {enableChangeStatus && (
                        <div className='next-status'>

                            <Dropdown 
                                overlay={
                                    <DropdownOrderStatus 
                                        status={_.get(currentStatus, 'code')} 
                                        handleMenuClick={handleMenuClick} 
                                    />
                                } 
                                trigger={['click']}
                            >
                                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                    {statusObj?.name} <DownOutlined />
                                </a>
                            </Dropdown>
                            {isError && <div style={{ color: "#ef4036" }}>Vui lòng chọn trạng thái kế tiếp</div>}
                        </div>
                    )}

                    <Space size={24}>
                        <Button
                            className="style-btn cancel"
                            onClick={handleCancel}
                        >Hủy</Button>
                        <Button
                            className="style-btn"
                            onClick={handleConfirm}
                        >Đồng ý</Button>
                    </Space>
                </Modal>
            </Fragment>
        </div>
    );
}

export default PrintConfirm;