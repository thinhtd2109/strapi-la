import _ from "lodash";
import {
    Button, Row, Typography, Divider, Form, Col, TimePicker, Space, Spin, InputNumber,
    notification
} from "antd";
import React, { useEffect, useState, Fragment } from "react";
import style from '../settings.module.scss';
import moment from "moment";
import { useHistory } from "react-router-dom";
import slugs from "../../../constant/slugs";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { useGetSettings, useUpdateSetting } from "../hooks";
import SuccessModal from "../../../components/Modal/SuccessModal";


const EditSettings = () => {
    const [form] = Form.useForm();
    const history = useHistory();
    const format = 'HH:mm';
    const [initialValues, setInitialValues] = useState(null);
    const [updating, setUpdating] = useState(false);

    const { data: dataSettings, loading: loadingSettings } = useGetSettings();

    const { updateSetting, loading: loadingUpdate } = useUpdateSetting(setUpdating);

    const onFinishFailed = (errorInfo) => {
        notification['error']({
            message: 'Thông báo',
            description:
                `Cập nhật thất bại. ${_.head(_.get(_.head(_.get(errorInfo, 'errorFields')), 'errors'))}`,
        });
    };

    const onFinished = (values) => {
        setUpdating(true);
        const dataUpdate = _.map(dataSettings, (item) => {
            if (_.get(item, 'code') === 'shift_time') {
                if (_.isUndefined(_.get(values, 'shifts'))) {
                    return item;
                } else {
                    return {
                        ...item,
                        shifts: _.map(_.get(_.find(dataSettings, ['code', 'shift_time']), 'shifts'), (item, key) => {
                            return {
                                from: _.get(values, `shifts[${key}].from`) ? moment(_.get(values, `shifts[${key}].from`)).format(format) : _.get(item, 'from'),
                                to: _.get(values, `shifts[${key}].to`) ? moment(_.get(values, `shifts[${key}].to`)).format(format) : _.get(item, 'to'),
                            }
                        })
                    }
                };
            }
            return {
                ...item,
                value: _.get(values, _.get(item, 'code'))
            }
        });

        updateSetting({
            variables: {
                code: "SHIPPER",
                data: dataUpdate
            }
        })
    }

    const handleReturn = () => {
        history.push(slugs.settings)
    };

    useEffect(() => {
        if (dataSettings) {
            const timer = _.get(_.find(dataSettings, ['code', 'shift_time']), 'shifts');

            setInitialValues({
                request_timeline: _.get(_.find(dataSettings, ['code', 'request_timeline']), 'value'),
                kpi_min_order: _.get(_.find(dataSettings, ['code', 'kpi_min_order']), 'value'),
                kpi_delay_max: _.get(_.find(dataSettings, ['code', 'kpi_delay_max']), 'value'),
                shift_time: {
                    shifts: _.map(timer, item => {
                        return {
                            from: _.get(item, 'from', '00:00'),
                            to: _.get(item, 'to', '00:00')
                        }
                    })
                },
                checkin_distance: _.get(_.find(dataSettings, ['code', 'checkin_distance']), 'value'),

            });
        }
    }, [dataSettings]);

    if (loadingSettings || _.isEmpty(initialValues) || loadingUpdate) {
        return (
            <div className="wapperLoading">
                <Spin tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <Fragment>
            <SuccessModal onSuccess={handleReturn} visible={updating} title="Thành công" content="Chỉnh sửa cài đặt thành công." />
            <Row justify="space-between" className={style.titleRow}>
                <Typography.Title level={3}>Cài đặt</Typography.Title>
            </Row>
            <Form
                name="form_edit_setting"
                initialValues={initialValues}
                onFinishFailed={onFinishFailed}
                onFinish={onFinished}
                layout="vertical"
                className="w-max" form={form}
            >
                <Wrapper>
                    <Row>
                        <Typography.Title level={5} className={style.styleHeader}>
                            Shipper
                        </Typography.Title>
                    </Row>
                    <Divider style={{ margin: "-9px 0px 24px 0px" }} />

                    <Row>
                        <Col span={15}>
                            <Row gutter={120}>
                                {
                                    _.map(initialValues, (value, key) => {
                                        const item = _.find(dataSettings, ['code', key]);

                                        if (key === 'shift_time') {
                                            return (
                                                <Col key={key} span={12}>
                                                    <Form.Item
                                                        // name='shift_time'
                                                        // shouldUpdate={true}
                                                        label={<div style={{ color: '#748CAD' }}>{_.get(item, 'name')}</div>}
                                                    >
                                                        <Form.List name="shifts">
                                                            {(fields, { add, remove }) => {

                                                                return (
                                                                    <Fragment>
                                                                        {_.map(_.get(item, 'shifts'), ({ ...restField }, index) => {
                                                                            return (
                                                                                <Row key={index} gutter={[8, 16]} >
                                                                                    <Col span={11}>
                                                                                        <Form.Item
                                                                                            {...restField}
                                                                                            name={[index, 'from']}
                                                                                        >
                                                                                            <TimePicker
                                                                                                id={`input-${_.get(item, 'code')}-${index}-to`}
                                                                                                defaultValue={moment(_.get(restField, 'from'), format)}
                                                                                                format={format}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>

                                                                                    <Col span={2} style={{ textAlign: 'center' }}>
                                                                                        <span>-</span>
                                                                                    </Col>

                                                                                    <Col span={11}>
                                                                                        <Form.Item
                                                                                            {...restField}
                                                                                            name={[index, 'to']}
                                                                                        >
                                                                                            <TimePicker
                                                                                                id={`input-${_.get(item, 'code')}-${index}-to`}
                                                                                                defaultValue={moment(_.get(restField, 'to'), format)}
                                                                                                format={format}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                </Row>
                                                                            )
                                                                        })}
                                                                    </Fragment>
                                                                )
                                                            }}
                                                        </Form.List>
                                                    </Form.Item>
                                                </Col>
                                            )
                                        } else {
                                            return (
                                                <Col key={key} span={12}>
                                                    <Form.Item
                                                        name={key}
                                                        label={<div style={{ color: '#748CAD' }}>{_.get(item, 'name')}</div>}
                                                        rules={
                                                            key === 'request_timeline' ?
                                                                [{
                                                                    validator: (_, value) => value * 1 >= 1 && value * 1 <= 10 ? Promise.resolve() : Promise.reject(new Error('Thời gian nhận đơn trong khoảng từ 1 đến 10 phút')),
                                                                }]
                                                                : key === 'kpi_min_order' ?
                                                                    [{
                                                                        validator: (_, value) => value * 1 >= 1 && value * 1 <= 100 ? Promise.resolve() : Promise.reject(new Error('Số đơn đạt KPI phải từ 1 đến 100 đơn')),
                                                                    }]
                                                                    : key === 'kpi_delay_max' ?
                                                                        [{
                                                                            validator: (_, value) => value * 1 >= 10 && value * 1 <= 50 ? Promise.resolve() : Promise.reject(new Error('Thời lượng cho phép trễ tối đa phải từ 10% đến 50%')),
                                                                        }]
                                                                        : key === 'checkin_distance' ?
                                                                            [{
                                                                                validator: (_, value) => value * 1 >= 10 && value * 1 <= 100 ? Promise.resolve() : Promise.reject(new Error('Khoảng cách tối thiểu chấm công vào từ 10m đến 100m')),
                                                                            }]
                                                                            : undefined
                                                        }
                                                    >
                                                        <InputNumber
                                                            id={`input-${key}`}
                                                            style={{ width: '100%' }}
                                                            type={_.includes(['request_timeline', 'kpi_min_order', 'kpi_delay_max', 'checkin_distance'], key) ? 'number' : 'text'}
                                                            placeholder="Nhập số"
                                                            addonAfter={_.get(item, 'unit')}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            )
                                        }
                                    })
                                }
                            </Row>
                        </Col>
                    </Row>
                </Wrapper>

                <Row>
                    <div className="w-max flex justify-end mt-3 custom-button">
                        <Space size={24}>
                            <Button htmlType="button" onClick={() => history.push(slugs.settings)} className="btn_reset__product_create">Hủy</Button>
                            <Button htmlType="submit" className="btn__btn-create__product">Xác nhận</Button>
                        </Space>
                    </div>
                </Row>
            </Form >

        </Fragment >
    );
}

export default EditSettings;
