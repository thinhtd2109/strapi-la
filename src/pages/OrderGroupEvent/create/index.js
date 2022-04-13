import { Fragment, useState } from "react";
import { Button, Row, Typography, Form, DatePicker, Space, Col, Radio, notification, InputNumber } from "antd";
import Wrapper from "../../../components/Wrapper/Wrapper"
import slugs from "../../../constant/slugs";
import "./style.scss"
import _ from "lodash";
import { useMutation } from "@apollo/client";
import { useHistory } from "react-router";
import moment from "moment";
import { CREATE_ORDER_GROUP_EVENT } from "../../../graphql/schemas/ordergroupevent/mutation";
import SuccessModal from "../../../components/Modal/SuccessModal";

const OrderGroupEventCreate = () => {
    const { Title, Text } = Typography;
    const [form] = Form.useForm();
    const { RangePicker } = DatePicker;
    const [isList, setIsList] = useState(false);
    const [goalValue, setGoalValue] = useState(2);
    const [loading, setLoading] = useState();
    const [dataSelected, setDataSelected] = useState([]);
    const [modal, setModal] = useState({ success: false });

    //const [blur, setBlur] = useState(false);
    const [params, setParams] = useState({
        name: "",
        //phone: "",
        start_time: "",
        end_time: "",
        order_min_price: 0,
        total_order_min_price: 0,
        group_timeline: 0,
        total_participates: 0,
        total_order_number: 0,
        time_next_group: 0
    })
    const history = useHistory();
    const [createOrderGroupEvent, { data: dataPromotion }] = useMutation(CREATE_ORDER_GROUP_EVENT)
    const onComplete = (data) => {
        let newData = _.unionBy(dataSelected, data, 'id');
        setDataSelected(newData);
        setIsList(false);
    }

    const onFinished = (values) => {
        setLoading(true);
        let temp = _.cloneDeep(params);
        temp.start_time = moment(values.time[0]).format();
        temp.end_time = moment(values.time[1]).format();
        temp.name = values.name;
        temp.order_min_price = Number(values.order_min_price);
        temp.group_timeline = Number(values.group_timeline);
        temp.time_next_group = Number(values.time_next_group);

        if (values.total_order_min_price < values.order_min_price) {
            notification['error']({
                message: 'Thất bại',
                description: "Tổng giá trị không được bé hơn giá trị đơn tối thiểu"
            });
            return;
        }

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

        createOrderGroupEvent({
            variables: {
                data: temp
            }
        }).then(res => {
            setLoading(false);
            setModal((prev) => ({ ...prev, success: true }))
        }, (error) => {
            setLoading(false);
            notification['error']({
                message: 'Thất bại',
                description: _.get(error, 'message', "Tạo chương trình thất bại"),
            });
        })


    }
    const filterDataUnits = (values) => {

    }

    const onFinishFailed = (values) => {
    }

    //Set disabled range time
    function range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }
    function disabledDate(current) {
        // Can not select days before today
        return current && current < moment().startOf('day');
    }
    function disabledRangeTime(_, type) {
        if (type === 'start') {
            return {
                disabledHours: () => range(0, 60).splice(4, 20),
                disabledMinutes: () => range(30, 60),
                disabledSeconds: () => [55, 56],
            };
        }
        return {
            disabledHours: () => range(0, 60).splice(20, 4),
            disabledMinutes: () => range(0, 31),
            disabledSeconds: () => [55, 56],
        };
    }

    const [isRequired, setIsRequired] = useState({
        total_participates: false,
    })

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

    let blur = false;


    return (
        <Fragment>
            <SuccessModal onSuccess={() => history.goBack()} visible={modal.success} title="Thành công" content="Thêm mới sự kiện thành công" />
            <Form
                onFinishFailed={(values) => onFinishFailed(values)}
                onFinish={onFinished}
                layout="vertical"
                className="w-max" form={form}
            >
                <Typography.Title level={3} >Tạo sự kiện nhóm mua</Typography.Title>
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
                                        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
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
                                        min={0}
                                        disabled={goalValue !== 1}
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
                                        min={0}
                                        disabled={goalValue !== 2}
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
                                        min={0}
                                        disabled={goalValue !== 3}
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
                            <Button loading={loading} disabled={loading} htmlType="submit" className="btn__btn-create__product">Xác nhận</Button>
                        </Space>
                    </div>
                </Row>
            </Form>
        </Fragment>
    )
}

export default OrderGroupEventCreate;
