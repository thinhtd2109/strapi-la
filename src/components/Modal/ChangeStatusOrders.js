import * as _ from "lodash";
import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Space, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ReactComponent as ChangeStatus } from '../../assets/icons/change-status.svg';
import { ReactComponent as Warning } from '../../assets/icons/warning.svg';

import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_ALL_ORDER_STATUS, GET_ORDER_STATUS } from '../../graphql/schemas/order/query';

import "./styles.scss";

const { Title } = Typography;

function ChangeStatusOrders({ visible, onCancel, isUpdate, onConfirm, currentStatus, setNextStatus, orders }) {

    
    const [open, setOpen] = useState(visible);
    const [isError, setIsError] = useState(false);
    const [statusObj, setStatusObj] = useState(currentStatus);
    const [getOrderStatus, { loading: loadingStatus, data: dataStatus }] = useLazyQuery(GET_ORDER_STATUS);
    const { data: allStatus } = useQuery(GET_ALL_ORDER_STATUS, {});

    const handleConfirm = async () => {
        if (isUpdate && _.isEqual(statusObj, currentStatus)) {
            setIsError(true);
        } else {
            onConfirm();
            onCancel(false);
            setOpen(false);
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

    useEffect(() => {
        setOpen(visible);
        if (isUpdate) {
            getOrderStatus({
                variables: {
                    nextIndex: _.get(currentStatus, 'id') + 1
                }
            })
        };
    }, [visible]);

    if(!isUpdate) {
        return <Reject open={open} handleCancel={handleCancel} />
    }

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

    

    return (
        <Modal
            className="modal-wrapper print"
            centered
            width={600}
            visible={open}
            footer={[]}
            onCancel
            title={<ChangeStatus width="100px" height="90px" />}
            closable={false}
            footer={false}
        >
            <Title className='title' level={3}>Th??ng b??o</Title>
            <div className='description letter-spacing'>Chuy???n ?????i tr???ng th??i danh s??ch ????n h??ng. Vui l??ng ch???n tr???ng th??i b??n d?????i.</div>

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
                {isError && <div style={{ color: "#ef4036" }}>Vui l??ng ch???n tr???ng th??i k??? ti???p</div>}
            </div>

            <Space size={24}>
                <Button
                    className="style-btn cancel"
                    onClick={handleCancel}
                >H???y</Button>
                <Button
                    className="style-btn"
                    onClick={handleConfirm}
                >?????ng ??</Button>
            </Space>
        </Modal>
    );
}

export default ChangeStatusOrders;

const Reject = ({open, handleCancel}) => {
    return (
        <Modal
            className="modal-wrapper print"
            centered
            width={600}
            visible={open}
            footer={[]}
            onCancel
            title={<Warning width="100px" height="90px" />}
            closable={false}
            footer={false}
        >
            <Title className='title' level={3}>?????i tr???ng th??i</Title>
            <div className='description'>Vui l??ng ch??? ch???n m???t tr???ng th??i ????? chuy???n ?????i h??ng lo???t</div>
            <Button
                className="style-btn single-btn"
                onClick={handleCancel}
            >????ng</Button>
        </Modal>
    )
};
