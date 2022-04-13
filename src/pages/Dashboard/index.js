import _, { values } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import {
    Row, Col, Typography, Divider,
    Menu, DatePicker, Space,
} from 'antd';
import style from "./style.module.scss";
import Wrapper from "../../components/Wrapper/Wrapper";
import Overview from './Overview';
import Statistical from './Statistical';
// import Downloads from './Downloads';
// import EndUser from './EndUser';
// import LastOder from './LastOder';
import { ReactComponent as Calendar } from '../../assets/icons/calendar.svg';
import moment from "moment";

const { Title, Text } = Typography;
const { SubMenu } = Menu;

const Dashboard = () => {
    let dataResult;
    const [openKeys, setOpenKeys] = useState(['']);
    const [timeFilter, setTimeFilter] = useState({ type: 'Y', value: new Date().getFullYear() });

    const handleClick = (keys) => {
        const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
        if (['timer'].indexOf(latestOpenKey) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const customWeekStartEndFormat = value => {
        dataResult = `${moment(value).startOf('week').format("YYYY/MM/DD")}-${moment(value)
            .endOf('week')
            .format("YYYY/MM/DD")}`
        return `${moment(value).startOf('week').format("DD/MM/YYYY")}-${moment(value)
            .endOf('week')
            .format("DD/MM/YYYY")}`;
    }

    const handleSelectTimerFilter = (e, date, dateString) => {
        let tmp = timeFilter;
        if (_.size(date) > 3 && _.size(date) < 5) {
            _.set(tmp, 'type', 'Y');
            _.set(tmp, 'value', date);
            setOpenKeys([])
        }
        if (_.size(date) > 5 && _.size(date) < 8) {
            _.set(tmp, 'type', 'M');
            _.set(tmp, 'value', date);
            setOpenKeys([])
        }
        if (_.size(date) >= 8) {
            _.set(tmp, 'type', 'W');
            _.set(tmp, 'value', dataResult);
            setOpenKeys([])
        }

        setTimeFilter(tmp);
    }

    return (
        <Fragment>
            <Row justify="space-between" className={style.titleRow} style={{ marginBottom: '30px' }}>
                <Title level={3}>Dashboard</Title>

                <Menu
                    mode="inline"
                    openKeys={openKeys}
                    onOpenChange={handleClick}
                    className={style.dropdownFilter}
                >
                    <SubMenu
                        key="timer"
                        icon={<Calendar />}
                        title="Thời gian"
                        className={style.subFilter}
                    >
                        <Menu.Item key="Y" className={style.itemFilter}>
                            <span style={{ display: 'inline-block', width: '60px' }}>Năm</span>
                            <Space direction="vertical">
                                <DatePicker
                                    className={style.pickerItem}
                                    style={{ width: 238 }}
                                    picker="year"
                                    onChange={handleSelectTimerFilter}
                                />
                            </Space>
                        </Menu.Item>
                        <Menu.Item key="M" className={style.itemFilter}>
                            <span style={{ display: 'inline-block', width: '60px' }}>Tháng</span>
                            <Space direction="vertical">
                                <DatePicker
                                    style={{ width: 238 }}
                                    className={style.pickerItem}
                                    picker="month"
                                    onChange={handleSelectTimerFilter}
                                />
                            </Space>
                        </Menu.Item>
                        <Menu.Item key="W" className={style.itemFilter}>
                            <span style={{ display: 'inline-block', width: '60px' }}>Tuần</span>
                            <Space direction="vertical">
                                <DatePicker
                                    className={style.pickerItem}
                                    style={{ width: 238 }}
                                    picker="week"
                                    format={customWeekStartEndFormat}
                                    onChange={handleSelectTimerFilter}
                                />
                            </Space>
                        </Menu.Item>
                    </SubMenu>
                </Menu>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Overview timeFilter={timeFilter} />
                </Col>

                <Col span={24}>
                    <Wrapper>
                        <div className={style.styleLastOder}>
                            <Row>
                                <Text className={style.styleTitleSection}>Thống kê</Text>
                            </Row>
                            <Divider className={style.styleDivider} />
                            <Statistical timeFilter={timeFilter} />
                        </div>
                    </Wrapper>
                </Col>

                {/*
                <Col span={12}>
                    <Wrapper>
                        <div className={style.styleLastOder}>
                            <Row>
                                <Text className={style.styleTitleSection}>Lượt tải</Text>
                            </Row>
                            <Divider className={style.styleDivider} />
                            <Downloads timeFilter={timeFilter}/>
                        </div>
                    </Wrapper>
                </Col>
                */}

                {/*
                <Col span={6}>
                    <Wrapper>
                        <div className={style.styleLastOder}>
                            <Row>
                                <Text className={style.styleTitleSection}>Người dùng</Text>
                            </Row>
                            <Divider className={style.styleDivider} />
                            <EndUser timeFilter={timeFilter}/>
                        </div>
                    </Wrapper>
                </Col> 
                */}

                {/* 
                <Col span={24}>
                    <Wrapper>
                        <div className={style.styleLastOder}>
                            <Row>
                                <Text className={style.styleTitleSection}>Đơn hàng gần nhất</Text>
                            </Row>
                            <Divider className={style.styleDivider} />
                            <LastOder timeFilter={timeFilter}/>
                        </div>
                    </Wrapper>
                </Col>
                */}
            </Row>
        </Fragment>
    )
}

export default Dashboard;

