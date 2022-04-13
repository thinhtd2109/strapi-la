import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { Avatar, Button, Popover, Spin, Typography, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { GET_ACCOUNT_INFO } from '../../graphql/schemas/core/query'
import './styles.scss'
import { user } from '../../constant/user';
import _ from 'lodash';
const SignOutPages = () => {
    const { Text } = Typography;
    const history = useHistory();

    const handleLogout = () => {
        user.reset();
        history.push('/login');
    }

    const title = <span>Tài khoản</span>;
    const content = (
        <Fragment>
            <div className="content">
                <div style={{ marginRight: "5px" }}>
                    <Avatar size="medium">A</Avatar>
                </div>
                <div>
                    <div>
                        <Text type="secondary">{user.getValue('username')}</Text>
                    </div>
                    <div>
                        <Text type="secondary">{user.getValue('email')}</Text>
                    </div>
                </div>
            </div>
            <div className="footer" onClick={handleLogout}>
                <Button type="text">Đăng xuất</Button>
            </div>
        </Fragment>

    );
    //if (loading) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return (
        <Fragment>
            <Popover className="popOverCustom" placement="bottom" title={title} content={content} trigger="click">
                <div className="root">
                    <Space>
                        <Avatar size="medium" className="avatar">{_.toUpper(_.split(user.getValue('username'), '')[0])}</Avatar><span className="downIcon"><DownOutlined /></span>
                    </Space>

                </div>

            </Popover>
        </Fragment >

    )
}

export default SignOutPages;
