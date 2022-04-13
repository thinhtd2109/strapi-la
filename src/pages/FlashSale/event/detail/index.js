import { Fragment, useEffect, useState } from "react";
import { Row, Typography, Form, Input, DatePicker, Upload, message, Image, Space, Col, Divider, Spin } from "antd";
import Wrapper from "../../../../components/Wrapper/Wrapper"
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Vector from "../../../../assets/icons/Vector.svg";
import { ReactComponent as UploadProduct } from "../../../../assets/icons/product/upload-product.svg"
import "./style.scss"
import ProductItemAdd from "../create/ProductItemAdd";
import axios from "axios";
import _, { concat } from "lodash";
import { useQuery } from "@apollo/client";
import { GET_PROMOTION } from "../../../../graphql/schemas/promotion/query";
import { useHistory, useParams } from "react-router";
import moment from "moment";
import { formatMoney } from "../../../../helpers";
const FlashSaleDetail = () => {
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

    }
    const filterDataUnits = (values) => {
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
                <Typography.Title level={3} >Chi tiết chương trình khuyến mãi</Typography.Title>
                <Wrapper>

                    <Form.Item rules={[{ required: true, message: 'Tên chương trình không được để trống' }]} name="name" label={<span style={{ color: '#748CAD' }}>Tên chương trình</span>}>
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Thời gian không được để trống' }]} name="time" label={<span style={{ color: '#748CAD' }}>Thời gian</span>}>
                        <RangePicker showTime placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} disabled={true} />
                    </Form.Item>
                    {/* <Form.Item rules={[{ required: true, message: 'Hình ảnh không được để trống' }]} name="image" label={<span style={{ color: '#748CAD' }}>Hình ảnh</span>}>
                        <Upload
                            name="photo"
                            listType={image ? undefined : "picture-card"}
                            className="avatar-uploader"
                            action={upload}
                            disabled={true}
                            beforeUpload={beforeUpload}
                            showUploadList={false}
                        >
                            <div>
                                {image ? <Image
                                    style={{ width: '200px', cursor: 'pointer' }}
                                    src={`${process.env.REACT_APP_S3_GATEWAY}${image[0].url}`}
                                    alt="Image Product"
                                    preview={false} /> :
                                    loading ? <LoadingOutlined /> :
                                        <div className="flex flex-column"
                                            style={{ color: '#FCB040' }}>
                                            <UploadProduct
                                                fill="#FCB040"
                                                width="40px"
                                                height="40px" />
                                            Upload
                                        </div>
                                }

                            </div>
                        </Upload>
                    </Form.Item> */}
                    <Form.Item name="description" label={<span style={{ color: '#748CAD' }}>Mô tả</span>}>
                        <Input.TextArea rows={5} disabled={true} />
                    </Form.Item>

                </Wrapper>
                <div style={{ marginTop: '40px' }}>
                    <div className="createFlash">
                        <Row justify="space-between" className="headerWrapper">
                            <Typography.Title level={4}>Danh sách sản phẩm</Typography.Title>
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
                                                    <Input disabled={true} type="number" style={{ textAlign: 'center' }} min={0} max={100} defaultValue={item.percent} value={item.percent} onChange={(e) => handleInputChange(item.id, e.target.value * 1)}></Input>
                                                </div>
                                            </Col>

                                            <Divider />
                                        </Row>
                                    })}

                                </Fragment>
                            }
                        </div>
                    </div>
                </div>
            </Form>
            : <ProductItemAdd onCancel={() => setIsList(false)} onComplete={onComplete} />}
    </Fragment>

}

export default FlashSaleDetail;