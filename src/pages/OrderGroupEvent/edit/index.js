import { Fragment, useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import { Form, Typography, Row, Col, DatePicker, Spin, Radio, Space, notification, Button, InputNumber } from 'antd';
import Wrapper from '../../../components/Wrapper/Wrapper';
import '../create/style.scss';
import moment from "moment";
import { useUpdateDetailOrderGroupEvent, useGetDetailOrderGroupEventById } from '../hooks';
import _ from 'lodash';
import SuccessModal from "../../../components/Modal/SuccessModal";
import slugs from "../../../constant/slugs";

const { Text, Title } = Typography;

const OrderGroupEventEdit = () => {
    const { id } = useParams();
    const history = useHistory();
    const { RangePicker } = DatePicker;

    const { data: orderGroupEventDetail, loading } = useGetDetailOrderGroupEventById({ id });


    const [goalValue, setGoalValue] = useState(2);
    const [initialValues, setInitialValues] = useState({});

    const [loadingEdit, setLoadingEdit] = useState(false);

    const [modal, setModal] = useState({ success: false })

    const updateOrderGroupEvent = useUpdateDetailOrderGroupEvent();

    const [params, setParams] = useState({
        id: null,
        name: null,
        //description: "test description",
        start_time: "",
        end_time: "",
        order_min_price: 0,
        total_order_min_price: 0,
        group_timeline: 0,
        total_participates: 0,
        total_order_number: 0,
        time_next_group: 0
    })

    const { useForm } = Form;
    const [form] = useForm();

    const onFinished = (values) => {
        setLoadingEdit(true);
        let temp = _.cloneDeep(params);
        temp.id = id;
        temp.start_time = moment(values.time[0]).format();
        temp.end_time = moment(values.time[1]).format();
        temp.name = values.name;
        temp.order_min_price = Number(values.order_min_price);
        temp.group_timeline = Number(values.group_timeline);
        if (goalValue === 1) {
            temp.total_participates = Number(values.total_participates);
            temp.total_order_min_price = null;
            temp.total_order_number = null;
        }
        if (goalValue === 2) {
            temp.total_participates = null;
            temp.total_order_min_price = Number(values.total_order_min_price);
            temp.total_order_number = null
        }
        if (goalValue === 3) {
            temp.total_participates = null;
            temp.total_order_min_price = null;
            temp.total_order_number = Number(values.total_order_number);
        }


        temp.time_next_group = Number(values.time_next_group);

        updateOrderGroupEvent({
            variables: {
                data: temp
            }
        }).then(res => {
            setLoadingEdit(false);
            setModal((prev) => ({ ...prev, success: true }))
        }, (error) => {
            setLoadingEdit(false);
            notification['error']({
                message: 'Thất bại',
                description: _.get(error, 'message', "cập nhật chương trình thất bại"),
            });
        })
    }

    function disabledDate(current) {
        return current && current < moment().startOf('day');
    }

    useEffect(() => {
        let start_time = _.get(orderGroupEventDetail, 'start_time');
        let end_time = _.get(orderGroupEventDetail, 'end_time');
        if (orderGroupEventDetail) {
            setInitialValues({
                time: [moment(start_time), moment(end_time)],
                order_min_price: _.get(orderGroupEventDetail, 'order_min_price'),
                group_timeline: _.get(orderGroupEventDetail, 'group_timeline'),
                time_next_group: _.get(orderGroupEventDetail, 'time_next_group'),
                total_participates: _.get(orderGroupEventDetail, 'total_participates', undefined),
                total_order_min_price: _.get(orderGroupEventDetail, 'total_order_min_price', undefined),
                total_order_number: _.get(orderGroupEventDetail, 'total_order_number', undefined)
            });
        }

    }, [orderGroupEventDetail]);

    const onChangeCheckBox = (e, type) => {
        let value = _.cloneDeep(form.getFieldValue());
        if (type === 'total_participates') {
            form.setFieldsValue({
                ...value,
                total_order_min_price: null,
                total_order_number: null
            });
            return;
        }
        if (type === 'total_order_min_price') {
            form.setFieldsValue({
                ...value,
                total_order_number: null,
                total_participates: null
            });
            return;
        }
        form.setFieldsValue({
            ...value,
            total_participates: null,
            total_order_min_price: null
        })

    }

    useEffect(() => {
        if (orderGroupEventDetail) {
            if (!_.isNull(_.get(orderGroupEventDetail, 'total_participates')) && Number(_.get(orderGroupEventDetail, 'total_participates')) > 0) {
                setGoalValue(1);
            }
            if (!_.isNull(_.get(orderGroupEventDetail, 'total_order_min_price')) && Number(_.get(orderGroupEventDetail, 'total_order_min_price')) > 0) {
                setGoalValue(2)
            }
            if (!_.isNull(_.get(orderGroupEventDetail, 'total_order_number')) && Number(_.get(orderGroupEventDetail, 'total_order_number')) > 0) {
                setGoalValue(3);
            }
        }
    }, [orderGroupEventDetail])

    if (loading || _.isEmpty(initialValues)) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>

    return (
        <Fragment>
            <SuccessModal onSuccess={() => history.goBack()} visible={modal.success} title="Thành công" content="Cập nhật sự kiện thành công" />
            <Title level={3} >Thay đổi sự kiện nhóm mua</Title>
            <Form
                initialValues={initialValues}
                //onFinishFailed={(values) => onFinishFailed(values)}
                onFinish={onFinished}
                layout="vertical"
                className="w-max"
                form={form}
            >
                <Wrapper>
                    <div className="createOrderGroup">
                        <Row className="border-bottom">
                            <div className="w-max h-max flex flex-column container">
                                <Col span={24}>
                                    <Text className="text__title">Sự kiện nhóm mua</Text>
                                </Col>
                            </div>
                        </Row>
                    </div>
                    <Row>
                        <Col span={11}>
                            <Form.Item rules={[{ required: true, message: 'Thời gian không được để trống' }]} name="time" label={<span style={{ color: '#748CAD' }}>Thời gian</span>}>
                                <RangePicker placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                    disabledDate={disabledDate}
                                    style={{ width: '100%', borderRadius: '6px' }}
                                    // disabledTime={disabledRangeTime}
                                    showTime={{
                                        hideDisabledOptions: true,
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="group_timeline" label={<span style={{ color: '#748CAD' }}>Thời gian hết hạn</span>}>
                                <InputNumber
                                    min={0}
                                    formatter={value => {
                                        let result = `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                        return result;
                                    }}
                                    parser={value => value.replace(/\ Phút\s?|(,*)/g, '')}
                                    style={{ width: '100%' }}
                                    placeholder="Phút"
                                />
                            </Form.Item>
                            <Form.Item name="time_next_group" label={<span style={{ color: '#748CAD' }}>Tần suất tạo đơn</span>}>
                                <InputNumber
                                    min={0}
                                    formatter={value => {
                                        let result = `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                        return result;
                                    }}
                                    parser={value => value.replace(/\ Phút\s?|(,*)/g, '')}
                                    style={{ width: '100%' }}
                                    placeholder="Phút"
                                />
                            </Form.Item>
                            <Form.Item name="order_min_price" label={<span style={{ color: '#748CAD' }}>Giá trị đơn tối thiểu</span>}>
                                <InputNumber
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                    placeholder="VNĐ"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={1}></Col>
                        <Col span={11}>
                            <span style={{ color: '#748CAD' }}><span style={{ color: '#EF4036' }}>*</span> Mục tiêu chốt đơn</span>
                            <Radio.Group onChange={(e) => setGoalValue(e.target.value)} value={goalValue} style={{ paddingLeft: "40px", width: '100%' }} defaultValue={goalValue}>
                                {/* <Radio value={1} style={{ width: '100%', margin: '10px 0px' }}>Tổng số người</Radio>
                                <Form.Item
                                    name="total_participates"
                                    style={{ marginLeft: "25px" }}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value && goalValue === 1) {
                                                    return Promise.reject(new Error('Tổng số người không được để trống'));
                                                } else {
                                                    return Promise.resolve();
                                                }
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        disabled={goalValue !== 1}
                                        min={0}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        style={{ width: '100%' }}
                                        placeholder="người"
                                    />

                                </Form.Item> */}
                                <Radio value={2} style={{ margin: '10px 0px' }}>Tổng giá trị</Radio>
                                <Form.Item
                                    name="total_order_min_price"
                                    style={{ marginLeft: "25px" }}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value && goalValue === 2) {
                                                    return Promise.reject(new Error('Tổng giá trị không được để trống'));
                                                } else {
                                                    return Promise.resolve();
                                                }
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        disabled={goalValue !== 2}
                                        min={0}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        style={{ width: '100%' }}
                                        placeholder="VNĐ"
                                    />
                                </Form.Item>
                                {/* <Radio value={3} style={{ margin: '10px 0px' }}>Tổng số đơn</Radio>
                                <Form.Item
                                    name="total_order_number"
                                    style={{ marginLeft: "25px" }}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value && goalValue === 3) {
                                                    return Promise.reject(new Error('Tổng số đơn không được để trống'));
                                                } else {
                                                    return Promise.resolve();
                                                }
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        disabled={goalValue !== 3}
                                        min={0}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        style={{ width: '100%' }}
                                        placeholder="Đơn"
                                    />
                                </Form.Item> */}
                            </Radio.Group>
                        </Col>
                    </Row>

                </Wrapper>
                <Row>
                    <div className="w-max flex justify-end mt-3 custom-button">
                        <Space size={24}>
                            <Button htmlType="button" onClick={() => history.push(slugs.orderGroupEvent)} className="btn_reset__product_create">Hủy</Button>
                            <Button loading={loadingEdit} disabled={loadingEdit} htmlType="submit" className="btn__btn-create__product">Xác nhận</Button>
                        </Space>
                    </div>
                </Row>
            </Form>
        </Fragment>
    )
}

export default OrderGroupEventEdit;