import _ from "lodash";
import { Button, Row, Typography, Divider, Form, Col, Input, Spin } from "antd";
import { EditOutlined, ClockCircleOutlined } from "@ant-design/icons";

import React, { useEffect, Fragment } from "react";
import style from './settings.module.scss';

import Wrapper from "../../components/Wrapper/Wrapper";
import { useHistory } from "react-router-dom";
import slugs from "../../constant/slugs";
import { useGetSettings } from "./hooks";

const Settings = () => {
    const [form] = Form.useForm();
    const history = useHistory();

    const { data: dataSettings, loading: loadingSettings, refetch } = useGetSettings();

    useEffect(() => {
        refetch();
    }, []);

    if (loadingSettings) {
        return (
            <div className="wapperLoading">
                <Spin tip="Đang tải dữ liệu..." />
            </div>
        );
    }
    return (
        <Fragment>
            <Row justify="space-between" className={style.titleRow}>
                <Typography.Title level={3}>Cài đặt</Typography.Title>
                <Button
                    className={style.stylePrimary}
                    icon={<EditOutlined />}
                    onClick={() => history.push(slugs.editSettings)}
                >
                    Sửa thông tin
                </Button>
            </Row>
            <Form
                initialValues={{}}
                layout="vertical"
                className="w-max" form={form}
            >
                <Wrapper>
                    <Row>
                        <Typography.Title level={5} className={style.styleHeader}>
                            Shipper
                        </Typography.Title>
                    </Row>
                    <Divider style={{ margin: '-9px 0px 24px 0px' }} />

                    <Row>
                        <Col span={15}>
                            <Row gutter={120}>
                                {
                                    _.map(dataSettings, (item) => {
                                        return (
                                            <Col key={_.get(item, 'key')} span={12}>
                                                <Form.Item name={_.get(item, 'code')} label={<div style={{ color: '#748CAD' }}>{_.get(item, 'name')}</div>}>
                                                    {
                                                        _.get(item, 'code') === 'shift_time' ?
                                                            (
                                                                <Row gutter={[8, 16]} align='middle'>
                                                                    {_.map(_.get(item, 'shifts'), (Obj, key) => {
                                                                        return (
                                                                            <Row key={key} gutter={8} align='middle'>
                                                                                <Col span={11}>
                                                                                    <Input
                                                                                        readOnly
                                                                                        defaultValue={_.get(Obj, 'from')}
                                                                                        addonAfter={<ClockCircleOutlined />}
                                                                                    />
                                                                                </Col>

                                                                                <Col span={2} style={{ textAlign: 'center' }}>
                                                                                    <span>-</span>
                                                                                </Col>

                                                                                <Col span={11}>
                                                                                    <Input
                                                                                        readOnly
                                                                                        defaultValue={_.get(Obj, 'to')}
                                                                                        addonAfter={<ClockCircleOutlined />}
                                                                                    />
                                                                                </Col>
                                                                            </Row>
                                                                        )
                                                                    })}
                                                                </Row>
                                                            )
                                                            :
                                                            (
                                                                <Input
                                                                    readOnly
                                                                    defaultValue={_.get(item, 'value')}
                                                                    addonAfter={_.get(item, 'unit')}
                                                                />
                                                            )
                                                    }
                                                </Form.Item>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        </Col>
                    </Row>
                </Wrapper>
            </Form>
        </Fragment >
    );
}

export default Settings;
