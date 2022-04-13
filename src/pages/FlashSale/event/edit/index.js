import { Fragment, useEffect, useState } from "react";
import { Button, Row, Typography, Table, Form, Input, DatePicker, Upload, message, Image, Space, Col, Divider, notification, Spin } from "antd";
import Wrapper from "../../../../components/Wrapper/Wrapper"
import { PlusOutlined, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';
import Vector from "../../../../assets/icons/Vector.svg";
import slugs from "../../../../constant/slugs";
import { ReactComponent as UploadProduct } from "../../../../assets/icons/product/upload-product.svg"
import "./style.scss"
import ProductItemAdd from "../create/ProductItemAdd";
import axios from "axios";
import _, { concat } from "lodash";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_PROMOTION } from "../../../../graphql/schemas/promotion/mutation";
import { GET_PROMOTION, GET_PROMOTIONS_BY_TYPE_CODE } from "../../../../graphql/schemas/promotion/query";
import { useHistory, useParams } from "react-router";
import moment from "moment";
import { formatMoney } from "../../../../helpers/index";
const FlashSaleEdit = () => {
    const { Title, Text } = Typography;
    const { id } = useParams();
    const [form] = Form.useForm();
    const { RangePicker } = DatePicker;
    const { TextArea } = Input;
    const [isList, setIsList] = useState(false);
    const [image, setImage] = useState();
    const [loading, setLoading] = useState();
    const [dataSelected, setDataSelected] = useState([]);
    const [initValueForm, setInitValueForm] = useState({});
    const history = useHistory();
    const { loading: loadingPromotion, data } = useQuery(GET_PROMOTION, {
        variables: {
            id: id
        },
        fetchPolicy: 'network-only'
    })
    const [editPromotion, { data: dataPromotion }] = useMutation(EDIT_PROMOTION, {
        refetchQueries: [{
            query: GET_PROMOTIONS_BY_TYPE_CODE,
            variables: {
                code: "FLASHSALE"
            }
        }]
    })
    const onComplete = (data) => {
        let newData = _.unionBy(dataSelected, data, 'id');
        setDataSelected(newData);
        setIsList(false);
    }

    useEffect(() => {
        // let mounted = true;
        if (data) {
            let newData = _.map(data?.result?.promotion_product_pricings, item => ({
                id: item?.productPricingByProductPricing?.id,
                percent: item?.percent,
                price: item?.productPricingByProductPricing?.price,
                product_type: {
                    name: item?.productPricingByProductPricing?.product_type.name
                },
                productByProduct: item?.productPricingByProductPricing?.productByProduct,
            }));
            let valueForm = {
                name: data?.result.name,
                time: [moment(data?.result?.start_time), moment(data?.result?.end_time)],
                // image: data?.result?.banner,
                description: data?.result.description
            }
            // let img = {
            //     id: data?.result?.banner,
            //     url: data?.result?.banner_detail.url
            // }
            // setImage([img]);
            setInitValueForm(valueForm);
            setDataSelected(newData);
        }
        // return () => mounted = false;
    }, [data]);

    const upload = async (file) => {

        const formData = new FormData();

        formData.append("file", file);

        formData.append('media_type_code', "BANNER_PROMOTION");

        setLoading(true)

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
            const { data } = await axios.post(process.env.REACT_APP_BASEURL_UPLOAD, formData, config);
            setImage(data);
            setLoading(false)
        } catch (error) {
        }

    }

    const handleRemoveItem = (id) => {
        let newData = _.filter(dataSelected, item => item.id !== id);
        setDataSelected(newData);
    }

    const handleInputChange = (id, value) => {
        const percent = value < 0 ? 0 : value > 100 ? 100 : value;
        const newData = [...dataSelected];
        const index = newData.findIndex(item => item.id === id);
        if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                percent: percent
            });
            setDataSelected(newData);
        } else {
            setDataSelected(newData);
        }
    }
    function beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === "image/svg+xml";
        setImage(null)
        if (isJpgOrPng === false) {
            message.error('Vui lòng chọn hình ảnh');
        }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //   message.error('Image must smaller than 2MB!');
        // }
        return isJpgOrPng;
    }

    const onFinished = (values) => {
        if (_.size(dataSelected) > 0) {
            //Handle create flash sale
            let pricings = _.map(dataSelected, item => ({
                product_pricing: item.id,
                percent: item.percent
            }));

            editPromotion({
                variables: {
                    arg: {
                        id: id,
                        code: null,
                        name: values.name,
                        promotion_type_code: "FLASHSALE",
                        description: values.description,
                        // banner: image[0].id,
                        start_time: values.time[0],
                        end_time: values.time[1],
                        promotion_product_pricings: pricings
                    }
                }
            }).then(() => {
                notification['success']({
                    message: 'Thành công',
                    description: 'Cập nhật chương trình khuyến mãi thành công'
                });
                history.push(slugs.flashSale);
            }).catch((err) => {
                notification['error']({
                    message: 'Thất bại',
                    description: _.get(err, 'message', "Cập nhật chương trình khuyến mãi thất bại"),
                });
            })

        } else {
            notification['warning']({
                message: 'Thông báo',
                description: 'Vui lòng chọn ít nhất một sản phẩm',
            });
        }
    }
    const filterDataUnits = (values) => {
        // if (_.get(values, 'category')) {
        //     const tmp = getUnitByCategory({ list: _.get(unitList, 'unit'), category: _.get(_.find(categories, ['id', _.get(values, 'category')]), 'code') });
        //     setExportDataUnits(tmp);
        // };
    }

    const onFinishFailed = (values) => {
    }

    if (loadingPromotion || _.isEmpty(initValueForm)) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return <Fragment>
        {!isList ?
            <Form
                initialValues={initValueForm}
                onFinishFailed={(values) => onFinishFailed(values)}
                onFinish={onFinished}
                onValuesChange={filterDataUnits}
                layout="vertical"
                className="w-max" form={form}
            >
                <Typography.Title level={3} >Cập nhật chương trình khuyến mãi</Typography.Title>
                <Wrapper>

                    <Form.Item rules={[{ required: true, message: 'Tên chương trình không được để trống' }]} name="name" label={<span style={{ color: '#748CAD' }}>Tên chương trình</span>}>
                        <Input />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Thời gian không được để trống' }]} name="time" label={<span style={{ color: '#748CAD' }}>Thời gian</span>}>
                        <RangePicker showTime placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
                    </Form.Item>
                    <Form.Item name="description" label={<span style={{ color: '#748CAD' }}>Mô tả</span>}>
                        <Input.TextArea rows={5} />
                    </Form.Item>

                </Wrapper>
                <div style={{ marginTop: '40px' }}>
                    <div className="createFlash">
                        <Row justify="space-between" className="headerWrapper">
                            <Typography.Title level={4}>Danh sách sản phẩm</Typography.Title>
                            <Button
                                className="addBtn"
                                icon={<PlusOutlined />}
                                onClick={() => setIsList(true)}
                            >
                                Thêm
                            </Button>
                        </Row>
                        <div className="contentWrapper">
                            {_.size(dataSelected) === 0 ? <div className="imgWrapper">
                                <img src={Vector} width={100} height={200}></img>
                            </div> :
                                <Fragment>
                                    {_.map(dataSelected, (item, idx) => {
                                        return <Row key={idx}>

                                            <Col span={7}>
                                                <div className="flex align-center h-max">
                                                    <Space size={12}>
                                                        <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'productByProduct.photo.url')} alt="product_image" />
                                                        <div className="flex flex-column">
                                                            <Text style={{ fontSize: '20px' }}>{_.get(item, 'productByProduct.name')}</Text>
                                                            <Text>Giá: <Text className="red">{formatMoney(_.get(item, 'price', ""))} đ</Text></Text>
                                                            <Text>Mã sản phẩm: {_.get(item, 'productByProduct.code')}</Text>
                                                        </div>
                                                    </Space>
                                                </div>
                                            </Col>
                                            <Col span={5} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Trạng thái sản phẩm</Text>
                                                </div>
                                                <div className="subTitle align-center">
                                                    <Text>{_.get(item, 'productByProduct.product_status.name')}</Text>
                                                </div>
                                            </Col>
                                            <Col span={5} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Phân loại</Text>

                                                </div>
                                                <div className="subTitle">
                                                    <Text>{_.get(item, 'product_type.name')}</Text>
                                                </div>
                                            </Col>
                                            <Col span={4} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Phần trăm giảm giá (%)</Text>
                                                </div>
                                                <div>
                                                    <Input type="number" style={{ textAlign: 'center' }} min={0} max={100} defaultValue={item.percent} value={item.percent} onChange={(e) => handleInputChange(item.id, e.target.value * 1)}></Input>
                                                </div>
                                            </Col>
                                            <Col span={3} className="removeIcon" onClick={() => handleRemoveItem(item.id)}>
                                                <CloseCircleFilled />
                                            </Col>
                                            <Divider />
                                        </Row>
                                    })}

                                </Fragment>
                            }
                        </div>
                    </div>
                </div>
                <Row>
                    <div className="w-max flex justify-end mt-3 custom-button">
                        <Space size={24}>
                            <Button htmlType="button" onClick={() => history.push(slugs.flashSale)} className="btn_reset__product_create">Hủy</Button>
                            <Button htmlType="submit" className="btn__btn-create__product">Xác nhận</Button>
                        </Space>
                    </div>
                </Row>
            </Form>
            : <ProductItemAdd onCancel={() => setIsList(false)} onComplete={onComplete} />}
    </Fragment>

}

export default FlashSaleEdit;